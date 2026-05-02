import { llm } from "@livekit/agents";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { caseStateService } from "../case/state.js";
import { casesCollection, notesCollection } from "../entities/index.js";
import { getPlaybook } from "../playbooks/index.js";
import { getNextQuestion } from "../extraction/question.js";
import type { SessionUserData } from "./types.js";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

async function emitCaseEvent(caseId: string, event: string, data: unknown) {
  try {
    await fetch(`${API_URL}/_internal/case-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, event, data }),
    });
  } catch {
    // HTTP server may not be reachable
  }
}

// ─── TOOL 1: start_intake ───────────────────────────────────

export const startIntake = llm.tool({
  description:
    "Initialize intake checklist for the current session. Call ONCE at the very beginning of intake, after greeting, before asking structured questions. Returns the plan to follow during the conversation. NEVER call again in the same session.",
  parameters: z.object({}),
  execute: async (_args, opts) => {
    console.log("[tool:start_intake] called");
    const userData = opts.ctx.userData as SessionUserData;
    const { userId, playbook } = userData;
    let caseId = userData.caseId;

    // Create case if none exists
    if (!caseId) {
      const caseDoc = await caseStateService.createCase(userId, playbook);
      caseId = caseDoc._id.toHexString();
      userData.caseId = caseId;
    }

    const caseDoc = await caseStateService.getState(caseId);
    if (!caseDoc) {
      return { error: "Case not found" };
    }

    const completed = caseDoc.checklist.filter(
      (t) => t.status === "completed",
    ).length;
    const firstPending =
      caseDoc.checklist.find(
        (t) => t.status === "pending" && t.priority === "high",
      ) ??
      caseDoc.checklist.find(
        (t) => t.status === "pending" && t.priority === "normal",
      );

    const knownKeys = Object.keys(caseDoc.facts);

    const result = {
      checklist: caseDoc.checklist,
      summary:
        knownKeys.length > 0
          ? `Some data already collected: ${knownKeys.join(", ")}`
          : "No data collected yet — starting fresh.",
      total_tasks: caseDoc.checklist.length,
      completed_tasks: completed,
      first_topic_suggestion: firstPending
        ? `Start with: ${firstPending.topic}`
        : "All tasks completed.",
    };
    console.log("[tool:start_intake] result:", JSON.stringify(result, null, 2));

    // Emit initial state to frontend via SSE
    await emitCaseEvent(caseId!, "case_update", {
      caseId,
      facts: caseDoc.facts,
      checklist: caseDoc.checklist,
      risks: caseDoc.risks,
      requirements: caseDoc.requirements,
      completion: caseDoc.completion,
      nextQuestion: null,
    });

    return result;
  },
});

// ─── TOOL 2: note ───────────────────────────────────────────

export const note = llm.tool({
  description:
    "Record facts the client shared. Call IMMEDIATELY after client shares any factual information. Education, work, family, immigration history, dates, names, amounts, locations, intentions. Multiple facts in one client message → ONE note call with all of them. Optionally mark a checklist task as covered.",
  parameters: z.object({
    facts: z
      .record(z.string(), z.unknown())
      .describe(
        "Structured object of facts. Keys should match playbook fact keys where possible, e.g. { applicant_nationality: 'Indian', visit_purpose: 'visit family' }",
      ),
    completes_task_id: z
      .string()
      .optional()
      .describe("Checklist task ID that these facts complete"),
    evidence: z
      .string()
      .optional()
      .describe("Direct quote from client message"),
  }),
  execute: async ({ facts, completes_task_id, evidence }, opts) => {
    console.log("[tool:note] called with:", JSON.stringify({ facts, completes_task_id, evidence }));
    const userData = opts.ctx.userData as SessionUserData;
    const caseId = userData.caseId;
    if (!caseId) {
      console.log("[tool:note] error: no active case");
      return {
        accepted: false,
        error: "No active case. Call start_intake first.",
      };
    }

    // Snapshot existing facts for conflict detection
    const before = await caseStateService.getState(caseId);
    if (!before) {
      return { accepted: false, error: "Case not found." };
    }

    const conflicts: {
      field: string;
      old: unknown;
      new_value: unknown;
      needs_clarification: boolean;
    }[] = [];
    for (const [key, value] of Object.entries(facts)) {
      const existing = before.facts[key];
      if (
        existing !== undefined &&
        JSON.stringify(existing) !== JSON.stringify(value)
      ) {
        conflicts.push({
          field: key,
          old: existing,
          new_value: value,
          needs_clarification: true,
        });
      }
    }

    // Process through CaseStateService (merge + recompute derived state)
    const result = await caseStateService.processAndUpdate(caseId, facts);
    if (!result) {
      return { accepted: false, error: "Failed to update case." };
    }

    const now = new Date();
    const noteContent =
      evidence?.trim() ||
      `Structured facts recorded:\n${JSON.stringify(facts, null, 2)}`;
    const noteInsert = await notesCollection().insertOne({
      _id: new ObjectId(),
      caseId: new ObjectId(caseId),
      userId: new ObjectId(userData.userId),
      content: noteContent,
      createdAt: now,
      updatedAt: now,
    });

    // Handle explicit task completion signal from agent
    if (completes_task_id) {
      const task = result.checklist.find((t) => t.id === completes_task_id);
      if (task && task.status !== "completed") {
        task.status = "completed";
        await casesCollection().updateOne(
          { _id: new ObjectId(caseId) },
          { $set: { checklist: result.checklist, updatedAt: new Date() } },
        );
      }
    }

    // Build applied changes
    const appliedChanges = Object.keys(facts).map((key) => ({
      path: key,
      action: key in before.facts ? "updated" : "added",
    }));

    // Find next pending task
    const nextPending =
      result.checklist.find(
        (t) => t.status === "pending" && t.priority === "high",
      ) ??
      result.checklist.find(
        (t) => t.status === "pending" && t.priority === "normal",
      );

    const completedCount = result.checklist.filter(
      (t) => t.status === "completed",
    ).length;
    const completeness =
      result.checklist.length > 0
        ? Math.round((completedCount / result.checklist.length) * 100) / 100
        : 1;

    // Task status update
    let taskStatusUpdate = null;
    if (completes_task_id) {
      const task = result.checklist.find((t) => t.id === completes_task_id);
      taskStatusUpdate = task
        ? { task_id: completes_task_id, new_status: task.status }
        : null;
    }

    // Build suggestion
    let suggestion: string;
    if (conflicts.length > 0) {
      suggestion = "Clarify conflict first.";
    } else if (result.nextQuestion) {
      suggestion = `Move to topic: ${result.nextQuestion.key}`;
    } else if (nextPending) {
      suggestion = `Move to topic: ${nextPending.topic}`;
    } else {
      suggestion = "All tasks completed — wrap up intake.";
    }

    const noteResult = {
      accepted: true,
      applied_changes: appliedChanges,
      task_status_update: taskStatusUpdate,
      conflicts,
      completeness_now: completeness,
      next_pending_task: nextPending
        ? `${nextPending.id} (${nextPending.topic})`
        : null,
      note_id: noteInsert.insertedId.toHexString(),
      suggestion,
    };
    console.log("[tool:note] result:", JSON.stringify(noteResult, null, 2));

    // Emit to frontend via SSE
    await emitCaseEvent(caseId, "case_update", result);

    return noteResult;
  },
});

// ─── TOOL 3: orient ─────────────────────────────────────────

export const orient = llm.tool({
  description:
    "Get current conversation state when uncertain. Use when the client says something unexpected, you're unsure which topic to address next, multiple turns spent without progress, or you need context to respond. NOT for routine use after every note call.",
  parameters: z.object({}),
  execute: async (_args, opts) => {
    console.log("[tool:orient] called");
    const userData = opts.ctx.userData as SessionUserData;
    const caseId = userData.caseId;
    if (!caseId) {
      console.log("[tool:orient] no active case — pre-intake");
      return {
        current_phase: "pre-intake",
        suggested_action: "Call start_intake to begin.",
      };
    }

    const caseDoc = await caseStateService.getState(caseId);
    if (!caseDoc) {
      return { error: "Case not found." };
    }

    const playbook = getPlaybook(caseDoc.playbook);
    const checklist = caseDoc.checklist;

    const completed = checklist.filter(
      (t) => t.status === "completed",
    ).length;
    const partial = checklist.filter((t) => t.status === "partial").length;
    const pending = checklist.filter((t) => t.status === "pending").length;

    const currentFocus =
      checklist.find((t) => t.status === "partial") ??
      checklist.find(
        (t) => t.status === "pending" && t.priority === "high",
      ) ??
      checklist.find((t) => t.status === "pending");

    // Build case summary from facts
    const factEntries = Object.entries(caseDoc.facts);
    const caseSummary =
      factEntries.length > 0
        ? factEntries
            .map(
              ([k, v]) =>
                `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`,
            )
            .join("; ")
        : "No facts recorded yet.";

    // Build concerns
    const concerns: string[] = [];
    const highPending = checklist.filter(
      (t) => t.status === "pending" && t.priority === "high",
    );
    if (highPending.length > 0 && completed > 0) {
      concerns.push(
        `${highPending.length} high-priority tasks still pending: ${highPending.map((t) => t.topic).join(", ")}`,
      );
    }
    for (const risk of caseDoc.risks) {
      concerns.push(`${risk.severity} risk: ${risk.label}`);
    }

    // Suggested action using playbook question engine
    const nextQ = getNextQuestion(caseDoc.facts, playbook);
    let suggestedAction: string;
    if (completed === checklist.length && checklist.length > 0) {
      suggestedAction =
        "All intake tasks completed. Summarize findings and wrap up.";
    } else if (nextQ) {
      suggestedAction = `Ask about: ${nextQ.question}`;
    } else if (currentFocus) {
      suggestedAction = `Continue with: ${currentFocus.topic}. ${currentFocus.guidance}`;
    } else {
      suggestedAction =
        "Review collected facts and proceed to remaining tasks.";
    }

    const orientResult = {
      current_phase: "intake",
      checklist_summary: {
        total: checklist.length,
        completed,
        in_progress: partial,
        pending,
        current_focus: currentFocus
          ? `${currentFocus.id} (${currentFocus.topic})`
          : null,
      },
      case_summary: caseSummary,
      suggested_action: suggestedAction,
      concerns,
    };
    console.log("[tool:orient] result:", JSON.stringify(orientResult, null, 2));
    return orientResult;
  },
});

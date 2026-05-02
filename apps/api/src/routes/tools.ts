import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { casesCollection } from "../entities/index.js";
import { caseStateService } from "../case/state.js";
import { getPlaybook } from "../playbooks/index.js";
import { getNextQuestion } from "../extraction/question.js";

export const tools = new Hono()

  // ─── start-intake ───────────────────────────────────────
  .post("/start-intake", async (c) => {
    const body = await c.req.json<{
      userId: string;
      playbook?: string;
      caseId?: string;
    }>();

    let caseId = body.caseId;

    if (!caseId) {
      const caseDoc = await caseStateService.createCase(
        body.userId,
        body.playbook ?? "general",
      );
      caseId = caseDoc._id.toHexString();
    }

    const caseDoc = await caseStateService.getState(caseId);
    if (!caseDoc) return c.json({ error: "Case not found" }, 404);

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

    return c.json({
      caseId,
      checklist: caseDoc.checklist,
      summary:
        Object.keys(caseDoc.facts).length > 0
          ? `Some data already collected: ${Object.keys(caseDoc.facts).join(", ")}`
          : "No data collected yet — starting fresh.",
      total_tasks: caseDoc.checklist.length,
      completed_tasks: completed,
      first_topic_suggestion: firstPending
        ? `Start with: ${firstPending.topic}`
        : "All tasks completed.",
    });
  })

  // ─── note ───────────────────────────────────────────────
  .post("/note", async (c) => {
    const body = await c.req.json<{
      caseId: string;
      facts: Record<string, unknown>;
      completes_task_id?: string;
      evidence?: string;
    }>();

    const before = await caseStateService.getState(body.caseId);
    if (!before) return c.json({ error: "Case not found" }, 404);

    // Detect conflicts
    const conflicts: {
      field: string;
      old: unknown;
      new_value: unknown;
      needs_clarification: boolean;
    }[] = [];
    for (const [key, value] of Object.entries(body.facts)) {
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

    const result = await caseStateService.processAndUpdate(
      body.caseId,
      body.facts,
    );
    if (!result) return c.json({ error: "Failed to update case" }, 500);

    // Handle explicit task completion
    if (body.completes_task_id) {
      const task = result.checklist.find(
        (t) => t.id === body.completes_task_id,
      );
      if (task && task.status !== "completed") {
        task.status = "completed";
        await casesCollection().updateOne(
          { _id: new ObjectId(body.caseId) },
          { $set: { checklist: result.checklist, updatedAt: new Date() } },
        );
      }
    }

    const appliedChanges = Object.keys(body.facts).map((key) => ({
      path: key,
      action: key in before.facts ? "updated" : "added",
    }));

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

    let taskStatusUpdate = null;
    if (body.completes_task_id) {
      const task = result.checklist.find(
        (t) => t.id === body.completes_task_id,
      );
      taskStatusUpdate = task
        ? { task_id: body.completes_task_id, new_status: task.status }
        : null;
    }

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

    return c.json({
      accepted: true,
      applied_changes: appliedChanges,
      task_status_update: taskStatusUpdate,
      conflicts,
      completeness_now: completeness,
      next_pending_task: nextPending
        ? `${nextPending.id} (${nextPending.topic})`
        : null,
      suggestion,
    });
  })

  // ─── orient ─────────────────────────────────────────────
  .get("/orient/:caseId", async (c) => {
    const caseDoc = await caseStateService.getState(c.req.param("caseId"));
    if (!caseDoc) return c.json({ error: "Case not found" }, 404);

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

    return c.json({
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
    });
  });

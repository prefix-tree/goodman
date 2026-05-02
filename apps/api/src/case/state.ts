import { ObjectId } from "mongodb";
import {
  type Case,
  type ChecklistTask,
  type CaseRequirement,
  casesCollection,
  transcriptSegmentsCollection,
} from "../entities/index.js";
import { getPlaybook, type PlaybookDefinition } from "../playbooks/index.js";
import { extractFacts } from "../extraction/keyword.js";
import { evaluateRisks } from "../extraction/risk.js";
import { getNextQuestion } from "../extraction/question.js";

export interface CaseUpdateResult {
  caseId: string;
  facts: Record<string, unknown>;
  checklist: ChecklistTask[];
  risks: Case["risks"];
  requirements: CaseRequirement[];
  completion: number;
  nextQuestion: { key: string; question: string } | null;
}

export class CaseStateService {
  async getState(caseId: string): Promise<Case | null> {
    if (!ObjectId.isValid(caseId)) {
      console.error("[CaseStateService.getState] Invalid caseId:", caseId);
      return null;
    }
    return casesCollection().findOne({ _id: new ObjectId(caseId) });
  }

  async createCase(userId: string, playbookId: string): Promise<Case> {
    const playbook = getPlaybook(playbookId);
    const now = new Date();

    const doc: Case = {
      _id: new ObjectId(),
      userId: new ObjectId(userId),
      title: `${playbook.label} — ${now.toLocaleDateString("en-GB")}`,
      status: "in_progress",
      playbook: playbookId,
      facts: {},
      checklist: this.buildChecklist(playbook),
      risks: [],
      requirements: this.computeRequirements({}, playbook),
      completion: 0,
      summary: null,
      createdAt: now,
      updatedAt: now,
    };

    await casesCollection().insertOne(doc);
    return doc;
  }

  /**
   * Atomic read → merge facts → recompute derived state → write.
   */
  async processAndUpdate(
    caseId: string,
    newFacts: Record<string, unknown>,
  ): Promise<CaseUpdateResult | null> {
    const caseDoc = await this.getState(caseId);
    if (!caseDoc) return null;

    const playbook = getPlaybook(caseDoc.playbook);

    // Merge facts: new values overwrite existing
    const mergedFacts = { ...caseDoc.facts, ...newFacts };

    // Recompute derived state
    const risks = evaluateRisks(mergedFacts, playbook);
    const checklist = this.updateChecklist(caseDoc.checklist, mergedFacts, playbook);
    const requirements = this.computeRequirements(mergedFacts, playbook);
    const completion = this.computeCompletion(mergedFacts, playbook);
    const nextQuestion = getNextQuestion(mergedFacts, playbook);

    await casesCollection().updateOne(
      { _id: new ObjectId(caseId) },
      {
        $set: {
          facts: mergedFacts,
          checklist,
          risks,
          requirements,
          completion,
          updatedAt: new Date(),
        },
      },
    );

    return {
      caseId,
      facts: mergedFacts,
      checklist,
      risks,
      requirements,
      completion,
      nextQuestion,
    };
  }

  /**
   * Extract facts from transcript text and process.
   */
  async updateFromTranscript(
    caseId: string,
    text: string,
  ): Promise<CaseUpdateResult | null> {
    const caseDoc = await this.getState(caseId);
    if (!caseDoc) return null;

    const playbook = getPlaybook(caseDoc.playbook);
    const newFacts = extractFacts(text, playbook);

    if (Object.keys(newFacts).length === 0) return null;

    return this.processAndUpdate(caseId, newFacts);
  }

  /**
   * Store a transcript segment.
   */
  async addTranscript(
    caseId: string,
    speaker: "user" | "agent",
    text: string,
    isFinal: boolean,
  ): Promise<void> {
    if (!ObjectId.isValid(caseId)) {
      console.error("[CaseStateService.addTranscript] Invalid caseId:", caseId);
      return;
    }
    await transcriptSegmentsCollection().insertOne({
      _id: new ObjectId(),
      caseId: new ObjectId(caseId),
      speaker,
      text,
      isFinal,
      createdAt: new Date(),
    });
  }

  // --- Pure computation helpers ---

  private buildChecklist(playbook: PlaybookDefinition): ChecklistTask[] {
    // Group required facts into checklist tasks by topic
    const topics = new Map<string, string[]>();
    for (const fact of playbook.requiredFacts) {
      if (!fact.required) continue;
      const topic = fact.label;
      topics.set(fact.key, [topic]);
    }

    return playbook.requiredFacts
      .filter((f) => f.required)
      .map((f) => ({
        id: f.key,
        topic: f.label,
        whatToCollect: [f.question],
        guidance: f.question,
        status: "pending" as const,
        priority: "normal" as const,
      }));
  }

  private updateChecklist(
    checklist: ChecklistTask[],
    facts: Record<string, unknown>,
    _playbook: PlaybookDefinition,
  ): ChecklistTask[] {
    return checklist.map((task) => ({
      ...task,
      status: task.id in facts ? "completed" as const : task.status,
    }));
  }

  private computeRequirements(
    facts: Record<string, unknown>,
    playbook: PlaybookDefinition,
  ): CaseRequirement[] {
    const now = new Date();

    return playbook.requiredDocuments
      .filter((doc) => {
        if (!doc.conditionFacts || doc.conditionFacts.length === 0) return true;
        return doc.conditionFacts.some((key) => key in facts);
      })
      .map((doc) => ({
        id: doc.id,
        label: doc.label,
        type: "document" as const,
        status: "pending" as const,
        updatedAt: now,
      }));
  }

  private computeCompletion(
    facts: Record<string, unknown>,
    playbook: PlaybookDefinition,
  ): number {
    const requiredFacts = playbook.requiredFacts.filter((f) => f.required);
    if (requiredFacts.length === 0) return 100;

    const filled = requiredFacts.filter((f) => f.key in facts).length;
    return Math.round((filled / requiredFacts.length) * 100);
  }
}

export const caseStateService = new CaseStateService();

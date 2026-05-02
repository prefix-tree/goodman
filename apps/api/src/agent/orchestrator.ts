import type { voice } from "@livekit/agents";
import { caseStateService, type CaseUpdateResult } from "../case/state.js";
import type { PlaybookDefinition } from "../playbooks/types.js";
import { extractFacts } from "../extraction/keyword.js";
import { getNextQuestion } from "../extraction/question.js";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

export class CaseOrchestrator {
  private caseId: string;
  private playbook: PlaybookDefinition;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    caseId: string,
    playbook: PlaybookDefinition,
    private session: voice.AgentSession,
  ) {
    this.caseId = caseId;
    this.playbook = playbook;
  }

  /**
   * Called on every transcript event from LiveKit.
   */
  async onTranscript(text: string, isFinal: boolean): Promise<void> {
    // 1. Store transcript
    await caseStateService.addTranscript(this.caseId, "user", text, isFinal);
    await this.emitEvent("transcript_update", {
      speaker: "user",
      text,
      isFinal,
      timestamp: Date.now(),
    });

    // 2. Fast extraction on every chunk
    await this.fastExtract(text);

    // 3. Debounced deep processing on final transcript
    if (isFinal) {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.deepProcess(text).catch(console.error);
      }, 500);
    }
  }

  /**
   * Fast path: keyword extraction on partial/final transcript.
   */
  private async fastExtract(text: string): Promise<void> {
    const newFacts = extractFacts(text, this.playbook);
    if (Object.keys(newFacts).length === 0) return;

    const result = await caseStateService.processAndUpdate(
      this.caseId,
      newFacts,
    );
    if (result) {
      await this.emitCaseUpdate(result);
    }
  }

  /**
   * Deep path: full recomputation on final transcript.
   * Decides next action based on case state.
   */
  private async deepProcess(text: string): Promise<void> {
    const newFacts = extractFacts(text, this.playbook);
    let result: CaseUpdateResult | null = null;

    if (Object.keys(newFacts).length > 0) {
      result = await caseStateService.processAndUpdate(this.caseId, newFacts);
      if (result) {
        await this.emitCaseUpdate(result);
      }
    }

    // Get current state to decide next action
    const state = await caseStateService.getState(this.caseId);
    if (!state) return;

    const nextQ = getNextQuestion(state.facts, this.playbook);

    if (nextQ) {
      // Ask the next question — agent is the voice, orchestrator is the brain
      this.session.say(nextQ.question);
    } else if (state.completion >= 80 && !state.summary) {
      this.session.say(
        "I think I have a good understanding of your situation. Let me put together your case summary.",
      );
    }
  }

  /**
   * Emit a case_update event to the HTTP server's event bus.
   */
  private async emitCaseUpdate(result: CaseUpdateResult): Promise<void> {
    await this.emitEvent("case_update", result);
  }

  /**
   * Send an event to the HTTP server's internal endpoint.
   * The agent process is separate from the HTTP server, so we POST.
   */
  private async emitEvent(
    event: string,
    data: unknown,
  ): Promise<void> {
    try {
      await fetch(`${API_URL}/_internal/case-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: this.caseId,
          event,
          data,
        }),
      });
    } catch {
      // HTTP server may not be reachable — don't crash the agent
    }
  }
}

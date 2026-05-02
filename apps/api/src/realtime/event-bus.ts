import { EventEmitter } from "node:events";

export interface CaseEvent {
  caseId: string;
  event: "transcript_update" | "case_update" | "risk_detected";
  data: unknown;
  timestamp: number;
}

class CaseEventBus extends EventEmitter {
  publish(caseEvent: CaseEvent): void {
    this.emit(`case:${caseEvent.caseId}`, caseEvent);
  }

  subscribe(
    caseId: string,
    handler: (event: CaseEvent) => void,
  ): () => void {
    const key = `case:${caseId}`;
    this.on(key, handler);
    return () => {
      this.off(key, handler);
    };
  }
}

export const caseEventBus = new CaseEventBus();

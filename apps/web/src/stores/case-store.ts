import { create } from "zustand";

export interface ChecklistTask {
  id: string;
  topic: string;
  whatToCollect: string[];
  guidance: string;
  status: "pending" | "completed" | "partial";
  priority: "high" | "normal" | "low";
}

export interface CaseRisk {
  id: string;
  label: string;
  severity: "high" | "medium" | "low";
  triggerFacts: string[];
  detectedAt: string;
}

export interface CaseRequirement {
  id: string;
  label: string;
  type: "document" | "action" | "information";
  status: "pending" | "provided" | "waived";
  updatedAt: string;
}

export interface TranscriptEntry {
  speaker: "user" | "agent";
  text: string;
  isFinal: boolean;
  timestamp: number;
}

interface CaseState {
  caseId: string | null;
  playbook: string | null;
  facts: Record<string, unknown>;
  checklist: ChecklistTask[];
  risks: CaseRisk[];
  requirements: CaseRequirement[];
  transcript: TranscriptEntry[];
  completion: number;
  summary: string | null;
  currentQuestion: { key: string; question: string } | null;
  status: "idle" | "active" | "complete";

  setCaseId: (id: string) => void;
  setInitialState: (state: CaseSnapshot) => void;
  addTranscript: (entry: TranscriptEntry) => void;
  updateCase: (update: CaseUpdate) => void;
  reset: () => void;
}

export interface CaseSnapshot {
  caseId: string;
  playbook: string;
  facts: Record<string, unknown>;
  checklist: ChecklistTask[];
  risks: CaseRisk[];
  requirements: CaseRequirement[];
  completion: number;
  summary: string | null;
  status: string;
}

export interface CaseUpdate {
  caseId: string;
  facts: Record<string, unknown>;
  checklist: ChecklistTask[];
  risks: CaseRisk[];
  requirements: CaseRequirement[];
  completion: number;
  nextQuestion: { key: string; question: string } | null;
}

const initialState = {
  caseId: null,
  playbook: null,
  facts: {},
  checklist: [],
  risks: [],
  requirements: [],
  transcript: [],
  completion: 0,
  summary: null,
  currentQuestion: null,
  status: "idle" as const,
};

export const useCaseStore = create<CaseState>((set) => ({
  ...initialState,

  setCaseId: (id) => set({ caseId: id, status: "active" }),

  setInitialState: (state) =>
    set({
      caseId: state.caseId,
      playbook: state.playbook,
      facts: state.facts,
      checklist: state.checklist,
      risks: state.risks,
      requirements: state.requirements,
      completion: state.completion,
      summary: state.summary,
      status: "active",
    }),

  addTranscript: (entry) =>
    set((s) => ({ transcript: [...s.transcript, entry] })),

  updateCase: (update) =>
    set({
      facts: update.facts,
      checklist: update.checklist,
      risks: update.risks,
      requirements: update.requirements,
      completion: update.completion,
      currentQuestion: update.nextQuestion,
    }),

  reset: () => set(initialState),
}));

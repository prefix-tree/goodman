import type { CaseFact } from "../entities/case.js";

export interface PlaybookFact {
  key: string;
  label: string;
  patterns: string[];
  question: string;
  required: boolean;
}

export interface RiskRule {
  id: string;
  label: string;
  severity: "high" | "medium" | "low";
  condition: (facts: CaseFact[]) => boolean;
}

export interface DocumentRequirement {
  id: string;
  label: string;
  /** Only required when these fact keys exist */
  conditionFacts?: string[];
}

export interface PlaybookDefinition {
  id: string;
  label: string;
  requiredFacts: PlaybookFact[];
  riskRules: RiskRule[];
  requiredDocuments: DocumentRequirement[];
  /** Fact keys in the order they should be asked */
  questionOrder: string[];
}

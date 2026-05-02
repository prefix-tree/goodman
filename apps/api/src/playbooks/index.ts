import type { PlaybookDefinition } from "./types.js";
import { immigration } from "./immigration.js";
import { fines } from "./fines.js";
import { claims } from "./claims.js";

const general: PlaybookDefinition = {
  id: "general",
  label: "General Legal Matter",
  requiredFacts: [
    {
      key: "situation_summary",
      label: "What happened",
      patterns: [],
      question: "Can you describe your situation?",
      required: true,
    },
    {
      key: "parties_involved",
      label: "Who is involved",
      patterns: [
        "(?:with|against|by|from)\\s+(\\w[\\w\\s]+?)(?:\\.|,|$)",
      ],
      question: "Who else is involved in this matter?",
      required: true,
    },
    {
      key: "deadline",
      label: "Any deadline",
      patterns: [
        "(deadline|due|by|before)\\s+(\\w+\\s*\\d*)",
        "(urgent|asap|soon|immediately)",
      ],
      question: "Are there any deadlines you're aware of?",
      required: false,
    },
    {
      key: "desired_outcome",
      label: "Desired outcome",
      patterns: [
        "(?:want|need|hoping|like)\\s+(?:to\\s+)?(.+?)(?:\\.|$)",
      ],
      question: "What outcome are you hoping for?",
      required: true,
    },
  ],
  riskRules: [],
  requiredDocuments: [
    { id: "relevant_documents", label: "Any relevant documents" },
  ],
  questionOrder: [
    "situation_summary",
    "parties_involved",
    "deadline",
    "desired_outcome",
  ],
};

const registry: Record<string, PlaybookDefinition> = {
  immigration,
  appeal: fines,
  "small-claims": claims,
  response: general,
  eligibility: general,
  general,
};

export function getPlaybook(id: string): PlaybookDefinition {
  return registry[id] ?? general;
}

export function listPlaybooks(): PlaybookDefinition[] {
  return Object.values(registry);
}

export type { PlaybookDefinition, PlaybookFact, RiskRule, DocumentRequirement } from "./types.js";

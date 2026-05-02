import type { PlaybookDefinition } from "./types.js";

export const fines: PlaybookDefinition = {
  id: "appeal",
  label: "Fine or Penalty Appeal",

  requiredFacts: [
    {
      key: "fine_type",
      label: "Type of fine or penalty",
      patterns: [
        "(parking|speeding|council tax|penalty charge|fixed penalty|PCN|congestion)",
        "(fine|penalty|charge)\\s+(?:for|from)\\s+(\\w+)",
      ],
      question: "What type of fine or penalty did you receive?",
      required: true,
    },
    {
      key: "fine_amount",
      label: "Amount",
      patterns: [
        "[£$](\\d+(?:\\.\\d{2})?)",
        "(\\d+)\\s*(?:pounds|quid|dollars)",
      ],
      question: "How much is the fine?",
      required: true,
    },
    {
      key: "fine_date",
      label: "Date received",
      patterns: [
        "(?:received|got|issued)\\s+(?:on|in|last)?\\s*(\\w+\\s*\\d*\\s*\\d*)",
        "(last week|last month|yesterday|today|\\d+\\s+days? ago)",
      ],
      question: "When did you receive the fine?",
      required: true,
    },
    {
      key: "issuing_body",
      label: "Issued by",
      patterns: [
        "(?:from|by|issued by)\\s+(\\w[\\w\\s]+?)(?:\\.|,|$)",
        "(council|police|TfL|DVLA|HMRC)",
      ],
      question: "Who issued the fine?",
      required: true,
    },
    {
      key: "already_responded",
      label: "Has responded",
      patterns: [
        "(already responded|already appealed|wrote back|replied|haven't responded|not yet)",
      ],
      question: "Have you already responded or appealed?",
      required: true,
    },
    {
      key: "grounds_for_appeal",
      label: "Grounds for appeal",
      patterns: [
        "(?:because|reason|grounds?)\\s+(.+?)(?:\\.|$)",
        "(wasn't me|wrong address|already paid|didn't receive|error|mistake)",
      ],
      question: "Why do you believe the fine should be appealed?",
      required: true,
    },
  ],

  riskRules: [
    {
      id: "deadline_risk",
      label: "Response deadline may be approaching",
      severity: "high",
      condition: (facts) =>
        facts.some(
          (f) =>
            f.key === "already_responded" &&
            ["no", "not yet", "haven't responded"].includes(
              f.value.toLowerCase(),
            ),
        ),
    },
    {
      id: "escalation_risk",
      label: "Fine may escalate if not addressed",
      severity: "medium",
      condition: (facts) =>
        facts.some(
          (f) =>
            f.key === "fine_amount" &&
            Number(f.value.replace(/[^0-9.]/g, "")) > 500,
        ),
    },
  ],

  requiredDocuments: [
    { id: "fine_notice", label: "Copy of fine or penalty notice" },
    { id: "evidence", label: "Supporting evidence (photos, receipts, etc.)" },
    {
      id: "previous_correspondence",
      label: "Any previous correspondence",
      conditionFacts: ["already_responded"],
    },
  ],

  questionOrder: [
    "fine_type",
    "fine_amount",
    "fine_date",
    "issuing_body",
    "already_responded",
    "grounds_for_appeal",
  ],
};

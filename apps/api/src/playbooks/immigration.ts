import type { PlaybookDefinition } from "./types.js";

export const immigration: PlaybookDefinition = {
  id: "immigration",
  label: "UK Immigration",

  requiredFacts: [
    {
      key: "nationality",
      label: "Nationality",
      patterns: [
        "(?:i am|i'm|from)\\s+(\\w+)",
        "(\\w+)\\s+passport",
        "citizen(?:ship)?\\s+(?:is|of)\\s+(\\w+)",
      ],
      question: "What is your nationality?",
      required: true,
    },
    {
      key: "visa_type",
      label: "Type of visa",
      patterns: [
        "(visitor|student|work|tourist|family|spouse)\\s*visa",
        "visa\\s+(?:type|for)\\s+(\\w+)",
      ],
      question: "What type of visa are you applying for?",
      required: true,
    },
    {
      key: "travel_purpose",
      label: "Purpose of travel",
      patterns: [
        "(?:visit|see|stay with)\\s+(?:my\\s+)?(\\w+)",
        "going\\s+(?:for|to)\\s+(\\w+)",
        "want\\s+to\\s+(visit|see|attend|study|work)",
      ],
      question: "What is the purpose of your visit to the UK?",
      required: true,
    },
    {
      key: "previous_refusal",
      label: "Previous visa refusal",
      patterns: [
        "(refused|denied|rejected|refusal|turned down)",
        "visa\\s+was\\s+(not approved|declined)",
      ],
      question: "Have you had any previous visa refusals?",
      required: true,
    },
    {
      key: "refusal_date",
      label: "Refusal date",
      patterns: [
        "refused\\s+(?:in|on|last|around)?\\s*(\\d{4})",
        "(last year|\\d+\\s+months? ago|\\d{4})",
      ],
      question: "When was the refusal?",
      required: false,
    },
    {
      key: "refusal_reason",
      label: "Refusal reason",
      patterns: [
        "reason\\s+(?:was|being)\\s+(.+?)(?:\\.|$)",
        "(?:because|they said)\\s+(.+?)(?:\\.|$)",
      ],
      question: "Do you know the reason for the refusal?",
      required: false,
    },
    {
      key: "financial_situation",
      label: "Financial situation",
      patterns: [
        "(employed|self[- ]employed|unemployed|retired|student)",
        "(?:savings|sponsor|supported by|paid by)\\s+(\\w+)",
        "(?:i work|working)\\s+(?:as|at|for|in)\\s+(\\w+)",
      ],
      question: "How will you fund your trip? Are you employed?",
      required: true,
    },
    {
      key: "travel_dates",
      label: "Intended travel dates",
      patterns: [
        "(?:in|on|around|for)\\s+(\\w+\\s+\\d{4})",
        "(next month|next week|next year)",
        "(?:for|about|around)\\s+(\\d+\\s+(?:days|weeks|months))",
      ],
      question: "When do you plan to travel, and for how long?",
      required: true,
    },
    {
      key: "host_relationship",
      label: "Relationship to host",
      patterns: [
        "(?:visit|see|stay with)\\s+(?:my\\s+)?(sister|brother|friend|cousin|uncle|aunt|family|relative|partner|wife|husband)",
        "(sister|brother|friend|cousin|uncle|aunt|family|relative|partner)\\s+(?:in|lives in|who lives)",
      ],
      question: "Who will you be staying with, and what is your relationship to them?",
      required: false,
    },
  ],

  riskRules: [
    {
      id: "previous_refusal",
      label: "Previous visa refusal detected",
      severity: "high",
      condition: (facts) => {
        const v = facts.previous_refusal;
        return (
          typeof v === "string" &&
          !["no", "none", "never"].includes(v.toLowerCase())
        );
      },
    },
    {
      id: "no_employment",
      label: "No clear employment or financial support",
      severity: "medium",
      condition: (facts) => !("financial_situation" in facts),
    },
    {
      id: "missing_financials",
      label: "Additional financial documentation likely required",
      severity: "medium",
      condition: (facts) => {
        const v = facts.financial_situation;
        return (
          typeof v === "string" &&
          ["self-employed", "unemployed", "sponsor", "retired"].includes(
            v.toLowerCase(),
          )
        );
      },
    },
  ],

  requiredDocuments: [
    { id: "passport", label: "Valid passport" },
    { id: "bank_statements", label: "Bank statements (last 6 months)" },
    {
      id: "employment_letter",
      label: "Employment letter or business registration",
    },
    {
      id: "invitation_letter",
      label: "Invitation letter from host",
      conditionFacts: ["host_relationship"],
    },
    {
      id: "previous_refusal_letter",
      label: "Previous refusal letter",
      conditionFacts: ["previous_refusal"],
    },
  ],

  questionOrder: [
    "nationality",
    "travel_purpose",
    "visa_type",
    "previous_refusal",
    "refusal_date",
    "refusal_reason",
    "financial_situation",
    "travel_dates",
    "host_relationship",
  ],
};

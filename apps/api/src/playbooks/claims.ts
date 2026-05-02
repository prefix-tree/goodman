import type { PlaybookDefinition } from "./types.js";

export const claims: PlaybookDefinition = {
  id: "small-claims",
  label: "Dispute or Claim",

  requiredFacts: [
    {
      key: "dispute_type",
      label: "Type of dispute",
      patterns: [
        "(landlord|tenant|neighbour|contractor|seller|buyer|employer)",
        "(money owed|damage|breach of contract|faulty goods|unpaid|deposit)",
      ],
      question: "What is the dispute about?",
      required: true,
    },
    {
      key: "other_party",
      label: "Other party",
      patterns: [
        "(?:with|against|by)\\s+(\\w[\\w\\s]+?)(?:\\.|,|$)",
        "(landlord|tenant|company|business|neighbour|employer)",
      ],
      question: "Who is the dispute with?",
      required: true,
    },
    {
      key: "claim_amount",
      label: "Amount claimed",
      patterns: [
        "[£$](\\d+(?:\\.\\d{2})?)",
        "(\\d+)\\s*(?:pounds|quid)",
        "(?:owe|owes|owed)\\s+(?:me\\s+)?[£$]?(\\d+)",
      ],
      question: "How much money is involved?",
      required: true,
    },
    {
      key: "when_occurred",
      label: "When it happened",
      patterns: [
        "(?:happened|occurred|started)\\s+(?:in|on|last)?\\s*(\\w+\\s*\\d*)",
        "(last year|last month|\\d+\\s+(?:weeks?|months?) ago|\\d{4})",
      ],
      question: "When did this happen?",
      required: true,
    },
    {
      key: "evidence_available",
      label: "Evidence available",
      patterns: [
        "(contract|receipt|email|text|photo|message|letter|invoice|agreement)",
        "(?:have|got)\\s+(evidence|proof|documentation)",
      ],
      question: "What evidence do you have (contracts, receipts, messages)?",
      required: true,
    },
    {
      key: "attempted_resolution",
      label: "Prior resolution attempts",
      patterns: [
        "(tried|attempted|contacted|wrote|called|emailed|spoke|talked)",
        "(no response|ignored|refused|won't respond)",
      ],
      question: "Have you tried to resolve this directly with the other party?",
      required: true,
    },
  ],

  riskRules: [
    {
      id: "high_value_claim",
      label: "Claim may exceed small claims limit (£10,000)",
      severity: "high",
      condition: (facts) =>
        facts.some(
          (f) =>
            f.key === "claim_amount" &&
            Number(f.value.replace(/[^0-9.]/g, "")) > 10000,
        ),
    },
    {
      id: "no_evidence",
      label: "Limited evidence may weaken the claim",
      severity: "medium",
      condition: (facts) =>
        !facts.some((f) => f.key === "evidence_available"),
    },
  ],

  requiredDocuments: [
    { id: "contract", label: "Contract or agreement (if any)" },
    { id: "correspondence", label: "Correspondence with other party" },
    { id: "invoices", label: "Invoices, receipts, or proof of payment" },
    { id: "evidence_photos", label: "Photos or other evidence" },
  ],

  questionOrder: [
    "dispute_type",
    "other_party",
    "claim_amount",
    "when_occurred",
    "evidence_available",
    "attempted_resolution",
  ],
};

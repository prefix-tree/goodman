import type { PlaybookDefinition } from "./types.js";

function textValue(facts: Record<string, unknown>, key: string): string {
  const value = facts[key];
  return typeof value === "string" ? value.toLowerCase() : "";
}

function hasAffirmativeFact(facts: Record<string, unknown>, key: string): boolean {
  const value = textValue(facts, key);
  return value !== "" && !["no", "none", "never", "not applicable", "n/a"].includes(value);
}

export const immigration: PlaybookDefinition = {
  id: "immigration",
  label: "UK Visitor Visa",

  requiredFacts: [
    {
      key: "applicant_nationality",
      label: "Applicant nationality",
      patterns: [
        "(?:i am|i'm|im|from)\\s+([a-z][a-z\\s-]+?)(?:\\.|,|$)",
        "([a-z][a-z\\s-]+?)\\s+passport",
        "citizen(?:ship)?\\s+(?:is|of)\\s+([a-z][a-z\\s-]+?)(?:\\.|,|$)",
      ],
      question: "What is your nationality?",
      required: true,
    },
    {
      key: "application_location",
      label: "Applying from",
      patterns: [
        "applying\\s+from\\s+([a-z][a-z\\s-]+?)(?:\\.|,|$)",
        "currently\\s+(?:in|living in|based in)\\s+([a-z][a-z\\s-]+?)(?:\\.|,|$)",
        "i live in\\s+([a-z][a-z\\s-]+?)(?:\\.|,|$)",
      ],
      question: "Which country are you applying from?",
      required: true,
    },
    {
      key: "visit_purpose",
      label: "Purpose of visit",
      patterns: [
        "(?:visit|see|stay with)\\s+(?:my\\s+)?([a-z][a-z\\s-]+?)(?:\\.|,|$)",
        "(?:tourism|holiday|vacation|business meeting|conference|family visit|medical treatment)",
        "going\\s+(?:to the uk|to britain|there)?\\s*(?:for|to)\\s+([a-z][a-z\\s-]+?)(?:\\.|,|$)",
      ],
      question: "What is the main purpose of your visit to the UK?",
      required: true,
    },
    {
      key: "visit_duration",
      label: "Visit duration",
      patterns: [
        "(?:for|about|around)\\s+(\\d+\\s+(?:days|weeks|months))",
        "(?:stay|staying)\\s+(?:for|about|around)?\\s*(\\d+\\s+(?:days|weeks|months))",
        "(one|two|three|four|five|six)\\s+(?:days|weeks|months)",
      ],
      question: "How long do you plan to stay in the UK?",
      required: true,
    },
    {
      key: "travel_dates",
      label: "Travel dates",
      patterns: [
        "(?:travel|arrive|leave|visit)\\s+(?:in|on|around)?\\s*([a-z]+\\s+\\d{4})",
        "(?:in|around)\\s+([a-z]+\\s+\\d{4})",
        "(next month|next week|next year)",
      ],
      question: "When do you plan to travel?",
      required: true,
    },
    {
      key: "uk_host",
      label: "UK host or accommodation",
      patterns: [
        "(?:stay with|staying with|visit|see)\\s+(?:my\\s+)?([a-z][a-z\\s-]+?)(?:\\.|,|$)",
        "(?:hotel|airbnb|hostel|friend|sister|brother|cousin|uncle|aunt|partner|family)",
        "invitation\\s+(?:from|letter from)\\s+([a-z][a-z\\s-]+?)(?:\\.|,|$)",
      ],
      question: "Where will you stay in the UK, and is anyone hosting you?",
      required: true,
    },
    {
      key: "employment_or_study_status",
      label: "Employment or study status",
      patterns: [
        "(employed|self-employed|self employed|unemployed|retired|student|business owner)",
        "(?:i work|working)\\s+(?:as|at|for|in)\\s+([a-z][a-z\\s-]+?)(?:\\.|,|$)",
        "(?:i study|studying)\\s+(?:at|in)\\s+([a-z][a-z\\s-]+?)(?:\\.|,|$)",
      ],
      question: "What do you currently do for work or study?",
      required: true,
    },
    {
      key: "monthly_income",
      label: "Monthly income",
      patterns: [
        "(?:earn|income|salary)\\s+(?:is\\s+)?(?:about\\s+)?[£$]?\\s*(\\d+(?:,\\d{3})*(?:\\.\\d{2})?)",
        "[£$]\\s*(\\d+(?:,\\d{3})*(?:\\.\\d{2})?)\\s+(?:per month|monthly|a month)",
      ],
      question: "What is your approximate monthly income?",
      required: true,
    },
    {
      key: "trip_funding",
      label: "Trip funding",
      patterns: [
        "(?:paying|funding|covering)\\s+(?:for\\s+)?(?:the trip|it)?\\s*(?:myself|by myself|with savings|from savings)",
        "(?:sponsor|sponsored|paid by|supported by)\\s+([a-z][a-z\\s-]+?)(?:\\.|,|$)",
        "(?:my\\s+)?(father|mother|sister|brother|partner|employer|company)\\s+(?:will pay|is paying|sponsors)",
      ],
      question: "Who will pay for the trip, and from what funds?",
      required: true,
    },
    {
      key: "home_ties",
      label: "Ties to home country",
      patterns: [
        "(?:job|work|employment|business|property|family|children|spouse|studies|school|university)",
        "(?:return|come back)\\s+(?:because|for|to)\\s+(.+?)(?:\\.|$)",
      ],
      question: "What ties do you have to your home country that show you will return?",
      required: true,
    },
    {
      key: "previous_uk_travel",
      label: "Previous UK or international travel",
      patterns: [
        "(?:visited|travelled|traveled)\\s+(?:to\\s+)?(?:the\\s+)?(uk|united kingdom|europe|usa|canada|schengen)",
        "(?:never travelled|never traveled|first time travelling|first time traveling)",
      ],
      question: "Have you travelled to the UK or other countries before?",
      required: false,
    },
    {
      key: "previous_refusal",
      label: "Previous visa refusal",
      patterns: [
        "(refused|denied|rejected|refusal|turned down)",
        "(?:visa|application)\\s+was\\s+(not approved|declined)",
        "(?:no|never)\\s+(?:visa\\s+)?(?:refusal|refused|denied)",
      ],
      question: "Have you ever had a UK or other visa refusal?",
      required: true,
    },
    {
      key: "refusal_reason",
      label: "Refusal reason",
      patterns: [
        "(?:reason|refusal reason)\\s+(?:was|being|is)\\s+(.+?)(?:\\.|$)",
        "(?:because|they said)\\s+(.+?)(?:\\.|$)",
      ],
      question: "If there was a refusal, what reason did they give?",
      required: false,
    },
  ],

  riskRules: [
    {
      id: "previous_refusal",
      label: "Previous visa refusal needs careful explanation",
      severity: "high",
      condition: (facts) => hasAffirmativeFact(facts, "previous_refusal"),
    },
    {
      id: "weak_home_ties",
      label: "Home country ties are not clearly evidenced yet",
      severity: "medium",
      condition: (facts) => !("home_ties" in facts),
    },
    {
      id: "third_party_sponsor",
      label: "Third-party funding will need sponsor evidence",
      severity: "medium",
      condition: (facts) => {
        const funding = textValue(facts, "trip_funding");
        return (
          funding.includes("sponsor") ||
          funding.includes("paid by") ||
          funding.includes("supported by") ||
          funding.includes("father") ||
          funding.includes("mother") ||
          funding.includes("sister") ||
          funding.includes("brother") ||
          funding.includes("partner")
        );
      },
    },
    {
      id: "unclear_finances",
      label: "Financial position is incomplete",
      severity: "medium",
      condition: (facts) =>
        !("monthly_income" in facts) || !("trip_funding" in facts),
    },
  ],

  requiredDocuments: [
    { id: "passport", label: "Current passport" },
    { id: "travel_itinerary", label: "Planned travel dates and itinerary" },
    { id: "bank_statements", label: "Personal bank statements" },
    { id: "income_evidence", label: "Payslips, tax records, or business income evidence" },
    { id: "employment_or_study_letter", label: "Employer, business, or study confirmation" },
    { id: "home_ties_evidence", label: "Evidence of home ties, such as job, family, property, or study commitments" },
    {
      id: "accommodation_evidence",
      label: "Hotel booking or host accommodation details",
      conditionFacts: ["uk_host"],
    },
    {
      id: "invitation_letter",
      label: "Invitation letter and host status evidence",
      conditionFacts: ["uk_host"],
    },
    {
      id: "sponsor_evidence",
      label: "Sponsor bank statements and relationship evidence",
      conditionFacts: ["trip_funding"],
    },
    {
      id: "previous_refusal_letter",
      label: "Previous refusal notice and explanation",
      conditionFacts: ["previous_refusal"],
    },
  ],

  questionOrder: [
    "applicant_nationality",
    "application_location",
    "visit_purpose",
    "visit_duration",
    "travel_dates",
    "uk_host",
    "employment_or_study_status",
    "monthly_income",
    "trip_funding",
    "home_ties",
    "previous_uk_travel",
    "previous_refusal",
    "refusal_reason",
  ],
};

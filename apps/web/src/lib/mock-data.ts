import type {
  ChecklistTask,
  CaseRisk,
  CaseRequirement,
  TranscriptEntry,
} from "@/stores/case-store";

const t = (minAgo: number) => Date.now() - minAgo * 60_000;

export const MOCK_TRANSCRIPT: TranscriptEntry[] = [
  {
    speaker: "agent",
    text: "Hello Sarah! Thank you for calling SOL. I'm Sofia, and I'll be helping you today with your visa matter.",
    isFinal: true,
    timestamp: t(12),
  },
  {
    speaker: "user",
    text: "Hi Sofia, I need help with a work visa application. I've been offered a software engineering position at a company in Berlin.",
    isFinal: true,
    timestamp: t(11),
  },
  {
    speaker: "agent",
    text: "Congratulations on the offer! Let me help you get organized. What type of visa are you applying for — is it an EU Blue Card or a general work permit?",
    isFinal: true,
    timestamp: t(10),
  },
  {
    speaker: "user",
    text: "I believe it's an EU Blue Card. The company said my salary qualifies for it.",
    isFinal: true,
    timestamp: t(9),
  },
  {
    speaker: "agent",
    text: "Great, the EU Blue Card is the best route for skilled workers. Can you tell me your nationality and current country of residence?",
    isFinal: true,
    timestamp: t(8),
  },
  {
    speaker: "user",
    text: "I'm a Ukrainian citizen, currently living in Warsaw, Poland on a temporary residence permit.",
    isFinal: true,
    timestamp: t(7),
  },
  {
    speaker: "agent",
    text: "Understood. And do you have a recognized university degree in computer science or a related field?",
    isFinal: true,
    timestamp: t(6),
  },
  {
    speaker: "user",
    text: "Yes, I have a Master's degree in Computer Science from Kyiv Polytechnic Institute. I also have the apostille for it already.",
    isFinal: true,
    timestamp: t(5),
  },
  {
    speaker: "agent",
    text: "That's excellent — having the apostille ready will speed things up. What's the annual salary in your offer letter?",
    isFinal: true,
    timestamp: t(4),
  },
  {
    speaker: "user",
    text: "It's 72,000 euros per year before tax.",
    isFinal: true,
    timestamp: t(3),
  },
  {
    speaker: "agent",
    text: "That's well above the Blue Card threshold. I've noted all the key facts so far. Do you have health insurance that covers Germany, or will your employer provide that?",
    isFinal: true,
    timestamp: t(2),
  },
  {
    speaker: "user",
    text: "The company provides health insurance from the start date. But I'm a bit worried about the timeline — my Polish permit expires in two months.",
    isFinal: true,
    timestamp: t(1),
  },
];

export const MOCK_FACTS: Record<string, unknown> = {
  visa_type: "EU Blue Card",
  nationality: "Ukrainian",
  current_residence: "Warsaw, Poland",
  residence_permit: "Temporary (Poland)",
  degree: "MSc Computer Science — Kyiv Polytechnic Institute",
  degree_apostille: "Available",
  employer: "Berlin-based tech company",
  position: "Software Engineer",
  annual_salary: "€72,000",
  health_insurance: "Employer-provided",
  permit_expiry: "~2 months from now",
};

export const MOCK_CHECKLIST: ChecklistTask[] = [
  {
    id: "t1",
    topic: "Personal identification",
    whatToCollect: ["Full name", "Date of birth", "Nationality", "Passport number"],
    guidance: "Confirm passport validity — must be valid for at least 3 months beyond visa end date.",
    status: "completed",
    priority: "high",
  },
  {
    id: "t2",
    topic: "Employment details",
    whatToCollect: ["Employer name", "Job title", "Annual salary", "Start date"],
    guidance: "Verify salary meets EU Blue Card threshold (currently €43,800 for IT roles in Germany).",
    status: "completed",
    priority: "high",
  },
  {
    id: "t3",
    topic: "Educational qualifications",
    whatToCollect: ["Degree type", "Institution", "Apostille status"],
    guidance: "Degree must be recognized in Germany — check anabin database.",
    status: "completed",
    priority: "high",
  },
  {
    id: "t4",
    topic: "Health insurance coverage",
    whatToCollect: ["Provider", "Coverage territory", "Start date"],
    guidance: "Must have coverage valid in Germany from day one.",
    status: "partial",
    priority: "normal",
  },
  {
    id: "t5",
    topic: "Housing in Germany",
    whatToCollect: ["Address or proof of accommodation search"],
    guidance: "Required for Anmeldung (city registration) upon arrival.",
    status: "pending",
    priority: "normal",
  },
  {
    id: "t6",
    topic: "Current residence permit status",
    whatToCollect: ["Permit type", "Expiry date", "Any restrictions"],
    guidance: "Check if current permit allows travel to Germany for appointment.",
    status: "partial",
    priority: "high",
  },
];

export const MOCK_RISKS: CaseRisk[] = [
  {
    id: "r1",
    label: "Polish residence permit expiring in ~2 months — tight timeline for Blue Card processing",
    severity: "high",
    triggerFacts: ["permit_expiry"],
    detectedAt: new Date(t(1)).toISOString(),
  },
  {
    id: "r2",
    label: "Degree recognition may require anabin verification if not already listed",
    severity: "medium",
    triggerFacts: ["degree"],
    detectedAt: new Date(t(5)).toISOString(),
  },
];

export const MOCK_REQUIREMENTS: CaseRequirement[] = [
  {
    id: "d1",
    label: "Valid passport (3+ months beyond visa end)",
    type: "document",
    status: "pending",
    updatedAt: new Date(t(10)).toISOString(),
  },
  {
    id: "d2",
    label: "Signed employment contract / offer letter",
    type: "document",
    status: "pending",
    updatedAt: new Date(t(9)).toISOString(),
  },
  {
    id: "d3",
    label: "University degree with apostille",
    type: "document",
    status: "provided",
    updatedAt: new Date(t(5)).toISOString(),
  },
  {
    id: "d4",
    label: "Health insurance confirmation",
    type: "document",
    status: "pending",
    updatedAt: new Date(t(2)).toISOString(),
  },
  {
    id: "d5",
    label: "Biometric photo (35x45mm)",
    type: "document",
    status: "pending",
    updatedAt: new Date(t(10)).toISOString(),
  },
  {
    id: "d6",
    label: "Proof of accommodation in Germany",
    type: "document",
    status: "pending",
    updatedAt: new Date(t(10)).toISOString(),
  },
  {
    id: "d7",
    label: "Book appointment at German embassy / consulate",
    type: "action",
    status: "pending",
    updatedAt: new Date(t(10)).toISOString(),
  },
];

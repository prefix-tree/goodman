import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../db.js";

// --- Embedded types ---

export interface CaseFact {
  key: string;
  value: string;
  source: "transcript" | "document" | "manual";
  sourceRef?: string;
  confidence: "high" | "medium" | "low";
  extractedAt: Date;
}

export interface CaseRisk {
  id: string;
  label: string;
  severity: "high" | "medium" | "low";
  triggerFacts: string[];
  detectedAt: Date;
}

export interface CaseRequirement {
  id: string;
  label: string;
  type: "document" | "action" | "information";
  status: "pending" | "provided" | "waived";
  updatedAt: Date;
}

// --- Case document ---

export interface Case {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  status: "open" | "in_progress" | "closed";
  playbook: string;
  facts: CaseFact[];
  risks: CaseRisk[];
  requirements: CaseRequirement[];
  completion: number;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function casesCollection(): Collection<Case> {
  return getDb().collection<Case>("cases");
}

import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../db.js";

// --- Checklist ---

export interface ChecklistTask {
  id: string;
  topic: string;
  whatToCollect: string[];
  guidance: string;
  status: "pending" | "completed" | "partial";
  priority: "high" | "normal" | "low";
}

// --- Embedded types ---

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
  facts: Record<string, unknown>;
  checklist: ChecklistTask[];
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

import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../db.js";

export interface CaseDocument {
  _id: ObjectId;
  caseId: ObjectId;
  label: string;
  requirementId: string;
  fileUrl: string | null;
  status: "pending" | "uploaded" | "verified";
  createdAt: Date;
}

export function documentsCollection(): Collection<CaseDocument> {
  return getDb().collection<CaseDocument>("documents");
}

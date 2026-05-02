import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../db.js";

export interface TranscriptSegment {
  _id: ObjectId;
  caseId: ObjectId;
  speaker: "user" | "agent";
  text: string;
  isFinal: boolean;
  createdAt: Date;
}

export function transcriptSegmentsCollection(): Collection<TranscriptSegment> {
  return getDb().collection<TranscriptSegment>("transcript_segments");
}

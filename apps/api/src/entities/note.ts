import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../db.js";

export interface Note {
  _id: ObjectId;
  caseId: ObjectId;
  userId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export function notesCollection(): Collection<Note> {
  return getDb().collection<Note>("notes");
}

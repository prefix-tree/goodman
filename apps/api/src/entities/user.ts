import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../db.js";

export interface User {
  _id: ObjectId;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export function usersCollection(): Collection<User> {
  return getDb().collection<User>("users");
}

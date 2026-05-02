import type { Db } from "mongodb";
import { getDb } from "./db.js";

async function ensureCollection(
  db: Db,
  name: string,
  validator: object,
): Promise<void> {
  const collections = await db
    .listCollections({ name })
    .toArray();

  if (collections.length === 0) {
    await db.createCollection(name, { validator });
    console.log(`  Created collection: ${name}`);
  } else {
    await db.command({ collMod: name, validator });
    console.log(`  Updated validator: ${name}`);
  }
}

export async function applySchema(): Promise<void> {
  const db = getDb();
  console.log("Applying database schema...");

  // --- Users ---
  await ensureCollection(db, "users", {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "createdAt", "updatedAt"],
      properties: {
        email: { bsonType: "string" },
        name: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  });
  await db.collection("users").createIndex({ email: 1 }, { unique: true });

  // --- Cases ---
  await ensureCollection(db, "cases", {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "userId",
        "title",
        "status",
        "playbook",
        "facts",
        "risks",
        "requirements",
        "completion",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        userId: { bsonType: "objectId" },
        title: { bsonType: "string" },
        status: {
          bsonType: "string",
          enum: ["open", "in_progress", "closed"],
        },
        playbook: { bsonType: "string" },
        facts: { bsonType: "array" },
        risks: { bsonType: "array" },
        requirements: { bsonType: "array" },
        completion: { bsonType: "number" },
        summary: { bsonType: ["string", "null"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  });
  await db.collection("cases").createIndex({ userId: 1 });
  await db.collection("cases").createIndex({ status: 1 });

  // --- Notes ---
  await ensureCollection(db, "notes", {
    $jsonSchema: {
      bsonType: "object",
      required: ["caseId", "userId", "content", "createdAt", "updatedAt"],
      properties: {
        caseId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        content: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  });
  await db.collection("notes").createIndex({ caseId: 1 });
  await db.collection("notes").createIndex({ userId: 1 });

  // --- Transcript Segments ---
  await ensureCollection(db, "transcript_segments", {
    $jsonSchema: {
      bsonType: "object",
      required: ["caseId", "speaker", "text", "isFinal", "createdAt"],
      properties: {
        caseId: { bsonType: "objectId" },
        speaker: { bsonType: "string", enum: ["user", "agent"] },
        text: { bsonType: "string" },
        isFinal: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
      },
    },
  });
  await db
    .collection("transcript_segments")
    .createIndex({ caseId: 1, createdAt: 1 });

  // --- Documents ---
  await ensureCollection(db, "documents", {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "caseId",
        "label",
        "requirementId",
        "status",
        "createdAt",
      ],
      properties: {
        caseId: { bsonType: "objectId" },
        label: { bsonType: "string" },
        requirementId: { bsonType: "string" },
        fileUrl: { bsonType: ["string", "null"] },
        status: {
          bsonType: "string",
          enum: ["pending", "uploaded", "verified"],
        },
        createdAt: { bsonType: "date" },
      },
    },
  });
  await db.collection("documents").createIndex({ caseId: 1 });

  console.log("Schema applied.");
}

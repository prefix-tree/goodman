import { llm } from "@livekit/agents";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { casesCollection, notesCollection } from "../entities/index.js";
import type { SessionUserData } from "./types.js";

// --- Real tools backed by MongoDB ---

export const createCase = llm.tool({
  description: "Create a new legal case for the user after understanding their situation.",
  parameters: z.object({
    title: z.string().describe("Short title summarizing the case"),
    summary: z.string().describe("Brief summary of the situation as described by the user"),
  }),
  execute: async ({ title, summary }, opts) => {
    const { userId, playbook } = opts.ctx.userData as SessionUserData;
    const now = new Date();
    const result = await casesCollection().insertOne({
      _id: new ObjectId(),
      userId: new ObjectId(userId),
      title,
      status: "open",
      playbook: playbook ?? "general",
      facts: [],
      risks: [],
      requirements: [],
      completion: 0,
      summary: null,
      createdAt: now,
      updatedAt: now,
    });
    await notesCollection().insertOne({
      _id: new ObjectId(),
      caseId: result.insertedId,
      userId: new ObjectId(userId),
      content: summary,
      createdAt: now,
      updatedAt: now,
    });
    return { caseId: result.insertedId.toHexString(), title, status: "open" };
  },
});

export const addNote = llm.tool({
  description: "Add a note or update to an existing case during the conversation.",
  parameters: z.object({
    caseId: z.string().describe("The ID of the case to add the note to"),
    content: z.string().describe("The content of the note"),
  }),
  execute: async ({ caseId, content }, opts) => {
    const { userId } = opts.ctx.userData as SessionUserData;
    const now = new Date();
    await notesCollection().insertOne({
      _id: new ObjectId(),
      caseId: new ObjectId(caseId),
      userId: new ObjectId(userId),
      content,
      createdAt: now,
      updatedAt: now,
    });
    return { status: "saved", caseId };
  },
});

export const listCases = llm.tool({
  description: "List all existing cases for the current user.",
  parameters: z.object({}),
  execute: async (_args, opts) => {
    const { userId } = opts.ctx.userData as SessionUserData;
    const docs = await casesCollection()
      .find({ userId: new ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .limit(10)
      .toArray();
    return docs.map((c) => ({
      id: c._id.toHexString(),
      title: c.title,
      status: c.status,
      updatedAt: c.updatedAt.toISOString(),
    }));
  },
});

// --- Stub tools (replace with real integrations) ---

export const lookupContact = llm.tool({
  description: "Look up a contact by name and return their information.",
  parameters: z.object({
    name: z.string().describe("The name of the contact to look up"),
  }),
  execute: async ({ name }) => {
    // TODO: replace with real DB/CRM lookup
    return { name, phone: "+1-555-0100", email: `${name.toLowerCase()}@example.com` };
  },
});

export const scheduleCallback = llm.tool({
  description: "Schedule a callback for a customer at a specific time.",
  parameters: z.object({
    phoneNumber: z.string().describe("The phone number to call back"),
    scheduledTime: z.string().describe("ISO 8601 datetime for the callback"),
    reason: z.string().describe("Brief reason for the callback"),
  }),
  execute: async ({ phoneNumber, scheduledTime, reason }) => {
    // TODO: persist to database
    return { status: "scheduled", phoneNumber, scheduledTime, reason };
  },
});

export const transferCall = llm.tool({
  description: "Transfer the current call to a human agent or department.",
  parameters: z.object({
    department: z
      .enum(["sales", "support", "billing"])
      .describe("The department to transfer to"),
  }),
  execute: async ({ department }) => {
    // TODO: integrate with telephony provider
    return { status: "transferring", department };
  },
});

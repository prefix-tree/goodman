import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { casesCollection, notesCollection } from "../entities/index.js";

export const tools = new Hono()

  .post("/create-case", async (c) => {
    const body = await c.req.json<{
      userId: string;
      title: string;
      summary: string;
      playbook?: string;
    }>();
    const now = new Date();
    const result = await casesCollection().insertOne({
      _id: new ObjectId(),
      userId: new ObjectId(body.userId),
      title: body.title,
      status: "open",
      playbook: body.playbook ?? "general",
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
      userId: new ObjectId(body.userId),
      content: body.summary,
      createdAt: now,
      updatedAt: now,
    });
    return c.json(
      { caseId: result.insertedId.toHexString(), title: body.title, status: "open" },
      201,
    );
  })

  .post("/add-note", async (c) => {
    const body = await c.req.json<{
      caseId: string;
      userId: string;
      content: string;
    }>();
    const now = new Date();
    await notesCollection().insertOne({
      _id: new ObjectId(),
      caseId: new ObjectId(body.caseId),
      userId: new ObjectId(body.userId),
      content: body.content,
      createdAt: now,
      updatedAt: now,
    });
    return c.json({ status: "saved", caseId: body.caseId }, 201);
  })

  .get("/list-cases/:userId", async (c) => {
    const docs = await casesCollection()
      .find({ userId: new ObjectId(c.req.param("userId")) })
      .sort({ updatedAt: -1 })
      .limit(10)
      .toArray();
    return c.json(
      docs.map((d) => ({
        id: d._id.toHexString(),
        title: d.title,
        status: d.status,
        updatedAt: d.updatedAt.toISOString(),
      })),
    );
  })

  .post("/lookup-contact", async (c) => {
    const { name } = await c.req.json<{ name: string }>();
    // TODO: replace with real DB/CRM lookup
    return c.json({
      name,
      phone: "+1-555-0100",
      email: `${name.toLowerCase()}@example.com`,
    });
  })

  .post("/schedule-callback", async (c) => {
    const body = await c.req.json<{
      phoneNumber: string;
      scheduledTime: string;
      reason: string;
    }>();
    // TODO: persist to database
    return c.json({ status: "scheduled", ...body }, 201);
  })

  .post("/transfer-call", async (c) => {
    const { department } = await c.req.json<{
      department: "sales" | "support" | "billing";
    }>();
    // TODO: integrate with telephony provider
    return c.json({ status: "transferring", department });
  });

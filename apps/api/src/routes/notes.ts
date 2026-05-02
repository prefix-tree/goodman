import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { notesCollection } from "../entities/index.js";

export const notes = new Hono()

  .get("/", async (c) => {
    const caseId = c.req.query("caseId");
    const filter = caseId ? { caseId: new ObjectId(caseId) } : {};
    const docs = await notesCollection().find(filter).toArray();
    return c.json(docs);
  })

  .get("/:id", async (c) => {
    const doc = await notesCollection().findOne({
      _id: new ObjectId(c.req.param("id")),
    });
    if (!doc) return c.json({ error: "Note not found" }, 404);
    return c.json(doc);
  })

  .post("/", async (c) => {
    const body = await c.req.json<{
      caseId: string;
      userId: string;
      content: string;
    }>();
    const now = new Date();
    const result = await notesCollection().insertOne({
      _id: new ObjectId(),
      caseId: new ObjectId(body.caseId),
      userId: new ObjectId(body.userId),
      content: body.content,
      createdAt: now,
      updatedAt: now,
    });
    const doc = await notesCollection().findOne({ _id: result.insertedId });
    return c.json(doc, 201);
  })

  .patch("/:id", async (c) => {
    const body = await c.req.json<Partial<{ content: string }>>();
    const result = await notesCollection().findOneAndUpdate(
      { _id: new ObjectId(c.req.param("id")) },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!result) return c.json({ error: "Note not found" }, 404);
    return c.json(result);
  })

  .delete("/:id", async (c) => {
    const result = await notesCollection().deleteOne({
      _id: new ObjectId(c.req.param("id")),
    });
    if (result.deletedCount === 0)
      return c.json({ error: "Note not found" }, 404);
    return c.json({ deleted: true });
  });

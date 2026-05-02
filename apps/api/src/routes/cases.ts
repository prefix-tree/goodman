import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { casesCollection, type Case } from "../entities/index.js";

export const cases = new Hono()

  .get("/", async (c) => {
    const userId = c.req.query("userId");
    const filter = userId ? { userId: new ObjectId(userId) } : {};
    const docs = await casesCollection().find(filter).toArray();
    return c.json(docs);
  })

  .get("/:id", async (c) => {
    const doc = await casesCollection().findOne({
      _id: new ObjectId(c.req.param("id")),
    });
    if (!doc) return c.json({ error: "Case not found" }, 404);
    return c.json(doc);
  })

  .post("/", async (c) => {
    const body = await c.req.json<{
      userId: string;
      title: string;
      playbook?: string;
      status?: Case["status"];
    }>();
    const now = new Date();
    const result = await casesCollection().insertOne({
      _id: new ObjectId(),
      userId: new ObjectId(body.userId),
      title: body.title,
      status: body.status ?? "open",
      playbook: body.playbook ?? "general",
      facts: [],
      risks: [],
      requirements: [],
      completion: 0,
      summary: null,
      createdAt: now,
      updatedAt: now,
    });
    const doc = await casesCollection().findOne({ _id: result.insertedId });
    return c.json(doc, 201);
  })

  .patch("/:id", async (c) => {
    const body = await c.req.json<
      Partial<{ title: string; status: Case["status"] }>
    >();
    const result = await casesCollection().findOneAndUpdate(
      { _id: new ObjectId(c.req.param("id")) },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!result) return c.json({ error: "Case not found" }, 404);
    return c.json(result);
  })

  .delete("/:id", async (c) => {
    const result = await casesCollection().deleteOne({
      _id: new ObjectId(c.req.param("id")),
    });
    if (result.deletedCount === 0)
      return c.json({ error: "Case not found" }, 404);
    return c.json({ deleted: true });
  });

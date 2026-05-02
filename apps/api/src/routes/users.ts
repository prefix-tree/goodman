import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { usersCollection } from "../entities/index.js";

export const users = new Hono()

  .get("/", async (c) => {
    const docs = await usersCollection().find().toArray();
    return c.json(docs);
  })

  .get("/:id", async (c) => {
    const doc = await usersCollection().findOne({
      _id: new ObjectId(c.req.param("id")),
    });
    if (!doc) return c.json({ error: "User not found" }, 404);
    return c.json(doc);
  })

  .post("/", async (c) => {
    const body = await c.req.json<{ email: string; name: string }>();
    const now = new Date();
    const result = await usersCollection().insertOne({
      _id: new ObjectId(),
      email: body.email,
      name: body.name,
      createdAt: now,
      updatedAt: now,
    });
    const doc = await usersCollection().findOne({ _id: result.insertedId });
    return c.json(doc, 201);
  })

  .patch("/:id", async (c) => {
    const body = await c.req.json<Partial<{ email: string; name: string }>>();
    const result = await usersCollection().findOneAndUpdate(
      { _id: new ObjectId(c.req.param("id")) },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!result) return c.json({ error: "User not found" }, 404);
    return c.json(result);
  })

  .delete("/:id", async (c) => {
    const result = await usersCollection().deleteOne({
      _id: new ObjectId(c.req.param("id")),
    });
    if (result.deletedCount === 0)
      return c.json({ error: "User not found" }, 404);
    return c.json({ deleted: true });
  });

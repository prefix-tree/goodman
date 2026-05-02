import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { usersCollection } from "../entities/index.js";
import { roomService, createParticipantToken } from "../livekit.js";

export const sessions = new Hono()

  .post("/", async (c) => {
    const body = await c.req.json<{
      userId: string;
      playbook?: string;
      caseId?: string;
    }>();

    const user = await usersCollection().findOne({
      _id: new ObjectId(body.userId),
    });
    if (!user) return c.json({ error: "User not found" }, 404);

    const roomName = `solea-${body.userId.slice(-6)}-${Date.now()}`;

    const metadata = JSON.stringify({
      userId: body.userId,
      userName: user.name,
      userEmail: user.email,
      playbook: body.playbook ?? "general",
      caseId: body.caseId ?? null,
    });

    await roomService.createRoom({
      name: roomName,
      emptyTimeout: 300,
      metadata,
    });

    const token = await createParticipantToken({
      roomName,
      participantIdentity: `user-${body.userId}`,
      participantName: user.name,
      metadata: JSON.stringify({ userId: body.userId }),
    });

    return c.json(
      { roomName, token, livekitUrl: process.env.LIVEKIT_URL },
      201,
    );
  });

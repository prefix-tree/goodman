import { Hono } from "hono";
import { caseEventBus, type CaseEvent } from "../realtime/event-bus.js";

/**
 * Internal endpoints called by the agent process to push events
 * to the HTTP server's event bus (which then pushes to SSE clients).
 */
export const internal = new Hono().post("/case-events", async (c) => {
  const body = await c.req.json<{
    caseId: string;
    event: CaseEvent["event"];
    data: unknown;
  }>();

  caseEventBus.publish({
    caseId: body.caseId,
    event: body.event,
    data: body.data,
    timestamp: Date.now(),
  });

  return c.json({ ok: true });
});

import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { caseEventBus } from "../realtime/event-bus.js";
import { caseStateService } from "../case/state.js";

export const caseStream = new Hono().get("/:caseId/stream", (c) => {
  const caseId = c.req.param("caseId");

  return streamSSE(c, async (stream) => {
    // Send initial state
    const state = await caseStateService.getState(caseId);
    if (state) {
      await stream.writeSSE({
        event: "initial_state",
        data: JSON.stringify({
          caseId: state._id.toHexString(),
          playbook: state.playbook,
          facts: state.facts,
          risks: state.risks,
          requirements: state.requirements,
          completion: state.completion,
          summary: state.summary,
          status: state.status,
        }),
        id: `init-${Date.now()}`,
      });
    }

    // Subscribe to live updates
    const unsubscribe = caseEventBus.subscribe(caseId, async (event) => {
      try {
        await stream.writeSSE({
          event: event.event,
          data: JSON.stringify(event.data),
          id: `${event.event}-${event.timestamp}`,
        });
      } catch {
        // Client disconnected
      }
    });

    stream.onAbort(() => {
      unsubscribe();
    });

    // Keep alive
    while (true) {
      await stream.writeSSE({ event: "ping", data: "", id: `ping-${Date.now()}` });
      await stream.sleep(15000);
    }
  });
});

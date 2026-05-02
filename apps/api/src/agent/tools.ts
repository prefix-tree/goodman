import { llm } from "@livekit/agents";
import { z } from "zod";

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

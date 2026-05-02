import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { usersCollection } from "../entities/index.js";
import { caseStateService } from "../case/state.js";
import { caseEventBus } from "../realtime/event-bus.js";
import { getPlaybook } from "../playbooks/index.js";
import { getNextQuestion } from "../extraction/question.js";

export const sessionsMock = new Hono().post("/", async (c) => {
  const body = await c.req.json<{
    userId: string;
    playbook?: string;
    caseId?: string;
  }>();

  const user = await usersCollection().findOne({
    _id: new ObjectId(body.userId),
  });
  if (!user) return c.json({ error: "User not found" }, 404);

  const playbookId = body.playbook ?? "general";

  // Create case
  let caseId = body.caseId;
  if (!caseId) {
    const caseDoc = await caseStateService.createCase(body.userId, playbookId);
    caseId = caseDoc._id.toHexString();
  }

  // Start mock agent simulation in background
  runMockAgent(caseId, playbookId, user.name).catch(console.error);

  return c.json(
    {
      roomName: `mock-${caseId}`,
      token: "mock-token",
      livekitUrl: "mock://localhost",
      caseId,
      mock: true,
    },
    201,
  );
});

// --- Mock agent that simulates a conversation ---

async function runMockAgent(
  caseId: string,
  playbookId: string,
  userName: string,
) {
  const playbook = getPlaybook(playbookId);
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Opening greeting
  await delay(1000);
  emitTranscript(
    caseId,
    "agent",
    `Hello ${userName}! ${playbook.requiredFacts[0]?.question ?? "Tell me about your situation."}`,
  );

  // Simulate user responses based on playbook
  const mockResponses: Record<
    string,
    { text: string; facts: Record<string, string> }[]
  > = {
    immigration: [
      {
        text: "I'm Nigerian and I want to visit my sister in London. I had a visa refusal last year.",
        facts: {
          applicant_nationality: "Nigerian",
          application_location: "Nigeria",
          visit_purpose: "visit sister",
          uk_host: "sister in London",
          previous_refusal: "yes, last year",
        },
      },
      {
        text: "They said I didn't have enough financial evidence. I will stay for two weeks in August 2025.",
        facts: {
          refusal_reason: "insufficient financial evidence",
          visit_duration: "two weeks",
          travel_dates: "August 2025",
        },
      },
      {
        text: "I'm employed as a software engineer, earn about 3000 per month, and will pay from my savings. I have my job and family to return to.",
        facts: {
          employment_or_study_status: "employed as a software engineer",
          monthly_income: "3000",
          trip_funding: "savings",
          home_ties: "job and family",
        },
      },
    ],
    appeal: [
      {
        text: "I got a parking fine for £80 from the council last week. I think it's wrong because the sign was covered.",
        facts: {
          fine_type: "parking",
          fine_amount: "80",
          fine_date: "last week",
          issuing_body: "council",
          grounds_for_appeal: "sign was covered",
        },
      },
      {
        text: "No I haven't responded yet.",
        facts: { already_responded: "not yet" },
      },
    ],
  };

  const responses = mockResponses[playbookId] ?? [
    {
      text: "I have a dispute with my landlord about my deposit. It's about £1500.",
      facts: {
        situation_summary: "deposit dispute with landlord",
        parties_involved: "landlord",
        desired_outcome: "get deposit back",
      },
    },
  ];

  for (const response of responses) {
    await delay(3000);

    // User speaks
    emitTranscript(caseId, "user", response.text);

    await delay(1000);

    // Process facts
    const result = await caseStateService.processAndUpdate(
      caseId,
      response.facts,
    );

    if (result) {
      caseEventBus.publish({
        caseId,
        event: "case_update",
        data: result,
        timestamp: Date.now(),
      });

      await delay(1500);

      // Agent responds with next question
      if (result.nextQuestion) {
        emitTranscript(caseId, "agent", result.nextQuestion.question);
      }
    }
  }

  // Final summary
  await delay(2000);
  const finalState = await caseStateService.getState(caseId);
  if (finalState) {
    const nextQ = getNextQuestion(finalState.facts, playbook);
    if (!nextQ) {
      emitTranscript(
        caseId,
        "agent",
        "I think I have all the key details. Let me put together your case summary.",
      );
    }
  }
}

function emitTranscript(
  caseId: string,
  speaker: "user" | "agent",
  text: string,
) {
  caseEventBus.publish({
    caseId,
    event: "transcript_update",
    data: { speaker, text, isFinal: true, timestamp: Date.now() },
    timestamp: Date.now(),
  });

  caseStateService
    .addTranscript(caseId, speaker, text, true)
    .catch(console.error);
}

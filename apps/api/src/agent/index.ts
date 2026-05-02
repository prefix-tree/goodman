import {
  cli,
  defineAgent,
  type JobContext,
  type JobProcess,
  ServerOptions,
} from "@livekit/agents";
import { LLM } from "@livekit/agents-plugin-google";
import { TTS } from "@livekit/agents-plugin-elevenlabs";
import * as silero from "@livekit/agents-plugin-silero";
import { voice } from "@livekit/agents";
import { fileURLToPath } from "node:url";
import { connectDb } from "../db.js";
import { getPlaybook } from "../playbooks/index.js";
import { caseStateService } from "../case/state.js";
import { CaseOrchestrator } from "./orchestrator.js";
import { startIntake, note, orient } from "./tools.js";
import type { SessionUserData } from "./types.js";

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
    await connectDb();
  },

  entry: async (ctx: JobContext) => {
    await ctx.connect();

    const meta: SessionUserData = JSON.parse(ctx.room.metadata ?? "{}");
    const playbook = getPlaybook(meta.playbook ?? "general");

    // Create case via CaseStateService
    const caseDoc = await caseStateService.createCase(
      meta.userId,
      playbook.id,
    );
    const caseId = caseDoc._id.toHexString();

    // Update session metadata with caseId
    meta.caseId = caseId;

    const instructions = [
      `You are Sofia, a legal intake assistant for Solea, handling ${playbook.label} matters.`,
      `The caller's name is ${meta.userName ?? "there"}. Address them by name.`,
      "Be concise, empathetic, and conversational. Keep responses to one or two sentences.",
      "",
      "WORKFLOW:",
      "1. After greeting, call start_intake ONCE to get your checklist.",
      "2. For every factual answer the client gives, call note with the facts immediately.",
      "3. Use the checklist and note responses to guide what to ask next.",
      "4. If uncertain or stuck, call orient to get guidance.",
      "5. When all tasks are completed, summarize and wrap up.",
      "",
      "RULES:",
      "- Ask ONE question at a time.",
      "- Never read the checklist to the client — it's your internal plan.",
      "- Use the guidance field to phrase questions naturally.",
      "- If note returns conflicts, clarify with the client before continuing.",
    ].join("\n");

    const agent = new voice.Agent({
      instructions,
      tools: { startIntake, note, orient },
    });

    const session = new voice.AgentSession<SessionUserData>({
      vad: ctx.proc.userData.vad as silero.VAD,
      llm: new LLM({ model: "gemini-2.5-flash" }),
      tts: new TTS({ voiceId: "aria" }),
      userData: meta,
    });

    await session.start({ agent, room: ctx.room });

    // Initialize orchestrator
    const orchestrator = new CaseOrchestrator(caseId, playbook, session);

    // Hook transcript events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (session as any).on("user_input_transcribed", (ev: { transcript?: string; isFinal?: boolean }) => {
      if (ev.transcript) {
        orchestrator
          .onTranscript(ev.transcript, ev.isFinal === true)
          .catch(console.error);
      }
    });

    const greeting = meta.userName
      ? `Hello ${meta.userName}! Thank you for calling Solea. I'm Sofia, and I'll be helping you today.`
      : "Hello! Thank you for calling Solea. I'm Sofia, and I'll be helping you today.";
    session.say(greeting);
  },
});

cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));

import {
  cli,
  defineAgent,
  type JobContext,
  type JobProcess,
  ServerOptions,
} from "@livekit/agents";
import { LLM } from "@livekit/agents-plugin-google";
import { STT, TTS } from "@livekit/agents-plugin-elevenlabs";
import * as silero from "@livekit/agents-plugin-silero";
import { voice } from "@livekit/agents";
import { fileURLToPath } from "node:url";
import { prompt } from "./_system.js";
import { resolve, dirname } from "node:path";
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

    // Reuse the case created by the session endpoint, or create one for
    // direct room starts where metadata does not include a case yet.
    let caseId = meta.caseId;
    if (!caseId) {
      const caseDoc = await caseStateService.createCase(
        meta.userId,
        playbook.id,
      );
      caseId = caseDoc._id.toHexString();
      meta.caseId = caseId;
    }

    const instructions = prompt;

    const agent = new voice.Agent({
      instructions,
      tools: { start_intake: startIntake, note, orient },
    });

    const session = new voice.AgentSession<SessionUserData>({
      vad: ctx.proc.userData.vad as silero.VAD,
      stt: new STT(),
      llm: new LLM({ model: "gemini-2.5-flash" }),
      tts: new TTS({ voiceId: "9BWtsMINqrJLrRacOk9x" }),
      userData: meta,
    });

    await session.start({ agent, room: ctx.room });

    // Initialize orchestrator
    const orchestrator = new CaseOrchestrator(caseId, playbook);

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
      ? `Hello ${meta.userName}! Thank you for calling SOL. I'm Sofia, and I'll be helping you today.`
      : "Hello! Thank you for calling SOL. I'm Sofia, and I'll be helping you today.";
    session.say(greeting);
  },
});

cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));

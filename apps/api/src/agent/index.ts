import { cli, defineAgent, type JobContext, type JobProcess, ServerOptions } from "@livekit/agents";
import { LLM, TTS } from "@livekit/agents-plugin-openai";
import * as silero from "@livekit/agents-plugin-silero";
import { voice } from "@livekit/agents";
import { fileURLToPath } from "node:url";
import { connectDb } from "../db.js";
import { buildInstructions } from "./playbooks.js";
import type { SessionUserData } from "./types.js";
import {
  lookupContact,
  scheduleCallback,
  transferCall,
  createCase,
  addNote,
  listCases,
} from "./tools.js";

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
    await connectDb();
  },

  entry: async (ctx: JobContext) => {
    await ctx.connect();

    const meta: SessionUserData = JSON.parse(ctx.room.metadata ?? "{}");
    const instructions = buildInstructions(meta.playbook ?? "general", meta.userName ?? "there");

    const agent = new voice.Agent({
      instructions,
      tools: { lookupContact, scheduleCallback, transferCall, createCase, addNote, listCases },
    });

    const session = new voice.AgentSession<SessionUserData>({
      vad: ctx.proc.userData.vad as silero.VAD,
      llm: new LLM({ model: "gpt-4o-mini" }),
      tts: new TTS({ voice: "ash" }),
      userData: meta,
    });

    await session.start({ agent, room: ctx.room });
    session.say(`Hello${meta.userName ? ` ${meta.userName}` : ""}! How can I help you today?`);
  },
});

cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));

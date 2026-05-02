import { cli, defineAgent, type JobContext, type JobProcess, ServerOptions } from "@livekit/agents";
import { LLM, TTS } from "@livekit/agents-plugin-openai";
import * as silero from "@livekit/agents-plugin-silero";
import { voice } from "@livekit/agents";
import { fileURLToPath } from "node:url";
import { lookupContact, scheduleCallback, transferCall } from "./tools.js";

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },

  entry: async (ctx: JobContext) => {
    await ctx.connect();

    const agent = new voice.Agent({
      instructions: [
        "You are a helpful voice assistant for Solea.",
        "Be concise and friendly. Keep responses short — ideally one or two sentences.",
        "When the caller asks to speak with a person, use the transferCall tool.",
        "When the caller wants a callback, use the scheduleCallback tool.",
        "You can look up contacts by name using the lookupContact tool.",
      ].join(" "),
      tools: { lookupContact, scheduleCallback, transferCall },
    });

    const session = new voice.AgentSession({
      vad: ctx.proc.userData.vad as silero.VAD,
      llm: new LLM({ model: "gpt-4o-mini" }),
      tts: new TTS({ voice: "ash" }),
    });

    await session.start({ agent, room: ctx.room });
    session.say("Hello! How can I help you today?");
  },
});

cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));

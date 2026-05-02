"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Mic, MessageSquare, Loader2 } from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { VoiceSession } from "@/components/voice-session";

export default function StartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playbook = searchParams.get("playbook") ?? "general";

  const userId = useUserStore((s) => s.userId);
  const { session, status, error, connect, disconnect } = useVoiceSession();

  // --- Start voice (real LiveKit) ---
  async function handleVoice() {
    if (!userId) return;
    await connect({ userId, playbook });
  }

  // --- Go to chat ---
  async function handleChat() {
    if (!userId) {
      router.push(`/dashboard?playbook=${playbook}`);
      return;
    }
    const result = await connect({ userId, playbook });
    if (result?.caseId) {
      router.push(`/dashboard?caseId=${result.caseId}`);
    }
  }

  function handleDisconnected() {
    disconnect();
    router.push("/dashboard");
  }

  const isLoading = status === "connecting";

  // Active voice session
  if (session) {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-6 px-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Tell us about your situation
        </h1>
        <div className="h-80 w-full">
          <VoiceSession
            token={session.token}
            livekitUrl={session.livekitUrl}
            onDisconnected={handleDisconnected}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-10 px-6 text-center">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          How would you like to proceed?
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          You can speak with our AI assistant or use text chat
        </p>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {/* Two options */}
      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleVoice}
          className="border-border hover:border-primary/40 hover:bg-primary/5 flex items-center gap-4 rounded-xl border p-5 text-left transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-full">
            {status === "connecting" ? (
              <Loader2 className="text-primary size-6 animate-spin" />
            ) : (
              <Mic className="text-primary size-6" />
            )}
          </div>
          <div>
            <p className="text-foreground font-medium">Start voice session</p>
            <p className="text-muted-foreground text-sm">
              Speak naturally — the AI will listen and ask questions
            </p>
          </div>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={handleChat}
          className="border-border hover:border-primary/40 hover:bg-primary/5 flex items-center gap-4 rounded-xl border p-5 text-left transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-full">
            {status === "connecting" ? (
              <Loader2 className="text-primary size-6 animate-spin" />
            ) : (
              <MessageSquare className="text-primary size-6" />
            )}
          </div>
          <div>
            <p className="text-foreground font-medium">Go to chat</p>
            <p className="text-muted-foreground text-sm">
              See your case build in real-time as the AI works through it
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

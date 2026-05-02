"use client";

import { Mic, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VoiceSession } from "@/components/voice-session";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { useUserStore } from "@/stores/user-store";

export function ChatPanel() {
  const searchParams = useSearchParams();
  const userId = useUserStore((s) => s.userId);
  const { session, status, error, connect, disconnect } = useVoiceSession();

  const playbook = searchParams.get("playbook") ?? undefined;
  const caseId = searchParams.get("caseId") ?? undefined;

  async function handleStart() {
    if (!userId) return;
    await connect({ userId, playbook, caseId });
  }

  if (session) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Voice Session</h2>
        </div>
        <VoiceSession
          token={session.token}
          livekitUrl={session.livekitUrl}
          onDisconnected={disconnect}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Chat</h2>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}

        {!userId ? (
          <p className="text-muted-foreground text-sm">
            Complete onboarding to start a voice session.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground text-center text-sm">
              Start a voice session to talk with your assistant.
            </p>
            <Button
              onClick={handleStart}
              disabled={status === "connecting"}
              className="gap-2"
            >
              {status === "connecting" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mic className="size-4" />
              )}
              {status === "connecting" ? "Connecting..." : "Start Voice Session"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

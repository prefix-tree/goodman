"use client";

import { Mic, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Thread } from "@/components/assistant-ui/thread";
import { VoiceSession } from "@/components/voice-session";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { useUserStore } from "@/stores/user-store";
import { useCaseStore } from "@/stores/case-store";
import { useTranscriptRuntime } from "@/lib/transcript-runtime";

export function ChatPanel() {
  const searchParams = useSearchParams();
  const userId = useUserStore((s) => s.userId);
  const { session, status, error, connect, disconnect } = useVoiceSession();

  const completion = useCaseStore((s) => s.completion);

  const playbook = searchParams.get("playbook") ?? undefined;
  const caseId = searchParams.get("caseId") ?? undefined;

  const runtime = useTranscriptRuntime();

  async function handleStart() {
    if (!userId) return;
    await connect({ userId, playbook, caseId });
  }

  // Active voice session view
  if (session) {
    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Your Case</h2>
          {completion > 0 && (
            <Badge variant="secondary" className="text-xs">
              {completion}% complete
            </Badge>
          )}
        </div>

        {/* Voice visualizer */}
        <div className="h-48 shrink-0 border-b">
          <VoiceSession
            token={session.token}
            livekitUrl={session.livekitUrl}
            onDisconnected={disconnect}
          />
        </div>

        {/* Transcript via assistant-ui Thread */}
        <div className="flex-1 overflow-hidden">
          <AssistantRuntimeProvider runtime={runtime}>
            <Thread />
          </AssistantRuntimeProvider>
        </div>
      </div>
    );
  }

  // Idle state
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Chat</h2>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        {error && <p className="text-destructive text-sm">{error}</p>}

        {!userId ? (
          <p className="text-muted-foreground text-sm">
            Complete onboarding to start a voice session.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground text-center text-sm">
              Start a voice session to describe your situation.
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
              {status === "connecting"
                ? "Connecting..."
                : "Start Voice Session"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

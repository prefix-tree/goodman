"use client";

import { useEffect, useRef } from "react";
import { Mic, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VoiceSession } from "@/components/voice-session";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { useUserStore } from "@/stores/user-store";
import { useCaseStore } from "@/stores/case-store";

export function ChatPanel() {
  const searchParams = useSearchParams();
  const userId = useUserStore((s) => s.userId);
  const { session, status, error, connect, disconnect } = useVoiceSession();

  const completion = useCaseStore((s) => s.completion);
  const transcript = useCaseStore((s) => s.transcript);
  const currentQuestion = useCaseStore((s) => s.currentQuestion);

  const scrollRef = useRef<HTMLDivElement>(null);

  const playbook = searchParams.get("playbook") ?? undefined;
  const caseId = searchParams.get("caseId") ?? undefined;

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

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

        {/* Transcript */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="space-y-3 p-4">
            {transcript.length === 0 && (
              <p className="text-muted-foreground text-center text-sm">
                Start speaking — your conversation will appear here.
              </p>
            )}
            {transcript.map((entry, i) => (
              <div
                key={i}
                className={`flex ${entry.speaker === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    entry.speaker === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  } ${!entry.isFinal ? "opacity-60" : ""}`}
                >
                  {entry.text}
                </div>
              </div>
            ))}
            {currentQuestion && (
              <div className="flex justify-start">
                <div className="bg-primary/10 text-primary max-w-[80%] rounded-lg border border-dashed px-3 py-2 text-sm">
                  Next: {currentQuestion.question}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
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

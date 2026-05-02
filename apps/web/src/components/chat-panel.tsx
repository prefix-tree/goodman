"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Loader2, Send } from "lucide-react";
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

  const isMock = session?.mock === true;
  const isActive = !!session || !!caseId;

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

  // Active session view (mock or real)
  if (isActive) {
    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Your Case</h2>
          <div className="flex items-center gap-2">
            {isMock && (
              <Badge variant="outline" className="text-xs">
                Mock
              </Badge>
            )}
            {completion > 0 && (
              <Badge variant="secondary" className="text-xs">
                {completion}%
              </Badge>
            )}
          </div>
        </div>

        {/* Voice visualizer — only for real sessions */}
        {session && !isMock && (
          <div className="h-48 shrink-0 border-b">
            <VoiceSession
              token={session.token}
              livekitUrl={session.livekitUrl}
              onDisconnected={disconnect}
            />
          </div>
        )}

        {/* Mock status bar */}
        {isMock && (
          <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2">
            <div className="size-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-muted-foreground text-xs">
              Simulating agent conversation...
            </span>
          </div>
        )}

        {/* Transcript */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="space-y-3 p-4">
            {transcript.length === 0 && (
              <p className="text-muted-foreground text-center text-sm">
                {isMock
                  ? "Mock agent starting..."
                  : "Start speaking — your conversation will appear here."}
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
            {/* Show next question hint only if it's not already in the transcript */}
            {currentQuestion &&
              transcript.length > 0 &&
              transcript[transcript.length - 1].text !== currentQuestion.question && (
              <div className="flex justify-start">
                <div className="bg-primary/10 text-primary max-w-[80%] rounded-lg border border-dashed px-3 py-2 text-sm">
                  Next: {currentQuestion.question}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <ChatInput />
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

      {/* Input */}
      <ChatInput onVoiceStart={userId ? handleStart : undefined} />
    </div>
  );
}

function ChatInput({ onVoiceStart }: { onVoiceStart?: () => void }) {
  const [message, setMessage] = useState("");
  const addTranscript = useCaseStore((s) => s.addTranscript);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    addTranscript({
      speaker: "user",
      text,
      isFinal: true,
      timestamp: Date.now(),
    });

    setMessage("");
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="border-input bg-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-2"
        />
        {onVoiceStart && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-10 shrink-0"
            onClick={onVoiceStart}
          >
            <Mic className="size-4" />
          </Button>
        )}
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="size-10 shrink-0"
          disabled={!message.trim()}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </form>
  );
}

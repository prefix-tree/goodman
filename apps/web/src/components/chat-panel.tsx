"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, Send } from "lucide-react";
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
  const storeCaseId = useCaseStore((s) => s.caseId);
  const transcript = useCaseStore((s) => s.transcript);
  const currentQuestion = useCaseStore((s) => s.currentQuestion);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [voiceConnected, setVoiceConnected] = useState(false);

  const playbook = searchParams.get("playbook") ?? undefined;
  const paramCaseId = searchParams.get("caseId") ?? undefined;
  const caseId = storeCaseId ?? session?.caseId ?? paramCaseId;

  const isActive = !!session || !!caseId;

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  async function handleStart() {
    if (!userId) return;
    await connect({ userId, playbook, caseId: caseId ?? undefined });
  }

  function handleVoiceToggle() {
    if (voiceConnected) {
      setVoiceConnected(false);
      disconnect();
    } else if (session) {
      // Session exists, just connect to the room
      setVoiceConnected(true);
    } else {
      // No session yet — create one and connect
      handleStart().then(() => setVoiceConnected(true));
    }
  }

  // Active session view
  if (isActive) {
    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Your Case</h2>
          {completion > 0 && (
            <Badge variant="secondary" className="text-xs">
              {completion}%
            </Badge>
          )}
        </div>

        {/* Voice visualizer — only when user has connected */}
        {session && voiceConnected && (
          <div className="h-36 shrink-0 border-b">
            <VoiceSession
              token={session.token}
              livekitUrl={session.livekitUrl}
              onDisconnected={() => {
                setVoiceConnected(false);
                disconnect();
              }}
            />
          </div>
        )}

        {/* Transcript */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="space-y-3 p-4">
            {transcript.length === 0 && (
              <p className="text-muted-foreground text-center text-sm">
                {voiceConnected
                  ? "Start speaking — your conversation will appear here."
                  : "Click the mic button below to start a voice session."}
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
        <ChatInput
          caseId={caseId ?? null}
          userId={userId}
          voiceConnected={voiceConnected}
          isConnecting={status === "connecting"}
          onVoiceToggle={handleVoiceToggle}
        />
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
          <p className="text-muted-foreground text-center text-sm">
            Start a voice session to describe your situation.
          </p>
        )}
      </div>

      {/* Input */}
      <ChatInput
        caseId={caseId ?? null}
        userId={userId}
        voiceConnected={false}
        isConnecting={status === "connecting"}
        onVoiceToggle={userId ? () => {
          handleStart().then(() => setVoiceConnected(true));
        } : undefined}
      />
    </div>
  );
}

function ChatInput({
  caseId,
  userId,
  voiceConnected,
  isConnecting,
  onVoiceToggle,
}: {
  caseId: string | null;
  userId: string | null;
  voiceConnected: boolean;
  isConnecting: boolean;
  onVoiceToggle?: () => void;
}) {
  const [message, setMessage] = useState("");
  const addTranscript = useCaseStore((s) => s.addTranscript);

  async function handleSubmit(e: React.FormEvent) {
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

    if (!caseId || !userId) return;

    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, userId, content: text }),
    });
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
        {onVoiceToggle && (
          <Button
            type="button"
            size="icon"
            variant={voiceConnected ? "destructive" : "outline"}
            className="size-10 shrink-0"
            disabled={isConnecting}
            onClick={onVoiceToggle}
          >
            {isConnecting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : voiceConnected ? (
              <MicOff className="size-4" />
            ) : (
              <Mic className="size-4" />
            )}
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

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VoiceSession } from "@/components/voice-session";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { useUserStore } from "@/stores/user-store";

const playbooks = [
  { label: "Visiting the UK", hint: "visa / travel", id: "immigration" },
  { label: "A fine or penalty", hint: "appeal it", id: "appeal" },
  { label: "A dispute or claim", hint: "resolve it", id: "small-claims" },
  {
    label: "A letter from council or government",
    hint: "respond to it",
    id: "response",
  },
  { label: "Benefits or permits", hint: "apply or appeal", id: "eligibility" },
  { label: "Not sure yet", hint: "just let me explain", id: "general" },
] as const;

export default function SituationPage() {
  const router = useRouter();
  const [freeText, setFreeText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const userId = useUserStore((s) => s.userId);
  const { session, status, error, connect, disconnect } = useVoiceSession();

  async function startVoice(playbook: string) {
    if (!userId) return;
    await connect({ userId, playbook });
  }

  function handleDisconnected() {
    disconnect();
    router.push("/dashboard");
  }

  function handleHintClick(id: string) {
    if (!userId) {
      // No user yet — fall back to direct navigation
      router.push(`/dashboard?playbook=${id}`);
      return;
    }
    startVoice(id);
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!freeText.trim()) return;
    if (!userId) {
      const params = new URLSearchParams({
        playbook: "general",
        context: freeText.trim(),
      });
      router.push(`/dashboard?${params.toString()}`);
      return;
    }
    startVoice("general");
  }

  function handleVoiceStart() {
    if (!userId) {
      router.push("/dashboard?playbook=general");
      return;
    }
    startVoice("general");
  }

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
    <div className="flex w-full max-w-lg flex-col items-center gap-10 px-6">
      {/* Header */}
      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          What are you dealing with?
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Pick a direction or just describe your situation
        </p>
      </div>

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      {/* Playbook hints */}
      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {playbooks.map((pb) => (
          <button
            key={pb.id}
            type="button"
            disabled={status === "connecting"}
            onClick={() => handleHintClick(pb.id)}
            className={cn(
              "border-border hover:border-primary/40 hover:bg-primary/5",
              "flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3",
              "text-left transition-colors focus-visible:outline-none",
              "focus-visible:ring-ring/50 focus-visible:ring-2",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <span className="text-foreground text-sm font-medium">
              {pb.label}
            </span>
            <span className="text-muted-foreground text-xs">{pb.hint}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex w-full items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">
          or describe it in your own words
        </span>
        <div className="bg-border h-px flex-1" />
      </div>

      {/* Free input + voice */}
      <div className="flex w-full gap-2">
        <form onSubmit={handleTextSubmit} className="flex flex-1 gap-2">
          <input
            ref={inputRef}
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="I need help with..."
            disabled={status === "connecting"}
            className={cn(
              "border-input bg-background placeholder:text-muted-foreground",
              "flex h-11 w-full rounded-lg border px-4 text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50",
              "focus-visible:outline-none focus-visible:ring-2",
              "disabled:opacity-50",
            )}
          />
          {freeText.trim() && (
            <Button
              type="submit"
              size="icon"
              className="size-11 shrink-0"
              disabled={status === "connecting"}
            >
              <ArrowRight className="size-4" />
            </Button>
          )}
        </form>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 shrink-0"
          disabled={status === "connecting"}
          onClick={handleVoiceStart}
        >
          {status === "connecting" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Mic className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

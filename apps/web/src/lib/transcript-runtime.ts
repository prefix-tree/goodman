import { useMemo } from "react";
import {
  useExternalStoreRuntime,
  type ThreadMessageLike,
} from "@assistant-ui/react";
import { type TranscriptEntry, useCaseStore } from "@/stores/case-store";

function transcriptToMessages(
  transcript: TranscriptEntry[],
): ThreadMessageLike[] {
  return transcript
    .filter((e) => e.isFinal)
    .map((entry, i) => ({
      id: `t-${i}`,
      role: entry.speaker === "user" ? ("user" as const) : ("assistant" as const),
      content: entry.text,
      createdAt: new Date(entry.timestamp),
    }));
}

export function useTranscriptRuntime() {
  const transcript = useCaseStore((s) => s.transcript);

  const messages = useMemo(
    () => transcriptToMessages(transcript),
    [transcript],
  );

  return useExternalStoreRuntime({
    isRunning: false,
    messages,
    convertMessage: (m) => m,
    onNew: async () => {
      // Voice-only — text input is a no-op for now
    },
  });
}

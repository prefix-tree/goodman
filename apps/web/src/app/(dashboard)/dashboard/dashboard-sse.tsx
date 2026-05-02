"use client";

import { useSearchParams } from "next/navigation";
import { useCaseStore } from "@/stores/case-store";
import { useVoiceStore } from "@/stores/voice-store";
import { useCaseStream } from "@/hooks/use-case-stream";

/**
 * Invisible component that connects the SSE stream to the case store.
 * Renders nothing — just manages the connection lifecycle.
 */
export function DashboardSSE() {
  const searchParams = useSearchParams();
  const storeCaseId = useCaseStore((s) => s.caseId);
  const voiceCaseId = useVoiceStore((s) => s.session?.caseId);
  const paramCaseId = searchParams.get("caseId");

  const caseId = paramCaseId ?? storeCaseId ?? voiceCaseId ?? null;
  useCaseStream(caseId);
  return null;
}

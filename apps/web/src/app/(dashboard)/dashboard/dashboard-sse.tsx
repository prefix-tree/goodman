"use client";

import { useSearchParams } from "next/navigation";
import { useCaseStore } from "@/stores/case-store";
import { useCaseStream } from "@/hooks/use-case-stream";

/**
 * Invisible component that connects the SSE stream to the case store.
 * Renders nothing — just manages the connection lifecycle.
 */
export function DashboardSSE() {
  const searchParams = useSearchParams();
  const caseId = useCaseStore((s) => s.caseId) ?? searchParams.get("caseId");
  useCaseStream(caseId);
  return null;
}

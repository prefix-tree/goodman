import { useEffect, useRef, useState } from "react";
import {
  useCaseStore,
  type CaseSnapshot,
  type CaseUpdate,
  type TranscriptEntry,
} from "@/stores/case-store";

// SSE must connect directly to the API — Next.js rewrites buffer streaming responses
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function useCaseStream(caseId: string | null) {
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  const setInitialState = useCaseStore((s) => s.setInitialState);
  const updateCase = useCaseStore((s) => s.updateCase);
  const addTranscript = useCaseStore((s) => s.addTranscript);

  useEffect(() => {
    if (!caseId) return;

    const url = `${API_URL}/case-stream/${caseId}/stream`;
    const source = new EventSource(url);
    sourceRef.current = source;

    source.addEventListener("initial_state", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as CaseSnapshot;
      setInitialState(data);
      setConnected(true);
    });

    source.addEventListener("case_update", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as CaseUpdate;
      updateCase(data);
    });

    source.addEventListener("transcript_update", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as TranscriptEntry;
      addTranscript(data);
    });

    source.addEventListener("error", () => {
      setConnected(false);
    });

    return () => {
      source.close();
      sourceRef.current = null;
      setConnected(false);
    };
  }, [caseId, setInitialState, updateCase, addTranscript]);

  return { connected };
}

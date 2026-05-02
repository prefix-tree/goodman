"use client";

import { useEffect } from "react";
import { useCaseStore } from "@/stores/case-store";
import {
  MOCK_TRANSCRIPT,
  MOCK_FACTS,
  MOCK_CHECKLIST,
  MOCK_RISKS,
  MOCK_REQUIREMENTS,
} from "@/lib/mock-data";

/**
 * Seeds the case store with mock visa intake data when no real session is active.
 * Remove this hook once real data flows end-to-end.
 */
export function useMockCase() {
  const caseId = useCaseStore((s) => s.caseId);
  const setInitialState = useCaseStore((s) => s.setInitialState);
  const addTranscript = useCaseStore((s) => s.addTranscript);

  useEffect(() => {
    // Only seed when no real case is loaded
    if (caseId) return;

    setInitialState({
      caseId: "mock-visa-001",
      playbook: "immigration",
      facts: MOCK_FACTS,
      checklist: MOCK_CHECKLIST,
      risks: MOCK_RISKS,
      requirements: MOCK_REQUIREMENTS,
      completion: 58,
      summary: null,
      status: "active",
    });

    for (const entry of MOCK_TRANSCRIPT) {
      addTranscript(entry);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCaseStore, type CaseSnapshot } from "@/stores/case-store";
import { useUserStore } from "@/stores/user-store";

interface UserResponse {
  _id: string;
  name?: string;
}

interface CaseResponse {
  _id: string;
  playbook: string;
  facts: Record<string, unknown>;
  checklist: CaseSnapshot["checklist"];
  risks: CaseSnapshot["risks"];
  requirements: CaseSnapshot["requirements"];
  completion: number;
  summary: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

function toId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "$oid" in value) {
    return String((value as { $oid: string }).$oid);
  }
  return String(value);
}

function toSnapshot(data: CaseResponse): CaseSnapshot {
  return {
    caseId: toId(data._id),
    playbook: data.playbook,
    facts: data.facts,
    checklist: data.checklist,
    risks: data.risks,
    requirements: data.requirements,
    completion: data.completion,
    summary: data.summary,
    status: data.status,
  };
}

export function DashboardQueryLoader() {
  const searchParams = useSearchParams();
  const paramUserId = searchParams.get("userId");
  const paramCaseId = searchParams.get("caseId");
  const setUser = useUserStore((s) => s.setUser);
  const setInitialState = useCaseStore((s) => s.setInitialState);

  useEffect(() => {
    if (!paramUserId) return;

    let cancelled = false;

    async function loadUser() {
      const res = await fetch(`/api/users/${paramUserId}`);
      if (!res.ok) return;
      const user = (await res.json()) as UserResponse;
      if (!cancelled) {
        setUser(toId(user._id), user.name ?? "Guest");
      }
    }

    loadUser().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [paramUserId, setUser]);

  useEffect(() => {
    let cancelled = false;

    async function loadCase() {
      let caseId = paramCaseId;

      if (!caseId && paramUserId) {
        const res = await fetch(`/api/cases?userId=${paramUserId}`);
        if (!res.ok) return;
        const cases = (await res.json()) as CaseResponse[];
        const latest = [...cases].sort((a: CaseResponse, b: CaseResponse) => {
          const left = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
          const right = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
          return right - left;
        })[0];
        caseId = latest ? toId(latest._id) : null;
      }

      if (!caseId) return;

      const res = await fetch(`/api/cases/${caseId}`);
      if (!res.ok) return;
      const data = (await res.json()) as CaseResponse;
      if (!cancelled) {
        setInitialState(toSnapshot(data));
      }
    }

    loadCase().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [paramCaseId, paramUserId, setInitialState]);

  return null;
}

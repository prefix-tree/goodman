"use client";

import { useEffect, useMemo, useState } from "react";
import {
  KanbanBoard,
  type KanbanColumn,
} from "@/components/atoms/kanban-board";
import { useCaseStore, type CaseSnapshot } from "@/stores/case-store";
import { useUserStore } from "@/stores/user-store";

interface CaseResponse {
  _id: string;
  title: string;
  status: string;
  playbook: string;
  facts: Record<string, unknown>;
  checklist: CaseSnapshot["checklist"];
  risks: CaseSnapshot["risks"];
  requirements: CaseSnapshot["requirements"];
  completion: number;
  summary: string | null;
  updatedAt?: string;
  createdAt?: string;
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

export function ProfileCases() {
  const userId = useUserStore((s) => s.userId);
  const activeCaseId = useCaseStore((s) => s.caseId);
  const setInitialState = useCaseStore((s) => s.setInitialState);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setCases([]);
      return;
    }

    setLoading(true);
    fetch(`/api/cases?userId=${userId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCases(Array.isArray(data) ? data : []))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const columns = useMemo<KanbanColumn[]>(() => {
    const open = cases.filter((item) => item.status === "open");
    const active = cases.filter((item) =>
      ["in_progress", "active"].includes(item.status),
    );
    const closed = cases.filter((item) =>
      ["complete", "closed"].includes(item.status),
    );

    return [
      {
        id: "open",
        title: "Open",
        items: open.map((item) => ({
          id: toId(item._id),
          title: item.title,
          description: `${item.playbook} · ${item.completion}% complete`,
          badge: {
            label: activeCaseId === toId(item._id) ? "Selected" : "Open",
          },
        })),
      },
      {
        id: "in-progress",
        title: "In Progress",
        items: active.map((item) => ({
          id: toId(item._id),
          title: item.title,
          description: `${item.playbook} · ${item.completion}% complete`,
          badge: {
            label: activeCaseId === toId(item._id) ? "Selected" : "Active",
          },
        })),
      },
      {
        id: "closed",
        title: "Closed",
        items: closed.map((item) => ({
          id: toId(item._id),
          title: item.title,
          description: `${item.playbook} · ${item.completion}% complete`,
          badge: { label: "Done", variant: "outline" },
        })),
      },
    ];
  }, [activeCaseId, cases]);

  if (!userId) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a userId query param or complete onboarding to load cases.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading cases...</p>;
  }

  if (cases.length === 0) {
    return <p className="text-sm text-muted-foreground">No cases yet.</p>;
  }

  return (
    <div className="space-y-3">
      <KanbanBoard columns={columns} className="h-full" />
      <div className="space-y-2">
        {cases.map((item) => (
          <button
            key={toId(item._id)}
            type="button"
            onClick={() => setInitialState(toSnapshot(item))}
            className="w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
          >
            <span className="block font-medium">{item.title}</span>
            <span className="text-xs text-muted-foreground">
              {item.playbook} · {item.completion}% complete
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

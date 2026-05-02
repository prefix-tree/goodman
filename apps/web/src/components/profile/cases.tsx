"use client";

import {
  KanbanBoard,
  type KanbanColumn,
} from "@/components/atoms/kanban-board";

const columns: KanbanColumn[] = [
  {
    id: "open",
    title: "Open",
    items: [
      { id: "1", title: "Intake call", badge: { label: "New" } },
      { id: "2", title: "Document review" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    items: [
      {
        id: "3",
        title: "Follow-up scheduled",
        description: "Awaiting client response",
        badge: { label: "Priority", variant: "destructive" },
      },
    ],
  },
  {
    id: "closed",
    title: "Closed",
    items: [
      { id: "4", title: "Initial consultation", badge: { label: "Done", variant: "outline" } },
    ],
  },
];

export function ProfileCases() {
  return <KanbanBoard columns={columns} className="h-full" />;
}

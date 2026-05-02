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
      {
        id: "1",
        title: "EU Blue Card — Germany",
        description: "Work visa for software engineering role in Berlin",
        badge: { label: "Active" },
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    items: [
      {
        id: "2",
        title: "Document collection",
        description: "Passport, contract, degree apostille",
        badge: { label: "Priority", variant: "destructive" },
      },
      {
        id: "3",
        title: "Embassy appointment",
        description: "German consulate in Warsaw",
      },
    ],
  },
  {
    id: "closed",
    title: "Closed",
    items: [
      {
        id: "4",
        title: "Initial intake call",
        description: "Visa type and eligibility confirmed",
        badge: { label: "Done", variant: "outline" },
      },
      {
        id: "5",
        title: "Salary threshold check",
        description: "€72k exceeds €43.8k minimum",
        badge: { label: "Done", variant: "outline" },
      },
    ],
  },
];

export function ProfileCases() {
  return <KanbanBoard columns={columns} className="h-full" />;
}

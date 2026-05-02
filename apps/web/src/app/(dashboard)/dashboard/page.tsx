"use client";

import { Suspense } from "react";
import { ChatPanel } from "@/components/chat-panel";
import { ProfilePanel } from "@/components/profile-panel";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSSE } from "./dashboard-sse";

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardSSE />
      <div className="flex h-screen flex-col">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden">
          <main className="w-1/2 border-r">
            <ChatPanel />
          </main>
          <aside className="w-1/2">
            <ProfilePanel />
          </aside>
        </div>
      </div>
    </Suspense>
  );
}

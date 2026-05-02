"use client";

import { Suspense } from "react";
import { ChatPanel } from "@/components/chat-panel";
import { ProfilePanel } from "@/components/profile-panel";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSSE } from "./dashboard-sse";
import { DashboardQueryLoader } from "./dashboard-query-loader";

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardSSE />
      <DashboardQueryLoader />
      <div className="flex h-screen flex-col">
        <DashboardHeader />
        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          <main className="min-h-0 w-full flex-1 border-b md:w-1/2 md:border-r md:border-b-0">
            <ChatPanel />
          </main>
          <aside className="min-h-0 w-full flex-1 md:w-1/2">
            <ProfilePanel />
          </aside>
        </div>
      </div>
    </Suspense>
  );
}

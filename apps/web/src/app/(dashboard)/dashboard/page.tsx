import { ChatPanel } from "@/components/chat-panel";
import { ProfilePanel } from "@/components/profile-panel";

export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      <main className="flex-1">
        <ChatPanel />
      </main>
      <aside className="w-80 border-l">
        <ProfilePanel />
      </aside>
    </div>
  );
}

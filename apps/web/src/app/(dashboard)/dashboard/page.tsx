import { ChatPanel } from "@/components/chat-panel";
import { ProfilePanel } from "@/components/profile-panel";

export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      <main className="w-1/2 border-r">
        <ChatPanel />
      </main>
      <aside className="w-1/2">
        <ProfilePanel />
      </aside>
    </div>
  );
}

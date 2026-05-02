import { ChatPanel } from "@/components/chat-panel";
import { ProfilePanel } from "@/components/profile-panel";

export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      <div className="w-1/2 border-r">
        <ChatPanel />
      </div>
      <div className="w-1/2">
        <ProfilePanel />
      </div>
    </div>
  );
}

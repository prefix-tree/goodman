"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/user-store";

export function DashboardHeader() {
  const router = useRouter();
  const userName = useUserStore((s) => s.userName);
  const clear = useUserStore((s) => s.clear);

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "G";

  function handleRestart() {
    clear();
    router.push("/onboarding");
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
      <span className="text-sm font-semibold tracking-tight">Solea</span>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={handleRestart}
        >
          <RotateCcw className="size-3.5" />
          Restart
        </Button>

        <Avatar size="sm">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

import { useState, useCallback } from "react";
import { useVoiceStore } from "@/stores/voice-store";

export function useVoiceSession() {
  const { session, status, setSession, setStatus, clearSession } =
    useVoiceStore();
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(
    async (opts: { userId: string; playbook?: string; caseId?: string }) => {
      setStatus("connecting");
      setError(null);
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(opts),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to create session");
        }
        const data = await res.json();
        setSession({
          roomName: data.roomName,
          token: data.token,
          livekitUrl: data.livekitUrl,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        setStatus("idle");
      }
    },
    [setSession, setStatus],
  );

  const disconnect = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return { session, status, error, connect, disconnect };
}

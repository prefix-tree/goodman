import { useState, useCallback } from "react";
import { useVoiceStore } from "@/stores/voice-store";

interface ConnectResult {
  caseId: string | null;
  mock: boolean;
}

export function useVoiceSession() {
  const { session, status, setSession, setStatus, clearSession } =
    useVoiceStore();
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(
    async (opts: {
      userId: string;
      playbook?: string;
      caseId?: string;
      mock?: boolean;
    }): Promise<ConnectResult | null> => {
      setStatus("connecting");
      setError(null);
      try {
        const useMock = opts.mock !== false; // default to mock
        const endpoint = useMock ? "/api/sessions-mock" : "/api/sessions";

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: opts.userId,
            playbook: opts.playbook,
            caseId: opts.caseId,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to create session");
        }
        const data = await res.json();
        const mock = data.mock ?? useMock;
        const caseId = data.caseId ?? null;

        setSession({
          roomName: data.roomName,
          token: data.token,
          livekitUrl: data.livekitUrl,
          caseId,
          mock,
        });

        if (mock) {
          setStatus("connected");
        }

        return { caseId, mock };
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        setStatus("idle");
        return null;
      }
    },
    [setSession, setStatus],
  );

  const disconnect = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return { session, status, error, connect, disconnect };
}

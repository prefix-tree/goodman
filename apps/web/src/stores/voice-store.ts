import { create } from "zustand";

interface VoiceSession {
  roomName: string;
  token: string;
  livekitUrl: string;
  caseId: string | null;
  mock: boolean;
}

interface VoiceState {
  session: VoiceSession | null;
  status: "idle" | "connecting" | "connected" | "disconnected";
  setSession: (session: VoiceSession) => void;
  setStatus: (status: VoiceState["status"]) => void;
  clearSession: () => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  session: null,
  status: "idle",
  setSession: (session) => set({ session, status: "connecting" }),
  setStatus: (status) => set({ status }),
  clearSession: () => set({ session: null, status: "idle" }),
}));

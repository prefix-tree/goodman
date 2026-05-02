"use client";

import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  DisconnectButton,
} from "@livekit/components-react";
import { useVoiceStore } from "@/stores/voice-store";

interface VoiceSessionProps {
  token: string;
  livekitUrl: string;
  onDisconnected?: () => void;
}

export function VoiceSession({
  token,
  livekitUrl,
  onDisconnected,
}: VoiceSessionProps) {
  const setStatus = useVoiceStore((s) => s.setStatus);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      connect={true}
      audio={true}
      video={false}
      onConnected={() => setStatus("connected")}
      onDisconnected={() => {
        setStatus("disconnected");
        onDisconnected?.();
      }}
      className="flex h-full flex-col"
    >
      <RoomAudioRenderer />
      <VoiceAssistantUI />
    </LiveKitRoom>
  );
}

function VoiceAssistantUI() {
  const { state, audioTrack } = useVoiceAssistant();

  const stateLabel =
    state === "listening"
      ? "Listening..."
      : state === "thinking"
        ? "Thinking..."
        : state === "speaking"
          ? "Speaking..."
          : "Connecting...";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="h-24 w-full max-w-md [--lk-bar-color:hsl(var(--primary))]"
      />

      <p className="text-muted-foreground text-sm capitalize">{stateLabel}</p>

      <DisconnectButton className="bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors">
        End Session
      </DisconnectButton>
    </div>
  );
}

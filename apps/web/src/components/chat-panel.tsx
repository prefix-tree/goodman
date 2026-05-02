"use client";

export function ChatPanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Chat</h2>
      </div>

      {/* Messages area — will be replaced by chat lib */}
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Chat interface
      </div>

      {/* Input area — will be replaced by chat lib */}
      <div className="border-t p-4">
        <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground">
          Type a message…
        </div>
      </div>
    </div>
  );
}

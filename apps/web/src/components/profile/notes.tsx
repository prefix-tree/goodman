"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCaseStore } from "@/stores/case-store";
import { useVoiceStore } from "@/stores/voice-store";
import { StickyNote } from "lucide-react";

interface Note {
  _id: string;
  caseId: string;
  userId: string;
  content: string;
  createdAt: string;
}

const MAX_COMPACT = 3;

export function ProfileNotes({ compact = false }: { compact?: boolean }) {
  const storeCaseId = useCaseStore((s) => s.caseId);
  const voiceCaseId = useVoiceStore((s) => s.session?.caseId);
  const caseId = storeCaseId ?? voiceCaseId;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!caseId) {
      setNotes([]);
      return;
    }

    setLoading(true);
    fetch(`/api/notes?caseId=${caseId}`)
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [caseId]);

  // Compact mode: render inside a card with limited items
  if (compact) {
    return (
      <Card className="w-full min-w-0" style={{ maxWidth: "calc(100vw - 2rem)" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="size-4" />
            Notes
          </CardTitle>
          <CardDescription>Recent notes from your case</CardDescription>
        </CardHeader>
        <CardContent>
          {!caseId ? (
            <p className="text-sm text-muted-foreground">
              Start a voice session to see notes.
            </p>
          ) : loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notes yet.
            </p>
          ) : (
            <div className="space-y-2">
              {notes.slice(0, MAX_COMPACT).map((note) => (
                <div key={note._id} className="border-b pb-2 last:border-0 last:pb-0">
                  <p className="text-sm">{note.content}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {notes.length > MAX_COMPACT && (
                <p className="text-xs text-muted-foreground">
                  +{notes.length - MAX_COMPACT} more — see Notes tab
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full mode
  if (!caseId) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Start a voice session to see notes.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading notes...
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No notes yet. Type a message in the chat to add one.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note._id} size="sm">
            <CardContent className="py-2">
              <p className="text-sm">{note.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

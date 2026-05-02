"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCaseStore } from "@/stores/case-store";

export function ProfileHome() {
  const caseId = useCaseStore((s) => s.caseId);
  const playbook = useCaseStore((s) => s.playbook);
  const completion = useCaseStore((s) => s.completion);
  const summary = useCaseStore((s) => s.summary);
  const risks = useCaseStore((s) => s.risks);

  if (!caseId) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No active case. Start a voice session.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Case Overview</CardTitle>
            {playbook && (
              <Badge variant="outline" className="capitalize text-xs">
                {playbook.replace(/-/g, " ")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium">{completion}%</span>
            </div>
            <Progress value={completion} className="h-2" />
          </div>

          {risks.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Risks</p>
              <div className="flex flex-wrap gap-1">
                {risks.map((r) => (
                  <Badge
                    key={r.id}
                    variant={
                      r.severity === "high" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {r.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

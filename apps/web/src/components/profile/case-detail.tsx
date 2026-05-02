"use client";

import { AlertTriangle, CheckCircle2, Circle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCaseStore } from "@/stores/case-store";

export function CaseDetail() {
  const facts = useCaseStore((s) => s.facts);
  const checklist = useCaseStore((s) => s.checklist);
  const risks = useCaseStore((s) => s.risks);
  const requirements = useCaseStore((s) => s.requirements);
  const completion = useCaseStore((s) => s.completion);
  const caseId = useCaseStore((s) => s.caseId);

  if (!caseId) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Start a voice session to see case details.
      </div>
    );
  }

  const factEntries = Object.entries(facts);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
        {/* Completion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Case Progress</span>
            <span className="text-muted-foreground">{completion}%</span>
          </div>
          <Progress value={completion} className="h-2" />
        </div>

        {/* Facts */}
        {factEntries.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Facts Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {factEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-2 text-sm"
                  >
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium text-right">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risks */}
        {risks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="size-4 text-destructive" />
                Risks Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {risks.map((risk) => (
                  <div
                    key={risk.id}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Badge
                      variant={
                        risk.severity === "high" ? "destructive" : "secondary"
                      }
                      className="shrink-0 text-xs"
                    >
                      {risk.severity}
                    </Badge>
                    <span>{risk.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist / Missing */}
        {checklist.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {checklist.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    {task.status === "completed" ? (
                      <CheckCircle2 className="text-primary size-4 shrink-0" />
                    ) : (
                      <Circle className="text-muted-foreground size-4 shrink-0" />
                    )}
                    <span
                      className={
                        task.status === "completed"
                          ? "text-muted-foreground line-through"
                          : ""
                      }
                    >
                      {task.topic}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Required */}
        {requirements.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="size-4" />
                Documents Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{req.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}

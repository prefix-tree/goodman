import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  badge?: { label: string; variant?: "default" | "secondary" | "destructive" | "outline" };
}

export interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  className?: string;
}

export function KanbanBoard({ columns, className }: KanbanBoardProps) {
  return (
    <div className={cn("flex gap-3 overflow-x-auto", className)}>
      {columns.map((column) => (
        <KanbanColumnView key={column.id} column={column} />
      ))}
    </div>
  );
}

function KanbanColumnView({ column }: { column: KanbanColumn }) {
  return (
    <div className="flex w-52 shrink-0 flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-muted-foreground">
          {column.title}
        </span>
        <Badge variant="secondary">{column.items.length}</Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2">
          {column.items.map((item) => (
            <KanbanCard key={item.id} item={item} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function KanbanCard({ item }: { item: KanbanItem }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      {(item.description || item.badge) && (
        <CardContent className="flex flex-col gap-2">
          {item.description && (
            <p className="text-xs text-muted-foreground">{item.description}</p>
          )}
          {item.badge && (
            <Badge variant={item.badge.variant ?? "secondary"}>
              {item.badge.label}
            </Badge>
          )}
        </CardContent>
      )}
    </Card>
  );
}

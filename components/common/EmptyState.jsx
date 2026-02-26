import { Button } from "@/components/ui/button";
import { Trophy, Plus } from "lucide-react";

export function EmptyState({
  icon: Icon = Trophy,
  title = "No tournaments found",
  description = "Get started by creating your first tournament",
  actionLabel = "Create Tournament",
  onAction,
  showAction = true,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {showAction && onAction && (
        <Button onClick={onAction} className="mt-6">
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

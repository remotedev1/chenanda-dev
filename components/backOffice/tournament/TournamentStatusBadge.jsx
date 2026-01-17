import { Badge } from "@/components/ui/badge";
import { statusConfig } from "@/schemas/tournament.schema";
import { cn } from "@/utils/tournament.utils";

export function TournamentStatusBadge({ status, className }) {
  const config = statusConfig[status] || statusConfig.DRAFT;

  const colorClasses = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium",
        colorClasses[config.color],
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
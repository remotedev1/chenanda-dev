"use client";

import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Trophy,
  CheckCircle2,
  X,
  FileText,
  Clock,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isPast, isToday, isFuture, differenceInDays } from "date-fns";

// Constants (imported from GameForm)
import { SPORT_TYPES, GAME_CATEGORIES } from "./GamesForm";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

function getDeadlineStatus(deadline) {
  if (!deadline) return null;

  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (isPast(deadlineDate) && !isToday(deadlineDate)) {
    return { label: "Closed", variant: "destructive", urgent: false };
  }

  if (isToday(deadlineDate)) {
    return { label: "Today", variant: "destructive", urgent: true };
  }

  const daysLeft = differenceInDays(deadlineDate, now);

  if (daysLeft <= 3) {
    return { label: `${daysLeft}d left`, variant: "destructive", urgent: true };
  }

  if (daysLeft <= 7) {
    return { label: `${daysLeft}d left`, variant: "warning", urgent: false };
  }

  return { label: "Open", variant: "success", urgent: false };
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export function GameCard({ game, onEdit, onDelete, onToggleActive }) {
  const sportConfig = SPORT_TYPES[game.sportType] || {
    label: game.sportType,
    icon: "🏆",
    color: "bg-gray-500",
  };
  const categoryConfig = GAME_CATEGORIES[game.category] || {
    label: game.category,
    icon: "👤",
    color: "text-gray-600",
  };

  const deadlineStatus = game.registrationDeadline
    ? getDeadlineStatus(game.registrationDeadline)
    : null;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-lg",
        !game.isActive && "opacity-60",
      )}
    >
      {/* Top color bar */}
      <div
        className={cn("absolute top-0 left-0 right-0 h-1", sportConfig.color)}
      />

      {/* Urgent deadline indicator */}
      {deadlineStatus?.urgent && game.isActive && (
        <div className="absolute top-2 right-2">
          <Badge variant="destructive" className="text-xs animate-pulse">
            <AlertCircle className="mr-1 h-3 w-3" />
            Urgent
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg text-2xl",
                sportConfig.color,
                "bg-opacity-10",
              )}
            >
              {game.icon || sportConfig.icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">
                {game.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className={categoryConfig.color}>
                  {categoryConfig.icon} {categoryConfig.label}
                </span>
                {game.format && (
                  <>
                    <span>•</span>
                    <span>{game.format}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-50">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(game)}
                className="cursor-pointer hover:bg-blue-300"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Game
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleActive(game)}
                className="cursor-pointer hover:bg-blue-300"
              >
                {game.isActive ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(game)}
                className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-blue-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Game
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(game.date), "PPP")}</span>
        </div>

        {/* Registration Info */}
        <div className="space-y-2 pt-2 border-t">
          {/* Registration Deadline */}
          {game.registrationDeadline && (
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Registration:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {format(new Date(game.registrationDeadline), "MMM d, yyyy")}
                </span>
                {deadlineStatus && (
                  <Badge variant={deadlineStatus.variant} className="text-xs">
                    {deadlineStatus.label}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Registration Fee */}
          {game.registrationFee !== null &&
            game.registrationFee !== undefined && (
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IndianRupee className="h-4 w-4" />
                  <span>Fee:</span>
                </div>
                <span className="font-semibold text-green-600">
                  {game.registrationFee === 0 ? (
                    <Badge variant="outline" className="text-green-600">
                      Free
                    </Badge>
                  ) : (
                    `₹${game.registrationFee.toLocaleString("en-IN")}`
                  )}
                </span>
              </div>
            )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-medium">
              {game._count?.registrations || 0}
            </span>
            <span className="text-muted-foreground">teams</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-orange-500" />
            <span className="font-medium">{game._count?.matches || 0}</span>
            <span className="text-muted-foreground">matches</span>
          </div>
        </div>

        {/* Description */}
        {game.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {game.description}
          </p>
        )}

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={game.isActive ? "default" : "secondary"}
            className="text-xs"
          >
            {game.isActive ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Active
              </>
            ) : (
              <>
                <X className="mr-1 h-3 w-3" />
                Inactive
              </>
            )}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {sportConfig.label}
          </Badge>
        </div>
      </CardContent>

      {game.rules && (
        <CardFooter className="pt-3 border-t">
          <div className="flex items-start gap-2 text-sm text-muted-foreground w-full">
            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="line-clamp-2 flex-1">{game.rules}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default GameCard;

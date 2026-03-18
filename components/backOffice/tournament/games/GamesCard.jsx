"use client";

import { format, isPast, isToday, differenceInDays } from "date-fns";

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

// Constants
import { SPORT_TYPES, GAME_CATEGORIES } from "./GamesForm";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function getDeadlineStatus(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);

  if (isPast(d) && !isToday(d))
    return { label: "Closed", variant: "destructive", urgent: false };
  if (isToday(d))
    return { label: "Today", variant: "destructive", urgent: true };

  const days = differenceInDays(d, new Date());
  if (days <= 3)
    return { label: `${days}d left`, variant: "destructive", urgent: true };
  if (days <= 7)
    return { label: `${days}d left`, variant: "warning", urgent: false };

  return { label: "Open", variant: "success", urgent: false };
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME CARD
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
        "group relative overflow-hidden border-slate-100 bg-white transition-all hover:shadow-md hover:border-slate-200",
        !game.isActive && "opacity-60",
      )}
    >
      {/* Sport colour bar */}
      <div className={cn("absolute inset-x-0 top-0 h-0.5", sportConfig.color)} />

      {/* Urgent badge */}
      {deadlineStatus?.urgent && game.isActive && (
        <div className="absolute top-3 right-3">
          <Badge variant="destructive" className="animate-pulse text-xs">
            <AlertCircle className="mr-1 h-3 w-3" />
            Urgent
          </Badge>
        </div>
      )}

      {/* Header */}
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Sport icon pill */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xl border border-slate-100">
              {game.icon || sportConfig.icon}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="line-clamp-1 text-base text-slate-800">
                {game.name}
              </CardTitle>
              <CardDescription className="mt-0.5 flex items-center gap-1.5 text-xs">
                <span className={categoryConfig.color}>
                  {categoryConfig.icon} {categoryConfig.label}
                </span>
                {game.format && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">{game.format}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-slate-100 shadow-lg">
              <DropdownMenuLabel className="text-xs text-slate-400 font-medium">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem
                onClick={() => onEdit(game)}
                className="cursor-pointer text-slate-600 hover:text-slate-800 hover:bg-slate-50 focus:bg-slate-50"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Game
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleActive(game)}
                className="cursor-pointer text-slate-600 hover:text-slate-800 hover:bg-slate-50 focus:bg-slate-50"
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
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem
                onClick={() => onDelete(game)}
                className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Game
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Game date */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{format(new Date(game.date), "PPP")}</span>
        </div>

        {/* Registration info */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2">
          {game.registrationDeadline && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Deadline</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700">
                  {format(new Date(game.registrationDeadline), "MMM d, yyyy")}
                </span>
                {deadlineStatus && (
                  <Badge variant={deadlineStatus.variant} className="text-xs py-0">
                    {deadlineStatus.label}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {game.registrationFee !== null && game.registrationFee !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                <span>Fee</span>
              </div>
              <span className="font-semibold text-green-600">
                {game.registrationFee === 0 ? (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200 bg-green-50 text-xs py-0"
                  >
                    Free
                  </Badge>
                ) : (
                  `₹${game.registrationFee.toLocaleString("en-IN")}`
                )}
              </span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-semibold text-slate-700">
              {game._count?.registrations || 0}
            </span>
            <span>teams</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Trophy className="h-3.5 w-3.5 text-orange-400" />
            <span className="font-semibold text-slate-700">
              {game._count?.matches || 0}
            </span>
            <span>matches</span>
          </div>
        </div>

        {/* Description */}
        {game.description && (
          <p className="line-clamp-2 text-xs text-slate-400">
            {game.description}
          </p>
        )}

        {/* Status badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={game.isActive ? "default" : "secondary"}
            className={cn(
              "text-xs",
              game.isActive
                ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100"
                : "bg-slate-100 text-slate-500",
            )}
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
          <Badge
            variant="outline"
            className="text-xs border-slate-200 text-slate-500"
          >
            {sportConfig.label}
          </Badge>
        </div>
      </CardContent>

      {game.rules && (
        <CardFooter className="border-t border-slate-100 pt-3">
          <div className="flex items-start gap-2 text-xs text-slate-400 w-full">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p className="line-clamp-2 flex-1">{game.rules}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default GameCard;
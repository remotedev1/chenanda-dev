"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  Radio,
  Calendar,
  MapPin,
  Swords,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ---- Constants ---- */

const STATUS_CONFIG = {
  SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
  DELAYED: { label: "Delayed", className: "bg-yellow-100 text-yellow-800" },
  LIVE: {
    label: "🔴 LIVE",
    className: "bg-red-100 text-red-700 font-semibold animate-pulse",
  },
  SUSPENDED: { label: "Suspended", className: "bg-orange-100 text-orange-800" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800" },
  POSTPONED: { label: "Postponed", className: "bg-slate-100 text-slate-700" },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-600 line-through",
  },
  ABANDONED: { label: "Abandoned", className: "bg-gray-100 text-gray-600" },
  WALKOVER: { label: "Walkover", className: "bg-purple-100 text-purple-700" },
  NO_RESULT: { label: "No Result", className: "bg-slate-100 text-slate-600" },
};

const ROUND_LABELS = {
  POOL_STAGE: "Pool Stage",
  ROUND_1: "Round 1",
  ROUND_2: "Round 2",
  ROUND_3: "Round 3",
  ROUND_4: "Round 4",
  ROUND_5: "Round 5",
  ROUND_6: "Round 6",
  ROUND_OF_32: "R32",
  ROUND_OF_16: "R16",
  PRE_QUARTER: "Pre-QF",
  QUARTER_FINAL: "QF",
  SEMI_FINAL: "SF",
  THIRD_PLACE: "3rd Place",
  FINAL: "🏆 Final",
};

const SPORT_ICONS = {
  FOOTBALL: "⚽",
  BASKETBALL: "🏀",
  VOLLEYBALL: "🏐",
  CRICKET: "🏏",
  TENNIS: "🎾",
  BADMINTON: "🏸",
  ATHLETICS: "🏃",
  FIELD_HOCKEY: "🏑",
  TABLE_TENNIS: "🏓",
  KABADDI: "🤼",
};

// Shimmer Card Component
function MatchCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="relative h-24 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-8 bg-gray-200 rounded-full animate-pulse w-8" />
        </div>
      </div>
    </div>
  );
}

// Match Card Component
function MatchCard({ match, onEdit, onDelete, onLiveControl }) {
  const sport = SPORT_ICONS[match.sport] || "🏆";
  const participants = match.participants || [];
  const team1 = participants[0];
  const team2 = participants[1];
  const statusConfig = STATUS_CONFIG[match.status] || {
    label: match.status,
    className: "",
  };
  const isLive = match.status === "LIVE";
  const canGoLive = ["SCHEDULED", "DELAYED"].includes(match.status);
  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Header with gradient and sport icon */}
      <div
        className={cn(
          "relative h-24 bg-gradient-to-br overflow-hidden",
          match.status === "LIVE"
            ? "from-red-500 via-red-600 to-rose-700"
            : match.status === "COMPLETED"
              ? "from-gray-400 via-gray-500 to-gray-600"
              : "from-blue-400 via-blue-500 to-indigo-600",
        )}
      >
        <div className="absolute inset-0 bg-black/10" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={cn(
              "bg-white/95 backdrop-blur-sm",
              statusConfig.className,
            )}
          >
            {statusConfig.label}
          </Badge>
        </div>

        {/* Match Info */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
              {sport}
            </div>
            <div className="text-white">
              <div className="text-sm font-semibold">
                Match #{match.matchNo}
              </div>
              <div className="text-xs opacity-90">
                {ROUND_LABELS[match.round] || match.round}
                {match.pool ? ` · Pool ${match.pool}` : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Teams VS Display */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 text-right min-w-0">
            <div
              className={cn(
                "font-bold text-base truncate capitalize",
                team1 ? "text-gray-900" : "text-gray-400 italic",
              )}
            >
              {team1?.family || "TBD"}
              {match.winnerId === participants[0]?.teamId && (
                <span className="ml-2 text-green-600 text-sm">🏆</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-sm shrink-0">
            <Swords className="h-4 w-4 text-white" />
          </div>

          <div className="flex-1 text-left min-w-0">
            <div
              className={cn(
                "font-bold text-base truncate capitalize",
                team2 ? "text-gray-900" : "text-gray-400 italic",
              )}
            >
              {team2?.family || "TBD"}
              {match.winnerId === team2.familyId && (
                <span className="ml-2 text-green-600 text-sm">✓</span>
              )}
            </div>
          </div>
        </div>

        {match.isDraw && (
          <div className="text-center">
            <Badge variant="outline" className="bg-slate-100 text-slate-700">
              Draw
            </Badge>
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-600">
          {match.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>{match.venue.replace(/_/g, " ")}</span>
            </div>
          )}

          {match.scheduledOn && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span>
                {format(new Date(match.scheduledOn), "dd MMM yyyy, hh:mm a")}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          {isLive && onLiveControl ? (
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => onLiveControl(match)}
            >
              <Radio className="h-4 w-4 mr-2" />
              Live Controls
            </Button>
          ) : canGoLive && onLiveControl ? (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => onLiveControl(match)}
            >
              <Radio className="h-4 w-4 mr-2" />
              Manage
            </Button>
          ) : (
            <div></div>
          )}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {/* {(isLive || canGoLive) && onLiveControl && (
                <>
                  <DropdownMenuItem
                    onClick={() => onLiveControl(match)}
                    className="cursor-pointer text-red-600 font-medium"
                  >
                    <Radio className="mr-2 h-4 w-4" />
                    {isLive ? "Live Controls" : "Go Live"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )} */}

              <DropdownMenuItem
                onClick={() => onLiveControl(match)}
                className="cursor-pointer text-red-600 font-medium"
              >
                <Radio className="mr-2 h-4 w-4" />
                {isLive ? "Live Controls" : "Go Live"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(match)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={() => onDelete(match)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function MatchTable({
  matches,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onEdit,
  onDelete,
  onLiveControl,
  loading = false,
}) {
  const searchInputRef = useRef(null);
  const searchTimerRef = useRef(null);
  const wasFocusedRef = useRef(false);

  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    match: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Restore focus after re-render
  useEffect(() => {
    if (wasFocusedRef.current && searchInputRef.current) {
      searchInputRef.current.focus();
      const length = searchInputRef.current.value.length;
      searchInputRef.current.setSelectionRange(length, length);
    }
  }, [matches]);

  // Handle search with debounce
  const handleSearch = (value) => {
    setSearchValue(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      onFilterChange({ search: value });
    }, 500);
  };

  const handleFocus = () => {
    wasFocusedRef.current = true;
  };

  const handleBlur = () => {
    wasFocusedRef.current = false;
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.match) return;
    setDeleting(true);
    try {
      await onDelete(
        deleteDialog.match.id,
        deleteDialog.match.name || `Match #${deleteDialog.match.matchNo}`,
      );
      setDeleteDialog({ open: false, match: null });
    } catch {
      /* handled in hook */
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (match) => {
    setDeleteDialog({ open: true, match });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Search matches..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="pl-9 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.status || "all"}
            onValueChange={(v) =>
              onFilterChange({ status: v === "all" ? undefined : v })
            }
          >
            <SelectTrigger className="w-[160px] bg-white border-gray-300">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.round || "all"}
            onValueChange={(v) =>
              onFilterChange({ round: v === "all" ? undefined : v })
            }
          >
            <SelectTrigger className="w-[160px] bg-white border-gray-300">
              <SelectValue placeholder="All Rounds" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Rounds</SelectItem>
              {Object.entries(ROUND_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.pool || "all"}
            onValueChange={(v) =>
              onFilterChange({ pool: v === "all" ? undefined : v })
            }
          >
            <SelectTrigger className="w-[130px] bg-white border-gray-300">
              <SelectValue placeholder="All Pools" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Pools</SelectItem>
              {["A", "B", "C", "D", "E", "F", "G", "H"].map((p) => (
                <SelectItem key={p} value={p}>
                  Pool {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onEdit={onEdit}
              onDelete={handleDeleteClick}
              onLiveControl={onLiveControl}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Swords className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No matches found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchValue || filters.status || filters.round || filters.pool
              ? "Try adjusting your search or filters"
              : "Get started by creating your first match"}
          </p>
          {searchValue && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchValue("")}
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{pagination.from}</span> to{" "}
            <span className="font-medium">{pagination.to}</span> of{" "}
            <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="border-gray-300"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-md">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="border-gray-300"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, match: null })}
      >
        <AlertDialogContent className="bg-white  ">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tournament?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to Delete this Match?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

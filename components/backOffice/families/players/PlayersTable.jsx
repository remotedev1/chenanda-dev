"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  Award,
  Trophy,
  Users,
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { differenceInYears } from "date-fns";

// ─── Constants ────────────────────────────────────────────────────────────────

const sportColors = {
  FOOTBALL: "bg-blue-100 text-blue-800",
  BASKETBALL: "bg-orange-100 text-orange-800",
  VOLLEYBALL: "bg-purple-100 text-purple-800",
  CRICKET: "bg-green-100 text-green-800",
  TENNIS: "bg-yellow-100 text-yellow-800",
  BADMINTON: "bg-pink-100 text-pink-800",
  ATHLETICS: "bg-red-100 text-red-800",
};

const sportGradients = {
  FOOTBALL: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  BASKETBALL: "linear-gradient(135deg, #f97316, #ea580c)",
  VOLLEYBALL: "linear-gradient(135deg, #a855f7, #7c3aed)",
  CRICKET: "linear-gradient(135deg, #22c55e, #15803d)",
  TENNIS: "linear-gradient(135deg, #eab308, #a16207)",
  BADMINTON: "linear-gradient(135deg, #ec4899, #be185d)",
  ATHLETICS: "linear-gradient(135deg, #ef4444, #b91c1c)",
};

const DEFAULT_GRADIENT = "linear-gradient(135deg, #f97316, #ef4444, #ec4899)";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  return differenceInYears(new Date(), new Date(dateOfBirth));
}

// ─── Player Card ──────────────────────────────────────────────────────────────

function PlayerCard({ player, onEdit, onDelete }) {
  const age = calculateAge(player.dateOfBirth);
  const headerGradient =
    sportGradients[player.primarySport] || DEFAULT_GRADIENT;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Header band */}
      <div
        className="relative h-28 overflow-hidden"
        style={{ background: headerGradient }}
      >
        <div className="absolute inset-0 bg-black/10" />

        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-7 left-5">
          <div
            className="h-14 w-14 rounded-full bg-white shadow-md border-2 border-white flex items-center justify-center text-xl font-bold"
            style={{
              color: sportGradients[player.primarySport]
                ? undefined
                : "#f97316",
              background: headerGradient,
            }}
          >
            <span className="text-white">
              {player.playerName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Top-right badges */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {/* Active/Inactive */}
          <Badge
            className={`text-xs font-medium border ${
              player.isActive
                ? "bg-green-500/20 backdrop-blur-sm text-white border-green-300/30"
                : "bg-gray-500/20 backdrop-blur-sm text-white border-gray-300/30"
            }`}
          >
            {player.isActive ? "Active" : "Inactive"}
          </Badge>

          {/* Jersey number */}
          {player.jerseyNumber && (
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs font-medium">
              #{player.jerseyNumber}
            </Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="pt-10 px-5 pb-5 space-y-3">
        {/* Name + age */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {player.playerName}
          </h3>
          {age && <p className="text-sm text-gray-400">{age} years old</p>}
        </div>

        {/* Family */}
        {player.family && (
          <p className="text-sm text-gray-500">
            <span className="text-gray-400">Family:</span>{" "}
            <span className="font-medium text-gray-700">
              {player.family.familyName}
            </span>
          </p>
        )}

        {/* Sport + stats */}
        <div className="flex flex-wrap gap-2">
          {player.primarySport && (
            <Badge
              variant="outline"
              className={`text-xs ${sportColors[player.primarySport] || ""}`}
            >
              {player.primarySport}
            </Badge>
          )}
          {player._count?.achievements > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">
              <Award className="h-3 w-3 mr-1" />
              {player._count.achievements}
            </Badge>
          )}
          {player._count?.manOfTheMatchIn > 0 && (
            <Badge variant="outline" className="text-xs font-normal">
              <Trophy className="h-3 w-3 mr-1" />
              {player._count.manOfTheMatchIn} MoM
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-sm text-gray-400">
            {player.primarySport ? (
              <span className="font-medium text-gray-600">
                {player.primarySport.charAt(0) +
                  player.primarySport.slice(1).toLowerCase()}
              </span>
            ) : (
              <span className="italic">No sport assigned</span>
            )}
          </div>

          <DropdownMenu>
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
              <DropdownMenuItem
                // ✅ Defer by one tick so Radix restores pointer-events
                // before the Dialog mounts — prevents frozen/unclickable dialogs
                onClick={() => setTimeout(() => onEdit(player), 0)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                onClick={() => setTimeout(() => onDelete(player), 0)}
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

// ─── Main PlayerTable ─────────────────────────────────────────────────────────

export function PlayerTable({
  players,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onEdit,
  onDelete,
  loading = false,
}) {
  const searchInputRef = useRef(null);
  const searchTimerRef = useRef(null);
  // ✅ Track whether the component has mounted to avoid focus stealing on load
  const hasMountedRef = useRef(false);
  const wasFocusedRef = useRef(false);

  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    player: null,
  });
  const [deleting, setDeleting] = useState(false);

  // ✅ Only restore focus after the FIRST data update post-mount, not on initial render
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (wasFocusedRef.current && searchInputRef.current) {
      searchInputRef.current.focus();
      const length = searchInputRef.current.value.length;
      searchInputRef.current.setSelectionRange(length, length);
    }
  }, [players]);

  // ✅ useCallback so handleSearch is stable across renders
  const handleSearch = useCallback(
    (value) => {
      setSearchValue(value);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        // ✅ Pass scroll:false hint via a wrapper — real fix is in parent using router.replace
        onFilterChange({ search: value });
      }, 500);
    },
    [onFilterChange],
  );

  const handleFocus = () => {
    wasFocusedRef.current = true;
  };
  const handleBlur = () => {
    wasFocusedRef.current = false;
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.player) return;
    setDeleting(true);
    try {
      await onDelete(deleteDialog.player.id, deleteDialog.player.playerName);
      setDeleteDialog({ open: false, player: null });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Filters ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Search players..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="pl-9 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.sport || "all"}
            onValueChange={(value) =>
              onFilterChange({ sport: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[160px] bg-white border-gray-300">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="HOCKEY">hockey</SelectItem>
              <SelectItem value="FOOTBALL">Football</SelectItem>
              <SelectItem value="BASKETBALL">Basketball</SelectItem>
              <SelectItem value="VOLLEYBALL">Volleyball</SelectItem>
              <SelectItem value="CRICKET">Cricket</SelectItem>
              <SelectItem value="TENNIS">Tennis</SelectItem>
              <SelectItem value="BADMINTON">Badminton</SelectItem>
              <SelectItem value="ATHLETICS">Athletics</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFilterChange({ status: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[160px] bg-white border-gray-300">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || "playerName"}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-[160px] bg-white border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="playerName">Name (A–Z)</SelectItem>
              <SelectItem value="playerName-desc">Name (Z–A)</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Cards Grid — filters always rendered above; these three states are mutually exclusive ── */}
      {players.length > 0 ? (
        // Results
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onEdit={onEdit}
              onDelete={(p) => setDeleteDialog({ open: true, player: p })}
            />
          ))}
        </div>
      ) : (
        // Empty state — only shown when not loading and truly no results
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No players found
          </h3>
          <p className="text-gray-500 mb-2">
            {searchValue || filters.sport || filters.status
              ? "Try adjusting your search or filters"
              : "Get started by adding your first player"}
          </p>
          {(searchValue || filters.sport || filters.status) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                handleSearch("");
                onFilterChange({ sport: undefined, status: undefined });
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* ── Pagination ── */}
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

      {/* ── Delete Dialog ── */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, player: null })}
        onConfirm={handleDelete}
        title="Delete Player"
        description="Are you sure you want to delete this player? This action cannot be undone."
        itemName={deleteDialog.player?.playerName}
        loading={deleting}
      />
    </div>
  );
}

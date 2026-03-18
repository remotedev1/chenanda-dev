"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import { Plus, Search, Trophy, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

// Hooks
import {
  useDeleteGame,
  useGames,
  useUpdateGame,
} from "@/hooks/useTournamentGame";
import { ConfirmDialog } from "@/components/ui/ConfirmDelete";

// Local Components
import { GameCard } from "./GamesCard";
import { GameFormDialog } from "./GamesForm";
import { SPORT_TYPES, GAME_CATEGORIES } from "./GamesForm";

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════════════════ */

function EmptyState({ onCreateGame }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
        <Trophy className="h-7 w-7 text-orange-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">No games found</h3>
      <p className="mt-1 text-sm text-slate-500">
        Get started by creating your first game
      </p>
      <Button
        className="mt-6 bg-orange-500 hover:bg-orange-600 text-white"
        onClick={onCreateGame}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create First Game
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export function TournamentGameMain() {
  const { tournamentId } = useParams();

  // Hooks
  const { games, tournament, loading, filters, updateFilters, refresh } =
    useGames({ tournamentId });
  const { updateGame, updating } = useUpdateGame(tournamentId);
  const { deleteGame, deleting } = useDeleteGame(tournamentId);

  // UI state
  const [formDialog, setFormDialog] = useState({ open: false, game: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, game: null });
  const [searchQuery, setSearchQuery] = useState("");

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  GAME ACTIONS                                                            */
  /* ─────────────────────────────────────────────────────────────────────── */

  const handleCreateGame = () => setFormDialog({ open: true, game: null });
  const handleEditGame = (game) => setFormDialog({ open: true, game });

  const handleConfirmDelete = async () => {
    if (!deleteDialog.game) return;
    try {
      await deleteGame(deleteDialog.game.id, deleteDialog.game.name);
      setDeleteDialog({ open: false, game: null });
      refresh();
    } catch (_) {}
  };

  const handleToggleActive = async (game) => {
    try {
      await updateGame(game.id, { isActive: !game.isActive });
      toast.success(`Game ${!game.isActive ? "activated" : "deactivated"}`);
      refresh();
    } catch (_) {}
  };

  const handleFormSuccess = () => refresh();

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  FILTERING & SEARCH                                                      */
  /* ─────────────────────────────────────────────────────────────────────── */

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          game.name.toLowerCase().includes(q) ||
          game.description?.toLowerCase().includes(q) ||
          game.format?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [games, searchQuery]);

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  STATISTICS                                                              */
  /* ─────────────────────────────────────────────────────────────────────── */

  const stats = useMemo(() => ({
    total: games.length,
    active: games.filter((g) => g.isActive).length,
    inactive: games.filter((g) => !g.isActive).length,
    totalRegistrations: games.reduce(
      (sum, g) => sum + (g._count?.registrations || 0),
      0,
    ),
    totalMatches: games.reduce((sum, g) => sum + (g._count?.matches || 0), 0),
  }), [games]);

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  LOADING                                                                 */
  /* ─────────────────────────────────────────────────────────────────────── */

  if (loading && games.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-orange-500" />
          <p className="text-sm text-slate-500">Loading games...</p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  RENDER                                                                  */
  /* ─────────────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-orange-500">
            Tournament Games
          </h1>
          {tournament ? (
            <p className="mt-1 text-sm text-slate-500">
              {tournament.name} •{" "}
              {format(new Date(tournament.startDate), "MMM d")} –{" "}
              {format(new Date(tournament.endDate), "MMM d, yyyy")}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              Manage and configure all games in this tournament
            </p>
          )}
        </div>
        <Button
          onClick={handleCreateGame}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Game
        </Button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Games", value: stats.total, color: "text-slate-800" },
          { label: "Active", value: stats.active, color: "text-green-600" },
          { label: "Inactive", value: stats.inactive, color: "text-slate-400" },
          { label: "Registrations", value: stats.totalRegistrations, color: "text-blue-600" },
          { label: "Matches", value: stats.totalMatches, color: "text-orange-500" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
          >
            <div className={cn("text-2xl font-bold", color)}>{value}</div>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Sport Filter */}
          <Select
            value={filters.sportType || "all"}
            onValueChange={(v) =>
              updateFilters({ sportType: v === "all" ? undefined : v })
            }
          >
            <SelectTrigger className="w-full lg:w-[180px] border-slate-200 bg-slate-50">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Sports</SelectItem>
              {Object.entries(SPORT_TYPES).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={filters.category || "all"}
            onValueChange={(v) =>
              updateFilters({ category: v === "all" ? undefined : v })
            }
          >
            <SelectTrigger className="w-full lg:w-[180px] border-slate-200 bg-slate-50">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(GAME_CATEGORIES).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={
              filters.isActive === undefined
                ? "all"
                : filters.isActive
                  ? "active"
                  : "inactive"
            }
            onValueChange={(v) =>
              updateFilters({
                isActive: v === "all" ? undefined : v === "active",
              })
            }
          >
            <SelectTrigger className="w-full lg:w-[160px] border-slate-200 bg-slate-50">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={filters.sortBy}
            onValueChange={(v) => updateFilters({ sortBy: v })}
          >
            <SelectTrigger className="w-full lg:w-[150px] border-slate-200 bg-slate-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="createdAt">Sort by Created</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              updateFilters({
                sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
              })
            }
            className="border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
          >
            {filters.sortOrder === "asc" ? "↑" : "↓"}
          </Button>

          {/* Refresh */}
          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={loading}
            className="border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Games Grid or Empty State */}
      {filteredGames.length === 0 ? (
        searchQuery ||
        filters.sportType ||
        filters.category ||
        filters.isActive !== undefined ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <Search className="mb-4 h-10 w-10 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-800">No results found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <EmptyState onCreateGame={handleCreateGame} />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={handleEditGame}
              onDelete={(game) => setDeleteDialog({ open: true, game })}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <GameFormDialog
        key={formDialog.game?.id || "new"}
        open={formDialog.open}
        onOpenChange={(open) =>
          setFormDialog({ open, game: open ? formDialog.game : null })
        }
        game={formDialog.game}
        tournamentId={tournamentId}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, game: null })
        }
        title="Delete Game?"
        description="Are you sure you want to delete this game? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        loading={deleting}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}

export default TournamentGameMain;
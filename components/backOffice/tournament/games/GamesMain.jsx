"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
// import { useGames, useUpdateGame, useDeleteGame } from "@/hooks/useTournamentGames";

// Local Components
import { GameCard } from "./GamesCard";
import { GameFormDialog } from "./GamesForm";
import { SPORT_TYPES, GAME_CATEGORIES } from "./GamesForm";
import {
  useDeleteGame,
  useGames,
  useUpdateGame,
} from "@/hooks/useTournamentGame";
import { ConfirmDialog } from "@/components/ui/ConfirmDelete";

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
  // Local search state (client-side filtering)
  const [searchQuery, setSearchQuery] = useState("");

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  GAME ACTIONS                                                            */
  /* ────────────────────
  
  ─────────────────────────────────────────────────── */

  const handleCreateGame = () => {
    setFormDialog({ open: true, game: null });
  };

  const handleEditGame = (game) => {
    setFormDialog({ open: true, game });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.game) return;

    try {
      await deleteGame(deleteDialog.game.id, deleteDialog.game.name);
      setDeleteDialog({ open: false, game: null });
      refresh();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleToggleActive = async (game) => {
    try {
      await updateGame(game.id, { isActive: !game.isActive });
      toast.success(`Game ${!game.isActive ? "activated" : "deactivated"}`);
      refresh();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleFormSuccess = () => {
    refresh();
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  FILTERING & SEARCH                                                      */
  /* ─────────────────────────────────────────────────────────────────────── */

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Search query (client-side)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          game.name.toLowerCase().includes(query) ||
          game.description?.toLowerCase().includes(query) ||
          game.format?.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [games, searchQuery]);

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  STATISTICS                                                              */
  /* ─────────────────────────────────────────────────────────────────────── */

  const stats = useMemo(() => {
    return {
      total: games.length,
      active: games.filter((g) => g.isActive).length,
      inactive: games.filter((g) => !g.isActive).length,
      totalRegistrations: games.reduce(
        (sum, g) => sum + (g._count?.registrations || 0),
        0,
      ),
      totalMatches: games.reduce((sum, g) => sum + (g._count?.matches || 0), 0),
    };
  }, [games]);

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  RENDER                                                                  */
  /* ─────────────────────────────────────────────────────────────────────── */

  if (loading && games.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tournament Games
          </h1>
          {tournament && (
            <p className="text-muted-foreground mt-1">
              {tournament.name} •{" "}
              {format(new Date(tournament.startDate), "MMM d")} -{" "}
              {format(new Date(tournament.endDate), "MMM d, yyyy")}
            </p>
          )}
        </div>
        <Button onClick={handleCreateGame} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Game
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Games</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-600">
              {stats.inactive}
            </div>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalRegistrations}
            </div>
            <p className="text-xs text-muted-foreground">Registrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalMatches}
            </div>
            <p className="text-xs text-muted-foreground">Matches</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Sport Filter */}
            <Select
              value={filters.sportType || "all"}
              onValueChange={(value) =>
                updateFilters({
                  sportType: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
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
              onValueChange={(value) =>
                updateFilters({
                  category: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
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
              onValueChange={(value) =>
                updateFilters({
                  isActive:
                    value === "all"
                      ? undefined
                      : value === "active"
                        ? true
                        : false,
                })
              }
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilters({ sortBy: value })}
            >
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            >
              {filters.sortOrder === "asc" ? "↑" : "↓"}
            </Button>

            {/* Refresh */}
            <Button
              variant="outline"
              size="icon"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No games found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ||
              filters.sportType ||
              filters.category ||
              filters.isActive !== undefined
                ? "Try adjusting your search or filters"
                : "Get started by creating your first game"}
            </p>
            {!searchQuery &&
              !filters.sportType &&
              !filters.category &&
              filters.isActive === undefined && (
                <Button onClick={handleCreateGame}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Game
                </Button>
              )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={handleEditGame}
              onDelete={(game) => setDeleteDialog({ open: true, game })}
              onToggleActive={handleToggleActive}
              handleEditGame={handleEditGame}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, gameId: null })
        }
        title="Delete Game?"
        description="Are you sure you want to delete this game?"
        onConfirm={handleConfirmDelete}
        loading={deleting}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}

export default TournamentGameMain;

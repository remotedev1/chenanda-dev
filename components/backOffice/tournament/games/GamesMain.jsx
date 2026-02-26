"use client";

import { useState } from "react";
<<<<<<< HEAD
import { Button } from "@/components/ui/button";
=======
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
>>>>>>> ea209cd5a00b0946fdc360bb3e547b29cd4cf8d4
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
<<<<<<< HEAD
import { Plus, Gamepad2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import {
  useGames,
  useCreateGame,
  useUpdateGame,
  useDeleteGame,
} from "@/hooks/useGame";
import { Can } from "@/hooks/useAbility";
import { Skeleton } from "@/components/ui/skeleton";
import { GameForm } from "./GamesForm";
import { GameTable } from "./GamesTable";
import { useParams } from "next/navigation";

const GamesMain = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const {tournamentId} = useParams();

  const { games, setPage, pagination, loading, filters, updateFilters, refresh } =
    useGames(tournamentId);
  const { createGame, creating } = useCreateGame();
  const { updateGame, updating } = useUpdateGame();
  const { deleteGame } = useDeleteGame();

  const handleCreate = async (data) => {
    await createGame(data);
    setCreateDialogOpen(false);
    refresh();
  };

  const handleEdit = (game) => {
    setSelectedGame(game);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (data) => {
    await updateGame(selectedGame.id, data);
    setEditDialogOpen(false);
    setSelectedGame(null);
    refresh();
  };

  const handleDelete = async (id, name) => {
    await deleteGame(id, name);
    refresh();
  };

  const handleDialogClose = (isOpen, dialogType) => {
    if (dialogType === "create") {
      setCreateDialogOpen(isOpen);
    } else {
      setEditDialogOpen(isOpen);
      if (!isOpen) setSelectedGame(null);
    }
  };
console.log(loading)
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-56 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-orange-500">
            Tournament Games
          </h1>
          <p className="text-muted-foreground">
            Manage games, sports, and categories for this tournament
          </p>
        </div>
        <Can I="create" a="TournamentGame">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
=======
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Trophy,
  Users,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
} from "lucide-react";
import {
  GameCategory,
  SportType,
  categoryConfig,
  sportConfigExtended,
} from "@/schemas/games.schema";
import { GameForm } from "./GameForm";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Can } from "@/hooks/useAbility";
import { cn, formatDate, formatDateTime } from "@/utils/tournament.utils";
import { toast } from "sonner";
import { useTournament } from "@/hooks/useTournament";

export default function GamesMain() {
  const router = useRouter();
  const { id } = useParams();
  const [filterSport, setFilterSport] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, game: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, game: null });

  // Fetch tournament with games
  const { tournament, loading, refresh } = useTournament(id);

  const handleCreateGame = async (data) => {
    try {
      const response = await fetch(`/api/tournaments/${id}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create game");
      }

      toast.success("Game created successfully");
      setCreateDialogOpen(false);
      refresh();
    } catch (error) {
      toast.error("Failed to create game", {
        description: error.message,
      });
    }
  };

  const handleUpdateGame = async (data) => {
    if (!editDialog.game) return;

    try {
      const response = await fetch(
        `/api/tournaments/${id}/games/${editDialog.game.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update game");
      }

      toast.success("Game updated successfully");
      setEditDialog({ open: false, game: null });
      refresh();
    } catch (error) {
      toast.error("Failed to update game", {
        description: error.message,
      });
    }
  };

  const handleDeleteGame = async () => {
    if (!deleteDialog.game) return;

    try {
      const response = await fetch(
        `/api/tournaments/${id}/games/${deleteDialog.game.id}`,
        { method: "DELETE" },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete game");
      }

      toast.success(result.message || "Game deleted successfully");
      setDeleteDialog({ open: false, game: null });
      refresh();
    } catch (error) {
      toast.error("Failed to delete game", {
        description: error.message,
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!tournament) {
    return <div className="p-6">Tournament not found</div>;
  }

  const games = tournament.games || [];

  // Filter games
  const filteredGames = games.filter((g) => {
    const matchesSport = filterSport === "all" || g.sportType === filterSport;
    const matchesCategory =
      filterCategory === "all" || g.category === filterCategory;
    return matchesSport && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/tournaments/${id}`)}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournament
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Games & Events</h1>
          <p className="text-muted-foreground">
            {tournament.name} - Manage tournament games
          </p>
        </div>

        <Can I="manage" a="all">
          <Button onClick={() => setCreateDialogOpen(true)}>
>>>>>>> ea209cd5a00b0946fdc360bb3e547b29cd4cf8d4
            <Plus className="mr-2 h-4 w-4" />
            Add Game
          </Button>
        </Can>
      </div>

<<<<<<< HEAD
      {/* Content */}
      {games.length === 0 && !filters.search ? (
        <EmptyState
          icon={Gamepad2}
          title="No games yet"
          description="Start adding games to structure your tournament sports and categories"
=======
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{games.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Games</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {games.filter((g) => g.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Registrations
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {games.reduce(
                (sum, g) => sum + (g._count?.registrations || 0),
                0,
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {games
                .reduce(
                  (sum, g) =>
                    sum + g.registrationFee * (g._count?.registrations || 0),
                  0,
                )
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={filterSport} onValueChange={setFilterSport}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {Object.entries(SportType).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {sportConfigExtended[value]?.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(GameCategory).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {categoryConfig[value]?.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No games found"
          description="Add games and events to your tournament"
>>>>>>> ea209cd5a00b0946fdc360bb3e547b29cd4cf8d4
          actionLabel="Add Game"
          onAction={() => setCreateDialogOpen(true)}
          showAction={true}
        />
      ) : (
<<<<<<< HEAD
        <GameTable
          games={games}
          pagination={pagination}
          filters={filters}
          onFilterChange={updateFilters}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(isOpen) => handleDialogClose(isOpen, "create")}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Add New Game</DialogTitle>
            <DialogDescription className="text-slate-600">
              Fill in the game details below
            </DialogDescription>
          </DialogHeader>
          <GameForm
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            loading={creating}
            tournamentId={tournamentId}
=======
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => {
            const sportConfig = sportConfigExtended[game.sportType];
            const catConfig = categoryConfig[game.category];

            return (
              <Card key={game.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sportConfig?.icon}</span>
                        <CardTitle className="text-lg">{game.name}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={cn(sportConfig?.color)}>
                          {sportConfig?.label}
                        </Badge>
                        <Badge className={cn(catConfig?.color)}>
                          {catConfig?.icon} {catConfig?.label}
                        </Badge>
                      </div>
                    </div>
                    {!game.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {game.format && (
                    <div className="text-sm text-muted-foreground">
                      Format: {game.format}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(game.date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fee</p>
                      <p className="font-medium">₹{game.registrationFee}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Registrations</p>
                      <p className="font-medium">
                        {game._count?.registrations || 0}
                        {game.maxTeams && ` / ${game.maxTeams}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-medium">
                        {formatDate(game.registrationDeadline)}
                      </p>
                    </div>
                  </div>

                  <Can I="manage" a="all">
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditDialog({ open: true, game })}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteDialog({ open: true, game })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Can>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Game</DialogTitle>
            <DialogDescription>
              Create a new game or event for this tournament
            </DialogDescription>
          </DialogHeader>
          <GameForm
            tournament={tournament}
            onSubmit={handleCreateGame}
            onCancel={() => setCreateDialogOpen(false)}
>>>>>>> ea209cd5a00b0946fdc360bb3e547b29cd4cf8d4
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
<<<<<<< HEAD
        open={editDialogOpen}
        onOpenChange={(isOpen) => handleDialogClose(isOpen, "edit")}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Edit Game</DialogTitle>
            <DialogDescription className="text-slate-600">
              Update the game details below
            </DialogDescription>
          </DialogHeader>
          <GameForm
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditDialogOpen(false);
              setSelectedGame(null);
            }}
            loading={updating}
            initialData={selectedGame}
            tournamentId={tournamentId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamesMain;
=======
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, game: null })}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
            <DialogDescription>Update game details</DialogDescription>
          </DialogHeader>
          <GameForm
            tournament={tournament}
            game={editDialog.game}
            onSubmit={handleUpdateGame}
            onCancel={() => setEditDialog({ open: false, game: null })}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, game: null })}
        onConfirm={handleDeleteGame}
        title="Delete Game"
        description="Are you sure you want to delete this game? If it has registrations or matches, it will be marked as inactive instead."
        itemName={deleteDialog.game?.name}
      />
    </div>
  );
}
>>>>>>> ea209cd5a00b0946fdc360bb3e547b29cd4cf8d4

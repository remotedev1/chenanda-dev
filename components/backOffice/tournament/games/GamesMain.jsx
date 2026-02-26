"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
            <Plus className="mr-2 h-4 w-4" />
            Add Game
          </Button>
        </Can>
      </div>

      {/* Content */}
      {games.length === 0 && !filters.search ? (
        <EmptyState
          icon={Gamepad2}
          title="No games yet"
          description="Start adding games to structure your tournament sports and categories"
          actionLabel="Add Game"
          onAction={() => setCreateDialogOpen(true)}
          showAction={true}
        />
      ) : (
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
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
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
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
import { Plus, Users2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import {
  usePlayers,
  useCreatePlayer,
  useUpdatePlayer,
  useDeletePlayer,
} from "@/hooks/usePlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerForm } from "./PlayersForm";
import { PlayerTable } from "./PlayersTable";

const PlayersMain = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const {
    players,
    setPage,
    pagination,
    loading,
    filters,
    updateFilters,
    refresh,
  } = usePlayers();
  const { createPlayer, creating } = useCreatePlayer();
  const { updatePlayer, updating } = useUpdatePlayer();
  const { deletePlayer } = useDeletePlayer();


  const handleCreate = async (data) => {
    await createPlayer(data);
    setCreateDialogOpen(false);
    refresh();
  };

  const handleEdit = (player) => {
    setSelectedPlayer(player);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (data) => {
    await updatePlayer(selectedPlayer.id, data);
    setEditDialogOpen(false);
    setSelectedPlayer(null);
    refresh();
  };

  const handleDelete = async (id, name) => {
    await deletePlayer(id, name);
    refresh();
  };

  const handleDialogClose = (isOpen, dialogType) => {
    if (dialogType === "create") {
      setCreateDialogOpen(isOpen);
    } else {
      setEditDialogOpen(isOpen);
      if (!isOpen) setSelectedPlayer(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
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
            Players
          </h1>
          <p className="text-muted-foreground">
            Manage tournament players and their information
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Player
        </Button>
      </div>

      {/* Content */}
      {players.length === 0 && !filters.search ? (
        <EmptyState
          icon={Users2}
          title="No players yet"
          description="Start adding players to build your tournament roster"
          actionLabel="Add Player"
          onAction={() => setCreateDialogOpen(true)}
          showAction={true}
        />
      ) : (
        <PlayerTable
          players={players}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Add New Player</DialogTitle>
            <DialogDescription className="text-slate-600">
              Fill in the player details below
            </DialogDescription>
          </DialogHeader>
          <PlayerForm
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            loading={creating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(isOpen) => handleDialogClose(isOpen, "edit")}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Edit Player</DialogTitle>
            <DialogDescription className="text-slate-600">
              Update the player details below
            </DialogDescription>
          </DialogHeader>
          <PlayerForm
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditDialogOpen(false);
              setSelectedPlayer(null);
            }}
            loading={updating}
            initialData={selectedPlayer}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayersMain;

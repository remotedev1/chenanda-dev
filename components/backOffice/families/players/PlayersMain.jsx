"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Users2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import {
  usePlayers,
  useCreatePlayer,
  useUpdatePlayer,
  useDeletePlayer,
} from "@/hooks/usePlayer";
import { PlayerForm } from "./PlayersForm";
import { PlayerTable } from "./PlayersTable";
import { withPermission } from "@/components/auth/WithPerission";
import { Can } from "@/components/providers/AbilityContext";

const PlayersMain = () => {
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
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
    setCreateSheetOpen(false);
    refresh();
  };

  const handleEdit = (player) => {
    setSelectedPlayer(player);
    setEditSheetOpen(true);
  };

  const handleUpdate = async (data) => {
    await updatePlayer(selectedPlayer.id, data);
    setEditSheetOpen(false);
    setSelectedPlayer(null);
    refresh();
  };

  const handleDelete = async (id, name) => {
    await deletePlayer(id, name);
    refresh();
  };

  const handleSheetClose = (isOpen, sheetType) => {
    if (sheetType === "create") {
      setCreateSheetOpen(isOpen);
    } else {
      setEditSheetOpen(isOpen);
      if (!isOpen) setSelectedPlayer(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-orange-500">
            Players ({players.length})
          </h1>
          <p className="text-muted-foreground">
            Manage tournament players and their information
          </p>
        </div>
        <Button
          onClick={() => setCreateSheetOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Player
        </Button>
      </div>

      {/* Content */}
      {
        <PlayerTable
          players={players}
          pagination={pagination}
          filters={filters}
          onFilterChange={updateFilters}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      }

      {/* Create Sheet */}
      <Sheet
        open={createSheetOpen}
        onOpenChange={(isOpen) => handleSheetClose(isOpen, "create")}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="text-slate-800">Add New Player</SheetTitle>
            <SheetDescription className="text-slate-600">
              Fill in the player details below
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <PlayerForm
              onSubmit={handleCreate}
              onCancel={() => setCreateSheetOpen(false)}
              loading={creating}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet
        open={editSheetOpen}
        onOpenChange={(isOpen) => handleSheetClose(isOpen, "edit")}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="text-slate-800">Edit Player</SheetTitle>
            <SheetDescription className="text-slate-600">
              Update the player details below
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <PlayerForm
              onSubmit={handleUpdate}
              onCancel={() => {
                setEditSheetOpen(false);
                setSelectedPlayer(null);
              }}
              loading={updating}
              initialData={selectedPlayer}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default withPermission("view", "PlayerManagement")(PlayersMain);
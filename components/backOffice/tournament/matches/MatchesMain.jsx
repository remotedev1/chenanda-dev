"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Swords } from "lucide-react";
import {
  useMatches,
  useCreateMatch,
  useUpdateMatch,
  useDeleteMatch,
} from "@/hooks/useMatch";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { MatchTable } from "./MatchesTable";
import { MatchForm } from "./MatchesForm";
import { LiveMatchControl } from "./LiveMatchControl";

const MatchesMain = ({ games = [] }) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [liveSheetOpen, setLiveSheetOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [liveMatchId, setLiveMatchId] = useState(null);
  const { tournamentId } = useParams();

  const {
    matches,
    setPage,
    pagination,
    loading,
    filters,
    updateFilters,
    refresh,
  } = useMatches({ tournamentId });
  const { createMatch, creating } = useCreateMatch({ tournamentId });
  const { updateMatch, updating } = useUpdateMatch({ tournamentId });
  const { deleteMatch } = useDeleteMatch();

  useEffect(() => {
    if (!createDialogOpen && !editDialogOpen && !liveSheetOpen) {
      document.body.style.pointerEvents = "";
    }
  }, [createDialogOpen, editDialogOpen, liveSheetOpen]);

  const handleCreate = async (data) => {
    await createMatch(data);
    setCreateDialogOpen(false);
    refresh();
  };

  const handleEdit = (match) => {
    setSelectedMatch(match);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (data) => {
    await updateMatch(selectedMatch.id, data);
    setEditDialogOpen(false);
    setSelectedMatch(null);
    refresh();
  };

  const handleDelete = async (id, name) => {
    await deleteMatch(id, name);
    refresh();
  };

  const handleLiveControl = (match) => {
    setLiveMatchId(match.id);
    setLiveSheetOpen(true);
  };

  const handleMatchUpdate = () => {
    refresh();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
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
            Matches
          </h1>
          <p className="text-muted-foreground">
            Schedule, manage, and control live matches for this tournament
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Schedule Match
        </Button>
      </div>

      <MatchTable
        matches={matches}
        pagination={pagination}
        filters={filters}
        onFilterChange={updateFilters}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLiveControl={handleLiveControl}
      />

      {/* Create Sheet */}
      <Sheet open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto bg-white"
        >
          <SheetHeader>
            <SheetTitle className="text-slate-800">
              Schedule New Match
            </SheetTitle>
            <SheetDescription className="text-slate-600">
              Fill in the match details below
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <MatchForm
              onSubmit={handleCreate}
              onCancel={() => setCreateDialogOpen(false)}
              loading={creating}
              tournamentId={tournamentId}
              games={games}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedMatch(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto bg-white"
        >
          <SheetHeader>
            <SheetTitle className="text-slate-800">Edit Match</SheetTitle>
            <SheetDescription className="text-slate-600">
              Update the match details below
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <MatchForm
              onSubmit={handleUpdate}
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedMatch(null);
              }}
              loading={updating}
              initialData={selectedMatch}
              tournamentId={tournamentId}
              games={games}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Live Control Sheet — slides in from right, stays open while managing */}
      <Sheet open={liveSheetOpen} onOpenChange={setLiveSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 overflow-y-auto "
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Live Match Control</SheetTitle>
          </SheetHeader>
          {liveMatchId && (
            <LiveMatchControl
              matchId={liveMatchId}
              tournamentId={tournamentId}
              onClose={() => setLiveSheetOpen(false)}
              onMatchUpdate={handleMatchUpdate}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MatchesMain;

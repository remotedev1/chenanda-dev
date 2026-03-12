"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trophy } from "lucide-react";
import { TournamentTable } from "./TournamentTable";
import { TournamentForm } from "./TournamentForm";
import { EmptyState } from "@/components/common/EmptyState";
import { TournamentTableSkeleton } from "./TournamentSkeleton";
import {
  useTournaments,
  useCreateTournament,
  useDeleteTournament,
} from "@/hooks/useTournament";
import { withPermission } from "@/components/auth/WithPerission";

const TournamentsPage = () => {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    tournaments,
    pagination,
    loading,
    filters,
    updateFilters,
    setPage,
    refresh,
  } = useTournaments();

  const { createTournament, creating } = useCreateTournament();
  const { deleteTournament } = useDeleteTournament();

  const handleCreate = async (data) => {
    try {
      const newTournament = await createTournament(data);
      setCreateDialogOpen(false);
      refresh();
      router.push(`/dashboard/tournaments/${newTournament.id}`);
    } catch (error) {
      console.error("Failed to create tournament:", error);
    }
  };

  const handleDelete = async (id, name) => {
    await deleteTournament(id, name);
    refresh();
  };

  // ✅ No early return — header and layout stay mounted always
  const isFirstLoad =
    loading && tournaments.length === 0 && !filters.search && !filters.status;

  return (
    <div className="space-y-6">
      {/* Header — always visible, never unmounts */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-orange-500">
            Tournaments
          </h1>
          <p className="text-muted-foreground">
            Manage and organize your tournaments
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Tournament
        </Button>
      </div>

      {/* Content */}
      {isFirstLoad ? (
        // ✅ Only show full skeleton on true first load (empty page, no filters)
        <TournamentTableSkeleton />
      ) : tournaments.length === 0 &&
        !filters.search &&
        !filters.status &&
        !loading ? (
        // ✅ Empty state only when genuinely no data exists
        <EmptyState
          icon={Trophy}
          title="No tournaments yet"
          description="Create your first tournament to get started with organizing sports events"
          actionLabel="Create Tournament"
          onAction={() => setCreateDialogOpen(true)}
          showAction={true}
        />
      ) : (
        // ✅ Table stays mounted — handles its own loading/skeleton/empty states
          <TournamentTable
            tournaments={tournaments}
            pagination={pagination}
            filters={filters}
            onFilterChange={updateFilters}
            onPageChange={setPage}
            onDelete={handleDelete}
            loading={loading}
          />
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Create New Tournament</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new tournament
            </DialogDescription>
          </DialogHeader>
          <TournamentForm
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            loading={creating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withPermission("view", "TournamentManagement")(TournamentsPage);

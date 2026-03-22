"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

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
      setCreateSheetOpen(false);
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

  const isFirstLoad =
    loading && tournaments.length === 0 && !filters.search && !filters.status;

  return (
    <div className="space-y-6">
      {/* Header */}
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
          onClick={() => setCreateSheetOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Tournament
        </Button>
      </div>

      {/* Content */}
      {isFirstLoad ? (
        <TournamentTableSkeleton />
      ) : tournaments.length === 0 &&
        !filters.search &&
        !filters.status &&
        !loading ? (
        <EmptyState
          icon={Trophy}
          title="No tournaments yet"
          description="Create your first tournament to get started with organizing sports events"
          actionLabel="Create Tournament"
          onAction={() => setCreateSheetOpen(true)}
          showAction={true}
        />
      ) : (
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

      <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle>Create New Tournament</SheetTitle>
            <SheetDescription>
              Fill in the details to create a new tournament
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <TournamentForm
              onSubmit={handleCreate}
              onCancel={() => setCreateSheetOpen(false)}
              loading={creating}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default withPermission("view", "TournamentManagement")(TournamentsPage);
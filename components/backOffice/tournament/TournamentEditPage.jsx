"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TournamentDetailSkeleton } from "./TournamentSkeleton";
import TournamentForm  from "./TournamentForm";
import { useTournament, useUpdateTournament } from "@/hooks/useTournament";

export default function TournamentEditPage({ params }) {
  const router = useRouter();
  const { id } = useParams();

  // Fetch tournament
  const { tournament, loading } = useTournament(id);

  // Update mutation
  const { updateTournament, updating } = useUpdateTournament();

  const handleUpdate = async (data) => {
    try {
      await updateTournament(tournament.id, data);
      router.push(`/dashboard/tournaments/${tournament.id}`);
    } catch (error) {
      console.error("Failed to update tournament:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Tournament
            </h1>
            <p className="text-muted-foreground">Update tournament details</p>
          </div>
        </div>
        <TournamentDetailSkeleton />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-2">Tournament Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The tournament you&apos;re trying to edit doesn&apos;t exist
        </p>
        <Button onClick={() => router.push("/dashboard/tournaments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tournaments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/tournaments/${tournament.id}`)}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tournament
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Tournament</h1>
        <p className="text-muted-foreground">
          Update the details for {tournament.name}
        </p>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <TournamentForm
          tournament={tournament}
          onSubmit={handleUpdate}
          onCancel={() =>
            router.push(`/dashboard/tournaments/${tournament.id}`)
          }
          loading={updating}
        />
      </div>
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TournamentDetailSkeleton } from "./TournamentSkeleton";
import { TournamentForm } from "./TournamentForm";
import { useTournament, useUpdateTournament } from "@/hooks/useTournament";
import { Can } from "@/components/providers/AbilityContext";

export default function TournamentEditPage() {
  const router = useRouter();
  const { tournamentId } = useParams();

  const { tournament, loading } = useTournament(tournamentId);
  const { updateTournament, updating } = useUpdateTournament();

  const backToTournament = () =>
    router.push(`/dashboard/tournaments/${tournamentId}`);
  const handleUpdate = async (data) => {
    try {
      await updateTournament(tournamentId, data);
      backToTournament();
    } catch {
      // errors handled inside useUpdateTournament via toast
    }
  };

  if (loading) return <TournamentDetailSkeleton />;

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-bold mb-2">Tournament Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The tournament you&apos;re trying to edit doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push("/dashboard/tournaments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tournaments
        </Button>
      </div>
    );
  }

  return (
    <Can I="edit" a="TournamentManagement" showFallback>
      <div className="space-y-6 max-w-3xl">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={backToTournament}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournament
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Tournament</h1>
        </div>

        <TournamentForm
          tournament={tournament}
          onSubmit={handleUpdate}
          onCancel={backToTournament}
          loading={updating}
        />
      </div>
    </Can>
  );
}

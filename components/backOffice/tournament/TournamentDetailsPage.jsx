"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Trophy,
  Calendar,
  MapPin,
  Info,
  Medal,
} from "lucide-react";
import { TournamentStats } from "./TournamentStats";
import { TournamentTimeline } from "./TournamentTimeline";
import { TournamentStatusBadge } from "./TournamentStatusBadge";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { TournamentDetailSkeleton } from "./TournamentSkeleton";
import { formatDate, formatDateTime } from "@/utils/tournament.utils";
import { useTournament, useDeleteTournament } from "@/hooks/useTournament";
import { Can } from "@/hooks/useAbility";
import { ACTIONS, RESOURCES } from "@/lib/ability";

export default function TournamentDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [deleteDialog, setDeleteDialog] = useState(false);

  // Fetch tournament with all relations
  const { tournament, loading, refresh } = useTournament(params.id, {
    includeParticipation: true,
    includeMatches: true,
    includePlacements: true,
  });

  const { deleteTournament, deleting } = useDeleteTournament();

  const handleDelete = async () => {
    try {
      await deleteTournament(tournament.id, tournament.name);
      setDeleteDialog(false);
      router.push("/dashboard/tournaments");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (loading) {
    return <TournamentDetailSkeleton />;
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Tournament Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The tournament you&apos;re looking for doesn&apos;t exist
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
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/tournaments")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournaments
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-orange-600 capitalize">
              {tournament.name}
            </h1>
            <TournamentStatusBadge status={tournament.status} />
          </div>
          <p className="text-muted-foreground">
            {tournament.year} • {formatDate(tournament.startDate)} -{" "}
            {formatDate(tournament.endDate)}
          </p>
        </div>

        <div className="flex gap-2">
          <Can I={ACTIONS.MANAGE} a="all">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/tournaments/${tournament.id}/edit`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Can>
          <Can I={ACTIONS.DELETE} a={RESOURCES.TOURNAMENT}>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 dark:text-red-400"
              onClick={() => setDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <TournamentStats tournament={tournament} />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3 ">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6 ">
          <Tabs defaultValue="overview" className="w-full ">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="overview"  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="participants"  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Participants
                <Badge variant="secondary" className="ml-2">
                  {tournament._count?.participation || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="matches"  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Matches
                <Badge variant="secondary" className="ml-2">
                  {tournament._count?.matches || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="placements"  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg">
                Placements
                <Badge variant="secondary" className="ml-2">
                  {tournament._count?.placements || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4  rounded-lg">
              <Card className="bg-slate-50 dark:bg-slate-800 text-blue-500 dark:text-blue-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Tournament Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tournament.description && (
                    <div>
                      <h4 className="text-sm  font-medium mb-2 dark:text-blue-600">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {tournament.description}
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm  font-medium mb-2 dark:text-blue-600">Start Date</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(tournament.startDate)}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm  font-medium mb-2 dark:text-blue-600">End Date</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(tournament.endDate)}
                      </div>
                    </div>

                    {/* {tournament.registrationDeadline && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Registration Deadline
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDateTime(tournament.registrationDeadline)}
                        </div>
                      </div>
                    )} */}
                  </div>

                  {/* {tournament.sponsors && tournament.sponsors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Sponsors</h4>
                      <div className="flex flex-wrap gap-2">
                        {tournament.sponsors.map((sponsor, i) => (
                          <Badge key={i} variant="secondary">
                            {sponsor.name || sponsor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )} */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants">
              <Card className="bg-slate-50 dark:bg-slate-800 text-blue-500 dark:text-blue-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Registered Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tournament.participation &&
                  tournament.participation.length > 0 ? (
                    <div className="space-y-2">
                      {tournament.participation.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {p.family?.familyName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {p.family?.shortName}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">Registered</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-red-600">
                      No participants yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches">
              <Card className="bg-slate-50 dark:bg-slate-800 text-blue-500 dark:text-blue-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Tournament Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground text-red-600">
                    Matches management coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="placements">
              <Card className="bg-slate-50 dark:bg-slate-800 text-blue-500 dark:text-blue-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="h-5 w-5" />
                    Final Standings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground text-red-600">
                    Placements will appear here when the tournament is completed
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Timeline */}
        <div className="space-y-6">
          <TournamentTimeline tournament={tournament} />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-2">
              <Can I="manage" a="Games">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(`/dashboard/tournaments/sponsors`)
                  }
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Sponsors
                </Button>
              </Can>
              <Can I="manage" a="Games">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(`/dashboard/tournaments/${tournament.id}/games`)
                  }
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Games
                </Button>
              </Can>
              <Can I="manage" a="Participation">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(
                      `/dashboard/tournaments/${tournament.id}/participants`,
                    )
                  }
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Participants
                </Button>
              </Can>
              <Can I="manage" a="Match">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(
                      `/dashboard/tournaments/${tournament.id}/matches`,
                    )
                  }
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Manage Matches
                </Button>
              </Can>
              <Can I="manage" a="Placement">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(
                      `/dashboard/tournaments/${tournament.id}/placements`,
                    )
                  }
                >
                  <Medal className="mr-2 h-4 w-4" />
                  Manage Placements
                </Button>
              </Can>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Tournament"
        description="This will permanently delete the tournament. If the tournament has participants or matches, it will be marked as cancelled instead."
        itemName={tournament.name}
        loading={deleting}
      />
    </div>
  );
}

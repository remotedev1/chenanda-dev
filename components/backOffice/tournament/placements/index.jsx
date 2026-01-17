"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Medal, Trophy, Award, Download, Plus } from "lucide-react";
import { Placements, placementConfig } from "@/schemas/placements.schema";
import { sportConfig } from "@/schemas/participants.schema";
import { EmptyState } from "@/components/common/EmptyState";
import { useTournament } from "@/hooks/useTournament";
import { Can } from "@/hooks/useAbility";
import { cn } from "@/utils/tournament.utils";
import { toast } from "sonner";

export default function PlacementsPage({ params }) {
  const router = useRouter();
  const { id } = useParams();
  const [selectedSport, setSelectedSport] = useState("all");

  // Fetch tournament with placements
  const { tournament, loading, refresh } = useTournament(id, {
    includePlacements: true,
  });

  const handleAddPlacement = () => {
    toast.info("Add placement feature coming soon");
  };

  const handleExportCertificates = () => {
    toast.info("Export certificates feature coming soon");
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!tournament) {
    return <div className="p-6">Tournament not found</div>;
  }

  const placements = tournament.placements || [];

  // Filter placements by sport
  const filteredPlacements =
    selectedSport === "all"
      ? placements
      : placements.filter((p) => p.sport === selectedSport);

  // Get unique sports
  const sports = [...new Set(placements.map((p) => p.sport))];

  // Group placements by sport
  const placementsBySport = sports.reduce((acc, sport) => {
    acc[sport] = placements.filter((p) => p.sport === sport);
    return acc;
  }, {});

  // Get podium (top 3) for each sport
  const getPodium = (sport) => {
    const sportPlacements = placementsBySport[sport] || [];
    return [
      sportPlacements.find((p) => p.placement === Placements.FIRST),
      sportPlacements.find((p) => p.placement === Placements.SECOND),
      sportPlacements.find((p) => p.placement === Placements.THIRD),
    ].filter(Boolean);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">
            Winners & Placements
          </h1>
          <p className="text-muted-foreground">
            {tournament.name} - Tournament results and standings
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCertificates}>
            <Download className="mr-2 h-4 w-4" />
            Export Certificates
          </Button>
          <Can I="manage" a="Placement">
            <Button onClick={handleAddPlacement}>
              <Plus className="mr-2 h-4 w-4" />
              Add Placement
            </Button>
          </Can>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sports</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gold Medals</CardTitle>
            <span className="text-2xl">🥇</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                placements.filter((p) => p.placement === Placements.FIRST)
                  .length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Silver Medals</CardTitle>
            <span className="text-2xl">🥈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                placements.filter((p) => p.placement === Placements.SECOND)
                  .length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bronze Medals</CardTitle>
            <span className="text-2xl">🥉</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                placements.filter((p) => p.placement === Placements.THIRD)
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sport Filter */}
      {sports.length > 1 && (
        <div className="flex gap-2">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {sports.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sportConfig[sport]?.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Placements Display */}
      {filteredPlacements.length === 0 ? (
        <EmptyState
          icon={Medal}
          title="No placements yet"
          description="Placements will appear here when matches are completed and winners are declared"
          actionLabel="Add Placement"
          onAction={handleAddPlacement}
          showAction={true}
        />
      ) : (
        <Tabs defaultValue="podium" className="w-full">
          <TabsList>
            <TabsTrigger value="podium">Podium View</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="sport">By Sport</TabsTrigger>
          </TabsList>

          {/* Podium View */}
          <TabsContent value="podium" className="space-y-6">
            {sports.map((sport) => {
              const podium = getPodium(sport);
              if (podium.length === 0) return null;

              return (
                <Card key={sport}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(sportConfig[sport]?.color)}>
                        {sportConfig[sport]?.icon} {sportConfig[sport]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-center gap-4 py-8">
                      {/* Second Place */}
                      {podium[1] && (
                        <div className="flex flex-col items-center">
                          <div className="text-6xl mb-2">🥈</div>
                          <div
                            className={cn(
                              "w-32 h-32 rounded-lg flex flex-col items-center justify-center",
                              placementConfig[Placements.SECOND].color
                            )}
                          >
                            <div className="text-center">
                              <p className="font-bold text-lg">
                                {podium[1].family?.familyName}
                              </p>
                              <p className="text-sm opacity-75">2nd Place</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* First Place */}
                      {podium[0] && (
                        <div className="flex flex-col items-center -mt-8">
                          <div className="text-7xl mb-2">🥇</div>
                          <div
                            className={cn(
                              "w-40 h-40 rounded-lg flex flex-col items-center justify-center",
                              placementConfig[Placements.FIRST].color
                            )}
                          >
                            <div className="text-center">
                              <Trophy className="h-6 w-6 mx-auto mb-2" />
                              <p className="font-bold text-xl">
                                {podium[0].family?.familyName}
                              </p>
                              <p className="text-sm opacity-75">Champion</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Third Place */}
                      {podium[2] && (
                        <div className="flex flex-col items-center">
                          <div className="text-6xl mb-2">🥉</div>
                          <div
                            className={cn(
                              "w-32 h-32 rounded-lg flex flex-col items-center justify-center",
                              placementConfig[Placements.THIRD].color
                            )}
                          >
                            <div className="text-center">
                              <p className="font-bold text-lg">
                                {podium[2].family?.familyName}
                              </p>
                              <p className="text-sm opacity-75">3rd Place</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Leaderboard View */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Overall Standings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredPlacements
                    .sort((a, b) => {
                      const order = Object.values(Placements);
                      return (
                        order.indexOf(a.placement) - order.indexOf(b.placement)
                      );
                    })
                    .map((placement, index) => {
                      const config = placementConfig[placement.placement];
                      return (
                        <div
                          key={placement.id}
                          className="flex items-center gap-4 p-4 rounded-lg border"
                        >
                          <div className="text-3xl">{config.medal}</div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {placement.family?.familyName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {sportConfig[placement.sport]?.label}
                            </div>
                          </div>
                          <Badge className={cn(config.color)}>
                            {config.label}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Sport View */}
          <TabsContent value="sport" className="space-y-4">
            {sports.map((sport) => {
              const sportPlacements = placementsBySport[sport] || [];
              return (
                <Card key={sport}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(sportConfig[sport]?.color)}>
                        {sportConfig[sport]?.icon} {sportConfig[sport]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {sportPlacements
                        .sort((a, b) => {
                          const order = Object.values(Placements);
                          return (
                            order.indexOf(a.placement) -
                            order.indexOf(b.placement)
                          );
                        })
                        .map((placement) => {
                          const config = placementConfig[placement.placement];
                          return (
                            <div
                              key={placement.id}
                              className="flex items-center justify-between p-3 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{config.medal}</span>
                                <div>
                                  <p className="font-medium">
                                    {placement.family?.familyName}
                                  </p>
                                  {placement.family?.shortName && (
                                    <p className="text-sm text-muted-foreground">
                                      {placement.family.shortName}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Badge className={cn(config.color)}>
                                {config.shortLabel}
                              </Badge>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

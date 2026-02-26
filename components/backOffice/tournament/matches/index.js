"use client";

import { use, useState } from "react";
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
import {
  ArrowLeft,
  Plus,
  Calendar,
  PlayCircle,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";
import {
  MatchStatus,
  Round,
  matchStatusConfig,
  roundConfig,
  venueConfig,
} from "@/schemas/matches.schema";
import { sportConfig } from "@/schemas/participants.schema";
import { EmptyState } from "@/components/common/EmptyState";
import { useTournament } from "@/hooks/useTournament";
import { Can } from "@/hooks/useAbility";
import { cn, formatDateTime, formatDate } from "@/utils/tournament.utils";
import { toast } from "sonner";

export default function MatchesPage() {
  const router = useRouter();
  const {id} = useParams();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRound, setFilterRound] = useState("all");
  const [selectedSport, setSelectedSport] = useState("all");

  // Fetch tournament with matches
  const { tournament, loading, refresh } = useTournament(id, {
    includeMatches: true,
  });

  const handleCreateMatch = () => {
    toast.info("Create match feature coming soon");
  };

  const handleGenerateFixtures = () => {
    toast.info("Auto-generate fixtures feature coming soon");
  };

  const handleMatchClick = (matchId) => {
    router.push(`/dashboard/tournaments/${id}/matches/${matchId}`);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!tournament) {
    return <div className="p-6">Tournament not found</div>;
  }

  const matches = tournament.matches || [];

  // Filter matches
  const filteredMatches = matches.filter((m) => {
    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    const matchesRound = filterRound === "all" || m.round === filterRound;
    const matchesSport = selectedSport === "all" || m.sport === selectedSport;
    return matchesStatus && matchesRound && matchesSport;
  });

  // Get match stats
  const stats = {
    total: matches.length,
    scheduled: matches.filter((m) => m.status === MatchStatus.SCHEDULED).length,
    live: matches.filter((m) => m.status === MatchStatus.LIVE).length,
    completed: matches.filter((m) => m.status === MatchStatus.COMPLETED).length,
  };

  // Get unique sports
  const sports = [...new Set(matches.map((m) => m.sport))];

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
          <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
          <p className="text-muted-foreground">
            {tournament.name} - Schedule and manage matches
          </p>
        </div>

        <Can I="manage" a="Match">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateFixtures}>
              <Calendar className="mr-2 h-4 w-4" />
              Generate Fixtures
            </Button>
            <Button onClick={handleCreateMatch}>
              <Plus className="mr-2 h-4 w-4" />
              Create Match
            </Button>
          </div>
        </Can>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Live Now</CardTitle>
            <PlayCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.live}</div>
            {stats.live > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">
                  In Progress
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(MatchStatus).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {matchStatusConfig[value]?.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRound} onValueChange={setFilterRound}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Rounds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rounds</SelectItem>
            {Object.entries(Round).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {roundConfig[value]?.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {sports.length > 1 && (
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-[180px]">
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
        )}
      </div>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No matches found"
          description="Create matches or generate fixtures automatically"
          actionLabel="Create Match"
          onAction={handleCreateMatch}
          showAction={true}
        />
      ) : (
        <Tabs defaultValue="grid" className="w-full">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="schedule">Schedule View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMatches.map((match) => {
                const statusConfig = matchStatusConfig[match.status];
                return (
                  <Card
                    key={match.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleMatchClick(match.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Match #{match.matchNo}
                            </Badge>
                            {match.sport && (
                              <Badge
                                variant="secondary"
                                className={cn("text-xs", sportConfig[match.sport]?.color)}
                              >
                                {sportConfig[match.sport]?.icon}{" "}
                                {sportConfig[match.sport]?.label}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base">
                            {match.name || `${roundConfig[match.round]?.label}`}
                          </CardTitle>
                        </div>
                        <Badge className={cn(statusConfig?.color)}>
                          {statusConfig?.pulse && (
                            <span className="flex h-2 w-2 mr-1">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                          )}
                          {statusConfig?.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Venue & Time */}
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {venueConfig[match.venue]?.label}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDateTime(match.scheduledOn)}
                        </div>
                      </div>

                      {/* Teams */}
                      {match.participants && match.participants.length === 2 && (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {match.participants[0].familyName || "Team 1"}
                            </span>
                            {match.participants[0].score !== undefined && (
                              <span className="font-bold">
                                {match.participants[0].score}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {match.participants[1].familyName || "Team 2"}
                            </span>
                            {match.participants[1].score !== undefined && (
                              <span className="font-bold">
                                {match.participants[1].score}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Winner */}
                      {match.status === MatchStatus.COMPLETED && match.winnerName && (
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 pt-2 border-t">
                          <CheckCircle className="h-4 w-4" />
                          Winner: {match.winnerName}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Match Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMatches
                    .sort((a, b) => new Date(a.scheduledOn) - new Date(b.scheduledOn))
                    .map((match) => {
                      const statusConfig = matchStatusConfig[match.status];
                      return (
                        <div
                          key={match.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleMatchClick(match.id)}
                        >
                          <div className="flex flex-col items-center min-w-[80px]">
                            <div className="text-sm font-medium">
                              {formatDate(match.scheduledOn, { month: "short", day: "numeric" })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(match.scheduledOn).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                Match #{match.matchNo}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {roundConfig[match.round]?.shortLabel}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {venueConfig[match.venue]?.label}
                            </div>
                          </div>
                          <Badge className={cn(statusConfig?.color)}>
                            {statusConfig?.label}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Plus,
  Users,
  Search,
  Trash2,
  Download,
  Upload,
} from "lucide-react";
import {
  sportConfig,
  poolConfig,
  SportType,
  Pool,
} from "@/schemas/participants.schema";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useTournament } from "@/hooks/useTournament";
import { cn } from "@/utils/tournament.utils";
import { toast } from "sonner";

export default function ParticipantsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSport, setFilterSport] = useState("all");
  const [filterPool, setFilterPool] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    participant: null,
  });

  // Fetch tournament with participants
  const { tournament, loading, refresh } = useTournament(id, {
    includeParticipation: true,
  });

  const handleAddParticipant = () => {
    setAddDialogOpen(true);
  };

  const handleRemoveParticipant = async () => {
    if (!deleteDialog.participant) return;

    try {
      // API call would go here
      toast.success("Participant removed successfully");
      setDeleteDialog({ open: false, participant: null });
      refresh();
    } catch (error) {
      toast.error("Failed to remove participant");
    }
  };

  const handleExport = () => {
    toast.info("Exporting participants list...");
  };

  const handleImport = () => {
    toast.info("Import feature coming soon");
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!tournament) {
    return <div className="p-6">Tournament not found</div>;
  }

  const participants = tournament.participation || [];

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.family?.familyName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSport =
      filterSport === "all" || p.sports?.includes(filterSport);
    const matchesPool = filterPool === "all" || p.pool === filterPool;
    return matchesSearch && matchesSport && matchesPool;
  });

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
          <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
          <p className="text-muted-foreground">
            {tournament.name} - Manage registered families
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
            <Button variant="outline" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button onClick={handleAddParticipant}>
              <Plus className="mr-2 h-4 w-4" />
              Add Family
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Families
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length}</div>
          </CardContent>
        </Card>

        {Object.entries(Pool)
          .slice(0, 3)
          .map(([key, value]) => {
            const count = participants.filter((p) => p.pool === value).length;
            const config = poolConfig[value];
            return (
              <Card key={value}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {config.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search families..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterSport} onValueChange={setFilterSport}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {Object.entries(SportType).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {sportConfig[value]?.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPool} onValueChange={setFilterPool}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Pools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pools</SelectItem>
              {Object.entries(Pool).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  Pool {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Participants List */}
      {filteredParticipants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No participants found"
          description="Add families to participate in this tournament"
          actionLabel="Add Family"
          onAction={handleAddParticipant}
          showAction={true}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredParticipants.map((participant) => (
            <Card
              key={participant.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">
                      {participant.family?.familyName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {participant.family?.shortName}
                    </p>
                  </div>
                  {participant.pool && (
                    <Badge
                      className={cn(
                        "ml-2",
                        poolConfig[participant.pool]?.color
                      )}
                    >
                      Pool {participant.pool}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Sports */}
                {participant.sports && participant.sports.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Sports</p>
                    <div className="flex flex-wrap gap-1">
                      {participant.sports.map((sport) => {
                        const config = sportConfig[sport];
                        return (
                          <Badge
                            key={sport}
                            variant="secondary"
                            className={cn("text-xs", config?.color)}
                          >
                            <span className="mr-1">{config?.icon}</span>
                            {config?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        toast.info("Edit feature coming soon");
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() =>
                        setDeleteDialog({ open: true, participant })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Participant Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Family to Tournament</DialogTitle>
            <DialogDescription>
              Register a family to participate in this tournament
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            Add participant form will be implemented here
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, participant: null })}
        onConfirm={handleRemoveParticipant}
        title="Remove Participant"
        description="Are you sure you want to remove this family from the tournament?"
        itemName={deleteDialog.participant?.family?.familyName}
      />
    </div>
  );
}

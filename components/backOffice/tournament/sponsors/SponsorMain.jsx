"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Plus, DollarSign } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import {
  useSponsors,
  useCreateSponsor,
  useUpdateSponsor,
  useDeleteSponsor,
} from "@/hooks/useSponsor";
import { Skeleton } from "@/components/ui/skeleton";
import { SponsorForm } from "./SponsorForm";
import { SponsorTable } from "./SponsorTable";
import { withPermission } from "@/components/auth/WithPerission";
import { Can } from "@/components/providers/AbilityContext";

const SponsorsMain = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);

  const {
    sponsors,
    setPage,
    pagination,
    loading,
    filters,
    updateFilters,
    refresh,
  } = useSponsors();
  const { createSponsor, creating } = useCreateSponsor();
  const { updateSponsor, updating } = useUpdateSponsor();
  const { deleteSponsor } = useDeleteSponsor();

  const handleCreate = async (data) => {
    await createSponsor(data);
    setCreateDialogOpen(false);
    refresh();
  };

  const handleEdit = (sponsor) => {
    setSelectedSponsor(sponsor);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (data) => {
    await updateSponsor(selectedSponsor.id, data);
    setEditDialogOpen(false);
    setSelectedSponsor(null);
    refresh();
  };

  const handleDelete = async (id, name) => {
    await deleteSponsor(id, name);
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
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
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
            Sponsors
          </h1>
          <p className="text-muted-foreground">
            Manage your tournament sponsors
          </p>
        </div>
        <Can I="create" a="Sponsor">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Sponsor
          </Button>
        </Can>
      </div>

      {/* Content */}
      {sponsors.length === 0 && !filters.search ? (
        <EmptyState
          icon={DollarSign}
          title="No sponsors yet"
          description="Start adding sponsors to support your tournaments"
          actionLabel="Add Sponsor"
          onAction={() => setCreateDialogOpen(true)}
          showAction={true}
        />
      ) : (
        <SponsorTable
          sponsors={sponsors}
          pagination={pagination}
          filters={filters}
          onFilterChange={updateFilters}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800 ">
              Add New Sponsor
            </DialogTitle>
            <DialogDescription className="text-slate-600 ml-0">
              Fill in the sponsor details below
            </DialogDescription>
          </DialogHeader>
          <SponsorForm
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            loading={creating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto  p-6 rounded-lg text-slate-600 dark:text-slate-300">
          <DialogHeader>
            <DialogTitle className="text-slate-800 ">Edit Sponsor</DialogTitle>
            <DialogDescription className="text-slate-600 ">
              Update the sponsor details below
            </DialogDescription>
          </DialogHeader>
          <SponsorForm
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditDialogOpen(false);
              setSelectedSponsor(null);
            }}
            loading={updating}
            initialData={selectedSponsor}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withPermission("view", "SponsorManagement")(SponsorsMain);

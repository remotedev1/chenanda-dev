"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Plus, DollarSign } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import {
  useSponsors,
  useCreateSponsor,
  useUpdateSponsor,
  useDeleteSponsor,
} from "@/hooks/useSponsor";
import { SponsorForm } from "./SponsorForm";
import { SponsorTable } from "./SponsorTable";
import { withPermission } from "@/components/auth/WithPerission";
import { Can } from "@/components/providers/AbilityContext";

const SponsorsMain = () => {
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
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
    setCreateSheetOpen(false);
    refresh();
  };

  const handleEdit = (sponsor) => {
    setSelectedSponsor(sponsor);
    setEditSheetOpen(true);
  };

  const handleUpdate = async (data) => {
    await updateSponsor(selectedSponsor.id, data);
    setEditSheetOpen(false);
    setSelectedSponsor(null);
    refresh();
  };

  const handleDelete = async (id, name) => {
    console.log(id);
    await deleteSponsor(id, name);
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-orange-500">
            Sponsors ({sponsors.length})
          </h1>
          <p className="text-muted-foreground">
            Manage your tournament sponsors
          </p>
        </div>
        <Can I="create" a="Sponsor">
          <Button
            onClick={() => setCreateSheetOpen(true)}
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
          onAction={() => setCreateSheetOpen(true)}
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

      {/* Create Sheet */}
      <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="text-slate-800">Add New Sponsor</SheetTitle>
            <SheetDescription className="text-slate-600">
              Fill in the sponsor details below
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <SponsorForm
              onSubmit={handleCreate}
              onCancel={() => setCreateSheetOpen(false)}
              loading={creating}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet
        open={editSheetOpen}
        onOpenChange={(isOpen) => {
          setEditSheetOpen(isOpen);
          if (!isOpen) setSelectedSponsor(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="text-slate-800">Edit Sponsor</SheetTitle>
            <SheetDescription className="text-slate-600">
              Update the sponsor details below
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <SponsorForm
              onSubmit={handleUpdate}
              onCancel={() => {
                setEditSheetOpen(false);
                setSelectedSponsor(null);
              }}
              loading={updating}
              initialData={selectedSponsor}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default withPermission("view", "SponsorManagement")(SponsorsMain);

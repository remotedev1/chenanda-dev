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
import { Plus, Users } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import {
  useFamilies,
  useCreateFamily,
  useUpdateFamily,
  useDeleteFamily,
} from "@/hooks/useFamily";
import { Skeleton } from "@/components/ui/skeleton";
import { FamilyForm } from "./FamiliesForm";
import { FamilyTable } from "./FamiliesTable";
import { withPermission } from "@/components/auth/WithPerission";

const FamiliesMain = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);

  const {
    families,
    setPage,
    pagination,
    loading,
    filters,
    updateFilters,
    refresh,
  } = useFamilies();
  const { createFamily, creating } = useCreateFamily();
  const { updateFamily, updating } = useUpdateFamily();
  const { deleteFamily } = useDeleteFamily();
  const handleCreate = async (data) => {
    await createFamily(data);
    setCreateDialogOpen(false);
    refresh();
  };

  const handleEdit = (family) => {
    setSelectedFamily(family);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (data) => {
    await updateFamily(selectedFamily.id, data);
    setEditDialogOpen(false);
    setSelectedFamily(null);
    refresh();
  };

  const handleDelete = async (id, name) => {
    await deleteFamily(id, name);
    refresh();
  };

  const handleDialogClose = (isOpen, dialogType) => {
    if (dialogType === "create") {
      setCreateDialogOpen(isOpen);
    } else {
      setEditDialogOpen(isOpen);
      if (!isOpen) setSelectedFamily(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-orange-500">
            Families
          </h1>
          <p className="text-muted-foreground">
            Manage tournament families and their members
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Family
        </Button>
      </div>

      {/* Content */}
      {families.length === 0 && !filters.search ? (
        <EmptyState
          icon={Users}
          title="No families yet"
          description="Start adding families to organize your tournament participants"
          actionLabel="Add Family"
          onAction={() => setCreateDialogOpen(true)}
          showAction={true}
        />
      ) : (
        <FamilyTable
          families={families}
          pagination={pagination}
          filters={filters}
          onFilterChange={updateFilters}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(isOpen) => handleDialogClose(isOpen, "create")}
        model={false}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Add New Family</DialogTitle>
            <DialogDescription className="text-slate-600">
              Fill in the family details below
            </DialogDescription>
          </DialogHeader>
          <FamilyForm
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            loading={creating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(isOpen) => handleDialogClose(isOpen, "edit")}
        model={false}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Edit Family</DialogTitle>
            <DialogDescription className="text-slate-600">
              Update the family details below
            </DialogDescription>
          </DialogHeader>
          <FamilyForm
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditDialogOpen(false);
              setSelectedFamily(null);
            }}
            loading={updating}
            initialData={selectedFamily}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withPermission("view", "FamilyManagement")(FamiliesMain);

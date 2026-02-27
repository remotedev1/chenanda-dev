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
import { Can } from "@/hooks/useAbility";
import { Skeleton } from "@/components/ui/skeleton";
import { FamilyForm } from "./FamiliesForm";
import { FamilyTable } from "./FamiliesTable";

const FamiliesMain = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);

  const { families, setPage, pagination, loading, filters, updateFilters, refresh } = useFamilies();
  const { createFamily, creating } = useCreateFamily();
  const { updateFamily, updating } = useUpdateFamily();
  const { deleteFamily } = useDeleteFamily();
console.log(families)

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-[400px] w-full" />
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

export default FamiliesMain;
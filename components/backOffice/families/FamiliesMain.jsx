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
import { Badge, Plus, Users } from "lucide-react";
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
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
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
    setCreateSheetOpen(false);
    refresh();
  };

  const handleEdit = (family) => {
    setSelectedFamily(family);
    setEditSheetOpen(true);
  };

  const handleUpdate = async (id, data) => {
    await updateFamily(id, data);
    setEditSheetOpen(false);
    setSelectedFamily(null);
    refresh();
  };

  const handleDelete = async (id, name) => {
    await deleteFamily(id, name);
    refresh();
  };

  const handleSheetClose = (isOpen, sheetType) => {
    if (sheetType === "create") {
      setCreateSheetOpen(isOpen);
    } else {
      setEditSheetOpen(isOpen);
      if (!isOpen) setSelectedFamily(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-orange-500">
            Families ({families.length})
          </h1>
          <p className="text-muted-foreground">
            Manage tournament families and their members
          </p>
        </div>
        <Button
          onClick={() => setCreateSheetOpen(true)}
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
          onAction={() => setCreateSheetOpen(true)}
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

      {/* Create Sheet */}
      <Sheet
        open={createSheetOpen}
        onOpenChange={(isOpen) => handleSheetClose(isOpen, "create")}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="text-slate-800">Add New Family</SheetTitle>
            <SheetDescription className="text-slate-600">
              Fill in the family details below
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FamilyForm
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
        onOpenChange={(isOpen) => handleSheetClose(isOpen, "edit")}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="text-slate-800">Edit Family</SheetTitle>
            <SheetDescription className="text-slate-600">
              Update the family details below
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FamilyForm
              id={selectedFamily?.id}
              onSubmit={handleUpdate}
              onCancel={() => {
                setEditSheetOpen(false);
                setSelectedFamily(null);
              }}
              loading={updating}
              initialData={selectedFamily}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default withPermission("view", "FamilyManagement")(FamiliesMain);

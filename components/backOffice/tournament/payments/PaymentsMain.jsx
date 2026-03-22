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
import { Plus, Wallet } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { PaymentTable } from "./PaymentsTable";
import { PaymentForm } from "./PaymentsForm";
import {
  usePayments,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
} from "@/hooks/usePayment";
import { withPermission } from "@/components/auth/WithPerission";

const PaymentsMain = ({ tournaments = [], games = [] }) => {
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const {
    payments,
    setPage,
    pagination,
    loading,
    filters,
    updateFilters,
    refresh,
  } = usePayments();

  const { createPayment, creating } = useCreatePayment();
  const { updatePayment, updating } = useUpdatePayment();
  const { deletePayment } = useDeletePayment();

  const handleCreate = async (data) => {
    await createPayment(data);
    setCreateSheetOpen(false);
    refresh();
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setEditSheetOpen(true);
  };


  const handleUpdate = async (data) => {
    await updatePayment(selectedPayment.id, data);
    setEditSheetOpen(false);
    setSelectedPayment(null);
    refresh();
  };

  const handleDelete = async (id, name) => {
    await deletePayment(id, name);
    refresh();
  };

  const handleSheetClose = (isOpen, type) => {
    if (type === "create") {
      setCreateSheetOpen(isOpen);
    } else {
      setEditSheetOpen(isOpen);
      if (!isOpen) setSelectedPayment(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-600">
            Payments
          </h1>
          <p className="text-muted-foreground">
            Record and manage payment transactions for tournaments
          </p>
        </div>
        <Button
          onClick={() => setCreateSheetOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Content */}
      {payments.length === 0 && !filters.search ? (
        <EmptyState
          icon={Wallet}
          title="No payments recorded"
          description="Start recording payments for this tournament"
        />
      ) : (
        <PaymentTable
          payments={payments}
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
            <SheetTitle className="text-slate-800">
              Record New Payment
            </SheetTitle>
            <SheetDescription className="text-slate-600">
              Record a payment transaction for a family
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <PaymentForm
              onSubmit={handleCreate}
              onCancel={() => setCreateSheetOpen(false)}
              loading={creating}
              tournaments={tournaments}
              games={games}
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
            <SheetTitle className="text-slate-800">Edit Payment</SheetTitle>
            <SheetDescription className="text-slate-600">
              Update payment transaction details
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <PaymentForm
              onSubmit={handleUpdate}
              onCancel={() => {
                setEditSheetOpen(false);
                setSelectedPayment(null);
              }}
              loading={updating}
              initialData={selectedPayment}
              tournaments={tournaments}
              games={games}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default withPermission("view", "PaymentManagement")(PaymentsMain);

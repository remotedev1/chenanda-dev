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
import { Plus, Wallet } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { PaymentTable } from "./PaymentsTable";
import { PaymentForm } from "./PaymentsForm";
import {
  usePayments,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
} from "@/hooks/usePayment";

const PaymentsMain = ({ tournaments = [], games = [] }) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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
    setCreateDialogOpen(false);
    refresh();
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (data) => {
    await updatePayment(selectedPayment.id, data);
    setEditDialogOpen(false);
    setSelectedPayment(null);
    refresh();
  };

  const handleDelete = async (id, name) => {
    await deletePayment(id, name);
    refresh();
  };

  const handleDialogClose = (isOpen, type) => {
    if (type === "create") {
      setCreateDialogOpen(isOpen);
    } else {
      setEditDialogOpen(isOpen);
      if (!isOpen) setSelectedPayment(null);
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
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
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
          <h1 className="text-3xl font-bold tracking-tight text-emerald-600">
            Payments
          </h1>
          <p className="text-muted-foreground">
            Record and manage payment transactions for tournaments
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
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

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(isOpen) => handleDialogClose(isOpen, "create")}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              Record New Payment
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Record a payment transaction for a family
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            loading={creating}
            tournaments={tournaments}
            games={games}
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
            <DialogTitle className="text-slate-800">Edit Payment</DialogTitle>
            <DialogDescription className="text-slate-600">
              Update payment transaction details
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditDialogOpen(false);
              setSelectedPayment(null);
            }}
            loading={updating}
            initialData={selectedPayment}
            tournaments={tournaments}
            games={games}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsMain;

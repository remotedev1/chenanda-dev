"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  Calendar,
  Wallet,
  CreditCard,
  Users,
  Receipt,
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Can } from "@/components/providers/AbilityContext";

/* ---- Constants ---- */

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-100 text-red-800 border-red-300",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-gray-100 text-gray-700 border-gray-300",
  },
};

const PAYMENT_TYPE_CONFIG = {
  REGISTRATION: { label: "Registration", icon: "📝", color: "blue" },
  ENTRY: { label: "Entry Fee", icon: "🎫", color: "purple" },
  SPONSORSHIP: { label: "Sponsorship", icon: "🤝", color: "orange" },
  DONATION: { label: "Donation", icon: "❤️", color: "pink" },
  MERCHANDISE: { label: "Merchandise", icon: "🛍️", color: "indigo" },
  OTHER: { label: "Other", icon: "💰", color: "gray" },
};

const SPORT_ICONS = {
  FOOTBALL: "⚽",
  BASKETBALL: "🏀",
  VOLLEYBALL: "🏐",
  CRICKET: "🏏",
  TENNIS: "🎾",
  BADMINTON: "🏸",
  ATHLETICS: "🏃",
  FIELD_HOCKEY: "🏑",
  TABLE_TENNIS: "🏓",
  KABADDI: "🤼",
};

// Shimmer Card Component
function PaymentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="relative h-20 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-8 bg-gray-200 rounded-full animate-pulse w-8" />
        </div>
      </div>
    </div>
  );
}

// Payment Card Component
function PaymentCard({ payment, onEdit, onDelete }) {
  const statusConfig = STATUS_CONFIG[payment.status] || {
    label: payment.status,
    className: "",
  };
  const typeConfig = PAYMENT_TYPE_CONFIG[payment.paymentType] || {
    label: payment.paymentType || "N/A",
    icon: "💰",
    color: "gray",
  };
  const sportIcon = SPORT_ICONS[payment.sport] || "🏆";

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Header with gradient */}
      <div className="relative h-20 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={cn("bg-white/95 backdrop-blur-sm border", statusConfig.className)}
          >
            {statusConfig.label}
          </Badge>
        </div>

        {/* Payment Amount */}
        <div className="absolute bottom-3 left-4">
          <div className="text-white">
            <div className="text-2xl font-bold">
              {payment.currency} {payment.amount.toFixed(2)}
            </div>
            <div className="text-xs opacity-90">
              {typeConfig.icon} {typeConfig.label}
            </div>
          </div>
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Family Info */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {payment.family?.familyName?.charAt(0) || "F"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 truncate">
              {payment.family?.familyName || "Unknown Family"}
            </h3>
            <p className="text-sm text-gray-600">{payment.payerName}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 text-sm text-gray-600">
          {payment.tournamentName && (
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="truncate">{payment.tournamentName}</span>
            </div>
          )}

          {payment.sport && (
            <div className="flex items-center gap-2">
              <span className="text-base">{sportIcon}</span>
              <span>
                {payment.sport.replace(/_/g, " ")}
                {payment.game?.name && ` - ${payment.game.name}`}
              </span>
            </div>
          )}

          {payment.paymentDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                {format(new Date(payment.paymentDate), "dd MMM yyyy")}
              </span>
            </div>
          )}

          {payment.transactionId && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="truncate font-mono text-xs">
                {payment.transactionId}
              </span>
            </div>
          )}

          {payment.receiptNumber && (
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="font-mono text-xs">
                Receipt: {payment.receiptNumber}
              </span>
            </div>
          )}

          {payment.description && (
            <div className="text-sm text-gray-500 italic line-clamp-2 mt-2">
              {payment.description}
            </div>
          )}
        </div>

        {/* Contact Info */}
        {(payment.payerPhone || payment.payerEmail) && (
          <div className="pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-500">
            {payment.payerPhone && (
              <div className="flex items-center gap-1">
                <span>📱</span>
                <span>{payment.payerPhone}</span>
              </div>
            )}
            {payment.payerEmail && (
              <div className="flex items-center gap-1 truncate">
                <span>📧</span>
                <span className="truncate">{payment.payerEmail}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {format(new Date(payment.createdAt), "dd MMM yyyy, hh:mm a")}
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <Can I="update" a="Payment">
                <DropdownMenuItem
                  onClick={() => onEdit(payment)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Can>
              <Can I="delete" a="Payment">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() => onDelete(payment)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function PaymentTable({
  payments,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onEdit,
  onDelete,
  loading = false,
}) {
  const searchInputRef = useRef(null);
  const searchTimerRef = useRef(null);
  const wasFocusedRef = useRef(false);

  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    payment: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Restore focus after re-render
  useEffect(() => {
    if (wasFocusedRef.current && searchInputRef.current) {
      searchInputRef.current.focus();
      const length = searchInputRef.current.value.length;
      searchInputRef.current.setSelectionRange(length, length);
    }
  }, [payments]);

  // Handle search with debounce
  const handleSearch = (value) => {
    setSearchValue(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      onFilterChange({ search: value });
    }, 500);
  };

  const handleFocus = () => {
    wasFocusedRef.current = true;
  };

  const handleBlur = () => {
    wasFocusedRef.current = false;
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.payment) return;
    setDeleting(true);
    try {
      await onDelete(
        deleteDialog.payment.id,
        `Payment ${deleteDialog.payment.currency} ${deleteDialog.payment.amount.toFixed(2)}`,
      );
      setDeleteDialog({ open: false, payment: null });
    } catch {
      /* handled in hook */
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (payment) => {
    setDeleteDialog({ open: true, payment });
  };

  // Calculate totals
  const totals = payments.reduce(
    (acc, payment) => {
      acc.total += payment.amount;
      if (payment.status === "COMPLETED") {
        acc.completed += payment.amount;
      } else if (payment.status === "PENDING") {
        acc.pending += payment.amount;
      }
      return acc;
    },
    { total: 0, completed: 0, pending: 0 },
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
            <div className="text-sm font-medium text-emerald-700">
              Total Amount
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              ₹ {totals.total.toFixed(2)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm font-medium text-green-700">Completed</div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              ₹ {totals.completed.toFixed(2)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-sm font-medium text-yellow-700">Pending</div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">
              ₹ {totals.pending.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Search payments..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="pl-9 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.status || "all"}
            onValueChange={(v) =>
              onFilterChange({ status: v === "all" ? undefined : v })
            }
          >
            <SelectTrigger className="w-[140px] bg-white border-gray-300">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.paymentType || "all"}
            onValueChange={(v) =>
              onFilterChange({ paymentType: v === "all" ? undefined : v })
            }
          >
            <SelectTrigger className="w-[160px] bg-white border-gray-300">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(PAYMENT_TYPE_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sport || "all"}
            onValueChange={(v) =>
              onFilterChange({ sport: v === "all" ? undefined : v })
            }
          >
            <SelectTrigger className="w-[140px] bg-white border-gray-300">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Sports</SelectItem>
              {Object.entries(SPORT_ICONS).map(([value, icon]) => (
                <SelectItem key={value} value={value}>
                  {icon} {value.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <PaymentCardSkeleton key={i} />
          ))}
        </div>
      ) : payments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onEdit={onEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No payments found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchValue || filters.status || filters.paymentType || filters.sport
              ? "Try adjusting your search or filters"
              : "Get started by recording your first payment"}
          </p>
          {searchValue && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchValue("");
                onFilterChange({ search: "" });
              }}
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{pagination.from}</span> to{" "}
            <span className="font-medium">{pagination.to}</span> of{" "}
            <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="border-gray-300"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-md">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="border-gray-300"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, payment: null })}
        onConfirm={handleDelete}
        title="Delete Payment"
        description="Are you sure you want to delete this payment record? This action cannot be undone."
        itemName={
          deleteDialog.payment
            ? `Payment ${deleteDialog.payment.currency} ${deleteDialog.payment.amount.toFixed(2)}`
            : ""
        }
        loading={deleting}
      />
    </div>
  );
}
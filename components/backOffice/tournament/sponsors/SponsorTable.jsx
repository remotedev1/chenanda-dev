"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  Building2,
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import Image from "next/image";

const statusColors = {
  true: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  false: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const categoryColors = {
  TITLE:
    "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200",
  GOLD: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200",
  SILVER:
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300",
  BRONZE:
    "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200",
};

const SPONSOR_CATEGORIES = [
  { value: "TITLE", label: "Title" },
  { value: "GOLD", label: "Gold" },
  { value: "SILVER", label: "Silver" },
  { value: "BRONZE", label: "Bronze" },
];

function SponsorCard({ sponsor, onEdit, onDelete }) {
  const gradients = [
    "from-orange-400 via-red-500 to-pink-500",
    "from-blue-400 via-indigo-500 to-purple-500",
    "from-teal-400 via-emerald-500 to-green-500",
    "from-amber-400 via-orange-500 to-red-500",
    "from-sky-400 via-cyan-500 to-teal-500",
    "from-fuchsia-400 via-purple-500 to-violet-500",
  ];
  const gradient = gradients[sponsor.name.charCodeAt(0) % gradients.length];

  const initials = sponsor.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Card banner */}
      <div
        className={`relative h-28 bg-gradient-to-br ${gradient} overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/10" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {/* Category badge */}
          {sponsor.category && (
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${categoryColors[sponsor.category]}`}
            >
              {sponsor.category}
            </Badge>
          )}
          {/* Status badge */}
          <Badge
            variant="outline"
            className={`text-xs font-semibold border-0 ${statusColors[sponsor.status]}`}
          >
            {sponsor.status ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Logo / Avatar */}
        <div className="absolute bottom-3 left-4">
          {sponsor.logo?.[0]?.url ? (
            <div className="w-14 h-14 rounded-xl shadow-md overflow-hidden bg-white flex items-center justify-center">
              <Image
                src={sponsor.logo[0].url}
                alt={sponsor.name}
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
          ) : (
            <div
              className={`h-14 w-14 rounded-xl border-2 border-white bg-gradient-to-br ${gradient} shadow-md flex items-center justify-center text-white font-bold text-xl`}
            >
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-2 space-y-4">
        {/* Name & description */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {sponsor.name}
          </h3>
          {sponsor.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
              {sponsor.description}
            </p>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-1.5">
          {sponsor.email && (
            <a
              href={`mailto:${sponsor.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors truncate"
            >
              <Mail className="h-4 w-4 shrink-0 text-orange-400" />
              <span className="truncate">{sponsor.email}</span>
            </a>
          )}
          {sponsor.phone && (
            <a
              href={`tel:${sponsor.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Phone className="h-4 w-4 shrink-0 text-orange-400" />
              <span>{sponsor.phone}</span>
            </a>
          )}
          {sponsor.website && (
            <a
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors truncate"
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-orange-400" />
              <span className="truncate">
                {sponsor.website.replace(/^https?:\/\//, "")}
              </span>
            </a>
          )}
          {!sponsor.email && !sponsor.phone && !sponsor.website && (
            <p className="text-sm text-gray-400 italic">No contact info</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            onClick={() => onEdit(sponsor)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

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
            <DropdownMenuContent
              align="end"
              className="bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onEdit(sponsor)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 hover:bg-red-500 hover:text-white cursor-pointer"
                onClick={() => onDelete(sponsor)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function SponsorTable({
  sponsors,
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
  const hasMountedRef = useRef(false);
  const wasFocusedRef = useRef(false);

  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    sponsor: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (wasFocusedRef.current && searchInputRef.current) {
      searchInputRef.current.focus();
      const length = searchInputRef.current.value.length;
      searchInputRef.current.setSelectionRange(length, length);
    }
  }, [sponsors]);

  const handleSearch = useCallback(
    (value) => {
      setSearchValue(value);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        onFilterChange({ search: value });
      }, 500);
    },
    [onFilterChange],
  );

  const handleFocus = () => {
    wasFocusedRef.current = true;
  };
  const handleBlur = () => {
    wasFocusedRef.current = false;
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.sponsor) return;
    setDeleting(true);
    try {
      await onDelete(deleteDialog.sponsor.id, deleteDialog.sponsor.name);
      setDeleteDialog({ open: false, sponsor: null });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50 p-4 rounded-lg border border-gray-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Search sponsors..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="pl-9 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Category filter */}
          <Select
            value={filters.category || "all"}
            onValueChange={(value) =>
              onFilterChange({ category: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px] bg-white border-gray-300">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Categories</SelectItem>
              {SPONSOR_CATEGORIES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFilterChange({ status: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px] bg-white border-gray-300">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={filters.sortBy || "name"}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-[150px] bg-white border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Grid */}
      {sponsors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              onEdit={onEdit}
              onDelete={(s) => setDeleteDialog({ open: true, sponsor: s })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No sponsors found
          </h3>
          <p className="text-gray-500">
            {searchValue || filters.status || filters.category
              ? "Try adjusting your search or filters"
              : "Get started by adding your first sponsor"}
          </p>
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

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, sponsor: null })}
        onConfirm={handleDelete}
        title="Delete Sponsor"
        description="Are you sure you want to delete this sponsor? This action cannot be undone."
        itemName={deleteDialog.sponsor?.name}
        loading={deleting}
      />
    </div>
  );
}

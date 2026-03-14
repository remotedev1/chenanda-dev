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
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Can } from "@/components/providers/AbilityContext";
import Image from "next/image";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function FamilyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="relative h-32 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-8 bg-gray-200 rounded-full animate-pulse w-8" />
        </div>
      </div>
    </div>
  );
}

// ─── Family Avatar / Images ───────────────────────────────────────────────────

function FamilyImages({ family }) {
  const images = family.images || [];

  if (images.length === 0) {
    return (
      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow-md border-2 border-white">
        {family.familyName.charAt(0).toUpperCase()}
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md">
        <Image
          src={images[0]}
          alt={family.familyName}
          width={56}
          height={56}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="flex -space-x-3">
      {images.slice(0, 3).map((img, idx) => (
        <div
          key={idx}
          className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow"
        >
          <Image
            src={img}
            alt={`${family.familyName} ${idx + 1}`}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        </div>
      ))}
      {images.length > 3 && (
        <div className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600 shadow">
          +{images.length - 3}
        </div>
      )}
    </div>
  );
}

// ─── Color Swatches ───────────────────────────────────────────────────────────

function ColorSwatches({ colors }) {
  if (!colors) return null;

  const colorArray = colors.includes(",")
    ? colors.split(",").map((c) => c.trim())
    : [colors];

  return (
    <div className="flex items-center gap-1.5">
      {colorArray.slice(0, 4).map((color, idx) => (
        <div
          key={idx}
          className="h-5 w-5 rounded-full border-2 border-gray-200 shadow-sm"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      {colorArray.length > 4 && (
        <span className="text-xs text-gray-400 font-medium">
          +{colorArray.length - 4}
        </span>
      )}
    </div>
  );
}

// ─── Family Card ──────────────────────────────────────────────────────────────

function FamilyCard({ family, onEdit, onDelete }) {
  const colors = family.colors || "";
  const colorArray = colors
    ? colors.includes(",")
      ? colors.split(",").map((c) => c.trim())
      : [colors]
    : [];

  // Use the first color for the gradient header if available, else fallback
  const headerStyle =
    colorArray.length >= 2
      ? {
          background: `linear-gradient(135deg, ${colorArray[0]}, ${colorArray[1]})`,
        }
      : colorArray.length === 1
        ? {
            background: `linear-gradient(135deg, ${colorArray[0]}, ${colorArray[0]}cc)`,
          }
        : undefined;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Header band */}
      <div
        className="relative h-28 overflow-hidden"
        style={
          headerStyle || {
            background: "linear-gradient(135deg, #f97316, #ef4444, #ec4899)",
          }
        }
      >
        <div className="absolute inset-0 bg-black/10" />

        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Avatar floated at bottom-left */}
        <div className="absolute -bottom-7 left-5">
          <FamilyImages family={family} />
        </div>

        {/* Stats badges top-right */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {family._count?.players !== undefined && (
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs font-medium">
              <Users className="h-3 w-3 mr-1" />
              {family._count.players}
            </Badge>
          )}
          {(family.images?.length ?? 0) > 0 && (
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs font-medium">
              <ImageIcon className="h-3 w-3 mr-1" />
              {family.images.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="pt-10 px-5 pb-5 space-y-3">
        {/* Name */}
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
          {family.familyName}
        </h3>

        {/* Description */}
        {family.description ? (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {family.description}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">No description provided</p>
        )}

        {/* Colors */}
        {colorArray.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Colors
            </span>
            <ColorSwatches colors={family.colors} />
          </div>
        )}

        {/* Footer row */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {family._count?.players ?? 0}
            </span>
            <span>{(family._count?.players ?? 0) === 1 ? "Player" : "Players"}</span>
          </div>

          <DropdownMenu>
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
              <Can I="update" a="Family">
                <DropdownMenuItem
                  // ✅ setTimeout defers the dialog open by one tick so Radix can
                  // finish restoring pointer-events on the body before the Dialog
                  // mounts — without this the dialog renders but accepts no input.
                  onClick={() => setTimeout(() => onEdit(family), 0)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Can>
              <Can I="delete" a="Family">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                  onClick={() => setTimeout(() => onDelete(family), 0)}
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

// ─── Main FamilyTable ─────────────────────────────────────────────────────────

export function FamilyTable({
  families,
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
  // ✅ Track whether the component has mounted to avoid focus stealing on load
  const hasMountedRef = useRef(false);
  const wasFocusedRef = useRef(false);

  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    family: null,
  });
  const [deleting, setDeleting] = useState(false);

  // ✅ Only restore focus after the FIRST data update post-mount, not on initial render
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
  }, [families]);

  // ✅ useCallback so handleSearch is stable across renders
  const handleSearch = useCallback(
    (value) => {
      setSearchValue(value);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        // ✅ Pass scroll:false hint via a wrapper — real fix is in parent using router.replace
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
    if (!deleteDialog.family) return;
    setDeleting(true);
    try {
      await onDelete(deleteDialog.family.id, deleteDialog.family.familyName);
      setDeleteDialog({ open: false, family: null });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
           {/* Summary Cards */}
  
      {/* ── Filters ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Search families..."
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

        <div className="flex gap-2">
          <Select
            value={filters.sortBy || "name"}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-[180px] bg-white border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="name">Name (A–Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z–A)</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      {families.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <FamilyCardSkeleton key={i} />
              ))
            : families.map((family) => (
                <FamilyCard
                  key={family.id}
                  family={family}
                  onEdit={onEdit}
                  onDelete={(f) => setDeleteDialog({ open: true, family: f })}
                />
              ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No families found
          </h3>
          <p className="text-gray-500 mb-2">
            {searchValue
              ? "Try adjusting your search"
              : "Get started by adding your first family"}
          </p>
          {searchValue && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => handleSearch("")}
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* ── Pagination ── */}
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

      {/* ── Delete Dialog ── */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, family: null })}
        onConfirm={handleDelete}
        title="Delete Family"
        description="Are you sure you want to delete this family? This action cannot be undone and will affect all associated data."
        itemName={deleteDialog.family?.familyName}
        loading={deleting}
      />
    </div>
  );
}
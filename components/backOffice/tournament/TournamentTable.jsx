"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Eye,
  Edit,
  Calendar,
  Users,
  Trophy,
  MapPin,
} from "lucide-react";
import { TournamentStatusBadge } from "./TournamentStatusBadge";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { formatDate, formatNumber } from "@/utils/tournament.utils";

// Shimmer Card Component
function TournamentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="relative h-32 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-8 bg-gray-200 rounded-full animate-pulse w-8" />
        </div>
      </div>
    </div>
  );
}

// Tournament Card Component
function TournamentCard({ tournament, onView, onEdit }) {
  const router = useRouter();

  return (
    <div
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => onView(tournament.id)}
    >
      {/* Header with gradient */}
      <div className="relative h-32 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-3 right-3">
          <TournamentStatusBadge status={tournament.status} />
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{tournament.year}</span>
          </div>
        </div>
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
            {tournament.name}
          </h3>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 text-orange-500" />
            <span className="font-medium">
              {formatNumber(tournament._count?.participation || 0)}
            </span>
            <span className="text-gray-400">Teams</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Trophy className="h-4 w-4 text-orange-500" />
            <span className="font-medium">
              {formatNumber(tournament._count?.matches || 0)}
            </span>
            <span className="text-gray-400">Matches</span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Starts {formatDate(tournament.startDate)}</span>
        </div>

        {/* Location if available */}
        {tournament.location && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{tournament.location}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            onClick={(e) => {
              e.stopPropagation();
              onView(tournament.id);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  onView(tournament.id);
                }}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(tournament.id);
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function TournamentTable({
  tournaments,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onDelete,
  loading = false,
}) {
  const router = useRouter();
  const searchInputRef = useRef(null);
  const searchTimerRef = useRef(null);
  const wasFocusedRef = useRef(false);
  
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    tournament: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Restore focus after re-render if it was previously focused
  useEffect(() => {
    if (wasFocusedRef.current && searchInputRef.current) {
      searchInputRef.current.focus();
      // Set cursor to end of input
      const length = searchInputRef.current.value.length;
      searchInputRef.current.setSelectionRange(length, length);
    }
  }, [tournaments]); // Re-run when tournaments change (after search completes)

  // Handle search with debounce
  const handleSearch = (value) => {
    setSearchValue(value);
    
    // Clear existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    // Set new timer
    searchTimerRef.current = setTimeout(() => {
      onFilterChange({ search: value });
    }, 500);
  };

  // Track focus state
  const handleFocus = () => {
    wasFocusedRef.current = true;
  };

  const handleBlur = () => {
    wasFocusedRef.current = false;
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.tournament) return;

    setDeleting(true);
    try {
      await onDelete(deleteDialog.tournament.id, deleteDialog.tournament.name);
      setDeleteDialog({ open: false, tournament: null });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (id) => {
    router.push(`/dashboard/tournaments/${id}`);
  };

  const handleEdit = (id) => {
    router.push(`/dashboard/tournaments/${id}/edit`);
  };

  return (
    <div className="space-y-6">
     
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Search tournaments..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="pl-9 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFilterChange({ status: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[160px] bg-white border-gray-300">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="REGISTRATION">Registration</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || "createdAt"}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-[160px] bg-white border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="startDate">Start Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <TournamentCardSkeleton key={i} />
          ))}
        </div>
      ) : tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onView={handleView}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tournaments found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchValue || filters.status
              ? "Try adjusting your search or filters"
              : "Get started by creating your first tournament"}
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

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, tournament: null })}
        onConfirm={handleDelete}
        title="Delete Tournament"
        description="This will permanently delete the tournament. If the tournament has participants or matches, it will be marked as cancelled instead."
        itemName={deleteDialog.tournament?.name}
        loading={deleting}
      />
    </div>
  );
}
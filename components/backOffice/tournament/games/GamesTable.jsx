"use client";

import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Swords,
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Can } from "@/hooks/useAbility";
import { format } from "date-fns";

const statusColors = {
  true: "bg-green-100 text-green-800",
  false: "bg-gray-100 text-gray-700",
};

const categoryColors = {
  MENS: "bg-blue-100 text-blue-800",
  WOMENS: "bg-pink-100 text-pink-800",
  JUNIOR: "bg-yellow-100 text-yellow-800",
  VETERANS: "bg-purple-100 text-purple-800",
  MIXED: "bg-teal-100 text-teal-800",
};

const sportColors = {
  FOOTBALL: "bg-emerald-100 text-emerald-800",
  BASKETBALL: "bg-orange-100 text-orange-800",
  VOLLEYBALL: "bg-indigo-100 text-indigo-800",
  CRICKET: "bg-lime-100 text-lime-800",
  TENNIS: "bg-yellow-100 text-yellow-800",
  BADMINTON: "bg-pink-100 text-pink-800",
  ATHLETICS: "bg-red-100 text-red-800",
  FIELD_HOCKEY: "bg-green-100 text-green-800",
  TABLE_TENNIS: "bg-cyan-100 text-cyan-800",
  KABADDI: "bg-amber-100 text-amber-800",
};

const SPORT_TYPES = [
  "FOOTBALL", "BASKETBALL", "VOLLEYBALL", "CRICKET",
  "TENNIS", "BADMINTON", "ATHLETICS", "FIELD_HOCKEY",
  "TABLE_TENNIS", "KABADDI",
];

const CATEGORIES = ["MENS", "WOMENS", "JUNIOR", "VETERANS", "MIXED"];

export function GameTable({
  games,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onEdit,
  onDelete,
}) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, game: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({ search: searchValue });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onFilterChange]);

  const handleDelete = async () => {
    if (!deleteDialog.game) return;
    setDeleting(true);
    try {
      await onDelete(deleteDialog.game.id, deleteDialog.game.name);
      setDeleteDialog({ open: false, game: null });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Game",
      cell: ({ row }) => {
        const game = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl shadow-sm">
              {game.icon || "🏆"}
            </div>
            <div>
              <div className="font-semibold text-sm">{game.name}</div>
              {game.format && (
                <div className="text-xs text-muted-foreground">{game.format}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "sportType",
      header: "Sport",
      cell: ({ row }) => {
        const sport = row.original.sportType;
        return (
          <Badge variant="outline" className={sportColors[sport] || ""}>
            {sport?.replace(/_/g, " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <Badge variant="outline" className={categoryColors[category] || ""}>
            {category?.charAt(0) + category?.slice(1).toLowerCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.original.date;
        return date ? (
          <span className="text-sm tabular-nums">
            {format(new Date(date), "dd MMM yyyy")}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "stats",
      header: "Activity",
      cell: ({ row }) => {
        const game = row.original;
        return (
          <div className="flex gap-2">
            {game._count?.registrations > 0 && (
              <Badge variant="secondary" className="font-normal text-xs">
                <Users className="h-3 w-3 mr-1" />
                {game._count.registrations}
              </Badge>
            )}
            {game._count?.matches > 0 && (
              <Badge variant="outline" className="font-normal text-xs">
                <Swords className="h-3 w-3 mr-1" />
                {game._count.matches} matches
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge variant="outline" className={statusColors[isActive]}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const game = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-50 dark:bg-slate-800">
              <DropdownMenuLabel className="text-black dark:text-white">Actions</DropdownMenuLabel>
              <Can I="update" a="TournamentGame">
                <DropdownMenuItem
                  onClick={() => onEdit(game)}
                  className="cursor-pointer text-black dark:text-white"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Can>
              <Can I="delete" a="TournamentGame">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 hover:bg-red-500 hover:text-white cursor-pointer"
                  onClick={() => setDeleteDialog({ open: true, game })}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: games,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages || 0,
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            placeholder="Search games..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.sportType || "all"}
            onValueChange={(value) =>
              onFilterChange({ sportType: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[160px] text-white bg-gray-700 [&>span]:text-white">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50">
              <SelectItem value="all">All Sports</SelectItem>
              {SPORT_TYPES.map((s) => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category || "all"}
            onValueChange={(value) =>
              onFilterChange({ category: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px] text-white bg-gray-700 [&>span]:text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50">
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFilterChange({ status: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px] text-white bg-gray-700 [&>span]:text-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || "name"}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-[160px] text-white bg-gray-700 [&>span]:text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50">
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="date">Date (Asc)</SelectItem>
              <SelectItem value="date-desc">Date (Desc)</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        if (cell.column.id === "actions") e.stopPropagation();
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {searchValue ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground">
                        No games found matching {searchValue}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => setSearchValue("")}>
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    "No games found."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.from} to {pagination.to} of {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, game: null })}
        onConfirm={handleDelete}
        title="Delete Game"
        description="Are you sure you want to delete this game? This action cannot be undone and will remove all associated registrations and matches."
        itemName={deleteDialog.game?.name}
        loading={deleting}
      />
    </div>
  );
}
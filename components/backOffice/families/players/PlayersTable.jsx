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
  Award,
  Trophy,
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Can } from "@/hooks/useAbility";
import { format, differenceInYears } from "date-fns";

const statusColors = {
  true: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  false: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const sportColors = {
  FOOTBALL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  BASKETBALL: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  VOLLEYBALL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  CRICKET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  TENNIS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  BADMINTON: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  ATHLETICS: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function PlayerTable({
  players,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onEdit,
  onDelete,
}) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    player: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Debounced search with cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({ search: searchValue });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onFilterChange]);

  const handleDelete = async () => {
    if (!deleteDialog.player) return;

    setDeleting(true);
    try {
      await onDelete(deleteDialog.player.id, deleteDialog.player.playerName);
      setDeleteDialog({ open: false, player: null });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const columns = [
    {
      accessorKey: "playerName",
      header: "Player",
      cell: ({ row }) => {
        const player = row.original;
        const age = calculateAge(player.dateOfBirth);
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                {player.playerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-base">{player.playerName}</div>
                {age && (
                  <div className="text-sm text-muted-foreground">
                    {age} years old
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "family",
      header: "Family",
      cell: ({ row }) => {
        const family = row.original.family;
        return family ? (
          <div className="font-medium">{family.familyName}</div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "primarySport",
      header: "Primary Sport",
      cell: ({ row }) => {
        const sport = row.original.primarySport;
        if (!sport) return <span className="text-muted-foreground">-</span>;

        return (
          <Badge 
            variant="outline" 
            className={sportColors[sport] || ""}
          >
            {sport}
          </Badge>
        );
      },
    },
    {
      accessorKey: "jerseyNumber",
      header: "Jersey #",
      cell: ({ row }) => {
        const number = row.original.jerseyNumber;
        return number ? (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
            {number}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "stats",
      header: "Stats",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <div className="flex gap-2">
            {player._count?.achievements > 0 && (
              <Badge variant="secondary" className="font-normal">
                <Award className="h-3 w-3 mr-1" />
                {player._count.achievements}
              </Badge>
            )}
            {player._count?.manOfTheMatchIn > 0 && (
              <Badge variant="outline" className="font-normal">
                <Trophy className="h-3 w-3 mr-1" />
                {player._count.manOfTheMatchIn} MoM
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
        const player = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-slate-50 dark:bg-slate-800"
            >
              <DropdownMenuLabel className="text-black dark:text-white">
                Actions
              </DropdownMenuLabel>
              <Can I="update" a="Player">
                <DropdownMenuItem
                  onClick={() => onEdit(player)}
                  className="cursor-pointer text-black dark:text-white"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Can>
              <Can I="delete" a="Player">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white cursor-pointer"
                  onClick={() => setDeleteDialog({ open: true, player })}
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
    data: players,
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
            placeholder="Search players..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.sport || "all"}
            onValueChange={(value) =>
              onFilterChange({ sport: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[180px] text-white bg-gray-700 [&>span]:text-white">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent className="min-w-[180px] bg-slate-50 dark:bg-slate-800">
              <SelectItem value="all">All Sports</SelectItem>
              <SelectItem value="FOOTBALL">Football</SelectItem>
              <SelectItem value="BASKETBALL">Basketball</SelectItem>
              <SelectItem value="VOLLEYBALL">Volleyball</SelectItem>
              <SelectItem value="CRICKET">Cricket</SelectItem>
              <SelectItem value="TENNIS">Tennis</SelectItem>
              <SelectItem value="BADMINTON">Badminton</SelectItem>
              <SelectItem value="ATHLETICS">Athletics</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFilterChange({ status: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[180px] text-white bg-gray-700 [&>span]:text-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="min-w-[180px] bg-slate-50 dark:bg-slate-800">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || "playerName"}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-[180px] text-white bg-gray-700 [&>span]:text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="min-w-[180px] bg-slate-50 dark:bg-slate-800">
              <SelectItem value="playerName">Name (A-Z)</SelectItem>
              <SelectItem value="playerName-desc">Name (Z-A)</SelectItem>
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
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    // Optional: Navigate to player detail page
                    // router.push(`/players/${row.original.id}`);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        if (cell.column.id === "actions") {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {searchValue ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground">
                        No players found matching {searchValue}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchValue("")}
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    "No players found."
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
            Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
            results
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
        onOpenChange={(open) => setDeleteDialog({ open, player: null })}
        onConfirm={handleDelete}
        title="Delete Player"
        description="Are you sure you want to delete this player? This action cannot be undone."
        itemName={deleteDialog.player?.playerName}
        loading={deleting}
      />
    </div>
  );
}
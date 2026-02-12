// components/sponsors/SponsorTable.jsx
"use client";

import { useState } from "react";
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
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Can } from "@/hooks/useAbility";
import Image from "next/image";

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export function SponsorTable({
  sponsors,
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
    sponsor: null,
  });
  const [deleting, setDeleting] = useState(false);

  const handleSearch = (value) => {
    setSearchValue(value);
    const timer = setTimeout(() => {
      onFilterChange({ search: value });
    }, 2000);
    return () => clearTimeout(timer);
  };

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

  const columns = [
    {
      accessorKey: "logo",
      header: "Logo",
      cell: ({ row }) => {
        const sponsor = row.original;
        return sponsor.logo ? (
          <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
            <Image
              src={sponsor.logo[0].url}
              alt={sponsor.name}
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {sponsor.name.charAt(0)}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Sponsor",
      cell: ({ row }) => {
        const sponsor = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{sponsor.name}</div>
            {sponsor.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {sponsor.description}
              </div>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={statusColors[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const sponsor = row.original;
        return (
          <div className="flex gap-2">
            {sponsor.contactEmail && (
              <a
                href={`mailto:${sponsor.contactEmail}`}
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-blue-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
            {sponsor.contactPhone && (
              <a
                href={`tel:${sponsor.contactPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-blue-600 transition-colors"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
            {sponsor.website && (
              <a
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-blue-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const sponsor = row.original;
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
              className="bg-slate-50  dark:bg-slate-800"
            >
              <DropdownMenuLabel className="text-black dark:text-white">Actions</DropdownMenuLabel>
              <Can I="update" a="Sponsor">
                <DropdownMenuItem
                  onClick={() => onEdit(sponsor)}
                  className="cursor-pointer  text-black dark:text-white "
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Can>
              <Can I="delete" a="Sponsor">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white cursor-pointer"
                  onClick={() => setDeleteDialog({ open: true, sponsor })}
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
    data: sponsors,
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
            placeholder="Search sponsors..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 relative z-0"
          />
        </div>
        <div className="flex gap-2">
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
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || "all"}
            onValueChange={(value) =>
              onFilterChange({ sortBy: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[180px] text-white bg-gray-700 [&>span]:text-white  cursor-pointer">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="min-w-[180px] bg-slate-50 dark:bg-slate-800">
              <SelectItem value="all">Sort by</SelectItem>

              <SelectItem value="name">Name</SelectItem>
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
                          header.getContext(),
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
                        cell.getContext(),
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
                  No sponsors found.
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

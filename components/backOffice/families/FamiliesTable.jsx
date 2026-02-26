"use client";

import { useState, useEffect, useCallback } from "react";
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
  Image as ImageIcon,
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Can } from "@/hooks/useAbility";
import Image from "next/image";

export function FamilyTable({
  families,
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
    family: null,
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

  const columns = [
    {
      accessorKey: "images",
      header: "Images",
      cell: ({ row }) => {
        const family = row.original;
        const images = family.images || [];
        
        if (images.length === 0) {
          return (
            <div className="h-12 w-12 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
              {family.familyName.charAt(0).toUpperCase()}
            </div>
          );
        }

        if (images.length === 1) {
          return (
            <div className="h-12 w-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src={images[0]}
                alt={family.familyName}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
          );
        }

        return (
          <div className="flex -space-x-2">
            {images.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 border-2 border-white flex items-center justify-center"
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
              <div className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                +{images.length - 3}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "familyName",
      header: "Family Name",
      cell: ({ row }) => {
        const family = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-base">{family.familyName}</div>
            {family.description && (
              <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                {family.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "colors",
      header: "Colors",
      cell: ({ row }) => {
        const colors = row.original.colors;
        if (!colors) return <span className="text-muted-foreground">-</span>;

        // Parse colors if it's a comma-separated string
        const colorArray = colors.includes(",")
          ? colors.split(",").map((c) => c.trim())
          : [colors];

        return (
          <div className="flex gap-1.5">
            {colorArray.slice(0, 3).map((color, idx) => (
              <div
                key={idx}
                className="h-6 w-6 rounded-full border-2 border-gray-200 shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {colorArray.length > 3 && (
              <div className="h-6 px-2 rounded-full bg-gray-100 flex items-center text-xs font-medium text-gray-600">
                +{colorArray.length - 3}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "stats",
      header: "Stats",
      cell: ({ row }) => {
        const family = row.original;
        return (
          <div className="flex gap-2">
            {family._count?.players !== undefined && (
              <Badge variant="secondary" className="font-normal">
                <Users className="h-3 w-3 mr-1" />
                {family._count.players} {family._count.players === 1 ? "Player" : "Players"}
              </Badge>
            )}
            {family.images?.length > 0 && (
              <Badge variant="outline" className="font-normal">
                <ImageIcon className="h-3 w-3 mr-1" />
                {family.images.length}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const family = row.original;
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
              <Can I="update" a="Family">
                <DropdownMenuItem
                  onClick={() => onEdit(family)}
                  className="cursor-pointer text-black dark:text-white"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Can>
              <Can I="delete" a="Family">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white cursor-pointer"
                  onClick={() => setDeleteDialog({ open: true, family })}
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
    data: families,
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
            placeholder="Search families..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.sortBy || "name"}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-[180px] text-white bg-gray-700 [&>span]:text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="min-w-[180px] bg-slate-50 dark:bg-slate-800">
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
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
                    // Optional: Navigate to family detail page
                    // router.push(`/families/${row.original.id}`);
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
                        No families found matching  `{searchValue}`
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
                    "No families found."
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
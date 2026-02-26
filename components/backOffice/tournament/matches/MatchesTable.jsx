"use client";

import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft, ChevronRight, MoreHorizontal,
  Search, Edit, Trash2, Radio, Eye,
} from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Can } from "@/hooks/useAbility";
import { format } from "date-fns";

/* ---- Constants ---- */

const STATUS_CONFIG = {
  SCHEDULED:  { label: "Scheduled",  className: "bg-blue-100 text-blue-800" },
  DELAYED:    { label: "Delayed",    className: "bg-yellow-100 text-yellow-800" },
  LIVE:       { label: "🔴 LIVE",    className: "bg-red-100 text-red-700 font-semibold animate-pulse" },
  SUSPENDED:  { label: "Suspended",  className: "bg-orange-100 text-orange-800" },
  COMPLETED:  { label: "Completed",  className: "bg-green-100 text-green-800" },
  POSTPONED:  { label: "Postponed",  className: "bg-slate-100 text-slate-700" },
  CANCELLED:  { label: "Cancelled",  className: "bg-red-100 text-red-600 line-through" },
  ABANDONED:  { label: "Abandoned",  className: "bg-gray-100 text-gray-600" },
  WALKOVER:   { label: "Walkover",   className: "bg-purple-100 text-purple-700" },
  NO_RESULT:  { label: "No Result",  className: "bg-slate-100 text-slate-600" },
};

const ROUND_LABELS = {
  POOL_STAGE: "Pool Stage", ROUND_1: "Round 1", ROUND_2: "Round 2",
  ROUND_3: "Round 3", ROUND_4: "Round 4", ROUND_5: "Round 5",
  ROUND_6: "Round 6", ROUND_OF_32: "R32", ROUND_OF_16: "R16",
  PRE_QUARTER: "Pre-QF", QUARTER_FINAL: "QF", SEMI_FINAL: "SF",
  THIRD_PLACE: "3rd Place", FINAL: "🏆 Final",
};

const SPORT_ICONS = {
  FOOTBALL: "⚽", BASKETBALL: "🏀", VOLLEYBALL: "🏐", CRICKET: "🏏",
  TENNIS: "🎾", BADMINTON: "🏸", ATHLETICS: "🏃", FIELD_HOCKEY: "🏑",
  TABLE_TENNIS: "🏓", KABADDI: "🤼",
};

export function MatchTable({
  matches, pagination, filters,
  onFilterChange, onPageChange, onEdit, onDelete, onLiveControl,
}) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, match: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) onFilterChange({ search: searchValue });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onFilterChange]);

  const handleDelete = async () => {
    if (!deleteDialog.match) return;
    setDeleting(true);
    try {
      await onDelete(
        deleteDialog.match.id,
        deleteDialog.match.name || `Match #${deleteDialog.match.matchNo}`
      );
      setDeleteDialog({ open: false, match: null });
    } catch { /* handled in hook */ }
    finally { setDeleting(false); }
  };

  const columns = [
    {
      accessorKey: "match",
      header: "Match",
      cell: ({ row }) => {
        const m = row.original;
        const sport = SPORT_ICONS[m.sport] || "🏆";
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl shadow-sm">
              {sport}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">
                {m.name || `${m.sport} Match #${m.matchNo}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {ROUND_LABELS[m.round] || m.round}
                {m.pool ? ` · Pool ${m.pool}` : ""}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "teams",
      header: "Teams",
      cell: ({ row }) => {
        const participants = row.original.participants || [];
        if (!participants.length) return <span className="text-muted-foreground text-sm">TBD</span>;
        return (
          <div className="flex flex-col gap-1">
            {participants.map((p) => (
              <div key={p.id} className="text-sm font-medium truncate max-w-[160px]">
                {p.team?.familyName || "Unknown"}
                {row.original.winnerId === p.teamId && (
                  <span className="ml-1 text-xs text-green-600 font-semibold">✓ W</span>
                )}
              </div>
            ))}
            {row.original.isDraw && (
              <span className="text-xs text-slate-500 font-medium">Draw</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "venue",
      header: "Venue",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.venue?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      accessorKey: "scheduledOn",
      header: "Scheduled",
      cell: ({ row }) => {
        const d = row.original.scheduledOn;
        return d ? (
          <div className="text-sm tabular-nums">
            <div>{format(new Date(d), "dd MMM yyyy")}</div>
            <div className="text-muted-foreground">{format(new Date(d), "hh:mm a")}</div>
          </div>
        ) : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const cfg = STATUS_CONFIG[s] || { label: s, className: "" };
        return (
          <Badge variant="outline" className={cfg.className}>
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const match = row.original;
        const isLive = match.status === "LIVE";
        const canGoLive = ["SCHEDULED", "DELAYED"].includes(match.status);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-50">
              <DropdownMenuLabel className="text-black">Actions</DropdownMenuLabel>
              {(isLive || canGoLive) && onLiveControl && (
                <>
                  <DropdownMenuItem
                    onClick={() => onLiveControl(match)}
                    className="cursor-pointer text-red-600 font-medium"
                  >
                    <Radio className="mr-2 h-4 w-4" />
                    {isLive ? "Live Controls" : "Go Live"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <Can I="update" a="Match">
                <DropdownMenuItem
                  onClick={() => onEdit(match)}
                  className="cursor-pointer text-black"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Can>
              <Can I="delete" a="Match">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 hover:bg-red-500 hover:text-white cursor-pointer"
                  onClick={() => setDeleteDialog({ open: true, match })}
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
    data: matches,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages || 0,
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search matches..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            {
              key: "status", placeholder: "All Statuses", width: "w-[160px]",
              options: Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label })),
            },
            {
              key: "round", placeholder: "All Rounds", width: "w-[160px]",
              options: Object.entries(ROUND_LABELS).map(([v, l]) => ({ value: v, label: l })),
            },
            {
              key: "pool", placeholder: "All Pools", width: "w-[130px]",
              options: ["A","B","C","D","E","F","G","H"].map((p) => ({ value: p, label: `Pool ${p}` })),
            },
          ].map(({ key, placeholder, width, options }) => (
            <Select
              key={key}
              value={filters[key] || "all"}
              onValueChange={(v) => onFilterChange({ [key]: v === "all" ? undefined : v })}
            >
              <SelectTrigger className={`${width} text-white bg-gray-700 [&>span]:text-white`}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-slate-50">
                <SelectItem value="all">{placeholder}</SelectItem>
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
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
                      onClick={(e) => { if (cell.column.id === "actions") e.stopPropagation(); }}
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
                      <p className="text-muted-foreground">No matches found matching {searchValue}</p>
                      <Button variant="outline" size="sm" onClick={() => setSearchValue("")}>Clear search</Button>
                    </div>
                  ) : "No matches found."}
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
            <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrevPage}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <div className="text-sm">Page {pagination.currentPage} of {pagination.totalPages}</div>
            <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.currentPage + 1)} disabled={!pagination.hasNextPage}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, match: null })}
        onConfirm={handleDelete}
        title="Delete Match"
        description="Are you sure you want to delete this match? This cannot be undone."
        itemName={deleteDialog.match?.name || `Match #${deleteDialog.match?.matchNo}`}
        loading={deleting}
      />
    </div>
  );
}
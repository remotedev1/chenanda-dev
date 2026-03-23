"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Activity,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  User,
  Layers,
  Calendar,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

/* ─────────────────────────────────────────────
   ZOD SCHEMA  (mirrors the API's querySchema)
───────────────────────────────────────────── */
const filterSchema = z.object({
  search: z.string().optional().default(""),
  action: z.enum(["all", "created", "updated", "deleted"]).default("all"),
  entity: z.string().optional().default(""),
  dateFrom: z.string().optional().default(""),
  dateTo: z.string().optional().default(""),
  sortBy: z
    .enum(["timestamp", "action", "entity", "entityName"])
    .default("timestamp"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce.number().default(20),
});

const DEFAULT_VALUES = {
  search: "",
  action: "all",
  entity: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "timestamp",
  sortOrder: "desc",
  limit: 20,
};

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const ACTION_COLORS = {
  created: "bg-emerald-100 text-emerald-700 border-emerald-200",
  updated: "bg-sky-100 text-sky-700 border-sky-200",
  deleted: "bg-rose-100 text-rose-700 border-rose-200",
};

const ACTION_LABELS = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const SORTABLE_COLUMNS = [
  { key: "timestamp", label: "Time" },
  { key: "action", label: "Action" },
  { key: "entity", label: "Type" },
  { key: "entityName", label: "Name" },
];

/* ─────────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────────── */

function SortButton({ columnKey, label, currentSort, currentOrder, onSort }) {
  const isActive = currentSort === columnKey;
  const Icon = !isActive
    ? ArrowUpDown
    : currentOrder === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <button
      onClick={() => onSort(columnKey)}
      className={`flex items-center gap-1 text-xs font-semibold tracking-wide uppercase transition-colors ${
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <Icon className="w-3 h-3" />
    </button>
  );
}

function ActionBadge({ action }) {
  const colorClass =
    ACTION_COLORS[action] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colorClass}`}
    >
      {ACTION_LABELS[action] ?? action}
    </span>
  );
}

function UserCell({ user }) {
  if (!user) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm truncate max-w-[120px]">{user.firstName}</span>
    </div>
  );
}

function TableSkeleton({ rows = 8 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <TableRow key={i} className="animate-pulse">
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-md" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
    </TableRow>
  ));
}

function PaginationBar({ page, totalPages, total, limit, onPage }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-foreground">{total}</span> entries
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPage(1)}
          disabled={page <= 1}
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page pills */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;

          return (
            <Button
              key={p}
              variant={p === page ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => onPage(p)}
            >
              {p}
            </Button>
          );
        })}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPage(totalPages)}
          disabled={page >= totalPages}
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CUSTOM HOOK — data fetching
───────────────────────────────────────────── */
function useActivityLogs(params) {
  const [state, setState] = useState({
    data: [],
    total: 0,
    totalPages: 1,
    entities: [],
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== "" && v !== undefined && v !== null) query.set(k, String(v));
      });

      const res = await fetch(`/api/users/logs?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const json = await res.json();
      const meta = json.data?.meta ?? {};

      setState({
        data: json.data?.data ?? [],
        total: meta.total ?? 0,
        totalPages: meta.totalPages ?? 1,
        entities: meta.filters?.entities ?? [],
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err.message ?? "Failed to load activity logs.",
      }));
    }
  }, [JSON.stringify(params)]); // eslint-disable-line

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function ActivityMain() {
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const watchedValues = form.watch();

  // Debounced search to avoid firing on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(watchedValues.search ?? ""),
      350,
    );
    return () => clearTimeout(t);
  }, [watchedValues.search]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    watchedValues.action,
    watchedValues.entity,
    watchedValues.dateFrom,
    watchedValues.dateTo,
    watchedValues.sortBy,
    watchedValues.sortOrder,
    watchedValues.limit,
  ]);

  const queryParams = {
    page,
    limit: watchedValues.limit,
    search: debouncedSearch || undefined,
    action: watchedValues.action !== "all" ? watchedValues.action : undefined,
    entity: watchedValues.entity || undefined,
    dateFrom: watchedValues.dateFrom || undefined,
    dateTo: watchedValues.dateTo || undefined,
    sortBy: watchedValues.sortBy,
    sortOrder: watchedValues.sortOrder,
  };

  const { data, total, totalPages, entities, loading, error, refetch } =
    useActivityLogs(queryParams);

  /* ---- Sort toggle ---- */
  function handleSort(column) {
    startTransition(() => {
      const current = form.getValues("sortBy");
      const order = form.getValues("sortOrder");
      if (current === column) {
        form.setValue("sortOrder", order === "asc" ? "desc" : "asc");
      } else {
        form.setValue("sortBy", column);
        form.setValue("sortOrder", "desc");
      }
    });
  }

  /* ---- Reset all filters ---- */
  function handleReset() {
    form.reset(DEFAULT_VALUES);
    setPage(1);
  }

  const isFiltered =
    watchedValues.search ||
    watchedValues.action !== "all" ||
    watchedValues.entity ||
    watchedValues.dateFrom ||
    watchedValues.dateTo;

  /* ─── RENDER ─── */
  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Activity Log</h1>
              <p className="text-sm text-muted-foreground">
                Track all system actions and changes
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* ── Error Alert ── */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── Filter Bar ── */}
        <Form {...form}>
          <div className="flex flex-wrap items-end gap-3 bg-muted/40 rounded-xl p-4 border">
            {/* Search */}
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[200px]">
                  <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Search className="w-3 h-3" /> Search
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Search by description, name…"
                      className="h-9 bg-background"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Action filter */}
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem className="w-36">
                  <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Tag className="w-3 h-3" /> Action
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-9 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="updated">Updated</SelectItem>
                      <SelectItem value="deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Entity type filter */}
            <FormField
              control={form.control}
              name="entity"
              render={({ field }) => (
                <FormItem className="w-40">
                  <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Layers className="w-3 h-3" /> Type
                  </FormLabel>
                  <Select
                    value={field.value || "__all__"}
                    onValueChange={(v) =>
                      field.onChange(v === "__all__" ? "" : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 bg-background">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__all__">All Types</SelectItem>
                      {entities.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e.charAt(0).toUpperCase() + e.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Date range (collapsible popover) */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-9 mt-auto gap-1.5 ${
                    watchedValues.dateFrom || watchedValues.dateTo
                      ? "border-primary text-primary"
                      : ""
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Date Range
                  {(watchedValues.dateFrom || watchedValues.dateTo) && (
                    <Badge
                      variant="secondary"
                      className="ml-0.5 px-1 text-[10px]"
                    >
                      active
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 space-y-3" align="start">
                <p className="text-sm font-semibold">Filter by date</p>
                <Separator />
                <FormField
                  control={form.control}
                  name="dateFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        From
                      </FormLabel>
                      <FormControl>
                        <Input type="date" className="h-9" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        To
                      </FormLabel>
                      <FormControl>
                        <Input type="date" className="h-9" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    form.setValue("dateFrom", "");
                    form.setValue("dateTo", "");
                  }}
                >
                  Clear dates
                </Button>
              </PopoverContent>
            </Popover>

            {/* Per-page selector */}
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem className="w-24">
                  <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <SlidersHorizontal className="w-3 h-3" /> Per page
                  </FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Reset button */}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="mt-auto h-9 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset
              </Button>
            )}
          </div>
        </Form>

        {/* ── Summary chips ── */}
        {(isFiltered || total > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {loading
                ? "Loading…"
                : `${total.toLocaleString()} result${total !== 1 ? "s" : ""}`}
            </span>
            {watchedValues.action !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Action: {watchedValues.action}
                <button
                  onClick={() => form.setValue("action", "all")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {watchedValues.entity && (
              <Badge variant="secondary" className="gap-1">
                Type: {watchedValues.entity}
                <button
                  onClick={() => form.setValue("entity", "")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {(watchedValues.dateFrom || watchedValues.dateTo) && (
              <Badge variant="secondary" className="gap-1">
                Date range active
                <button
                  onClick={() => {
                    form.setValue("dateFrom", "");
                    form.setValue("dateTo", "");
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* ── Table ── */}
        <div className="rounded-xl border overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[160px]">
                  <SortButton
                    columnKey="timestamp"
                    label="Time"
                    currentSort={watchedValues.sortBy}
                    currentOrder={watchedValues.sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="w-[100px]">
                  <SortButton
                    columnKey="action"
                    label="Action"
                    currentSort={watchedValues.sortBy}
                    currentOrder={watchedValues.sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="w-[110px]">
                  <SortButton
                    columnKey="entity"
                    label="Type"
                    currentSort={watchedValues.sortBy}
                    currentOrder={watchedValues.sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="w-[110px]">
                  <SortButton
                    columnKey="entityName"
                    label="Name"
                    currentSort={watchedValues.sortBy}
                    currentOrder={watchedValues.sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="w-[110px]">Description</TableHead>
                <TableHead className="w-[100px]">
                  <span className="flex items-center gap-1 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                    <User className="w-3 h-3" /> User
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableSkeleton rows={watchedValues.limit} />
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Activity className="w-8 h-8 opacity-30" />
                      <p className="text-sm font-medium">No activity found</p>
                      {isFiltered && (
                        <Button variant="link" size="sm" onClick={handleReset}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((log) => (
                  <TableRow
                    key={log.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Timestamp */}
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default">
                            {format(new Date(log.timestamp), "MMM d, HH:mm")}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {format(new Date(log.timestamp), "PPpp")}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Action badge */}
                    <TableCell>
                      <ActionBadge action={log.action} />
                    </TableCell>

                    {/* Entity type */}
                    <TableCell>
                      <span className="text-sm font-medium capitalize text-foreground/80">
                        {log.entity}
                      </span>
                    </TableCell>

                    {/* Entity name */}
                    <TableCell className="font-medium text-sm max-w-[180px] truncate">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default truncate block">
                            {log.entityName ?? (
                              <span className="text-muted-foreground italic">
                                —
                              </span>
                            )}
                          </span>
                        </TooltipTrigger>
                        {log.entityName && (
                          <TooltipContent>{log.entityName}</TooltipContent>
                        )}
                      </Tooltip>
                    </TableCell>

                    {/* Description */}
                    <TableCell className="text-sm text-muted-foreground max-w-[260px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default line-clamp-1 block">
                            {log.description}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          {log.description}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* User */}
                    <TableCell>
                      <UserCell user={log.User} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            limit={watchedValues.limit}
            onPage={setPage}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

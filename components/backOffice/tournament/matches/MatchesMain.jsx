"use client";

import { useCallback, useReducer } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Swords, Upload } from "lucide-react";
import {
  useMatches,
  useCreateMatch,
  useUpdateMatch,
  useDeleteMatch,
  useCreateMatches,
} from "@/hooks/useMatch";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { MatchTable } from "./MatchesTable";
import { MatchForm } from "./MatchesForm";
import { LiveMatchControl } from "./LiveMatchControl";
import { BulkMatchUpload } from "./BulkMatchesUpload";
import PropTypes from "prop-types";

// ─── Constants ────────────────────────────────────────────────────────────────

const VIEW = { MATCHES: "matches", BULK: "bulk" };

const SHEET = { NONE: null, CREATE: "create", EDIT: "edit", LIVE: "live" };

// ─── UI state reducer ─────────────────────────────────────────────────────────

const initialUIState = {
  activeSheet: SHEET.NONE,
  selectedMatch: null,
  liveMatchId: null,
  activeView: VIEW.MATCHES,
};

function uiReducer(state, action) {
  switch (action.type) {
    case "OPEN_CREATE":
      return { ...state, activeSheet: SHEET.CREATE };

    case "OPEN_EDIT":
      return {
        ...state,
        activeSheet: SHEET.EDIT,
        selectedMatch: action.match,
      };

    case "OPEN_LIVE":
      return {
        ...state,
        activeSheet: SHEET.LIVE,
        liveMatchId: action.matchId,
      };

    case "CLOSE_SHEET":
      return {
        ...state,
        activeSheet: SHEET.NONE,
        selectedMatch: null,
      };

    case "SET_VIEW":
      return { ...state, activeView: action.view };

    default:
      return state;
  }
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function MatchesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}

// ─── View toggle ──────────────────────────────────────────────────────────────

function ViewToggle({ activeView, onChange }) {
  const tabs = [
    { id: VIEW.MATCHES, label: "Matches", icon: Swords },
    { id: VIEW.BULK, label: "Bulk Upload", icon: Upload },
  ];

  return (
    <div
      role="tablist"
      aria-label="Match management view"
      className="flex gap-1 rounded-lg border border-border p-1 bg-muted"
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={activeView === id}
          onClick={() => onChange(id)}
          className={[
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeView === id
              ? "bg-orange-500 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}

ViewToggle.propTypes = {
  activeView: PropTypes.oneOf(Object.values(VIEW)).isRequired,
  onChange: PropTypes.func.isRequired,
};

// ─── Main component ───────────────────────────────────────────────────────────

const MatchesMain = ({ games = [] }) => {
  const { tournamentId } = useParams();
  const [ui, dispatch] = useReducer(uiReducer, initialUIState);

  const {
    matches,
    setPage,
    pagination,
    loading,
    filters,
    updateFilters,
    refresh,
  } = useMatches({ tournamentId });
  const { createMatch, creating } = useCreateMatch({ tournamentId });
  const { updateMatch, updating } = useUpdateMatch({ tournamentId });
  const { createMatches, creating: bulkCreating } = useCreateMatches({ tournamentId });
  const { deleteMatch } = useDeleteMatch();

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = useCallback(
    async (data) => {
      await createMatch(data);
      dispatch({ type: "CLOSE_SHEET" });
      refresh();
    },
    [createMatch, refresh],
  );

  const handleUpdate = useCallback(
    async (data) => {
      await updateMatch(ui.selectedMatch.id, data);
      dispatch({ type: "CLOSE_SHEET" });
      refresh();
    },
    [updateMatch, ui.selectedMatch, refresh],
  );

  const handleDelete = useCallback(
    async (id, name) => {
      await deleteMatch(id, name);
      refresh();
    },
    [deleteMatch, refresh],
  );

  const handleEdit = useCallback(
    (match) => dispatch({ type: "OPEN_EDIT", match }),
    [],
  );

  const handleLiveControl = useCallback(
    (match) => dispatch({ type: "OPEN_LIVE", matchId: match.id }),
    [],
  );

  const handleBulkUploadDone = useCallback(() => {
    refresh();
    dispatch({ type: "SET_VIEW", view: VIEW.MATCHES });
  }, [refresh]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <MatchesSkeleton />;

  const isBulk = ui.activeView === VIEW.BULK;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-orange-500">
            Matches
          </h1>
          <p className="text-muted-foreground">
            Schedule, manage, and control live matches for this tournament
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ViewToggle
            activeView={ui.activeView}
            onChange={(view) => dispatch({ type: "SET_VIEW", view })}
          />

          {!isBulk && (
            <Button
              onClick={() => dispatch({ type: "OPEN_CREATE" })}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Schedule Match
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isBulk ? (
        <BulkMatchUpload
          onSubmit={createMatches}
          onCancel={() => setOpen(false)}
          loading={bulkCreating}
          onDone={handleBulkUploadDone}
          tournamentId={tournamentId}
        />
      ) : (
        <MatchTable
          matches={matches}
          pagination={pagination}
          filters={filters}
          onFilterChange={updateFilters}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onLiveControl={handleLiveControl}
        />
      )}

      {/* Create sheet */}
      <MatchSheet
        open={ui.activeSheet === SHEET.CREATE}
        title="Schedule New Match"
        description="Fill in the match details below"
        onOpenChange={(open) => !open && dispatch({ type: "CLOSE_SHEET" })}
      >
        <MatchForm
          onSubmit={handleCreate}
          onCancel={() => dispatch({ type: "CLOSE_SHEET" })}
          loading={creating}
          tournamentId={tournamentId}
          games={games}
        />
      </MatchSheet>

      {/* Edit sheet */}
      <MatchSheet
        open={ui.activeSheet === SHEET.EDIT}
        title="Edit Match"
        description="Update the match details below"
        onOpenChange={(open) => !open && dispatch({ type: "CLOSE_SHEET" })}
      >
        <MatchForm
          onSubmit={handleUpdate}
          onCancel={() => dispatch({ type: "CLOSE_SHEET" })}
          loading={updating}
          initialData={ui.selectedMatch}
          tournamentId={tournamentId}
          games={games}
        />
      </MatchSheet>

      {/* Live control sheet */}
      <Sheet
        open={ui.activeSheet === SHEET.LIVE}
        onOpenChange={(open) => !open && dispatch({ type: "CLOSE_SHEET" })}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 overflow-y-auto"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Live Match Control</SheetTitle>
          </SheetHeader>
          {ui.liveMatchId && (
            <LiveMatchControl
              matchId={ui.liveMatchId}
              tournamentId={tournamentId}
              onClose={() => dispatch({ type: "CLOSE_SHEET" })}
              onMatchUpdate={refresh}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

MatchesMain.propTypes = {
  games: PropTypes.array,
};

export default MatchesMain;

// ─── Shared sheet wrapper ─────────────────────────────────────────────────────

function MatchSheet({ open, onOpenChange, title, description, children }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto bg-white"
      >
        <SheetHeader>
          <SheetTitle className="text-slate-800">{title}</SheetTitle>
          <SheetDescription className="text-slate-600">
            {description}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

MatchSheet.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Play, Square, Pause, Trophy, Users,
  Radio, Clock, AlertTriangle, CheckCircle2,
  ChevronsUpDown, Check, StickyNote, Loader2,
  ChevronRight, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
// import { useLiveMatchControl, useMatch } from "@/hooks/useMatch";
import { format, differenceInMinutes } from "date-fns";
import { toast } from "sonner";
import { useLiveMatchControl, useMatch } from "@/hooks/useMatch";

/* ---- Period config by sport ---- */

const SPORT_PERIODS = {
  FOOTBALL: [
    { value: "WARM_UP", label: "Warm Up", phase: "pre" },
    { value: "FIRST_HALF", label: "1st Half", phase: "active" },
    { value: "HALF_TIME", label: "Half Time", phase: "break" },
    { value: "SECOND_HALF", label: "2nd Half", phase: "active" },
    { value: "EXTRA_TIME_FIRST", label: "Extra Time 1st", phase: "active" },
    { value: "EXTRA_TIME_SECOND", label: "Extra Time 2nd", phase: "active" },
    { value: "PENALTY_SHOOTOUT", label: "Penalty Shootout", phase: "active" },
    { value: "FULL_TIME", label: "Full Time", phase: "end" },
  ],
  FIELD_HOCKEY: [
    { value: "WARM_UP", label: "Warm Up", phase: "pre" },
    { value: "FIRST_HALF", label: "1st Half", phase: "active" },
    { value: "HALF_TIME", label: "Half Time", phase: "break" },
    { value: "SECOND_HALF", label: "2nd Half", phase: "active" },
    { value: "PENALTY_SHOOTOUT", label: "Penalty Shootout", phase: "active" },
    { value: "FULL_TIME", label: "Full Time", phase: "end" },
  ],
  BASKETBALL: [
    { value: "WARM_UP", label: "Warm Up", phase: "pre" },
    { value: "FIRST_QUARTER", label: "Q1", phase: "active" },
    { value: "QUARTER_BREAK", label: "Break", phase: "break" },
    { value: "SECOND_QUARTER", label: "Q2", phase: "active" },
    { value: "HALF_TIME", label: "Half Time", phase: "break" },
    { value: "THIRD_QUARTER", label: "Q3", phase: "active" },
    { value: "QUARTER_BREAK", label: "Break", phase: "break" },
    { value: "FOURTH_QUARTER", label: "Q4", phase: "active" },
    { value: "FULL_TIME", label: "Full Time", phase: "end" },
  ],
  CRICKET: [
    { value: "WARM_UP", label: "Warm Up", phase: "pre" },
    { value: "FIRST_INNINGS", label: "1st Innings", phase: "active" },
    { value: "INNINGS_BREAK", label: "Innings Break", phase: "break" },
    { value: "SECOND_INNINGS", label: "2nd Innings", phase: "active" },
    { value: "SUPER_OVER", label: "Super Over", phase: "active" },
    { value: "FULL_TIME", label: "Match Over", phase: "end" },
  ],
  VOLLEYBALL: [
    { value: "WARM_UP", label: "Warm Up", phase: "pre" },
    { value: "SET_1", label: "Set 1", phase: "active" },
    { value: "SET_BREAK", label: "Set Break", phase: "break" },
    { value: "SET_2", label: "Set 2", phase: "active" },
    { value: "SET_BREAK", label: "Set Break", phase: "break" },
    { value: "SET_3", label: "Set 3 (Decider)", phase: "active" },
    { value: "FULL_TIME", label: "Match Over", phase: "end" },
  ],
  BADMINTON: [
    { value: "WARM_UP", label: "Warm Up", phase: "pre" },
    { value: "SET_1", label: "Game 1", phase: "active" },
    { value: "SET_BREAK", label: "Break", phase: "break" },
    { value: "SET_2", label: "Game 2", phase: "active" },
    { value: "SET_BREAK", label: "Break", phase: "break" },
    { value: "SET_3", label: "Game 3 (Decider)", phase: "active" },
    { value: "FULL_TIME", label: "Match Over", phase: "end" },
  ],
  TENNIS: [
    { value: "WARM_UP", label: "Warm Up", phase: "pre" },
    { value: "SET_1", label: "Set 1", phase: "active" },
    { value: "SET_2", label: "Set 2", phase: "active" },
    { value: "SET_3", label: "Set 3", phase: "active" },
    { value: "SET_4", label: "Set 4", phase: "active" },
    { value: "SET_5", label: "Set 5 (Final)", phase: "active" },
    { value: "TIE_BREAKER", label: "Tie Breaker", phase: "active" },
    { value: "FULL_TIME", label: "Match Over", phase: "end" },
  ],
};

const DEFAULT_PERIODS = [
  { value: "WARM_UP", label: "Warm Up", phase: "pre" },
  { value: "FIRST_HALF", label: "1st Period", phase: "active" },
  { value: "HALF_TIME", label: "Break", phase: "break" },
  { value: "SECOND_HALF", label: "2nd Period", phase: "active" },
  { value: "FULL_TIME", label: "Full Time", phase: "end" },
];

const STATUS_CONFIG = {
  SCHEDULED:  { label: "Scheduled",  color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  DELAYED:    { label: "Delayed",    color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  LIVE:       { label: "LIVE",       color: "bg-red-100 text-red-700", dot: "bg-red-500 animate-ping" },
  SUSPENDED:  { label: "Suspended",  color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  COMPLETED:  { label: "Completed",  color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  POSTPONED:  { label: "Postponed",  color: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  CANCELLED:  { label: "Cancelled",  color: "bg-red-100 text-red-400", dot: "bg-red-300" },
  ABANDONED:  { label: "Abandoned",  color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  WALKOVER:   { label: "Walkover",   color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  NO_RESULT:  { label: "No Result",  color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
};

const TERMINAL_STATUSES = ["COMPLETED", "CANCELLED", "ABANDONED", "WALKOVER", "NO_RESULT", "POSTPONED"];

/* ---- Elapsed timer ---- */

function ElapsedTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const update = () => {
      setElapsed(differenceInMinutes(new Date(), new Date(startTime)));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return null;
  const h = Math.floor(elapsed / 60);
  const m = elapsed % 60;
  return (
    <span className="font-mono text-sm font-semibold tabular-nums text-red-600">
      {h > 0 ? `${h}h ` : ""}{m}m
    </span>
  );
}

/* ---- Confirm action dialog ---- */

function ConfirmAction({ open, onOpenChange, title, description, onConfirm, loading, variant = "default" }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={variant === "destructive"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-orange-500 hover:bg-orange-600"}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---- Main LiveMatchControl ---- */

export function LiveMatchControl({ matchId, onClose, onMatchUpdate }) {
  const { match, loading: matchLoading, refresh } = useMatch(matchId);
  const controls = useLiveMatchControl(matchId);

  const [noteText, setNoteText] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [winnerPopoverOpen, setWinnerPopoverOpen] = useState(false);
  const [momPopoverOpen, setMomPopoverOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, title: "", description: "" });

  const isTerminal = match && TERMINAL_STATUSES.includes(match.status);
  const isLive = match?.status === "LIVE";
  const canStart = match?.status === "SCHEDULED" || match?.status === "DELAYED";

  const periods = SPORT_PERIODS[match?.sport] || DEFAULT_PERIODS;
  const participants = match?.participants || [];

  // All players from both teams for MoM
  const allPlayers = participants.flatMap((p) =>
    (p.team?.players || []).map((pl) => ({ ...pl, teamName: p.team?.familyName }))
  );

  const handleAction = async (actionFn, successMsg) => {
    try {
      const result = await actionFn();
      toast.success(successMsg);
      refresh();
      onMatchUpdate?.(result);
    } catch { /* handled in hook */ }
  };

  const openConfirm = (action, title, description) => {
    setConfirmDialog({ open: true, action, title, description });
  };

  const executeConfirm = async () => {
    if (!confirmDialog.action) return;
    await confirmDialog.action();
    setConfirmDialog({ open: false, action: null, title: "", description: "" });
  };

  if (matchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!match) return null;

  const statusCfg = STATUS_CONFIG[match.status] || STATUS_CONFIG.SCHEDULED;

  return (
    <div className="space-y-0 max-h-[85vh] overflow-y-auto">

      {/* ---- Match Header ---- */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${statusCfg.dot}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${statusCfg.dot.replace("animate-ping", "")}`} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800 leading-tight">
                {match.name || `${match.sport} Match #${match.matchNo}`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {match.round?.replace(/_/g, " ")}
                {match.pool ? ` · Pool ${match.pool}` : ""}
                {" · "}{match.venue?.replace(/_/g, " ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${statusCfg.color} border-0 text-sm px-3 py-1`}>
              {isLive ? "🔴 " : ""}{statusCfg.label}
            </Badge>
            {isLive && match.actualStartTime && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <ElapsedTimer startTime={match.actualStartTime} />
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={refresh} className="h-8 w-8 p-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Teams row */}
        {participants.length > 0 && (
          <div className="mt-3 flex items-center gap-3">
            {participants.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted-foreground font-bold text-sm">vs</span>}
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border",
                    match.winnerId === p.teamId
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  )}
                >
                  {match.winnerId === p.teamId && <Trophy className="h-3.5 w-3.5 text-green-600" />}
                  {p.team?.familyName || "TBD"}
                </div>
              </div>
            ))}
            {match.isDraw && (
              <Badge variant="outline" className="bg-slate-100 text-slate-600">Draw</Badge>
            )}
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">

        {/* ---- PRIMARY ACTIONS ---- */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Match Control
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {/* Start */}
            {canStart && (
              <Button
                onClick={() => openConfirm(
                  () => handleAction(controls.startMatch, "Match started!"),
                  "Start Match?",
                  "This will mark the match as LIVE and record the start time."
                )}
                disabled={controls.loading}
                className="h-12 bg-green-600 hover:bg-green-700 text-white col-span-2 sm:col-span-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Match
              </Button>
            )}

            {/* End */}
            {isLive && (
              <Button
                onClick={() => openConfirm(
                  () => handleAction(controls.endMatch, "Match ended!"),
                  "End Match?",
                  "This will mark the match as COMPLETED and record the end time."
                )}
                disabled={controls.loading}
                className="h-12 bg-slate-700 hover:bg-slate-800 text-white col-span-2 sm:col-span-1"
              >
                <Square className="mr-2 h-4 w-4" />
                End Match
              </Button>
            )}

            {/* Suspend */}
            {isLive && (
              <Button
                variant="outline"
                onClick={() => openConfirm(
                  () => handleAction(() => controls.setStatus("SUSPENDED"), "Match suspended"),
                  "Suspend Match?",
                  "Temporarily stop the match (rain, injury, etc.)"
                )}
                disabled={controls.loading}
                className="h-12 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Pause className="mr-2 h-4 w-4" />
                Suspend
              </Button>
            )}

            {/* Resume from suspended */}
            {match.status === "SUSPENDED" && (
              <Button
                onClick={() => handleAction(
                  () => controls.setStatus("LIVE"),
                  "Match resumed!"
                )}
                disabled={controls.loading}
                className="h-12 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}

            {/* Abandon */}
            {(isLive || match.status === "SUSPENDED") && (
              <Button
                variant="outline"
                onClick={() => openConfirm(
                  () => handleAction(() => controls.setStatus("ABANDONED"), "Match abandoned"),
                  "Abandon Match?",
                  "This cannot be undone. The match will be marked as abandoned.",
                )}
                disabled={controls.loading}
                className="h-12 border-red-300 text-red-600 hover:bg-red-50"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Abandon
              </Button>
            )}

            {/* No result */}
            {!isTerminal && (
              <Button
                variant="outline"
                onClick={() => openConfirm(
                  () => handleAction(() => controls.setStatus("NO_RESULT"), "Set as No Result"),
                  "No Result?",
                  "Mark this match as no result."
                )}
                disabled={controls.loading}
                className="h-12 text-slate-600"
              >
                No Result
              </Button>
            )}
          </div>
        </section>

        {/* ---- PERIOD CONTROL ---- */}
        {(isLive || match.status === "SUSPENDED") && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Current Period
            </h3>

            {/* Period quick-select pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {periods.map((p) => (
                <button
                  key={p.value + p.label}
                  type="button"
                  onClick={() => {
                    setSelectedPeriod(p.value);
                    handleAction(
                      () => controls.setPeriod(p.value),
                      `Period set: ${p.label}`
                    );
                  }}
                  disabled={controls.loading || match.currentPeriod === p.value}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                    match.currentPeriod === p.value
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : p.phase === "active"
                      ? "border-green-200 text-green-700 hover:bg-green-50 bg-white"
                      : p.phase === "break"
                      ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50 bg-white"
                      : p.phase === "end"
                      ? "border-slate-200 text-slate-600 hover:bg-slate-50 bg-white"
                      : "border-blue-200 text-blue-600 hover:bg-blue-50 bg-white"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {match.currentPeriod && (
              <p className="text-sm text-muted-foreground">
                Current: <span className="font-semibold text-slate-700">
                  {periods.find((p) => p.value === match.currentPeriod)?.label || match.currentPeriod}
                </span>
              </p>
            )}
          </section>
        )}

        {/* ---- RESULT ---- */}
        {(isLive || match.status === "SUSPENDED" || match.status === "COMPLETED") && participants.length >= 2 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Result
            </h3>
            <div className="flex flex-wrap gap-2">
              {/* Winner buttons per team */}
              {participants.map((p) => (
                <Button
                  key={p.id}
                  variant="outline"
                  onClick={() => openConfirm(
                    () => handleAction(
                      () => controls.setWinner(p.teamId, p.team?.familyName),
                      `Winner set: ${p.team?.familyName}`
                    ),
                    `Set Winner: ${p.team?.familyName}?`,
                    `This will mark ${p.team?.familyName} as the winner.`
                  )}
                  disabled={controls.loading || match.winnerId === p.teamId}
                  className={cn(
                    "h-10 border-2 transition-all",
                    match.winnerId === p.teamId
                      ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                      : "border-slate-200 hover:border-green-300 hover:bg-green-50"
                  )}
                >
                  {match.winnerId === p.teamId && <Trophy className="mr-2 h-4 w-4 text-green-600" />}
                  {p.team?.familyName}
                </Button>
              ))}

              {/* Draw button */}
              <Button
                variant="outline"
                onClick={() => openConfirm(
                  () => handleAction(controls.setDraw, "Match set as draw"),
                  "Set as Draw?",
                  "This will mark the match result as a draw."
                )}
                disabled={controls.loading || match.isDraw}
                className={cn(
                  "h-10 border-2 transition-all",
                  match.isDraw
                    ? "border-slate-500 bg-slate-100 font-semibold"
                    : "border-slate-200 hover:border-slate-400"
                )}
              >
                Draw
              </Button>
            </div>
          </section>
        )}

        {/* ---- MAN OF THE MATCH ---- */}
        {(isLive || match.status === "COMPLETED") && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Man of the Match
            </h3>
            {match.manOfTheMatch ? (
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <div>
                    <div className="font-semibold text-sm">{match.manOfTheMatch.playerName}</div>
                    {match.manOfTheMatch.jerseyNumber && (
                      <div className="text-xs text-muted-foreground">#{match.manOfTheMatch.jerseyNumber}</div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(
                    () => controls.setManOfMatch(null),
                    "Man of the match cleared"
                  )}
                  className="text-slate-400 hover:text-red-500 h-8"
                >
                  Clear
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {allPlayers.length === 0
                    ? "Player list unavailable. Enter player ID manually."
                    : "Select from participating teams' players."}
                </p>

                {allPlayers.length > 0 ? (
                  <Popover open={momPopoverOpen} onOpenChange={setMomPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full h-10 justify-between font-normal">
                        Select player...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-white" align="start">
                      <Command>
                        <CommandInput placeholder="Search players..." />
                        <CommandList>
                          <CommandEmpty>No player found.</CommandEmpty>
                          <CommandGroup>
                            {allPlayers.map((pl) => (
                              <CommandItem
                                key={pl.id}
                                value={pl.playerName}
                                onSelect={() => {
                                  handleAction(
                                    () => controls.setManOfMatch(pl.id),
                                    `Man of the match: ${pl.playerName}`
                                  );
                                  setMomPopoverOpen(false);
                                }}
                              >
                                <div className="flex-1">
                                  <span className="font-medium">{pl.playerName}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {pl.teamName} {pl.jerseyNumber ? `· #${pl.jerseyNumber}` : ""}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const id = prompt("Enter player ID:");
                      if (id) handleAction(
                        () => controls.setManOfMatch(id),
                        "Man of the match set"
                      );
                    }}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Set Manually
                  </Button>
                )}
              </div>
            )}
          </section>
        )}

        {/* ---- STATUS OVERRIDE ---- */}
        {!isTerminal && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Override Status
            </h3>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="flex-1 h-10">
                  <SelectValue placeholder="Select a status..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                    <SelectItem key={v} value={v}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={!selectedStatus || controls.loading}
                onClick={() => {
                  if (!selectedStatus) return;
                  openConfirm(
                    () => handleAction(
                      () => controls.setStatus(selectedStatus),
                      `Status updated to ${selectedStatus}`
                    ),
                    `Set status to ${selectedStatus}?`,
                    "This will immediately update the match status."
                  );
                }}
                className="h-10 px-4"
              >
                Apply
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </section>
        )}

        {/* ---- NOTES ---- */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Match Notes
          </h3>
          {match.notes && (
            <div className="mb-3 p-3 bg-slate-50 rounded-lg border text-sm text-slate-700 whitespace-pre-wrap">
              {match.notes}
            </div>
          )}
          <div className="flex gap-2 items-end">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note (replaces existing note)..."
              rows={2}
              className="flex-1 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500 resize-none"
            />
            <Button
              variant="outline"
              disabled={!noteText.trim() || controls.loading}
              onClick={() => {
                handleAction(
                  () => controls.addNote(noteText),
                  "Note saved"
                ).then(() => setNoteText(""));
              }}
              className="h-10 self-end"
            >
              <StickyNote className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* ---- MATCH INFO ---- */}
        <section className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Scheduled</p>
              <p className="font-medium">
                {match.scheduledOn ? format(new Date(match.scheduledOn), "dd MMM, hh:mm a") : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Actual Start</p>
              <p className="font-medium">
                {match.actualStartTime ? format(new Date(match.actualStartTime), "hh:mm a") : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Actual End</p>
              <p className="font-medium">
                {match.actualEndTime ? format(new Date(match.actualEndTime), "hh:mm a") : "—"}
              </p>
            </div>
            {match.sponsor && (
              <div>
                <p className="text-muted-foreground text-xs">Sponsor</p>
                <p className="font-medium">{match.sponsor}</p>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Confirm dialog */}
      <ConfirmAction
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((p) => ({ ...p, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={executeConfirm}
        loading={controls.loading}
      />
    </div>
  );
}
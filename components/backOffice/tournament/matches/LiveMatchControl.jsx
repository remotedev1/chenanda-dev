"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useLiveMatchControl } from "@/hooks/useLiveMatches";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Crown,
  Flag,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  Swords,
  Target,
  Trash2,
  Trophy,
  Users,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react";
import { useFamily } from "@/hooks/useFamily";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */

const HOCKEY_GOAL_TYPES = [
  { value: "FIELD_GOAL", label: "Field Goal", icon: "⛳" },
  { value: "PENALTY_CORNER", label: "Penalty Corner", icon: "🔶" },
  { value: "PENALTY_STROKE", label: "Penalty Stroke", icon: "🎯" },
];

const HOCKEY_PERIODS = [
  { value: "WARM_UP", label: "Warm Up" },
  { value: "FIRST_HALF", label: "1st Half" },
  { value: "HALF_TIME", label: "Half Time" },
  { value: "SECOND_HALF", label: "2nd Half" },
  { value: "FIRST_QUARTER", label: "1st Quarter" },
  { value: "SECOND_QUARTER", label: "2nd Quarter" },
  { value: "THIRD_QUARTER", label: "3rd Quarter" },
  { value: "FOURTH_QUARTER", label: "4th Quarter" },
  { value: "PENALTY_SHOOTOUT", label: "Shootout" },
];

const MATCH_STATUSES = [
  { value: "DELAYED", label: "Delayed", color: "bg-yellow-500" },
  { value: "LIVE", label: "Live", color: "bg-emerald-500" },
  { value: "COMPLETED", label: "Completed", color: "bg-blue-500" },
  { value: "POSTPONED", label: "Postponed", color: "bg-purple-500" },
  { value: "WALKOVER", label: "Walkover", color: "bg-amber-500" },
];

/* ─────────────────────────────────────────────
   Utility hooks / helpers
───────────────────────────────────────────── */

function useConfirm() {
  const [state, setState] = useState({
    open: false,
    title: "",
    desc: "",
    onConfirm: null,
  });
  const confirm = useCallback(
    (title, desc, onConfirm) =>
      setState({ open: true, title, desc, onConfirm }),
    [],
  );
  const handleConfirm = useCallback(() => {
    state.onConfirm?.();
    setState((s) => ({ ...s, open: false }));
  }, [state]);
  return {
    ...state,
    confirm,
    handleConfirm,
    setOpen: (open) => setState((s) => ({ ...s, open })),
  };
}

function removeUnderscore(str) {
  return (str || "").replace(/_/g, " ");
}

function getGoalCount(team) {
  if (!team) return 0;
  return team.hockeyData?.goals ?? team.footballData?.goals ?? 0;
}

function getShootoutResults(team) {
  return team?.hockeyData?.shootoutResults ?? [];
}

function getGoalDetails(team) {
  return team?.hockeyData?.goalDetails ?? team?.footballData?.goalDetails ?? [];
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

function ConnectionBadge({ isConnected, activeUsers }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold border transition-all ${
        isConnected
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-red-50 border-red-200 text-red-600"
      }`}
    >
      {isConnected ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          LIVE · {activeUsers} watching
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          OFFLINE
        </>
      )}
    </div>
  );
}

function ScoreBoard({ match }) {
  const t1 = match.participants[0];
  const t2 = match.participants[1];
  const score1 = getGoalCount(t1);
  const score2 = getGoalCount(t2);
  const shootout1 = getShootoutResults(t1);
  const shootout2 = getShootoutResults(t2);
  const hasShootout = shootout1.length > 0 || shootout2.length > 0;
  const status = MATCH_STATUSES.find((s) => s.value === match.status);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200 shadow-lg shadow-slate-100">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none" />

      {/* Match meta */}
      <div className="relative flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 text-xs">
            {removeUnderscore(match.round)}
            {match.pool ? ` · Pool ${match.pool}` : ""}
          </span>
          <span className="text-slate-400 text-xs">
            · {removeUnderscore(match.venue)} · Match #{match.matchNo}
          </span>
        </div>

        {match.currentPeriod && (
          <span className="text-xs text-slate-500 font-medium">
            {removeUnderscore(match.currentPeriod)}
          </span>
        )}
      </div>

      {/* Scoreline */}
      <div className="relative flex items-center justify-between px-8 py-6">
        {/* Team 1 */}
        <div className="flex-1 text-left">
          <h2 className="text-slate-900 font-black text-xl md:text-2xl lg:text-3xl tracking-tight leading-none mb-3">
            {t1?.family?.toUpperCase()}
          </h2>
          {t1?.walkover && (
            <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-xs">
              Walkover
            </Badge>
          )}
          {match.winnerId === t1?.familyId && (
            <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 text-xs gap-1">
              <Crown className="h-3 w-3" /> Winner
            </Badge>
          )}
        </div>

        {/* Score */}
        <div className="flex items-center gap-4 mx-4">
          <span
            className={`text-5xl md:text-6xl lg:text-7xl font-black tabular-nums transition-all ${
              score1 > score2 ? "text-slate-900" : "text-slate-300"
            }`}
          >
            {score1}
          </span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-slate-300 text-2xl font-light">:</span>
            {match.isDraw && (
              <span className="text-xs text-slate-500 font-mono uppercase">
                Draw
              </span>
            )}
          </div>
          <span
            className={`text-5xl md:text-6xl lg:text-7xl font-black tabular-nums transition-all ${
              score2 > score1 ? "text-slate-900" : "text-slate-300"
            }`}
          >
            {score2}
          </span>
        </div>

        {/* Team 2 */}
        <div className="flex-1 text-right">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1 font-mono">
            Away
          </p>
          <h2 className="text-slate-900 font-black text-xl md:text-2xl lg:text-3xl tracking-tight leading-none mb-3">
            {t2?.family?.toUpperCase()}
          </h2>
          {t2?.walkover && (
            <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-xs">
              Walkover
            </Badge>
          )}
          {match.winnerId === t2?.familyId && (
            <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 text-xs gap-1">
              <Crown className="h-3 w-3" /> Winner
            </Badge>
          )}
        </div>
      </div>

      {/* Shootout row */}
      {hasShootout && (
        <div className="flex items-center justify-between px-8 pb-5 gap-6">
          <div className="flex items-center gap-1.5 flex-1">
            {shootout1.map((scored, i) => (
              <ShootoutDot key={i} scored={scored} />
            ))}
          </div>
          <span className="text-slate-400 text-xs font-mono uppercase tracking-widest shrink-0">
            Shootout
          </span>
          <div className="flex items-center gap-1.5 flex-1 justify-end">
            {shootout2.map((scored, i) => (
              <ShootoutDot key={i} scored={scored} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShootoutDot({ scored }) {
  return (
    <div
      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
        scored
          ? "bg-emerald-50 border-emerald-400 text-emerald-600"
          : "bg-red-50 border-red-400 text-red-500"
      }`}
    >
      {scored ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
    </div>
  );
}

function GoalRow({ goal, index, canDelete, onDelete, loading }) {
  return (
    <div className="group flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm">
      <span className="text-slate-400 text-xs font-mono w-5 shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 text-sm font-semibold truncate">
          {goal.playerName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-slate-500 text-xs font-mono">
            {goal.minute}
          </span>
          {goal.period && (
            <span className="text-slate-400 text-[10px] uppercase tracking-wide">
              {removeUnderscore(goal.period)}
            </span>
          )}
          {goal.type && (
            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
              {removeUnderscore(goal.type)}
            </span>
          )}
        </div>
      </div>
      {canDelete && (
        <button
          onClick={() => onDelete(index)}
          disabled={loading}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-slate-400" />
      <h4 className="text-slate-600 text-sm font-semibold uppercase tracking-wider">
        {title}
      </h4>
      {count !== undefined && (
        <span className="ml-auto text-slate-400 text-xs font-mono">
          {count}
        </span>
      )}
    </div>
  );
}

function PlayerCombobox({
  players,
  loading,
  value,
  onSelect,
  onCreateAndSelect,
  isCreating,
  accentColor = "cyan",
}) {
  const [query, setQuery] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const filtered = players.filter((p) =>
    p.playerName.toLowerCase().includes(query.toLowerCase()),
  );

  const selected = players.find((p) => p.id === value);

  const showCreate = query.trim().length > 0 && filtered.length === 0;

  const accentBtn =
    accentColor === "cyan"
      ? "bg-cyan-50 border-cyan-300 text-cyan-700 hover:bg-cyan-100"
      : "bg-violet-50 border-violet-300 text-violet-700 hover:bg-violet-100";

  const CreateForm = () => (
    <div className="flex flex-col gap-2">
      <input
        type="number"
        placeholder="Jersey # (optional)"
        value={jerseyNumber}
        onChange={(e) => setJerseyNumber(Number(e.target.value))}
        className="h-8 px-3 w-full rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
      />
      <button
        type="button"
        onClick={async () => {
          await onCreateAndSelect(query.trim(), jerseyNumber || null);
          setOpen(false);
          setQuery("");
          setJerseyNumber("");
        }}
        disabled={isCreating}
        className={`w-full flex items-center justify-center gap-2 h-9 px-3 rounded-lg text-xs font-semibold border transition-all ${accentBtn}`}
      >
        {isCreating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {isCreating ? "Creating…" : `Add "${query.trim()}"`}
      </button>
    </div>
  );

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="w-full h-10 flex items-center justify-between px-3 rounded-lg bg-white border border-black text-sm text-slate-800 hover:border-slate-400 transition-colors shadow-sm"
      >
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {selected
            ? `${selected.playerName}${selected.jerseyNumber ? ` · #${selected.jerseyNumber}` : ""}`
            : loading
              ? "Loading players…"
              : "Search or add player…"}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-blue-600 border border-slate-200 shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search or create…"
              className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Case 1: no query yet */}
          {!query.trim() && (
            <div className="max-h-40 overflow-y-auto">
              {players.length === 0 ? (
                <p className="px-3 py-4 text-center text-slate-400 text-sm">
                  {loading
                    ? "Loading…"
                    : "No players yet — type a name to add one"}
                </p>
              ) : (
                players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelect(p.id, p.playerName);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors  text-white hover:bg-slate-500 
                     "
                  >
                    {value === p.id ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-white shrink-0" />
                    ) : (
                      <span className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="capitalize">{p.playerName}</span>
                    {p.jerseyNumber && (
                      <span className="ml-auto text-slate-400 text-xs font-mono">
                        #{p.jerseyNumber}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Case 2: query typed, matches found → show list + create at bottom */}
          {query.trim() && filtered.length > 0 && (
            <>
              <div className="max-h-40 overflow-y-auto">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelect(p.id, p.playerName);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors hover:bg-slate-50 ${
                      value === p.id
                        ? "bg-slate-50 text-slate-900"
                        : "text-slate-700"
                    }`}
                  >
                    {value === p.id ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>{p.playerName}</span>
                    {p.jerseyNumber && (
                      <span className="ml-auto text-slate-400 text-xs font-mono">
                        #{p.jerseyNumber}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {showCreate && (
                <div className="border-t border-slate-100 p-3 space-y-2 bg-slate-50">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-1">
                    Add &ldquo;{query.trim()}&rdquo; as new player
                  </p>
                  <CreateForm />
                </div>
              )}
            </>
          )}

          {/* Case 3: query typed, zero matches → show create immediately */}
          {query.trim() && filtered.length === 0 && (
            <div className="p-3 space-y-2">
              <p className="text-white text-xs font-semibold uppercase tracking-wider px-1">
                No results — add &ldquo;{query.trim()}&rdquo;
              </p>
              <CreateForm />
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpen(false);
            setQuery("");
          }}
        />
      )}
    </div>
  );
}
function TeamPanel({
  team,
  isHome,
  matchStatus,
  matchSport,
  actions,
  isAnyPending,
  confirm,
  players,
  familyLoading,
  invalidate,
}) {
  const isCompleted = matchStatus === "COMPLETED" || matchStatus === "WALKOVER";
  const goalDetails = getGoalDetails(team);
  const shootout = getShootoutResults(team);
  const score = getGoalCount(team);

  const [goalForm, setGoalForm] = useState({
    playerId: "",
    playerName: "",
    jerseyNumber: null,
    minute: null,
    type: "FIELD_GOAL",
  });
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [extraPlayers, setExtraPlayers] = useState([]); // ✅ NEW

  // ✅ Merge server players with any optimistically added ones
  const mergedPlayers = [
    ...players,
    ...extraPlayers.filter((ep) => !players.some((p) => p.id === ep.id)),
  ];

  const handleAddGoal = async () => {
    if (!goalForm.playerId) return toast.error("Select a player");
    if (!goalForm.minute) return toast.error("Enter goal time");
    await actions.addHockeyGoal(team.familyId, goalForm);
    setGoalForm({
      playerId: "",
      playerName: "",
      minute: null,
      jerseyNumber: null,
      type: "FIELD_GOAL",
    });
    setShowGoalForm(false);
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col transition-all ${
        isHome
          ? "bg-gradient-to-br from-cyan-50/80 via-white to-white border-black"
          : "bg-gradient-to-br from-violet-50/80 via-white to-white border-black"
      }`}
    >
      {/* Team header */}
      <div className={"px-5 py-4 border-b border-black"}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-900 font-black text-lg tracking-tight mt-0.5">
              {team.family?.toUpperCase()}
            </h3>
          </div>
          <div
            className={`text-4xl font-black tabular-nums ${
              isHome ? "text-cyan-600" : "text-violet-600"
            }`}
          >
            {score}
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-6">
        {/* ── ADD GOAL ── */}
        {!isCompleted && (
          <div>
            <SectionHeader
              icon={Target}
              title="Goals"
              count={goalDetails.length}
            />

            <button
              onClick={() => setShowGoalForm((v) => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all mb-3 ${
                showGoalForm
                  ? isHome
                    ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                    : "bg-violet-50 border-violet-300 text-violet-700"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Log Goal
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showGoalForm ? "rotate-180" : ""}`}
              />
            </button>

            {showGoalForm && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {/* Player combobox */}
                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">
                    Player
                  </Label>
                  <PlayerCombobox
                    players={mergedPlayers} // ✅ use mergedPlayers
                    loading={familyLoading}
                    value={goalForm.playerId}
                    onSelect={(id, name) =>
                      setGoalForm((f) => ({
                        ...f,
                        playerId: id,
                        playerName: name,
                        jerseyNumber:
                          mergedPlayers.find((p) => p.id === id)
                            ?.jerseyNumber || // ✅ use mergedPlayers
                          null,
                      }))
                    }
                    onCreateAndSelect={async (name, jersey) => {
                      setAddingPlayer(true);
                      try {
                        const res = await fetch(`/api/players`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            playerName: name,
                            familyId: team.familyId,
                            ...(jersey ? { jerseyNumber: jersey } : {}),
                          }),
                        });
                        if (!res.ok) throw new Error("Failed");
                        const data = await res.json();
                        const created = data?.data ?? data;

                        toast.success("Player added");

                        // ✅ Optimistically add to local list so combobox shows it immediately
                        setExtraPlayers((prev) => [...prev, created]);

                        // ✅ Select the new player right away
                        setGoalForm((f) => ({
                          ...f,
                          playerId: created.id,
                          playerName: created.playerName,
                          jerseyNumber: created.jerseyNumber ?? null,
                        }));

                        // Background sync to keep server state fresh
                        invalidate();
                      } catch {
                        toast.error("Failed to add player");
                      } finally {
                        setAddingPlayer(false);
                      }
                    }}
                    isCreating={addingPlayer}
                    accentColor={isHome ? "cyan" : "violet"}
                  />
                </div>

                {/* Minute + Period */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-500 text-xs uppercase tracking-wider">
                      Minute
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      placeholder="0–60"
                      value={goalForm.minute}
                      onChange={(e) =>
                        setGoalForm((f) => ({
                          ...f,
                          minute: Number(e.target.value),
                        }))
                      }
                      className="h-10 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Goal type */}
                <div className="space-y-1.5">
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">
                    Goal Type
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {HOCKEY_GOAL_TYPES.map((gt) => (
                      <button
                        key={gt.value}
                        type="button"
                        onClick={() =>
                          setGoalForm((f) => ({ ...f, type: gt.value }))
                        }
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                          goalForm.type === gt.value
                            ? isHome
                              ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                              : "bg-violet-50 border-violet-300 text-violet-700"
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {gt.icon} {gt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <Button
                  onClick={handleAddGoal}
                  disabled={
                    isAnyPending || !goalForm.playerId || !goalForm.minute
                  }
                  className={`w-full h-10 font-semibold ${
                    isHome
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                      : "bg-violet-600 hover:bg-violet-700 text-white"
                  }`}
                >
                  {isAnyPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Log Goal
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Goal list */}
            {goalDetails.length > 0 && (
              <ScrollArea className="max-h-56 pr-1">
                <div className="space-y-1.5">
                  {goalDetails.map((goal, i) => (
                    <GoalRow
                      key={i}
                      goal={goal}
                      index={i}
                      canDelete={!isCompleted}
                      loading={isAnyPending}
                      onDelete={(idx) =>
                        confirm("Delete Goal?", "This cannot be undone.", () =>
                          actions.deleteHockeyGoal(team.familyId, idx),
                        )
                      }
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* ── SHOOTOUT ── */}
        {!isCompleted && (
          <>
            <Separator className="bg-slate-100" />
            <div>
              <SectionHeader
                icon={Zap}
                title="Penalty Shootout"
                count={`${shootout.filter(Boolean).length}/${shootout.length}`}
              />

              <div className="flex gap-2 mb-3">
                <Button
                  onClick={() => actions.addShootout(team.familyId, true)}
                  disabled={isAnyPending}
                  size="sm"
                  className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Scored
                </Button>
                <Button
                  onClick={() => actions.addShootout(team.familyId, false)}
                  disabled={isAnyPending}
                  size="sm"
                  className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                  Missed
                </Button>
              </div>

              {shootout.length > 0 && (
                <div className="space-y-1.5">
                  {shootout.map((scored, i) => (
                    <div
                      key={i}
                      className="group flex items-center gap-3 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
                    >
                      <ShootoutDot scored={scored} />
                      <span
                        className={`text-sm font-medium flex-1 ${
                          scored ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        Penalty {i + 1} — {scored ? "Scored" : "Missed"}
                      </span>
                      {!isCompleted && (
                        <button
                          onClick={() =>
                            confirm(
                              "Remove Penalty?",
                              "Remove this penalty result?",
                              () => actions.deleteShootout(team.familyId, i),
                            )
                          }
                          disabled={isAnyPending}
                          className="p-1 rounded text-red-400 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── WALKOVER ── */}
        {!isCompleted && (
          <>
            <Separator className="bg-slate-100" />
            <Button
              onClick={() =>
                confirm(
                  "Mark as Walkover?",
                  `Award walkover to ${team.family}? This will end the match.`,
                  () => actions.setWalkover(team.familyId),
                )
              }
              disabled={isAnyPending}
              variant="outline"
              size="sm"
              className="w-full border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400 text-xs"
            >
              <Flag className="h-3.5 w-3.5 mr-2" />
              Walkover for {team.family}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/* Period selector pills */
function PeriodSelector({ currentPeriod, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {HOCKEY_PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onSelect(p.value)}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            currentPeriod === p.value
              ? "bg-cyan-50 border-cyan-300 text-cyan-700"
              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* Status selector */
function StatusSelector({ currentStatus, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {MATCH_STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => onSelect(s.value)}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            currentStatus === s.value
              ? `${s.color} border-transparent text-white`
              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/* Result panel */
function ResultPanel({ match, onSetManOfMatch, disabled, players }) {
  const [manId, setManId] = useState(match?.manOfTheMatchId || "");

  useEffect(() => {
    if (match?.manOfTheMatchId) setManId(match.manOfTheMatchId);
  }, [match?.manOfTheMatchId]);

  const t1 = match?.participants?.[0];
  const t2 = match?.participants?.[1];

  return (
    <div className="rounded-2xl bg-white border border-black p-5 space-y-5 shadow-sm">
      <SectionHeader icon={Trophy} title="Match Result" />

      {/* Winner — display only, auto-calculated by backend */}
      <div className="space-y-2">
        <Label className="text-slate-500 text-xs uppercase tracking-wider">
          Declare Winner
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            disabled={true}
            size="sm"
            variant="outline"
            className={`border-slate-200 text-xs h-10 font-semibold ${
              match?.winnerId === t1?.familyId
                ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                : "text-slate-500"
            }`}
          >
            {match?.winnerId === t1?.familyId && (
              <Crown className="h-3 w-3 mr-1.5" />
            )}
            {t1?.family}
          </Button>

          <Button
            disabled={true}
            size="sm"
            variant="outline"
            className={`border-slate-200 text-xs h-10 font-semibold ${
              match?.isDraw
                ? "border-slate-300 bg-slate-100 text-slate-700"
                : "text-slate-400"
            }`}
          >
            <Minus className="h-3 w-3 mr-1.5" />
            Draw
          </Button>

          <Button
            disabled={true}
            size="sm"
            variant="outline"
            className={`border-slate-200 text-xs h-10 font-semibold ${
              match?.winnerId === t2?.familyId
                ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                : "text-slate-400"
            }`}
          >
            {match?.winnerId === t2?.familyId && (
              <Crown className="h-3 w-3 mr-1.5" />
            )}
            {t2?.family}
          </Button>
        </div>
        <p className="text-slate-400 text-[10px] font-mono uppercase tracking-wider">
          Winner is calculated automatically by the backend
        </p>
      </div>

      {/* Man of the match */}
      <div className="space-y-2">
        <Label className="text-slate-500 text-xs uppercase tracking-wider flex items-center gap-2">
          <Trophy className="h-3 w-3" />
          Player of the Match
        </Label>
        <div className="flex gap-2">
          <Select value={manId} onValueChange={setManId}>
            <SelectTrigger className="flex-1 h-10 bg-white border-slate-300 text-slate-800 text-sm">
              <SelectValue placeholder="Select player…" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              {players.map((p) => (
                <SelectItem
                  key={p.id}
                  value={p.id}
                  className="text-slate-800 focus:bg-slate-50"
                >
                  {p.playerName} · {p.family}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => onSetManOfMatch(manId)}
            disabled={disabled || !manId}
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white shrink-0"
          >
            Confirm
          </Button>
        </div>
        {match?.manOfTheMatchId && (
          <p className="text-yellow-600 text-xs flex items-center gap-1.5">
            <Crown className="h-3 w-3" />
            {players.find((p) => p.id === match.manOfTheMatchId)?.playerName ||
              "Awarded"}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main LiveScore component
───────────────────────────────────────────── */

export function LiveMatchControl({ matchId, tournamentId }) {
  const [initialMatch, setInitialMatch] = useState(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);

  /* Bootstrap: load match once, then hand off to hook */
  useEffect(() => {
    if (!matchId) return;
    fetch(`/api/tournaments/${tournamentId}/matches/${matchId}`)
      .then((r) => r.json())
      .then((data) => {
        setInitialMatch(data.data);
      })
      .catch(() => toast.error("Failed to load match"))
      .finally(() => setBootstrapLoading(false));
  }, [matchId]);

  const {
    match,
    error,
    loading,
    isConnected,
    activeUsers,
    startMatch,
    endMatch,
    setPeriod,
    setStatus,
    setWinner,
    setDraw,
    setManOfMatch,
    addHockeyGoal,
    deleteHockeyGoal,
    addShootout,
    deleteShootout,
    setWalkover,
    addPlayer,
    refetch,
  } = useLiveMatchControl(matchId, tournamentId, initialMatch);

  const t1 = match?.participants?.[0];
  const t2 = match?.participants?.[1];

  const {
    family: family1,
    loading: family1Loading,
    refresh: invalidate1,
  } = useFamily(t1?.familyId);
  const {
    family: family2,
    loading: family2Loading,
    refresh: invalidate2,
  } = useFamily(t2?.familyId);

  const players1 = family1?.players ?? [];
  const players2 = family2?.players ?? [];

  const confirmDialog = useConfirm();

  const actions = {
    addHockeyGoal,
    deleteHockeyGoal,
    addShootout,
    deleteShootout,
    setWalkover,
    addPlayer,
  };

  const allPlayers = [
    ...players1.map((p) => ({ ...p, family: t1?.family })),
    ...players2.map((p) => ({ ...p, family: t2?.family })),
  ];

  /* ── Render: loading ── */
  if (bootstrapLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-slate-200 flex items-center justify-center">
              <Swords className="h-7 w-7 text-slate-400" />
            </div>
            <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm font-mono">
            Loading match data…
          </p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-slate-700 font-semibold">Match not found</p>
          <p className="text-slate-400 text-sm">ID: {matchId}</p>
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
        {JSON.stringify(match)}
      </div>
    );
  }

  const isCompleted = [
    "COMPLETED",
    "WALKOVER",
    "ABANDONED",
    "NO_RESULT",
    "CANCELLED",
  ].includes(match.status);
  const isLive = match.status === "LIVE";

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-sm">
          <div className="container mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                <Swords className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-slate-900 text-sm font-bold leading-none">
                  Match Control
                </p>
                <p className="text-slate-400 text-[10px] font-mono mt-0.5">
                  {/* {id?.slice(-8)} */}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {loading && (
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="font-mono">Syncing…</span>
                </div>
              )}
              <ConnectionBadge
                isConnected={isConnected}
                activeUsers={activeUsers}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={refetch}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-slate-800 border-slate-700 text-xs text-white"
                >
                  Refresh data
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
          {/* Scoreboard */}
          <ScoreBoard match={match} />

          {/* Quick actions */}
          {!isCompleted && (
            <div className="flex flex-wrap items-center gap-2">
              {!isLive ? (
                <Button
                  onClick={() =>
                    confirmDialog.confirm(
                      "Start Match?",
                      "Set status to LIVE and record start time?",
                      startMatch,
                    )
                  }
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-10 px-5"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Start Match
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    confirmDialog.confirm(
                      "End Match?",
                      "Mark match as COMPLETED?",
                      endMatch,
                    )
                  }
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold h-10 px-5"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  End Match
                </Button>
              )}
              <div className="h-6 w-px bg-slate-200 mx-1" />
              <span className="text-slate-400 text-xs font-mono">
                Quick status:
              </span>
              {["SUSPENDED", "DELAYED"].map((s) => (
                <Button
                  key={s}
                  onClick={() => setStatus(s)}
                  disabled={loading || match.status === s}
                  size="sm"
                  variant="outline"
                  className={`h-8 text-xs border-slate-200 ${
                    match.status === s
                      ? "bg-slate-100 text-slate-700"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          )}

          {/* Controls grid */}
          {!isCompleted && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Status */}
              <div className="rounded-2xl bg-white border border-black p-5 shadow-sm">
                <SectionHeader icon={Shield} title="Match Status" />
                <StatusSelector
                  currentStatus={match.status}
                  onSelect={(s) =>
                    confirmDialog.confirm(
                      `Change status to ${s}?`,
                      "Update the match status.",
                      () => setStatus(s),
                    )
                  }
                  disabled={loading}
                />
              </div>

              {/* Period */}
              <div className="rounded-2xl bg-white border border-black p-5 shadow-sm">
                <SectionHeader icon={Clock} title="Current Period" />
                <PeriodSelector
                  currentPeriod={match.currentPeriod}
                  onSelect={setPeriod}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Teams */}
          <div className="grid lg:grid-cols-2 gap-5">
            {match.participants.map((team, idx) => (
              <TeamPanel
                key={idx}
                team={team}
                isHome={idx === 0}
                matchStatus={match.status}
                matchSport={match.sport}
                actions={actions}
                isAnyPending={loading}
                confirm={confirmDialog.confirm}
                tournamentId={tournamentId}
                players={idx === 0 ? players1 : players2}
                familyLoading={idx === 0 ? family1Loading : family2Loading}
                invalidate={idx === 0 ? invalidate1 : invalidate2}
              />
            ))}
          </div>

          {/* Result + Man of the match */}
          <ResultPanel
            match={match}
            onSetManOfMatch={setManOfMatch}
            disabled={loading}
            players={allPlayers}
          />

          {/* Match info footer */}
          <div className="rounded-2xl bg-white border border-black p-5 shadow-sm">
            <SectionHeader icon={Activity} title="Match Info" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                { label: "Sport", value: removeUnderscore(match.sport) },
                { label: "Venue", value: removeUnderscore(match.venue) },
                { label: "Round", value: removeUnderscore(match.round) },
                {
                  label: "Pool",
                  value: match.pool ? `Pool ${match.pool}` : "—",
                },
                {
                  label: "Scheduled",
                  value: match.scheduledOn
                    ? new Date(match.scheduledOn).toLocaleString()
                    : "—",
                },
                {
                  label: "Started",
                  value: match.actualStartTime
                    ? new Date(match.actualStartTime).toLocaleTimeString()
                    : "—",
                },
                {
                  label: "Ended",
                  value: match.actualEndTime
                    ? new Date(match.actualEndTime).toLocaleTimeString()
                    : "—",
                },
                {
                  label: "Sponsor",
                  value: match.sponsor || "—",
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider font-mono mb-1">
                    {item.label}
                  </p>
                  <p className="text-slate-700 font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Confirm dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={confirmDialog.setOpen}
      >
        <AlertDialogContent className="bg-white border-slate-200 text-slate-900 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">
              {confirmDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              {confirmDialog.desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog.handleConfirm}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

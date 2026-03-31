"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
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
  Timer,
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
  { value: "OWN_GOAL", label: "Own Goal", icon: "😬" },
];

const HOCKEY_PERIODS = [
  { value: "WARM_UP", label: "Warm Up" },
  { value: "FIRST_HALF", label: "1st Half" },
  { value: "HALF_TIME", label: "Half Time" },
  { value: "SECOND_HALF", label: "2nd Half" },
  { value: "EXTRA_TIME_FIRST", label: "ET 1st" },
  { value: "EXTRA_TIME_SECOND", label: "ET 2nd" },
  { value: "PENALTY_SHOOTOUT", label: "Shootout" },
  { value: "FULL_TIME", label: "Full Time" },
];

const MATCH_STATUSES = [
  { value: "SCHEDULED", label: "Scheduled", color: "bg-slate-500" },
  { value: "DELAYED", label: "Delayed", color: "bg-yellow-500" },
  { value: "LIVE", label: "Live", color: "bg-emerald-500" },
  { value: "SUSPENDED", label: "Suspended", color: "bg-orange-500" },
  { value: "COMPLETED", label: "Completed", color: "bg-blue-500" },
  { value: "POSTPONED", label: "Postponed", color: "bg-purple-500" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-500" },
  { value: "ABANDONED", label: "Abandoned", color: "bg-red-700" },
  { value: "WALKOVER", label: "Walkover", color: "bg-amber-500" },
  { value: "NO_RESULT", label: "No Result", color: "bg-slate-400" },
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

function useMatchTimer(match) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (match?.status !== "LIVE" || !match?.actualStartTime) return;
    const tick = () => {
      const start = new Date(match.actualStartTime).getTime();
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [match?.status, match?.actualStartTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getStatusColor(status) {
  return (
    MATCH_STATUSES.find((s) => s.value === status)?.color || "bg-slate-500"
  );
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
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-red-500/10 border-red-500/30 text-red-400"
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

function ScoreBoard({ match, timer }) {
  const t1 = match.participants[0];
  const t2 = match.participants[1];
  const score1 = getGoalCount(t1);
  const score2 = getGoalCount(t2);
  const shootout1 = getShootoutResults(t1);
  const shootout2 = getShootoutResults(t2);
  const hasShootout = shootout1.length > 0 || shootout2.length > 0;
  const status = MATCH_STATUSES.find((s) => s.value === match.status);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 shadow-2xl">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none" />

      {/* Match meta */}
      <div className="relative flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-white ${getStatusColor(match.status)}`}
          >
            {match.status === "LIVE" && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
            )}
            {status?.label || match.status}
          </span>
          <span className="text-slate-500 text-xs">
            {removeUnderscore(match.round)}
            {match.pool ? ` · Pool ${match.pool}` : ""}
          </span>
          <span className="text-slate-500 text-xs">
            · {removeUnderscore(match.venue)} · Match #{match.matchNo}
          </span>
        </div>

        {match.status === "LIVE" && (
          <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-cyan-400">
            <Timer className="h-4 w-4" />
            {timer}
          </div>
        )}
        {match.currentPeriod && (
          <span className="text-xs text-slate-400 font-medium">
            {removeUnderscore(match.currentPeriod)}
          </span>
        )}
      </div>

      {/* Scoreline */}
      <div className="relative flex items-center justify-between px-8 py-6">
        {/* Team 1 */}
        <div className="flex-1 text-left">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1 font-mono">
            Home
          </p>
          <h2 className="text-white font-black text-xl md:text-2xl lg:text-3xl tracking-tight leading-none mb-3">
            {t1?.family?.toUpperCase()}
          </h2>
          {t1?.walkover && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
              Walkover
            </Badge>
          )}
          {match.winnerId === t1?.familyId && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs gap-1">
              <Crown className="h-3 w-3" /> Winner
            </Badge>
          )}
        </div>

        {/* Score */}
        <div className="flex items-center gap-4 mx-4">
          <span
            className={`text-5xl md:text-6xl lg:text-7xl font-black tabular-nums transition-all ${
              score1 > score2 ? "text-white" : "text-slate-500"
            }`}
          >
            {score1}
          </span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-slate-600 text-2xl font-light">:</span>
            {match.isDraw && (
              <span className="text-xs text-slate-400 font-mono uppercase">
                Draw
              </span>
            )}
          </div>
          <span
            className={`text-5xl md:text-6xl lg:text-7xl font-black tabular-nums transition-all ${
              score2 > score1 ? "text-white" : "text-slate-500"
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
          <h2 className="text-white font-black text-xl md:text-2xl lg:text-3xl tracking-tight leading-none mb-3">
            {t2?.family?.toUpperCase()}
          </h2>
          {t2?.walkover && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
              Walkover
            </Badge>
          )}
          {match.winnerId === t2?.familyId && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs gap-1">
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
          <span className="text-slate-500 text-xs font-mono uppercase tracking-widest shrink-0">
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
          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
          : "bg-red-500/20 border-red-500 text-red-400"
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
    <div className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/40 border border-slate-700/30 transition-all">
      <span className="text-slate-500 text-xs font-mono w-5 shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">
          {goal.playerName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-slate-400 text-xs font-mono">
            {goal.minute}
          </span>
          {goal.period && (
            <span className="text-slate-500 text-[10px] uppercase tracking-wide">
              {removeUnderscore(goal.period)}
            </span>
          )}
          {goal.type && (
            <span className="text-[10px] text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded-md">
              {removeUnderscore(goal.type)}
            </span>
          )}
        </div>
      </div>
      {canDelete && (
        <button
          onClick={() => onDelete(index)}
          disabled={loading}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
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
      <h4 className="text-slate-300 text-sm font-semibold uppercase tracking-wider">
        {title}
      </h4>
      {count !== undefined && (
        <span className="ml-auto text-slate-500 text-xs font-mono">
          {count}
        </span>
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
}) {
  const isCompleted = matchStatus === "COMPLETED" || matchStatus === "WALKOVER";
  const goalDetails = getGoalDetails(team);
  const shootout = getShootoutResults(team);
  const score = getGoalCount(team);

  const [goalForm, setGoalForm] = useState({
    playerId: "",
    playerName: "",
    minute: "",
    period: "FIRST_HALF",
    type: "FIELD_GOAL",
  });
  const [newPlayerName, setNewPlayerName] = useState("");
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const { family, loading, refresh } = useFamily(team.familyId);
  const handleAddGoal = async () => {
    if (!goalForm.playerId) return toast.error("Select a player");
    if (!goalForm.minute) return toast.error("Enter goal time");
    await actions.addHockeyGoal(team.familyId, goalForm);
    setGoalForm({
      playerId: "",
      playerName: "",
      minute: "",
      period: "FIRST_HALF",
      type: "FIELD_GOAL",
    });
    setShowGoalForm(false);
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    setAddingPlayer(true);
    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/families/${team.familyId}/players`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerName: newPlayerName.trim() }),
        },
      );
      if (!res.ok) throw new Error("Failed");
      setNewPlayerName("");
      toast.success("Player added");
      invalidate(); // ← re-fetch the dropdown immediately
    } catch {
      toast.error("Failed to add player");
    } finally {
      setAddingPlayer(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col transition-all ${
        isHome
          ? "bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-900 border-cyan-500/20"
          : "bg-gradient-to-br from-violet-950/30 via-slate-900 to-slate-900 border-violet-500/20"
      }`}
    >
      {/* Team header */}
      <div
        className={`px-5 py-4 border-b ${
          isHome ? "border-cyan-500/10" : "border-violet-500/10"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-mono">
              {isHome ? "Home" : "Away"}
            </p>
            <h3 className="text-white font-black text-lg tracking-tight mt-0.5">
              {team.family?.toUpperCase()}
            </h3>
          </div>
          <div
            className={`text-4xl font-black tabular-nums ${
              isHome ? "text-cyan-400" : "text-violet-400"
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
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    : "bg-violet-500/10 border-violet-500/30 text-violet-400"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600"
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
              <div className="space-y-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                {/* Player select */}
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">
                    Player
                  </Label>
                  <Select
                    value={goalForm.playerId}
                    onValueChange={(v) => {
                      const player = players?.find((p) => p.id === v);
                      setGoalForm((f) => ({
                        ...f,
                        playerId: v,
                        playerName: player?.playerName || "",
                      }));
                    }}
                  >
                    <SelectTrigger className="h-10 bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          loading ? "Loading players…" : "Select player…"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent className="bg-slate-900 border-slate-700">
                      {(family.data.players || []).map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          className="text-white focus:bg-slate-800"
                        >
                          {p.playerName}
                          {p.jerseyNumber ? ` · #${p.jerseyNumber}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add new player inline */}
                <div className="flex gap-2">
                  <Input
                    placeholder="New player name…"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                    className="h-9 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 text-sm"
                  />
                  <Button
                    onClick={handleAddPlayer}
                    disabled={!newPlayerName.trim() || addingPlayer}
                    size="sm"
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0"
                  >
                    {addingPlayer ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>

                {/* Minute + Period */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">
                      Minute
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={120}
                      placeholder="0–120"
                      value={goalForm.minute}
                      onChange={(e) =>
                        setGoalForm((f) => ({ ...f, minute: e.target.value }))
                      }
                      className="h-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">
                      Period
                    </Label>
                    <Select
                      value={goalForm.period}
                      onValueChange={(v) =>
                        setGoalForm((f) => ({ ...f, period: v }))
                      }
                    >
                      <SelectTrigger className="h-10 bg-slate-900/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {HOCKEY_PERIODS.map((p) => (
                          <SelectItem
                            key={p.value}
                            value={p.value}
                            className="text-white focus:bg-slate-800"
                          >
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Goal type */}
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">
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
                              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                              : "bg-violet-500/20 border-violet-500/40 text-violet-300"
                            : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {gt.icon} {gt.label}
                      </button>
                    ))}
                  </div>
                </div>

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
            <Separator className="bg-slate-800" />
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
                  className="flex-1 h-9 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Scored
                </Button>
                <Button
                  onClick={() => actions.addShootout(team.familyId, false)}
                  disabled={isAnyPending}
                  size="sm"
                  className="flex-1 h-9 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold"
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
                      className="group flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/20 hover:border-slate-600/40 transition-all"
                    >
                      <ShootoutDot scored={scored} />
                      <span
                        className={`text-sm font-medium flex-1 ${
                          scored ? "text-emerald-400" : "text-red-400"
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
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-red-500/10 transition-all"
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
            <Separator className="bg-slate-800" />
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
              className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 text-xs"
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
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
              : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-200"
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
              : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-200"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/* Result panel */
function ResultPanel({
  match,
  onSetWinner,
  onSetDraw,
  onSetManOfMatch,
  disabled,
}) {
  const [manId, setManId] = useState(match?.manOfTheMatchId || "");
  const t1 = match?.participants?.[0];
  const t2 = match?.participants?.[1];

  // Collect all players from both teams
  const allPlayers = [
    ...(t1?.familyData?.players || []).map((p) => ({
      ...p,
      family: t1.family,
    })),
    ...(t2?.familyData?.players || []).map((p) => ({
      ...p,
      family: t2.family,
    })),
  ];

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/40 p-5 space-y-5">
      <SectionHeader icon={Trophy} title="Match Result" />

      {/* Winner */}
      <div className="space-y-2">
        <Label className="text-slate-400 text-xs uppercase tracking-wider">
          Declare Winner
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => onSetWinner(t1?.familyId, t1?.family)}
            disabled={disabled || match?.winnerId === t1?.familyId}
            size="sm"
            variant="outline"
            className={`border-slate-700 text-xs h-10 font-semibold ${
              match?.winnerId === t1?.familyId
                ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {match?.winnerId === t1?.familyId && (
              <Crown className="h-3 w-3 mr-1.5" />
            )}
            {t1?.family}
          </Button>

          <Button
            onClick={onSetDraw}
            disabled={disabled || match?.isDraw}
            size="sm"
            variant="outline"
            className={`border-slate-700 text-xs h-10 font-semibold ${
              match?.isDraw
                ? "border-slate-500/50 bg-slate-700/50 text-slate-300"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Minus className="h-3 w-3 mr-1.5" />
            Draw
          </Button>

          <Button
            onClick={() => onSetWinner(t2?.familyId, t2?.family)}
            disabled={disabled || match?.winnerId === t2?.familyId}
            size="sm"
            variant="outline"
            className={`border-slate-700 text-xs h-10 font-semibold ${
              match?.winnerId === t2?.familyId
                ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {match?.winnerId === t2?.familyId && (
              <Crown className="h-3 w-3 mr-1.5" />
            )}
            {t2?.family}
          </Button>
        </div>
      </div>

      {/* Man of the match */}
      <div className="space-y-2">
        <Label className="text-slate-400 text-xs uppercase tracking-wider flex items-center gap-2">
          <Trophy className="h-3 w-3" />
          Player of the Match
        </Label>
        <div className="flex gap-2">
          <Select value={manId} onValueChange={setManId}>
            <SelectTrigger className="flex-1 h-10 bg-slate-900/50 border-slate-700 text-white text-sm">
              <SelectValue placeholder="Select player…" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {allPlayers.map((p) => (
                <SelectItem
                  key={p.id}
                  value={p.id}
                  className="text-white focus:bg-slate-800"
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
            className="bg-yellow-600 hover:bg-yellow-700 text-white shrink-0"
          >
            <Crown className="h-3.5 w-3.5" />
          </Button>
        </div>
        {match?.manOfTheMatchId && (
          <p className="text-yellow-400 text-xs flex items-center gap-1.5">
            <Crown className="h-3 w-3" />
            {allPlayers.find((p) => p.id === match.manOfTheMatchId)
              ?.playerName || "Awarded"}
          </p>
        )}
      </div>
    </div>
  );
}

/* Notes panel */
function NotesPanel({ currentNotes, onSave, disabled }) {
  const [notes, setNotes] = useState(currentNotes || "");

  useEffect(() => {
    setNotes(currentNotes || "");
  }, [currentNotes]);

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/40 p-5 space-y-3">
      <SectionHeader icon={Activity} title="Match Notes" />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add match notes, comments, incident reports…"
        rows={3}
        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:border-slate-500 transition-colors"
      />
      <Button
        onClick={() => onSave(notes)}
        disabled={disabled || notes === (currentNotes || "")}
        size="sm"
        variant="outline"
        className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
      >
        Save Notes
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main LiveScore component
───────────────────────────────────────────── */

export function LiveMatchControl({ matchId, tournamentId }) {
  const [initialMatch, setInitialMatch] = useState(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const confirmDialog = useConfirm();

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
    addNote,
    addPlayer,
    refetch,
  } = useLiveMatchControl(matchId, tournamentId, initialMatch);

  const timer = useMatchTimer(match);

  const actions = {
    addHockeyGoal,
    deleteHockeyGoal,
    addShootout,
    deleteShootout,
    setWalkover,
    addPlayer,
  };

  /* ── Render: loading ── */
  if (bootstrapLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-slate-700 flex items-center justify-center">
              <Swords className="h-7 w-7 text-slate-500" />
            </div>
            <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
          </div>
          <p className="text-slate-500 text-sm font-mono">
            Loading match data…
          </p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-slate-300 font-semibold">Match not found</p>
          <p className="text-slate-500 text-sm">ID: {matchId}</p>
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300"
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
  const t1 = match.participants?.[0];
  const t2 = match.participants?.[1];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
          <div className="container mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                <Swords className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-none">
                  Match Control
                </p>
                <p className="text-slate-500 text-[10px] font-mono mt-0.5">
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
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-slate-800 border-slate-700 text-xs"
                >
                  Refresh data
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
          {/* Scoreboard */}
          <ScoreBoard match={match} timer={timer} />

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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-10 px-5"
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
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold h-10 px-5"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  End Match
                </Button>
              )}
              <div className="h-6 w-px bg-slate-800 mx-1" />
              <span className="text-slate-500 text-xs font-mono">
                Quick status:
              </span>
              {["SUSPENDED", "DELAYED"].map((s) => (
                <Button
                  key={s}
                  onClick={() => setStatus(s)}
                  disabled={loading || match.status === s}
                  size="sm"
                  variant="outline"
                  className={`h-8 text-xs border-slate-700 ${
                    match.status === s
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800"
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
              <div className="rounded-2xl bg-slate-900/60 border border-slate-700/40 p-5">
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
              <div className="rounded-2xl bg-slate-900/60 border border-slate-700/40 p-5">
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
              />
            ))}
          </div>

          {/* Result + Man of the match */}
          <ResultPanel
            match={match}
            onSetWinner={(id, name) =>
              confirmDialog.confirm(
                `Declare ${name} as winner?`,
                "This will set the match result.",
                () => setWinner(id, name),
              )
            }
            onSetDraw={() =>
              confirmDialog.confirm(
                "Declare Draw?",
                "Set the match as a draw.",
                setDraw,
              )
            }
            onSetManOfMatch={setManOfMatch}
            disabled={loading}
          />

          {/* Notes */}
          <NotesPanel
            currentNotes={match.notes}
            onSave={addNote}
            disabled={loading}
          />

          {/* Match info footer */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/60 p-5">
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
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider font-mono mb-1">
                    {item.label}
                  </p>
                  <p className="text-slate-200 font-medium">{item.value}</p>
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
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {confirmDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {confirmDialog.desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
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

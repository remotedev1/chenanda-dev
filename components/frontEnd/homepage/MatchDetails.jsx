"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  MapPin,
  Clock,
  Calendar,
  Radio,
  Users,
  BarChart2,
  MessageSquare,
  ArrowLeft,
  Zap,
  Star,
  Shield,
  Target,
  Activity,
  TrendingUp,
  Award,
} from "lucide-react";
import Link from "next/link";
import { useState as useReactState, useEffect, useCallback } from "react";

/* ─── useMatch hook ─── */
function useMatch({ matchId, tournamentId }) {
  const [match, setMatch] = useReactState(null);
  const [loading, setLoading] = useReactState(true);
  const [error, setError] = useReactState(null);

  const fetchMatch = useCallback(async () => {
    if (!matchId || !tournamentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/matches/${matchId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch match");
      const data = await res.json();
      setMatch(data.data || data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [matchId, tournamentId]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  return { match, loading, error, refresh: fetchMatch };
}

/* ─── Constants ─── */
const SPORT_ICONS = {
  FIELD_HOCKEY: "🏑",
  FOOTBALL: "⚽",
  CRICKET: "🏏",
  BASKETBALL: "🏀",
  VOLLEYBALL: "🏐",
  BADMINTON: "🏸",
  TENNIS: "🎾",
  TABLE_TENNIS: "🏓",
  KABADDI: "🤼",
  OTHER: "🏆",
};

const STATUS_META = {
  LIVE: { label: "● LIVE", cls: "bg-red-500 text-white" },
  SCHEDULED: { label: "Upcoming", cls: "bg-slate-700 text-slate-200" },
  COMPLETED: { label: "Full Time", cls: "bg-emerald-700 text-emerald-100" },
  DELAYED: { label: "Delayed", cls: "bg-amber-600 text-white" },
  SUSPENDED: { label: "Suspended", cls: "bg-orange-600 text-white" },
  POSTPONED: { label: "Postponed", cls: "bg-slate-600 text-slate-200" },
};

const VENUE_LABELS = {
  GROUND_1: "Ground 1",
  GROUND_2: "Ground 2",
  GROUND_3: "Ground 3",
  GROUND_4: "Ground 4",
  GROUND_5: "Ground 5",
  MAIN_STADIUM: "Main Stadium",
};

const ROUND_LABELS = {
  POOL_STAGE: "Pool Stage",
  ROUND_OF_16: "Round of 16",
  PRE_QUARTER: "Pre-Quarter Final",
  QUARTER_FINAL: "Quarter Final",
  SEMI_FINAL: "Semi Final",
  THIRD_PLACE: "3rd Place",
  FINAL: "Grand Final",
};

/* ─── Score extractor ─── */
function getScore(participant, sport) {
  if (!participant) return "-";
  const d =
    participant.hockeyData ||
    participant.footballData ||
    participant.cricketData;
  if (!d) return "-";
  if (sport === "CRICKET") return `${d.runs ?? 0}/${d.wickets ?? 0}`;
  return d.goals ?? 0;
}

function getOvers(participant) {
  const d = participant?.cricketData;
  if (!d) return null;
  return `${d.overs ?? 0} ov`;
}

/* ─── Live Score Hero ─── */
function MatchHero({ match }) {
  const team1 = match.participants?.[0];
  const team2 = match.participants?.[1];
  const score1 = getScore(team1, match.sport);
  const score2 = getScore(team2, match.sport);
  const overs1 = getOvers(team1);
  const overs2 = getOvers(team2);
  const statusMeta = STATUS_META[match.status] || STATUS_META.SCHEDULED;
  const isLive = match.status === "LIVE";

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0a0a0f 0%, #0f172a 60%, #1a0a00 100%)",
      }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Match meta row */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-4 pb-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="text-2xl">{SPORT_ICONS[match.sport] || "🏆"}</span>
        <span className="font-semibold text-slate-300">
          {ROUND_LABELS[match.round] || match.round}
          {match.pool ? ` · Pool ${match.pool}` : ""}
        </span>
        <span className="text-slate-600">·</span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-orange-400" />
          {VENUE_LABELS[match.venue] || match.venue}
        </span>
        <span className="text-slate-600">·</span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-orange-400" />
          {match.scheduledOn
            ? new Date(match.scheduledOn).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "TBD"}
        </span>
        <span
          className={`ml-auto text-xs font-black px-3 py-1 rounded-full ${statusMeta.cls} ${
            isLive ? "animate-pulse" : ""
          }`}
        >
          {statusMeta.label}
        </span>
      </div>

      {/* Score block */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
          {/* Team 1 */}
          <div className="text-right">
            <div className="inline-flex items-center justify-end gap-3 mb-3">
              <div>
                <div className="font-black text-white text-xl sm:text-2xl leading-tight">
                  {team1?.family || "Team 1"}
                </div>
                {match.winnerId === team1?.familyId && (
                  <div className="text-xs text-amber-400 font-semibold flex items-center justify-end gap-1 mt-1">
                    <Trophy className="h-3 w-3" /> Winner
                  </div>
                )}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center text-xl font-black text-orange-300">
                {(team1?.family || "T1").substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div
              className={`text-6xl sm:text-7xl font-black tabular-nums ${
                match.winnerId === team1?.familyId
                  ? "text-amber-400"
                  : "text-white"
              }`}
            >
              {score1}
            </div>
            {overs1 && (
              <div className="text-sm text-slate-400 mt-1">{overs1}</div>
            )}
          </div>

          {/* Centre divider */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-orange-500/30">
              VS
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            {match.isDraw && (
              <span className="text-xs font-bold bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full mt-1">
                DRAW
              </span>
            )}
          </div>

          {/* Team 2 */}
          <div className="text-left">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center text-xl font-black text-blue-300">
                {(team2?.family || "T2").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-black text-white text-xl sm:text-2xl leading-tight">
                  {team2?.family || "Team 2"}
                </div>
                {match.winnerId === team2?.familyId && (
                  <div className="text-xs text-amber-400 font-semibold flex items-center gap-1 mt-1">
                    <Trophy className="h-3 w-3" /> Winner
                  </div>
                )}
              </div>
            </div>
            <div
              className={`text-6xl sm:text-7xl font-black tabular-nums ${
                match.winnerId === team2?.familyId
                  ? "text-amber-400"
                  : "text-white"
              }`}
            >
              {score2}
            </div>
            {overs2 && (
              <div className="text-sm text-slate-400 mt-1">{overs2}</div>
            )}
          </div>
        </div>

        {/* Live period strip */}
        {isLive && match.currentPeriod && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-sm font-bold text-red-400">
              {match.currentPeriod.replace(/_/g, " ")}
            </span>
          </div>
        )}
      </div>

      {/* Bottom fade */}
      <div className="h-6 bg-gradient-to-b from-transparent to-slate-950" />
    </div>
  );
}

/* ─── Tabs ─── */
const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "teams", label: "Teams", icon: Users },
  { id: "stats", label: "Stats", icon: BarChart2 },
  { id: "commentary", label: "Commentary", icon: MessageSquare },
];

/* ─── Overview Tab ─── */
function OverviewTab({ match }) {
  const team1 = match.participants?.[0];
  const team2 = match.participants?.[1];

  return (
    <div className="space-y-6">
      {/* Match info card */}
      <div className="rounded-xl border border-white/8 bg-slate-900 p-5">
        <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4">
          Match Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: "Sport", value: match.sport?.replace(/_/g, " ") },
            { label: "Round", value: ROUND_LABELS[match.round] || match.round },
            { label: "Pool", value: match.pool ? `Pool ${match.pool}` : "—" },
            { label: "Venue", value: VENUE_LABELS[match.venue] || match.venue },
            {
              label: "Date",
              value: match.scheduledOn
                ? new Date(match.scheduledOn).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "TBD",
            },
            {
              label: "Time",
              value: match.scheduledOn
                ? new Date(match.scheduledOn).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "TBD",
            },
            { label: "Status", value: match.status?.replace(/_/g, " ") },
            { label: "Match No.", value: `#${match.matchNo}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-start justify-between gap-2 py-2 border-b border-white/5 last:border-0"
            >
              <span className="text-slate-500">{label}</span>
              <span className="font-semibold text-white text-right">
                {value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Man of the match */}
      {match.manOfTheMatch && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-black text-amber-400 tracking-widest uppercase">
              Player of the Match
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-xl font-black text-amber-300">
              {(match.manOfTheMatch.playerName || "?")
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="font-black text-white text-lg">
                {match.manOfTheMatch.playerName}
              </div>
              {match.manOfTheMatch.primarySport && (
                <div className="text-sm text-slate-400">
                  {match.manOfTheMatch.primarySport.replace(/_/g, " ")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {match.notes && (
        <div className="rounded-xl border border-white/8 bg-slate-900 p-5">
          <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-3">
            Notes
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {match.notes}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Teams Tab ─── */
function TeamsTab({ match }) {
  const team1 = match.participants?.[0];
  const team2 = match.participants?.[1];

  function TeamSection({ participant, accent }) {
    if (!participant) return null;
    const family = participant.familyObject; // populated family data
    const cricketData = participant.cricketData;
    const hockeyData = participant.hockeyData;
    const footballData = participant.footballData;

    return (
      <div className="rounded-xl border border-white/8 bg-slate-900 overflow-hidden">
        {/* Team header */}
        <div
          className={`p-5 border-b border-white/8`}
          style={{
            background: `linear-gradient(135deg, ${accent}18, transparent)`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black"
              style={{
                background: `${accent}25`,
                border: `2px solid ${accent}40`,
                color: accent,
              }}
            >
              {(participant.family || "T").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-black text-white text-lg">
                {participant.family}
              </div>
              {family?.colors && (
                <div className="text-xs text-slate-400">
                  Colors: {family.colors}
                </div>
              )}
            </div>
            {match.winnerId === participant.familyId && (
              <div className="ml-auto flex items-center gap-1.5 text-amber-400 text-sm font-bold">
                <Trophy className="h-4 w-4" /> Winner
              </div>
            )}
          </div>
        </div>

        {/* Cricket batting scorecard */}
        {cricketData?.battingScores?.length > 0 && (
          <div className="p-4">
            <div className="text-xs font-black text-slate-400 tracking-widest uppercase mb-3">
              Batting
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs">
                    <th className="text-left pb-2 font-semibold">Batter</th>
                    <th className="text-right pb-2 font-semibold">R</th>
                    <th className="text-right pb-2 font-semibold">B</th>
                    <th className="text-right pb-2 font-semibold">4s</th>
                    <th className="text-right pb-2 font-semibold">6s</th>
                    <th className="text-right pb-2 font-semibold">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cricketData.battingScores.map((b, i) => (
                    <tr key={i} className="text-white">
                      <td className="py-2 font-semibold">{b.playerName}</td>
                      <td className="py-2 text-right font-black text-orange-400">
                        {b.runs}
                      </td>
                      <td className="py-2 text-right text-slate-400">
                        {b.ballsFaced}
                      </td>
                      <td className="py-2 text-right text-slate-400">
                        {b.fours}
                      </td>
                      <td className="py-2 text-right text-slate-400">
                        {b.sixes}
                      </td>
                      <td className="py-2 text-right text-slate-400">
                        {b.strikeRate?.toFixed(1) ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cricket bowling */}
        {cricketData?.bowlingFigures?.length > 0 && (
          <div className="p-4 border-t border-white/5">
            <div className="text-xs font-black text-slate-400 tracking-widest uppercase mb-3">
              Bowling
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs">
                    <th className="text-left pb-2 font-semibold">Bowler</th>
                    <th className="text-right pb-2 font-semibold">O</th>
                    <th className="text-right pb-2 font-semibold">M</th>
                    <th className="text-right pb-2 font-semibold">R</th>
                    <th className="text-right pb-2 font-semibold">W</th>
                    <th className="text-right pb-2 font-semibold">Econ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cricketData.bowlingFigures.map((b, i) => (
                    <tr key={i} className="text-white">
                      <td className="py-2 font-semibold">{b.playerName}</td>
                      <td className="py-2 text-right text-slate-400">
                        {b.overs}
                      </td>
                      <td className="py-2 text-right text-slate-400">
                        {b.maidens}
                      </td>
                      <td className="py-2 text-right text-slate-400">
                        {b.runs}
                      </td>
                      <td className="py-2 text-right font-black text-orange-400">
                        {b.wickets}
                      </td>
                      <td className="py-2 text-right text-slate-400">
                        {b.economy?.toFixed(2) ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Hockey / Football goals */}
        {(hockeyData?.goalDetails?.length > 0 ||
          footballData?.goalDetails?.length > 0) && (
          <div className="p-4 border-t border-white/5">
            <div className="text-xs font-black text-slate-400 tracking-widest uppercase mb-3">
              Goals
            </div>
            <div className="space-y-2">
              {(hockeyData?.goalDetails || footballData?.goalDetails || []).map(
                (g, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center text-orange-400 font-black text-xs">
                      {g.minute}'
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {g.playerName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {g.type?.replace(/_/g, " ")} ·{" "}
                        {g.period?.replace(/_/g, " ")}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Family contacts */}
        {family?.contacts?.length > 0 && (
          <div className="p-4 border-t border-white/5">
            <div className="text-xs font-black text-slate-400 tracking-widest uppercase mb-3">
              Contacts
            </div>
            <div className="space-y-2">
              {family.contacts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-semibold text-white">{c.name}</span>
                  <span className="text-slate-400">{c.phone}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <TeamSection participant={team1} accent="#f97316" />
      <TeamSection participant={team2} accent="#3b82f6" />
    </div>
  );
}

/* ─── Stats Tab ─── */
function StatsBar({ label, val1, val2, max }) {
  const pct1 = max ? Math.round((val1 / max) * 100) : 50;
  const pct2 = max ? Math.round((val2 / max) * 100) : 50;
  return (
    <div>
      <div className="flex justify-between text-sm font-bold text-white mb-1.5">
        <span>{val1}</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <span>{val2}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-slate-800">
        <div
          className="h-full bg-orange-500 rounded-l-full transition-all"
          style={{ width: `${pct1}%` }}
        />
        <div
          className="h-full bg-blue-500 rounded-r-full transition-all ml-auto"
          style={{ width: `${pct2}%` }}
        />
      </div>
    </div>
  );
}

function StatsTab({ match }) {
  const team1 = match.participants?.[0];
  const team2 = match.participants?.[1];
  const c1 = team1?.cricketData;
  const c2 = team2?.cricketData;
  const h1 = team1?.hockeyData || team1?.footballData;
  const h2 = team2?.hockeyData || team2?.footballData;

  const hasCricket = !!(c1 || c2);
  const hasGoalSport = !!(h1 || h2);

  return (
    <div className="rounded-xl border border-white/8 bg-slate-900 p-6 space-y-5">
      {/* Team labels */}
      <div className="flex justify-between text-sm font-black">
        <span className="text-orange-400">{team1?.family || "Team 1"}</span>
        <span className="text-slate-500 text-xs uppercase tracking-widest">
          Stats
        </span>
        <span className="text-blue-400">{team2?.family || "Team 2"}</span>
      </div>

      {hasGoalSport && (
        <>
          <StatsBar
            label="Goals"
            val1={h1?.goals ?? 0}
            val2={h2?.goals ?? 0}
            max={Math.max(h1?.goals ?? 0, h2?.goals ?? 0) || 1}
          />
          <StatsBar
            label="Goal Details"
            val1={h1?.goalDetails?.length ?? 0}
            val2={h2?.goalDetails?.length ?? 0}
            max={
              Math.max(
                h1?.goalDetails?.length ?? 0,
                h2?.goalDetails?.length ?? 0,
              ) || 1
            }
          />
        </>
      )}

      {hasCricket && (
        <>
          <StatsBar
            label="Runs"
            val1={c1?.runs ?? 0}
            val2={c2?.runs ?? 0}
            max={Math.max(c1?.runs ?? 0, c2?.runs ?? 0) || 1}
          />
          <StatsBar
            label="Wickets"
            val1={c1?.wickets ?? 0}
            val2={c2?.wickets ?? 0}
            max={10}
          />
          <StatsBar
            label="Fours"
            val1={c1?.fours ?? 0}
            val2={c2?.fours ?? 0}
            max={Math.max(c1?.fours ?? 0, c2?.fours ?? 0) || 1}
          />
          <StatsBar
            label="Sixes"
            val1={c1?.sixes ?? 0}
            val2={c2?.sixes ?? 0}
            max={Math.max(c1?.sixes ?? 0, c2?.sixes ?? 0) || 1}
          />
          <StatsBar
            label="Run Rate"
            val1={(c1?.runRate ?? 0).toFixed(2)}
            val2={(c2?.runRate ?? 0).toFixed(2)}
            max={Math.max(c1?.runRate ?? 0, c2?.runRate ?? 0) || 1}
          />
          <StatsBar
            label="Extras"
            val1={c1?.totalExtras ?? 0}
            val2={c2?.totalExtras ?? 0}
            max={Math.max(c1?.totalExtras ?? 0, c2?.totalExtras ?? 0) || 1}
          />
        </>
      )}

      {!hasCricket && !hasGoalSport && (
        <div className="text-center py-12 text-slate-500">
          <BarChart2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No detailed stats available yet</p>
        </div>
      )}
    </div>
  );
}

/* ─── Commentary Tab ─── */
function CommentaryTab({ match }) {
  const team1 = match.participants?.[0];
  const team2 = match.participants?.[1];

  // Build timeline from goals / wickets
  const events = [];

  const addGoals = (participant, data) => {
    (data?.goalDetails || []).forEach((g) => {
      events.push({
        minute: g.minute,
        period: g.period,
        type: "goal",
        team: participant?.family,
        player: g.playerName,
        subtype: g.type,
      });
    });
  };

  const addWickets = (participant, data) => {
    (data?.fallOfWickets || []).forEach((w) => {
      events.push({
        minute: null,
        over: w.over,
        type: "wicket",
        team: participant?.family,
        player: w.playerName,
        subtype: w.howOut,
        runs: w.runs,
      });
    });
  };

  addGoals(team1, team1?.hockeyData || team1?.footballData);
  addGoals(team2, team2?.hockeyData || team2?.footballData);
  addWickets(team1, team1?.cricketData);
  addWickets(team2, team2?.cricketData);

  events.sort((a, b) => (a.minute ?? a.over ?? 0) - (b.minute ?? b.over ?? 0));

  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-slate-900 p-12 text-center">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm text-slate-500">No events recorded yet</p>
        </div>
      ) : (
        events.map((ev, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-xl border border-white/8 bg-slate-900 p-4"
          >
            {/* Time badge */}
            <div className="w-14 text-center shrink-0">
              <div className="text-xs font-black text-orange-400">
                {ev.minute != null
                  ? `${ev.minute}'`
                  : ev.over != null
                    ? `${ev.over}ov`
                    : "—"}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {ev.period?.replace(/_/g, " ")}
              </div>
            </div>

            {/* Icon */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                ev.type === "goal"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {ev.type === "goal" ? (
                <Target className="h-4 w-4" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
            </div>

            {/* Detail */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-white">{ev.player}</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {ev.team}
                </span>
              </div>
              <div className="text-sm text-slate-400 mt-0.5">
                {ev.type === "goal"
                  ? `${ev.subtype?.replace(/_/g, " ")} goal`
                  : `Out · ${ev.subtype?.replace(/_/g, " ")} at ${ev.runs} runs`}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function MatchDetailPage({ match }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!match) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-slate-400">Match not found</p>
          <Link
            href="/matches"
            className="text-orange-400 hover:text-orange-300 text-sm mt-3 inline-block"
          >
            ← Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero / Live Score */}
      <MatchHero match={match} />

      {/* Tabs + Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-900 rounded-xl p-1 mb-6 border border-white/5 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex-1 justify-center ${
                activeTab === id
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <OverviewTab match={match} />}
            {activeTab === "teams" && <TeamsTab match={match} />}
            {activeTab === "stats" && <StatsTab match={match} />}
            {activeTab === "commentary" && <CommentaryTab match={match} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

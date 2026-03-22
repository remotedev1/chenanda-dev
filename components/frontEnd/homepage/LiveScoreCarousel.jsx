"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Trophy,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { useMatches } from "@/hooks/useMatch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import MatchDetailPage from "./MatchDetails";

/* ─── Sport icon map ─── */
const SPORT_ICONS = {
  FIELD_HOCKEY: "🏑", FOOTBALL: "⚽", CRICKET: "🏏",
  BASKETBALL: "🏀", VOLLEYBALL: "🏐", BADMINTON: "🏸",
  TENNIS: "🎾", TABLE_TENNIS: "🏓", KABADDI: "🤼", OTHER: "🏆",
};

const STATUS_META = {
  LIVE:      { label: "● LIVE",     cls: "bg-red-500 text-white animate-pulse" },
  SCHEDULED: { label: "Scheduled",  cls: "bg-slate-700 text-slate-200" },
  COMPLETED: { label: "Full Time",  cls: "bg-emerald-700 text-emerald-100" },
  DELAYED:   { label: "Delayed",    cls: "bg-amber-600 text-white" },
  SUSPENDED: { label: "Suspended",  cls: "bg-orange-600 text-white" },
  POSTPONED: { label: "Postponed",  cls: "bg-slate-600 text-slate-200" },
  CANCELLED: { label: "Cancelled",  cls: "bg-red-900 text-red-300 line-through" },
  ABANDONED: { label: "Abandoned",  cls: "bg-gray-700 text-gray-300" },
};

const VENUE_LABELS = {
  GROUND_1: "Ground 1", GROUND_2: "Ground 2", GROUND_3: "Ground 3",
  GROUND_4: "Ground 4", GROUND_5: "Ground 5", MAIN_STADIUM: "Main Stadium",
};

const ROUND_LABELS = {
  POOL_STAGE: "Pool Stage", ROUND_OF_16: "R16", PRE_QUARTER: "Pre-QF",
  QUARTER_FINAL: "Quarter Final", SEMI_FINAL: "Semi Final",
  THIRD_PLACE: "3rd Place", FINAL: "Grand Final",
};

/* ─── Extract score from TeamMatchData based on sport ─── */
function getScore(participant, sport) {
  if (!participant) return "-";
  const d = participant.hockeyData || participant.footballData || participant.cricketData;
  if (!d) return "-";
  if (sport === "CRICKET") return `${d.runs ?? 0}/${d.wickets ?? 0}`;
  return d.goals ?? 0;
}

/* ─── Scorecard ─── */
function ScoreCard({ match, isActive, onViewDetails }) {
  const team1 = match.participants?.[0];
  const team2 = match.participants?.[1];
  const score1 = getScore(team1, match.sport);
  const score2 = getScore(team2, match.sport);
  const statusMeta = STATUS_META[match.status] || STATUS_META.SCHEDULED;
  const isLive = match.status === "LIVE";

  return (
    <motion.div
      className="relative w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isActive ? 1 : 0.5, y: 0, scale: isActive ? 1 : 0.93 }}
      transition={{ duration: 0.4 }}
    >
      {/* Card */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-b from-slate-800 to-slate-900">

        {/* Top stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-400" />

        {/* Header row */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{SPORT_ICONS[match.sport] || "🏆"}</span>
            <div>
              <div className="text-xs text-slate-400 font-semibold tracking-widest uppercase">
                {ROUND_LABELS[match.round] || match.round}
                {match.pool ? ` · Pool ${match.pool}` : ""}
              </div>
              <div className="text-xs text-slate-500">Match #{match.matchNo}</div>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusMeta.cls}`}>
            {statusMeta.label}
          </span>
        </div>

        {/* Teams & Score */}
        <div className="px-5 py-5 space-y-4">
          {/* Team 1 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-black text-orange-300 shrink-0">
                {(team1?.family || "T1").substring(0, 2).toUpperCase()}
              </div>
              <span className="font-bold text-white text-base truncate">
                {team1?.family || "TBD"}
              </span>
              {match.winnerId && match.winnerId === team1?.familyId && (
                <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
              )}
            </div>
            <span className={`text-4xl font-black tabular-nums ${
              match.winnerId === team1?.familyId ? "text-amber-400" : "text-white"
            }`}>
              {score1}
            </span>
          </div>

          {/* VS divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs font-black text-slate-500 tracking-widest">VS</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Team 2 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sm font-black text-blue-300 shrink-0">
                {(team2?.family || "T2").substring(0, 2).toUpperCase()}
              </div>
              <span className="font-bold text-white text-base truncate">
                {team2?.family || "TBD"}
              </span>
              {match.winnerId && match.winnerId === team2?.familyId && (
                <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
              )}
            </div>
            <span className={`text-4xl font-black tabular-nums ${
              match.winnerId === team2?.familyId ? "text-amber-400" : "text-white"
            }`}>
              {score2}
            </span>
          </div>

          {match.isDraw && (
            <div className="text-center">
              <span className="text-xs font-bold bg-slate-700 text-slate-300 px-3 py-1 rounded-full">
                DRAW
              </span>
            </div>
          )}
        </div>

        {/* Footer meta */}
        <div className="px-5 py-3 border-t border-white/5 bg-black/20 flex items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            {match.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orange-400" />
                {VENUE_LABELS[match.venue] || match.venue}
              </span>
            )}
            {match.currentPeriod && isLive && (
              <span className="flex items-center gap-1 text-red-400 font-semibold">
                <Radio className="h-3 w-3" />
                {match.currentPeriod.replace(/_/g, " ")}
              </span>
            )}
          </div>
          {match.scheduledOn && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(match.scheduledOn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {/* View details button */}
        <button
          onClick={() => onViewDetails(match)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-500/5 transition-colors border-t border-white/5"
        >
          View Full Details
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Carousel ─── */
export default function LiveScoreCarousel({ tournamentId }) {
  const { matches, loading } = useMatches({ tournamentId });

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const intervalRef = useRef(null);

  const handleViewDetails = (match) => {
    setSelectedMatch(match);
    setSheetOpen(true);
  };

  // Filter to LIVE matches client-side (hook already fetches with status=LIVE)
  const liveMatches = matches.filter((m) => m.status === "LIVE");
  const total = liveMatches.length;

  const paginate = useCallback((dir) => {
    setDirection(dir);
    setActiveIndex((prev) => (prev + dir + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    intervalRef.current = setInterval(() => paginate(1), 6000);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, paginate, total]);

  if (loading) {
    return (
      <section className="py-16 px-4" style={{ background: "linear-gradient(180deg, #0a0a0f 0%, #0f172a 100%)" }}>
        <div className="max-w-md mx-auto animate-pulse space-y-4">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
          <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-8 space-y-5">
            <div className="flex justify-between">
              <div className="h-4 w-32 bg-slate-700 rounded" />
              <div className="h-6 w-16 bg-slate-700 rounded-full" />
            </div>
            <div className="h-10 w-24 bg-slate-700 rounded" />
            <div className="h-px bg-slate-700" />
            <div className="h-10 w-24 bg-slate-700 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (total === 0) {
    return (
      <section className="py-16 px-4" style={{ background: "linear-gradient(180deg, #0a0a0f 0%, #0f172a 100%)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-black text-white mb-2">No Live Matches</h2>
          <p className="text-slate-400">Action returns soon. Stay tuned!</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative py-14 px-4 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0a0f 0%, #0f172a 100%)" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-xs font-black tracking-[0.2em] text-red-400 uppercase">
                {liveMatches.length > 0 ? `${liveMatches.length} Live Now` : "Latest Scores"}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Match <span className="text-orange-500">Centre</span>
            </h2>
          </div>
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
          >
            All Matches <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Nav buttons */}
          {total > 1 && (
            <>
              <button
                onClick={() => paginate(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white hover:bg-orange-500 hover:border-orange-500 transition-colors shadow-lg"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => paginate(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white hover:bg-orange-500 hover:border-orange-500 transition-colors shadow-lg"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Card area */}
          <div className="overflow-hidden px-6 py-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeIndex}
                initial={{ x: direction > 0 ? 200 : -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction > 0 ? -200 : 200, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
              >
                <ScoreCard match={liveMatches[activeIndex]} isActive={true} onViewDetails={handleViewDetails} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          {total > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {liveMatches.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex ? "w-6 bg-orange-500" : "w-1.5 bg-slate-600 hover:bg-slate-400"
                  }`}
                  aria-label={`Match ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
          >
            <Zap className="h-4 w-4" />
            View All Matches
          </Link>
        </div>
      </div>

      {/* Match Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 overflow-y-auto bg-slate-950 border-white/10"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Match Details</SheetTitle>
          </SheetHeader>
          {selectedMatch && (
            <MatchDetailPage match={selectedMatch} />
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
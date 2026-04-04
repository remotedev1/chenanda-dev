"use client";
import { motion } from "framer-motion";
import { MapPin, Trophy, Clock, Navigation } from "lucide-react";
import { useLiveMatches } from "@/hooks/useLiveMatches";

const ARENAS = ["GROUND_1", "GROUND_2", "GROUND_3", "GROUND_4"];

const ARENA_META = {
  GROUND_1: { location: "Gen. Thimmaiah Stadium" },
  GROUND_2: { location: "Gen. Thimmaiah Stadium" },
  GROUND_3: { location: "Gen. Thimmaiah Stadium" },
  GROUND_4: { location: "Middle school ground" },
};

const VenueCard = ({ arena, match, index }) => {
  const meta = ARENA_META[arena];

  // Extract teams safely
  const team1 = match?.participants?.[0];
  const team2 = match?.participants?.[1];

  const team1Name = team1?.family || "—";
  const team2Name = team2?.family || "—";

  const score1 = team1?.hockeyData?.goals ?? 0;
  const score2 = team2?.hockeyData?.goals ?? 0;

  // Shootout (optional)
  const shootout1 = team1?.hockeyData?.shootoutResults || [];
  const shootout2 = team2?.hockeyData?.shootoutResults || [];

  const isShootout = match?.currentPeriod === "PENALTY_SHOOTOUT";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        {/* Live Match */}
        {match ? (
          <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10">
            {/* Live badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">
                {match.status}
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-xs">
                <Clock className="w-3 h-3" />
                <span>{match.currentPeriod}</span>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center justify-between gap-3">
              <span className="flex-1 text-right text-white font-bold text-sm sm:text-base truncate capitalize">
                {team1Name}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xl sm:text-2xl font-black text-white tabular-nums">
                  {score1}
                </span>
                <span className="text-white/20 text-sm">—</span>
                <span className="text-xl sm:text-2xl font-black text-white tabular-nums">
                  {score2}
                </span>
              </div>

              <span className="flex-1 text-left text-white font-bold text-sm sm:text-base truncate capitalize">
                {team2Name}
              </span>
            </div>

            {/* 🔥 Shootout UI */}
            {isShootout && (
              <div className="mt-4 flex justify-between text-xs">
                <div className="flex gap-1">
                  {shootout1.map((s, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        s ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  {shootout2.map((s, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        s ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-5 p-4 rounded-xl bg-white/[0.03] border border-white/8">
            <span className="text-white/25 text-xs font-medium tracking-wide">
              No match in progress
            </span>
          </div>
        )}

        {/* Arena name + location */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {arena
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </h3>

            <div className="flex items-center gap-1 mt-0.5 text-white/30">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{meta?.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`h-px ${match ? "bg-green-500/40" : "bg-white/5"}`} />
    </motion.div>
  );
};

export default function VenueDetails() {
  const { matches, loading, error } = useLiveMatches();
  // Map arena name → live match object
  const matchByArena = ARENAS.reduce((acc, arena) => {
    acc[arena] =
      matches?.data?.find(
        (m) => m?.venue?.toLowerCase?.() === arena?.toLowerCase?.(),
      ) ?? null;

    return acc;
  }, {});

  return (
    <div className="min-h-screen py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-primary">
      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            Venue Information
          </h2>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-8 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
            Failed to load live matches.
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {loading
            ? ARENAS.map((_, i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl bg-white/5 border border-white/8 animate-pulse"
                />
              ))
            : ARENAS.map((arena, i) => (
                <VenueCard
                  key={arena}
                  arena={arena}
                  match={matchByArena[arena]}
                  index={i}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

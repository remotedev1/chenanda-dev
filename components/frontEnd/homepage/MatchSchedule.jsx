"use client";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  Trophy,
  Target,
  Users,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useMatches } from "@/hooks/useMatch";
import LiveScoreCarousel from "./LiveScoreMain";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Map API status → display tab key */
function toTabStatus(apiStatus) {
  if (apiStatus === "LIVE") return "live";
  if (apiStatus === "COMPLETED") return "completed";
  return "upcoming"; // SCHEDULED / anything else
}

/** Format scheduledOn ISO string → "Apr 3 • 09:00" */
function formatScheduled(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

/** Shootout score = count of `true` in shootoutResults */
function shootoutScore(results = []) {
  return results.filter(Boolean).length;
}

function formatPeriod(p) {
  if (!p) return null;
  return p
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── MatchCard ─────────────────────────────────────────────────────────────────

const MatchCard = ({ match }) => {
  const tabStatus = toTabStatus(match.status);
  const isLive = tabStatus === "live";
  const isCompleted = tabStatus === "completed";
  const isUpcoming = tabStatus === "upcoming";

  const [p1, p2] = match.participants || [];
  const team1 = p1?.family ?? "TBD";
  const team2 = p2?.family ?? "TBD";

  const inShootout = match.currentPeriod === "PENALTY_SHOOTOUT";
  const goals1 = p1?.hockeyData?.goals ?? 0;
  const goals2 = p2?.hockeyData?.goals ?? 0;
  const so1 = shootoutScore(p1?.hockeyData?.shootoutResults);
  const so2 = shootoutScore(p2?.hockeyData?.shootoutResults);
  const showShootout =
    inShootout ||
    (isCompleted &&
      (p1?.hockeyData?.shootoutResults?.length > 0 ||
        p2?.hockeyData?.shootoutResults?.length > 0));

  const winner =
    isCompleted && !match.isDraw && match.winnerId
      ? match.winnerId === p1?.familyId
        ? "team1"
        : "team2"
      : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="relative bg-white  border border-zinc-200  rounded-2xl px-3 md:px-5 py-3 md:py-4  cursor-pointer"
    >
      {/* Meta row */}
      <div className="flex items-center justify-between text-xs text-black mb-4">
        <span>{formatScheduled(match.scheduledOn)}</span>
        <div className="flex items-center gap-2">
          {match.round && (
            <span className="border border-green-500 px-2 py-1 rounded-md">
              {match.round.replace(/_/g, " ")} ({match?.pool})
            </span>
          )}
          {match.venue && (
            <span className="lowercase border border-blue-500  px-2 py-1 rounded-md">
              {match.venue.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-4">
        {/* Team 1 */}
        <div className="flex-1 flex items-center justify-start gap-2">
          {winner === "team1" && <Trophy className="w-4 h-4 text-amber-400" />}
          <span
            className={`text-sm sm:text-base font-semibold capitalize ${winner === "team1" ? "text-primary " : "text-primary "}`}
          >
            {team1}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center min-w-[80px]">
          {isUpcoming ? (
            <span className="text-md font-medium text-zinc-800 tracking-widest uppercase">
              vs
            </span>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span
                  className={`text-2xl font-bold ${winner === "team1" ? "text-zinc-900 " : "text-zinc-400"}`}
                >
                  {goals1}
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">–</span>
                <span
                  className={`text-2xl font-bold ${winner === "team2" ? "text-zinc-900 " : "text-zinc-400"}`}
                >
                  {goals2}
                </span>
              </div>
              {showShootout && (
                <span className="text-xs text-zinc-400 mt-0.5">
                  SO {so1}–{so2}
                </span>
              )}
            </>
          )}

          {/* Status pill */}
          <div className="mt-1.5">
            {isLive && (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[10px] font-bold tracking-widest uppercase text-red-500"
              >
                ● Live
              </motion.span>
            )}
            {isCompleted && match.isDraw && (
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                Draw
              </span>
            )}
            {match.currentPeriod && isLive && (
              <span className="block text-[10px] text-zinc-400 text-center">
                {formatPeriod(match.currentPeriod)}
              </span>
            )}
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex-1 flex items-center gap-2">
          <span
            className={`text-sm sm:text-base font-semibold capitalize ${winner === "team2" ? "text-primary " : "text-primary "}`}
          >
            {team2}
          </span>
          {winner === "team2" && <Trophy className="w-4 h-4 text-amber-400" />}
        </div>
      </div>
    </motion.div>
  );
};

const TopPlayerCard = ({ player, topPlayers, rank }) => {
  const medals = ["🥇", "🥈", "🥉", "🏅"];
  const colors = {
    0: {
      border: "border-red-400",
      bg: "bg-red-400/30",
      score: "text-red-500",
      bar: "from-red-500 to-orange-500",
      avatar: "from-red-400 to-orange-500 text-black",
    },
    1: {
      border: "border-gray-400",
      bg: "bg-gray-400/30",
      score: "text-gray-500",
      bar: "from-gray-400 to-gray-600",
      avatar: "from-gray-300 to-gray-500 text-black",
    },
    2: {
      border: "border-orange-400",
      bg: "bg-orange-400/30",
      score: "text-orange-500",
      bar: "from-orange-500 to-red-500",
      avatar: "from-orange-400 to-orange-600 text-white",
    },
    3: {
      border: "border-green-400",
      bg: "bg-green-400/30",
      score: "text-green-500",
      bar: "from-green-500 to-cyan-500",
      avatar: "from-green-400 to-green-600 text-white",
    },
  };
  const c = colors[rank] ?? colors[3];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      whileHover={{ scale: 1.03, x: 10 }}
      className={`relative overflow-hidden rounded-xl border-2 ${c.border} ${c.bg}`}
    >
      <div className="absolute top-2 left-2 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
        {medals[rank]}
      </div>
      <div className="relative p-6 pl-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-br ${c.avatar}`}
            >
              {player.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold text-black mb-1">
                {player.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <Users className="w-4 h-4" />
                <span>{player.team}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <motion.div
              className={`text-4xl font-black ${c.score}`}
              animate={rank === 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {player.goals}
            </motion.div>
            <div className="text-sm text-gray-500 font-medium">GOALS</div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(player.goals / topPlayers[0].goals) * 100}%`,
            }}
            transition={{ duration: 1, delay: rank * 0.1 }}
            className={`h-full bg-gradient-to-r ${c.bar}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function FieldHockeySchedule() {
  const [activeTab, setActiveTab] = useState("live");
  const [activeSection, setActiveSection] = useState("matches");

  const { matches, loading, refresh } = useMatches();
  const tabs = ["live", "upcoming", "completed"];

  const filteredMatches = matches.filter(
    (m) => toTabStatus(m.status) === activeTab,
  );

  const liveCount = matches.filter(
    (m) => toTabStatus(m.status) === "live",
  ).length;

  const topScorers = useMemo(() => {
    const map = new Map();

    matches.forEach((match) => {
      match.participants?.forEach((p) => {
        const goals = p?.hockeyData?.goalDetails ?? [];

        goals.forEach((g) => {
          if (!g.playerName) return;

          const key = g.playerName;

          if (!map.has(key)) {
            map.set(key, {
              name: g.playerName,
              team: p.family,
              goals: 0,
            });
          }

          map.get(key).goals += 1;
        });
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 5);
  }, [matches]);

  return (
    <div className="bg-primary p-4 md:p-16 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            Tournament{" "}
            <span className="text-secondary bg-clip-text">Dashboard</span>
          </h1>
          <p className="text-white/75 text-lg">
            Field Hockey Championship 2026
          </p>
        </motion.div>

        {/* Section Selector */}
        <div className="flex flex-wrap justify-center gap-2 xs:gap-2.5 sm:gap-3 mb-6 sm:mb-8 px-2">
          {[
            { id: "matches", icon: Clock, label: "Matches" },
            { id: "players", icon: Target, label: "Top Scorers" },
          ].map((section) => (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl font-bold text-[10px] xs:text-xs sm:text-sm uppercase tracking-wider transition-all ${
                activeSection === section.id
                  ? "bg-gradient-to-r from-blue-700 to-blue-900 text-white"
                  : "bg-gradient-to-r from-gray-800 to-gray-900 text-gray-400 hover:from-gray-700 hover:to-gray-800"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <section.icon className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">{section.label}</span>
            </motion.button>
          ))}

          {/* Refresh button */}
          <motion.button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-gray-800 to-gray-900 text-gray-400 hover:from-gray-700 hover:to-gray-800 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {/* Matches Section */}
          {activeSection === "matches" && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Tabs */}
              <div className="relative mb-8 w-full">
                <div className="flex justify-center">
                  <div className="flex gap-2 md:gap-4 bg-slate-300 backdrop-blur-sm p-2 rounded-2xl border-2 border-slate-400 overflow-x-auto no-scrollbar max-w-full">
                    {tabs.map((tab) => (
                      <motion.button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative px-4 md:px-10 py-2 md:py-3 rounded-xl font-semibold text-xs md:text-lg uppercase tracking-wider transition-all whitespace-nowrap ${
                          activeTab === tab
                            ? "text-white"
                            : "text-blue-600 hover:text-white"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {activeTab === tab && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-blue-600 rounded-xl"
                            style={{
                              boxShadow: "0 0 20px rgba(6,182,212,0.5)",
                            }}
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          {tab}
                          {tab === "live" && liveCount > 0 && (
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center"
                            >
                              {liveCount}
                            </motion.span>
                          )}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loading state */}
              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
              ) : (
                <>
                  {activeTab === "live" ? (
                    // ✅ LIVE TAB → show carousel instead of cards
                    <motion.div
                      key="live-carousel"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="w-full"
                    >
                      <LiveScoreCarousel />
                    </motion.div>
                  ) : (
                    // ✅ OTHER TABS → show match cards
                    <motion.div
                      layout
                      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredMatches.map((match) => (
                          <MatchCard key={match.id} match={match} />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                  {filteredMatches.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20 text-gray-600 text-xl"
                    >
                      No {activeTab} matches
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Top Players Section */}
          {activeSection === "players" && (
            <motion.div
              key="players"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6 flex items-start justify-start gap-3">
                <Target className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-black text-black">
                  Top Goal Scorers
                </h2>
              </div>
              <div className="space-y-4">
                {topScorers.map((player, index) => (
                  <TopPlayerCard
                    key={index}
                    player={player}
                    topPlayers={topScorers}
                    rank={index}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

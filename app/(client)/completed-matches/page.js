"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMatches } from "@/hooks/useMatch";
import { cx } from "class-variance-authority";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function toDateKey(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() + 5.5 * 3600000).toISOString().slice(0, 10);
}

const GOAL_TYPE_LABEL = {
  FIELD_GOAL: "FG",
  PENALTY_CORNER: "PC",
  PENALTY_STROKE: "PS",
};

const GOAL_TYPE_COLOR = {
  FIELD_GOAL: "#22c55e",
  PENALTY_CORNER: "#f59e0b",
  PENALTY_STROKE: "#ef4444",
};

// ── GoalLine ─────────────────────────────────────────────────────────────────

function GoalLine({ goal, align = "left" }) {
  const label = GOAL_TYPE_LABEL[goal.type] || goal.type;
  const color = GOAL_TYPE_COLOR[goal.type] || "#888";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexDirection: align === "right" ? "row-reverse" : "row",
        marginBottom: 4,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          background: color,
          borderRadius: 4,
          padding: "1px 5px",
          letterSpacing: 0.5,
          fontFamily: "var(--font-mono, monospace)",
          minWidth: 24,
          textAlign: "center",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 11,
          color: "#94a3b8",
          fontFamily: "var(--font-mono, monospace)",
        }}
      >
        {goal.minute}&apos;
      </span>
      <span
        style={{
          fontSize: 12,
          color: "#e2e8f0",
          textAlign: align === "right" ? "right" : "left",
          textTransform: "capitalize",
        }}
      >
        {goal.playerName}
      </span>
    </div>
  );
}

// ── MatchResultCard ───────────────────────────────────────────────────────────

function MatchResultCard({ match }) {
  const [expanded, setExpanded] = useState(false);
  const [p1, p2] = match.participants || [];

  const team1 = p1?.family ?? "TBD";
  const team2 = p2?.family ?? "TBD";
  const goals1 = p1?.hockeyData?.goals ?? 0;
  const goals2 = p2?.hockeyData?.goals ?? 0;
  const goalDetails1 = p1?.hockeyData?.goalDetails ?? [];
  const goalDetails2 = p2?.hockeyData?.goalDetails ?? [];

  const shootout1 = (p1?.hockeyData?.shootoutResults ?? []).filter(
    Boolean,
  ).length;
  const shootout2 = (p2?.hockeyData?.shootoutResults ?? []).filter(
    Boolean,
  ).length;
  const hasShootout =
    (p1?.hockeyData?.shootoutResults?.length ?? 0) > 0 ||
    (p2?.hockeyData?.shootoutResults?.length ?? 0) > 0;

  // Walkover detection
  const isWalkover1 = p1?.walkover === true;
  const isWalkover2 = p2?.walkover === true;
  const hasWalkover = isWalkover1 || isWalkover2;
  // The team that walked over loses; the other is the winner
  const walkoverWinner = isWalkover1 ? 2 : isWalkover2 ? 1 : null;

  const winner = hasWalkover
    ? walkoverWinner
    : !match.isDraw && match.winnerId
      ? match.winnerId === p1?.familyId
        ? 1
        : 2
      : null;

  const roundLabel = match.round?.replace(/_/g, " ") ?? "";
  const venueLabel = match.venue?.replace(/_/g, " ") ?? "";

  // All goals sorted by minute for timeline
  const allGoals = [
    ...goalDetails1.map((g) => ({ ...g, team: 1 })),
    ...goalDetails2.map((g) => ({ ...g, team: 2 })),
  ].sort((a, b) => a.minute - b.minute);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        border: "1px solid #1e3a5f",
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Top bar: round + venue + date */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          borderBottom: "1px solid #1e3a5f",
          background: "#0a1628",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {roundLabel && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.2,
                color: "#f59e0b",
                textTransform: "uppercase",
                background: "#1c1700",
                border: "1px solid #854d0e",
                borderRadius: 4,
                padding: "2px 8px",
              }}
            >
              {roundLabel}
            </span>
          )}
          {match.pool && (
            <span style={{ fontSize: 0, color: "#64748b" }}>
              Pool {match.pool}
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            fontSize: 11,
            color: "#475569",
          }}
        >
          {venueLabel && (
            <span style={{ textTransform: "capitalize" }}>{venueLabel}</span>
          )}
          <span>{formatDate(match.scheduledOn)}</span>
          <span>{formatTime(match.actualStartTime)}</span>
        </div>
      </div>

      {/* Main score area */}
      <div className="grid grid-cols-3 py-5 gap-2 p-2 md:p-5 ">
        {/* Team 1 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            className={cx(
              "text-[0.7rem] lg:text-xl",
              "flex items-center gap-1.5",
              "uppercase tracking-[0.5px]",
              "overflow-hidden whitespace-nowrap",
              {
                "font-extrabold": true,
                "text-white": winner === 1,
                "text-slate-500": winner !== 1,
              },
            )}
          >
            {team1}
            {isWalkover1 && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  background: "#7f1d1d",
                  color: "#fca5a5",
                  borderRadius: 3,
                  padding: "1px 5px",
                  marginLeft: 6,
                  letterSpacing: 1,
                  fontFamily: "monospace",
                  flexShrink: 0,
                }}
              >
                W/O
              </span>
            )}
          </div>
          {winner === 1 && <span style={{ color: "#f59e0b" }}>🏆</span>}
          {match.isDraw && (
            <span style={{ fontSize: 10, color: "#64748b" }}>Draw</span>
          )}
        </div>

        {/* Score */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 5px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontWeight: 900,
                color: winner === 1 ? "#ffffff" : "#94a3b8",
                fontFamily: "'DM Mono', monospace",
                lineHeight: 1,
              }}
              className={cx(
                winner === 1 ? "text-4xl " : "text-3xl",
                "transition-all",
              )}
            >
              {goals1}
            </span>
            <span style={{ fontSize: 28, color: "#334155", fontWeight: 300 }}>
              —
            </span>
            <span
              style={{
                fontWeight: 900,
                color: winner === 2 ? "#ffffff" : "#94a3b8",
                fontFamily: "'DM Mono', monospace",
                lineHeight: 1,
              }}
              className={cx(
                winner === 2 ? "text-4xl " : "text-3xl",
                "transition-all",
              )}
            >
              {goals2}
            </span>
          </div>
          {hasShootout && (
            <span
              style={{
                fontSize: 11,
                color: "#64748b",
                fontFamily: "monospace",
                marginTop: 4,
              }}
            >
              SO {shootout1}–{shootout2}
            </span>
          )}
          <span
            style={{
              fontSize: 10,
              letterSpacing: 1.5,
              color: hasWalkover ? "#f87171" : "#22c55e",
              fontWeight: 700,
              marginTop: 6,
              textTransform: "uppercase",
            }}
          >
            {hasWalkover ? "Walkover" : "Full Time"}
          </span>
        </div>

        {/* Team 2 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          <div
            className={cx(
              "text-[0.7rem] lg:text-xl",
              "flex items-center gap-1.5",
              "uppercase tracking-[0.5px]",
              "overflow-hidden whitespace-nowrap",
              {
                "font-extrabold": true,
                "text-white": winner === 2,
                "text-slate-500": winner !== 2,
              },
            )}
          >
            {team2}
            {isWalkover2 && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  background: "#7f1d1d",
                  color: "#fca5a5",
                  borderRadius: 3,
                  padding: "1px 5px",
                  marginLeft: 6,
                  letterSpacing: 1,
                  fontFamily: "monospace",
                  flexShrink: 0,
                }}
              >
                W/O
              </span>
            )}
          </div>
          {winner === 2 && (
            <span style={{ fontSize: 14, color: "#f59e0b" }}>🏆</span>
          )}
        </div>
      </div>

      {/* Goal timeline bar */}
      {allGoals.length > 0 && (
        <div style={{ padding: "0 16px 12px" }}>
          <div
            style={{
              position: "relative",
              height: 4,
              background: "#1e293b",
              borderRadius: 2,
              overflow: "visible",
            }}
          >
            {allGoals.map((g, i) => {
              const pct = Math.min((g.minute / 60) * 100, 98);
              return (
                <div
                  key={i}
                  title={`${g.playerName} ${g.minute}'`}
                  style={{
                    position: "absolute",
                    left: `${pct}%`,
                    top: -4,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: g.team === 1 ? "#3b82f6" : "#f43f5e",
                    border: "2px solid #0f172a",
                    cursor: "pointer",
                    transform: "translateX(-50%)",
                  }}
                />
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 4,
              fontSize: 9,
              color: "#334155",
              fontFamily: "monospace",
            }}
          >
            <span>0&apos;</span>
            <span>30&apos;</span>
            <span>60&apos;</span>
          </div>
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          borderTop: "1px solid #1e293b",
          padding: "10px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          color: "#475569",
          fontSize: 12,
          fontFamily: "'DM Sans', sans-serif",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
      >
        <span>{expanded ? "Hide" : "Show"} goal details</span>
        <span
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s",
            display: "inline-block",
          }}
        >
          ▾
        </span>
      </button>

      {/* Expanded goal details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 0,
                padding: "12px 16px 16px",
                borderTop: "1px solid #1e293b",
              }}
            >
              {/* Team 1 goals */}
              <div style={{ paddingRight: 12 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: "#3b82f6",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  {team1}
                </div>
                {goalDetails1.length === 0 ? (
                  <span style={{ fontSize: 11, color: "#334155" }}>
                    No goals
                  </span>
                ) : (
                  goalDetails1.map((g, i) => (
                    <GoalLine key={i} goal={g} align="left" />
                  ))
                )}
              </div>

              {/* Team 2 goals */}
              <div
                style={{
                  paddingLeft: 12,
                  borderLeft: "1px solid #1e293b",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: "#f43f5e",
                    textTransform: "uppercase",
                    marginBottom: 8,
                    textAlign: "right",
                  }}
                >
                  {team2}
                </div>
                {goalDetails2.length === 0 ? (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#334155",
                      display: "block",
                      textAlign: "right",
                    }}
                  >
                    No goals
                  </span>
                ) : (
                  goalDetails2.map((g, i) => (
                    <GoalLine key={i} goal={g} align="right" />
                  ))
                )}
              </div>
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: "0 16px 14px",
                flexWrap: "wrap",
              }}
            >
              {Object.entries(GOAL_TYPE_LABEL).map(([type, label]) => (
                <span
                  key={type}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#fff",
                      background: GOAL_TYPE_COLOR[type],
                      borderRadius: 3,
                      padding: "1px 5px",
                      fontFamily: "monospace",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#475569",
                      textTransform: "capitalize",
                    }}
                  >
                    {type.replace(/_/g, " ").toLowerCase()}
                  </span>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CompletedMatchesPage() {
  const { matches, loading } = useMatches();

  const [dateFilter, setDateFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [search, setSearch] = useState("");

  const completedMatches = useMemo(
    () =>
      matches
        .filter((m) => m.status === "COMPLETED")
        .sort((a, b) => new Date(b.scheduledOn) - new Date(a.scheduledOn)),
    [matches],
  );

  // Unique dates
  const uniqueDates = useMemo(() => {
    const keys = [
      ...new Set(completedMatches.map((m) => toDateKey(m.scheduledOn))),
    ].sort((a, b) => b.localeCompare(a));
    return keys;
  }, [completedMatches]);

  // Unique team names
  const uniqueTeams = useMemo(() => {
    const names = new Set();
    completedMatches.forEach((m) =>
      m.participants?.forEach((p) => {
        if (p?.family) names.add(p.family);
      }),
    );
    return [...names].sort();
  }, [completedMatches]);

  const filtered = useMemo(() => {
    return completedMatches.filter((m) => {
      if (dateFilter !== "all" && toDateKey(m.scheduledOn) !== dateFilter)
        return false;
      if (
        teamFilter !== "all" &&
        !m.participants?.some((p) => p?.family === teamFilter)
      )
        return false;
      if (search) {
        const q = search.toLowerCase();
        const teamMatch = m.participants?.some((p) =>
          p?.family?.toLowerCase().includes(q),
        );
        const roundMatch = m.round?.toLowerCase().includes(q);
        if (!teamMatch && !roundMatch) return false;
      }
      return true;
    });
  }, [completedMatches, dateFilter, teamFilter, search]);

  const inputStyle = {
    background: "#0f172a",
    border: "1px solid #1e3a5f",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: 13,
    padding: "8px 12px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020817",
        fontFamily: "'DM Sans', sans-serif",
      }}
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 scroll-m-24 mt-10"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 36, textAlign: "center" }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: "#f59e0b",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Chenanda Hockey Festival 2026
          </p>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 900,
              color: "#f8fafc",
              letterSpacing: -1,
              margin: 0,
            }}
          >
            Match Results
          </h1>
          <p style={{ color: "#475569", marginTop: 8, fontSize: 14 }}>
            {completedMatches.length} completed match
            {completedMatches.length !== 1 ? "es" : ""}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 28,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <input
            type="text"
            placeholder="Search team or round..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              flex: "1 1 180px",
              minWidth: 160,
            }}
          />

          {/* Date filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ ...inputStyle, flex: "1 1 140px", minWidth: 130 }}
          >
            <option value="all">All dates</option>
            {uniqueDates.map((d) => (
              <option key={d} value={d}>
                {new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </option>
            ))}
          </select>

          {/* Team filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            style={{ ...inputStyle, flex: "1 1 160px", minWidth: 140 }}
          >
            <option value="all">All teams</option>
            {uniqueTeams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Clear */}
          {(dateFilter !== "all" || teamFilter !== "all" || search) && (
            <button
              onClick={() => {
                setDateFilter("all");
                setTeamFilter("all");
                setSearch("");
              }}
              style={{
                ...inputStyle,
                color: "#f43f5e",
                border: "1px solid #4c0519",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Clear filters
            </button>
          )}
        </motion.div>

        {/* Results count */}
        {(dateFilter !== "all" || teamFilter !== "all" || search) && (
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 16 }}>
            Showing {filtered.length} of {completedMatches.length} matches
          </p>
        )}

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid #1e3a5f",
                borderTop: "3px solid #3b82f6",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}
          >
            No matches found
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((match) => (
                <MatchResultCard key={match.id} match={match} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

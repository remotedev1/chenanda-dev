"use client";

import { useEffect, useRef, useState } from "react";

// components/LiveCard.jsx
//
// Pure display component. Receives a `match` prop that is kept live
// by the parent's useLiveMatches hook. No socket logic here — that
// eliminates the double-subscription / leaveMatch race condition that
// was preventing instant updates.

// ─── Helpers ──────────────────────────────────────────────────────────────────
function goalCount(participant) {
  return (
    participant?.hockeyData?.goals ?? participant?.footballData?.goals ?? 0
  );
}

function shootoutResults(participant) {
  return participant?.hockeyData?.shootoutResults ?? [];
}

const STATUS_COLORS = {
  LIVE: { bg: "#059669", text: "#fff" },
  SCHEDULED: { bg: "#475569", text: "#cbd5e1" },
  COMPLETED: { bg: "#1d4ed8", text: "#fff" },
  DELAYED: { bg: "#ca8a04", text: "#fff" },
  SUSPENDED: { bg: "#ea580c", text: "#fff" },
  HALF_TIME: { bg: "#7c3aed", text: "#fff" },
  WALKOVER: { bg: "#b45309", text: "#fff" },
  CANCELLED: { bg: "#dc2626", text: "#fff" },
};

function statusColor(status) {
  return STATUS_COLORS[status] ?? { bg: "#334155", text: "#94a3b8" };
}

function fmt(str) {
  return (str ?? "").replace(/_/g, " ");
}

// ─── Shootout dots ────────────────────────────────────────────────────────────
function ShootoutRow({ results, align = "left" }) {
  if (!results.length) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        justifyContent: align === "right" ? "flex-end" : "flex-start",
        marginTop: 4,
        flexWrap: "wrap",
      }}
    >
      {results.map((scored, i) => (
        <span
          key={i}
          title={scored ? "Scored" : "Missed"}
          style={{
            display: "inline-block",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: scored ? "#10b981" : "#ef4444",
            border: `2px solid ${scored ? "#34d399" : "#f87171"}`,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── Goal event feed ──────────────────────────────────────────────────────────
function GoalFeed({ participants }) {
  const events = participants
    .flatMap((p) =>
      (p.hockeyData?.goalDetails ?? p.footballData?.goalDetails ?? []).map(
        (g) => ({ ...g, family: p.family }),
      ),
    )
    .sort((a, b) => Number(a.minute) - Number(b.minute));

  if (!events.length) return null;

  return (
    <div
      style={{
        marginTop: 12,
        borderTop: "1px solid #1e293b",
        paddingTop: 10,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {events.map((e, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          <span
            style={{ color: "#22d3ee", fontFamily: "monospace", minWidth: 28 }}
          >
            {e.minute ?? "—"}′
          </span>
          <span style={{ fontSize: 13 }}>⚽</span>
          <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
            {e.playerName}
          </span>
          <span style={{ color: "#475569" }}>·</span>
          <span style={{ color: "#64748b" }}>{e.family}</span>
          {e.type && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                background: "#1e293b",
                padding: "1px 6px",
                borderRadius: 4,
                color: "#94a3b8",
                whiteSpace: "nowrap",
              }}
            >
              {fmt(e.type)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Flash-on-update effect ───────────────────────────────────────────────────
// Pulses the card border briefly whenever the match prop changes.
function useUpdatePulse(match) {
  const [pulse, setPulse] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip the very first render (initial mount — not an "update")
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setPulse(true);
    const id = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(id);
  }, [match]); // fires on every new match object reference from the parent

  return pulse;
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export default function LiveCard({ match }) {
  const pulse = useUpdatePulse(match);

  if (!match) return null;

  const t1 = match.participants?.[0];
  const t2 = match.participants?.[1];
  const score1 = goalCount(t1);
  const score2 = goalCount(t2);
  const so1 = shootoutResults(t1);
  const so2 = shootoutResults(t2);
  const isLive = match.status === "LIVE";
  const { bg: statusBg, text: statusText } = statusColor(match.status);

  return (
    <div
      style={{
        background: pulse ? "#0f2a3a" : "#0f172a",
        border: `1px solid ${pulse ? "#22d3ee55" : "#1e293b"}`,
        borderRadius: 16,
        padding: "18px 20px",
        transition: "background 0.3s, border-color 0.3s",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        userSelect: "none",
      }}
    >
      {/* ── Status + timer ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              background: statusBg,
              color: statusText,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "3px 8px",
              borderRadius: 20,
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {isLive && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#fff",
                  animation: "livePing 1.2s ease-in-out infinite",
                  display: "inline-block",
                }}
              />
            )}
            {match.status}
          </span>
          {match.currentPeriod && (
            <span style={{ color: "#64748b", fontSize: 11 }}>
              {fmt(match.currentPeriod)}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#334155", fontSize: 11 }}>
            #{match.matchNo}
          </span>
        </div>
      </div>

      {/* ── Scoreline ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Team 1 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: "#94a3b8",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            Home
          </p>
          <p
            style={{
              color: score1 >= score2 ? "#f1f5f9" : "#475569",
              fontWeight: 800,
              fontSize: 18,
              margin: "2px 0 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
              letterSpacing: "0.02em",
              transition: "color 0.3s",
            }}
          >
            {t1?.family?.toUpperCase() ?? "—"}
          </p>
          {so1.length > 0 && <ShootoutRow results={so1} align="left" />}
        </div>

        {/* Score */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: score1 > score2 ? "#f8fafc" : "#334155",
              fontFamily: "monospace",
              lineHeight: 1,
              transition: "color 0.3s",
            }}
          >
            {score1}
          </span>
          <span style={{ color: "#1e293b", fontSize: 22, fontWeight: 300 }}>
            :
          </span>
          <span
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: score2 > score1 ? "#f8fafc" : "#334155",
              fontFamily: "monospace",
              lineHeight: 1,
              transition: "color 0.3s",
            }}
          >
            {score2}
          </span>
        </div>

        {/* Team 2 */}
        <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
          <p
            style={{
              color: "#94a3b8",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            Away
          </p>
          <p
            style={{
              color: score2 >= score1 ? "#f1f5f9" : "#475569",
              fontWeight: 800,
              fontSize: 18,
              margin: "2px 0 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
              letterSpacing: "0.02em",
              transition: "color 0.3s",
            }}
          >
            {t2?.family?.toUpperCase() ?? "—"}
          </p>
          {so2.length > 0 && <ShootoutRow results={so2} align="right" />}
        </div>
      </div>

      {/* ── Draw badge ──────────────────────────────────────────────────── */}
      {match.isDraw && (
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <span
            style={{
              color: "#94a3b8",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Draw
          </span>
        </div>
      )}

      {/* ── Goal feed ───────────────────────────────────────────────────── */}
      {match.participants && <GoalFeed participants={match.participants} />}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: "#334155",
          borderTop: "1px solid #1e293b",
          paddingTop: 8,
        }}
      >
        <span>
          {fmt(match.round)}
          {match.pool ? ` · Pool ${match.pool}` : ""}
        </span>
        <span>{fmt(match.venue)}</span>
      </div>

      <style>{`
        @keyframes livePing {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}

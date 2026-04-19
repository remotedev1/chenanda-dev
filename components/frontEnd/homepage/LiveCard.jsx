"use client";

import { cx } from "class-variance-authority";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── Web Audio sound synthesiser ─────────────────────────────────────────────

function useAudioEngine() {
  const ctxRef = useRef(null);

  // ✅ Prime AudioContext on first user gesture (fixes browser autoplay block)
  useEffect(() => {
    const prime = () => {
      if (!ctxRef.current) {
        ctxRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      if (ctxRef.current.state === "suspended") {
        ctxRef.current.resume();
      }
      window.removeEventListener("click", prime);
      window.removeEventListener("touchstart", prime);
    };
    window.addEventListener("click", prime);
    window.addEventListener("touchstart", prime);
    return () => {
      window.removeEventListener("click", prime);
      window.removeEventListener("touchstart", prime);
    };
  }, []);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  // 🏁 Match complete: triumphant fanfare
  const playNotification = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const notes = [261.6, 329.6, 392, 523.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.14);
        gain.gain.setValueAtTime(0.5, now + i * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.4);
        osc.start(now + i * 0.14);
        osc.stop(now + i * 0.14 + 0.45);
      });
    } catch (_) {}
  }, [getCtx]);

  return { playNotification };
}

// ─── Notification toast stack ─────────────────────────────────────────────────

let _notifId = 0;
const NOTIF_DURATION = 4200;

const NOTIF_STYLES = {
  GOAL: {
    icon: "🏑",
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
    border: "#10b981",
    accent: "#34d399",
    label: "GOAL!",
  },
  SHOOTOUT: {
    icon: "🥅",
    bg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    border: "#818cf8",
    accent: "#a5b4fc",
    label: "SHOOTOUT",
  },
  COMPLETE: {
    icon: "🏁",
    bg: "linear-gradient(135deg, #1c1917 0%, #292524 100%)",
    border: "#f59e0b",
    accent: "#fbbf24",
    label: "FULL TIME",
  },
};

function NotificationToast({ notif, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const s = NOTIF_STYLES[notif.type] || NOTIF_STYLES.GOAL;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10);
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(notif.id), 350);
    }, NOTIF_DURATION);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [notif.id, onDismiss]);

  return (
    <div
      onClick={() => {
        setVisible(false);
        setTimeout(() => onDismiss(notif.id), 350);
      }}
      style={{
        cursor: "pointer",
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `4px solid ${s.border}`,
        borderRadius: 12,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 280,
        maxWidth: 360,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${s.border}22`,
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
        userSelect: "none",
        willChange: "transform, opacity",
        position: "relative",
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>
        {s.icon}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: s.accent,
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          {s.label}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#f1f5f9",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {notif.title}
        </div>
        {notif.subtitle && (
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            {notif.subtitle}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          borderRadius: "0 0 12px 12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: s.border,
            animation: `notifProgress ${NOTIF_DURATION}ms linear forwards`,
            transformOrigin: "left",
          }}
        />
      </div>
    </div>
  );
}

function NotificationStack({ notifications, onDismiss }) {
  if (!notifications.length) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {/* {notifications.map((n) => (
        <div key={n.id} style={{ pointerEvents: "all", position: "relative" }}>
          <NotificationToast notif={n} onDismiss={onDismiss} />
        </div>
      ))} */}
      <style>{`
        @keyframes notifProgress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Hook: diff previous vs current match, fire events ───────────────────────

function useMatchEvents(match, onGoal, onShootout, onComplete) {
  const prevRef = useRef(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = match;
    if (!prev || !match) return;

    const prevParticipants = prev.participants ?? [];
    const currParticipants = match.participants ?? [];

    // ── Goal detection ──────────────────────────────────────────────────
    currParticipants.forEach((cp, idx) => {
      const pp = prevParticipants[idx];
      const prevGoals = pp?.hockeyData?.goals ?? pp?.footballData?.goals ?? 0;
      const currGoals = cp?.hockeyData?.goals ?? cp?.footballData?.goals ?? 0;

      if (currGoals > prevGoals) {
        const prevDetails =
          pp?.hockeyData?.goalDetails ?? pp?.footballData?.goalDetails ?? [];
        const currDetails =
          cp?.hockeyData?.goalDetails ?? cp?.footballData?.goalDetails ?? [];
        const newGoals = currDetails.slice(prevDetails.length);

        newGoals.forEach((g) => {
          onGoal({
            type: "GOAL",
            title: g.playerName
              ? `${g.playerName} scores!`
              : `${cp.family} score!`,
            subtitle:
              `${cp.family} · ${g.minute ?? ""}′ ${g.type ? `· ${g.type}` : ""}`.trim(),
          });
        });

        if (!newGoals.length) {
          onGoal({
            type: "GOAL",
            title: `${cp.family} score!`,
            subtitle: match.round ? match.round.replace(/_/g, " ") : "",
          });
        }
      }
    });

    // ── Shootout detection ──────────────────────────────────────────────
    currParticipants.forEach((cp, idx) => {
      const pp = prevParticipants[idx];
      const prevSO = pp?.hockeyData?.shootoutResults ?? [];
      const currSO = cp?.hockeyData?.shootoutResults ?? [];
      if (currSO.length > prevSO.length) {
        const scored = currSO[currSO.length - 1];
        onShootout({
          type: "SHOOTOUT",
          title: scored
            ? `${cp.family} convert the penalty!`
            : `${cp.family} miss — saved!`,
          subtitle: `Shootout · ${currSO.filter(Boolean).length}/${currSO.length} scored`,
        });
      }
    });

    // ── Match complete ──────────────────────────────────────────────────
    const completedStatuses = ["COMPLETED", "WALKOVER"];
    if (
      !completedStatuses.includes(prev.status) &&
      completedStatuses.includes(match.status)
    ) {
      const t1 = currParticipants[0];
      const t2 = currParticipants[1];
      const s1 = t1?.hockeyData?.goals ?? t1?.footballData?.goals ?? 0;
      const s2 = t2?.hockeyData?.goals ?? t2?.footballData?.goals ?? 0;

      // ✅ Prefer matchWinner field; fall back to score comparison
      const winner = match.matchWinner
        ? match.matchWinner
        : s1 > s2
          ? t1?.family
          : s2 > s1
            ? t2?.family
            : null;

      const isDraw = !winner;

      onComplete({
        type: "COMPLETE",
        isDraw,
        title: winner ? `${winner} win!` : "It's a draw!",
        subtitle: `Final score: ${s1} – ${s2}`,
      });
    }
  }, [match, onGoal, onShootout, onComplete]);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  return (str ?? "").replace(/_/g, " ").split(" ").join("");
}

function fmtPeriod(str) {
  return (str ?? "")
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

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
            style={{ color: "blue", fontFamily: "monospace" }}
            className="font-semibold text-md"
          >
            {e.minute ?? "—"}′
          </span>
          <span style={{ fontSize: 13 }}>🏑</span>
          <span
            style={{ color: "black", fontWeight: 600 }}
            className="capitalize"
          >
            {e.playerName}
          </span>
          <span style={{ color: "#475569" }}>·</span>
          <span style={{ color: "#64748b" }} className="capitalize">
            {e.family}
          </span>
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
              {fmtPeriod(e.type)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function useUpdatePulse(match) {
  const [pulse, setPulse] = useState(false);
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setPulse(true);
    const id = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(id);
  }, [match]);
  return pulse;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export default function LiveCard({ match }) {
  const pulse = useUpdatePulse(match);
  const [notifications, setNotifications] = useState([]);
  const [audioReady, setAudioReady] = useState(false);
  const { playNotification } = useAudioEngine();

  // Show "click to enable audio" hint until first interaction
  useEffect(() => {
    const onInteract = () => {
      setAudioReady(true);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
    window.addEventListener("click", onInteract);
    window.addEventListener("touchstart", onInteract);
    return () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, []);

  const pushNotif = useCallback((data) => {
    setNotifications((prev) => [...prev, { ...data, id: ++_notifId }]);
  }, []);

  const dismissNotif = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const onGoal = useCallback(
    (data) => {
      playNotification();
      pushNotif(data);
    },
    [playNotification, pushNotif],
  );

  const onShootout = useCallback(
    (data) => {
      playNotification();
      pushNotif(data);
    },
    [playNotification, pushNotif],
  );

  const onComplete = useCallback(
    (data) => {
      playNotification();
      pushNotif(data);
    },
    [playNotification, pushNotif],
  );

  useMatchEvents(match, onGoal, onShootout, onComplete);

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
    <>
      {/* <NotificationStack
        notifications={notifications}
        onDismiss={dismissNotif}
      /> */}

      <div
        style={{
          background: pulse ? "#000" : "#fff",
          border: `1px solid ${pulse ? "#000" : "#e2e8f0"}`,
          borderRadius: 16,
          transition: "background 0.3s, border-color 0.3s",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          position: "relative",
        }}
        className="select-none p-2 md:p-4 w-[90vw] md:w-[84vw] lg:w-[400px] "
      >
        {/* Audio hint */}
        {!audioReady && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 12,
              fontSize: 10,
              color: pulse ? "#ffffff60" : "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>🔇</span>
            <span>Click to enable audio</span>
          </div>
        )}

        {/* Status + period */}
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
              <span
                style={{ color: pulse ? "#ffffff60" : "#64748b", fontSize: 11 }}
              >
                {fmt(match.currentPeriod)}
              </span>
            )}
          </div>
        </div>

        {/* Scoreline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Team 1 */}
          <div
            style={{ flex: 1, minWidth: 0 }}
            className={cx(
              "transition-colors duration-300 font-semibold truncate text-sm md:text-lg",
              pulse ? " text-white" : "text-black",
            )}
          >
            {t1?.family?.toUpperCase()}
            {so1.length > 0 && <ShootoutRow results={so1} align="left" />}
          </div>
          {/* Score */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
            className="gap-1"
          >
            <span
              className={cx(
                "text-[38px] font-black font-mono leading-none transition-colors duration-300",
                score1 > score2
                  ? pulse
                    ? "text-white"
                    : "text-black"
                  : pulse
                    ? "text-white/40"
                    : "text-black/30",
              )}
            >
              {score1}
            </span>
            <span
              style={{
                color: pulse ? "white" : "black",
                fontSize: 28,
                fontWeight: 800,
              }}
              className="animate-ping"
            >
              :
            </span>
            <span
              className={cx(
                "text-[38px] font-black font-mono leading-none transition-colors duration-300",
                score2 > score1
                  ? pulse
                    ? "text-white"
                    : "text-black"
                  : pulse
                    ? "text-white/40"
                    : "text-black/30",
              )}
            >
              {score2}
            </span>
          </div>

          {/* Team 2 */}
          <div
            style={{ flex: 1, minWidth: 0, textAlign: "right" }}
            className={cx(
              "transition-colors duration-300 font-semibold truncate text-sm md:text-lg",
              pulse ? " text-white" : "text-black",
            )}
          >
            {t2?.family?.toUpperCase()}
            {so2.length > 0 && <ShootoutRow results={so2} align="right" />}
          </div>
        </div>

        {/* Goal feed */}
        {match.participants && <GoalFeed participants={match.participants} />}

        {/* Footer */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            borderTop: `1px solid ${pulse ? "#ffffff15" : "#e2e8f0"}`,
            paddingTop: 8,
            color: pulse ? "#ffffff50" : "black",
            transition: "border-color 0.3s, color 0.3s",
          }}
        >
          {/* <span>
            {fmt(match.round)}
            {match.pool ? ` · Pool ${match.pool}` : ""}
          </span> */}
          <span>{fmt(match.venue)}</span>
        </div>

        <style>{`
    @keyframes livePing {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.4; transform: scale(1.5); }
    }
  `}</style>
      </div>
    </>
  );
}

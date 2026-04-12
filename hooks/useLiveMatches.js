import { status } from "nprogress";
import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";

const SOCKET_URL = typeof window !== "undefined" && window.location.origin;

let _socket = null;
export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!_socket) {
    _socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    _socket.on("connect", () =>
      console.log("[socket] ✅ connected, id:", _socket.id),
    );
    _socket.on("connect_error", (e) =>
      console.log("[socket] ❌ connect_error:", e.message),
    );
    _socket.on("disconnect", (r) => console.log("[socket] ⚠️  disconnect:", r));
  }
  return _socket;
}

// ─────────────────────────────────────────────────────────────────────────────
// useLiveMatches
// ─────────────────────────────────────────────────────────────────────────────
export function useLiveMatches(apiUrl = "/api/tournaments/live") {
  const [matches, setMatches] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const pollingInterval = useRef(null);
  const hasRequestedInitial = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${apiUrl}?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const list = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.data)
            ? json.data.data
            : [];

      setMatches({ data: list });
    } catch (err) {
      console.error("[useLiveMatches] Load error:", err);
      setError(err.message);
    }
  }, [apiUrl]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  // Polling fallback — refresh every 5 seconds when socket is disconnected
  useEffect(() => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    pollingInterval.current = setInterval(() => {
      if (!isConnected) {
        load();
      }
    }, 5000);

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [isConnected, load]);

  // Socket listeners
  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const onUserCount = ({ count }) => setUserCount(count);

    const onConnect = () => {
      setIsConnected(true);
      load();

      // ✅ NEW: Request initial live matches from server
      if (!hasRequestedInitial.current) {
        s.emit("requestLiveMatches");
        hasRequestedInitial.current = true;
      }
    };

    const onDisconnect = () => {
      console.log("[useLiveMatches] Socket disconnected");
      setIsConnected(false);
      hasRequestedInitial.current = false; // Reset so we request again on reconnect
    };

    // ✅ NEW: Listen for initial matches broadcast
    const onInitialLiveMatches = ({ data }) => {
      if (Array.isArray(data)) {
        console.log("[useLiveMatches] Received initial matches:", data.length);
        setMatches({ data });
      }
    };

    const onMatchData = ({ matchId, data }) => {
      if (!matchId || !data) return;
      const incomingId = String(matchId);

      if (data.status === "COMPLETED") return;
      setMatches((prev) => {
        const list = prev?.data ?? [];
        const exists = list.some((m) => String(m.id) === incomingId);
        // If the match isn't in the list yet, add it
        if (!exists) {
          return { ...prev, data: [...list, { id: incomingId, ...data }] };
        }
        const updated = list.map((m) =>
          String(m.id) === incomingId ? { ...m, ...data, id: m.id } : m,
        );
        return { ...prev, data: updated };
      });
    };

    const onMatchStarted = () => setTimeout(() => load(), 500);
    const onMatchEnded = () => setTimeout(() => load(), 1000);

    const onGameAdded = ({ matchId, data }) => {
      if (!matchId || !data) return;
      const incomingId = String(matchId);

      setMatches((prev) => {
        const list = prev?.data ?? [];
        const exists = list.some((m) => String(m.id) === incomingId);
        if (!exists) {
          return { ...prev, data: [...list, { id: incomingId, ...data }] };
        }
        return prev;
      });
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("initialLiveMatches", onInitialLiveMatches); // ✅ NEW
    s.on("matchData", onMatchData);
    s.on("gameAdded", onGameAdded);
    s.on("matchStarted", onMatchStarted);
    s.on("matchEnded", onMatchEnded);
    s.on("userCount", onUserCount);

    if (s.connected) {
      setIsConnected(true);
      if (!hasRequestedInitial.current) {
        s.emit("requestLiveMatches");
        hasRequestedInitial.current = true;
      }
    }

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("initialLiveMatches", onInitialLiveMatches); // ✅ NEW
      s.off("matchData", onMatchData);
      s.off("gameAdded", onGameAdded);
      s.off("matchStarted", onMatchStarted);
      s.off("matchEnded", onMatchEnded);
      s.off("userCount", onUserCount);
    };
  }, [load]);

  return { matches, loading, error, isConnected, refetch: load, userCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// useLiveMatchControl (unchanged, but included for completeness)
// ─────────────────────────────────────────────────────────────────────────────
export function useLiveMatchControl(
  matchId,
  tournamentId,
  initialMatch = null,
) {
  const [match, setMatch] = useState(initialMatch);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const matchRef = useRef(match);
  const selfEmittedRef = useRef(new Set());

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  useEffect(() => {
    if (initialMatch) setMatch(initialMatch);
  }, [initialMatch]);

  useEffect(() => {
    if (!matchId) return;
    const id = String(matchId);
    const s = getSocket();
    if (!s) return;

    const onUserCount = ({ count }) => setUserCount(count);
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onMatchData = ({ matchId: mid, data, fromSocketId }) => {
      if (String(mid) !== id || !data) return;
      if (fromSocketId && fromSocketId === s.id) return;
      setMatch((prev) => ({ ...prev, ...data }));
    };

    const onMatchStarted = ({ matchId: mid, data, fromSocketId }) => {
      const key = `started-${mid}`;
      if (fromSocketId === s?.id && selfEmittedRef.current.has(key)) {
        selfEmittedRef.current.delete(key);
        return;
      }
      if (String(mid) === id && data) {
        setMatch((prev) => ({ ...prev, ...data, status: "LIVE" }));
      }
    };

    const onMatchEnded = ({ matchId: mid, data, fromSocketId }) => {
      const key = `ended-${mid}`;
      if (fromSocketId === s?.id && selfEmittedRef.current.has(key)) {
        selfEmittedRef.current.delete(key);
        return;
      }
      if (String(mid) !== id || !data) return;
      setMatch((prev) => ({
        ...prev,
        ...data,
        status: "COMPLETED",
        participants: (data?.participants ?? prev?.participants ?? []).map(
          (p) => ({
            ...p,
            hockeyData: { goals: 0, goalDetails: [], shootoutResults: [] },
          }),
        ),
      }));
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("matchData", onMatchData);
    s.on("matchStarted", onMatchStarted);
    s.on("matchEnded", onMatchEnded);
    s.on("userCount", onUserCount); // ✅ ADD

    if (s.connected) setIsConnected(true);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("matchData", onMatchData);
      s.off("matchStarted", onMatchStarted);
      s.off("matchEnded", onMatchEnded);
      s.off("userCount", onUserCount);
    };
  }, [matchId]);

  const apiBase = `/api/tournaments/${tournamentId}/matches/${matchId}`;

  const broadcast = useCallback(
    (updated) => {
      const s = getSocket();
      if (!s) return;
      s.emit("gameData", {
        matchId: String(matchId),
        fromSocketId: s.id,
        ...updated,
      });
    },
    [matchId],
  );

  const run = useCallback(
    async ({ optimisticFn, apiFn, successMsg, errorMsg }) => {
      const prev = matchRef.current;
      if (optimisticFn) setMatch(optimisticFn(prev));
      setLoading(true);
      setError(null);
      try {
        const updated = await apiFn();
        setMatch(updated);
        broadcast(updated);
        if (successMsg) toast.success(successMsg);
        return updated;
      } catch (err) {
        setMatch(prev);
        const msg = err?.message || errorMsg || "Something went wrong";
        setError(msg);
        toast.error(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [broadcast],
  );

  const patch = useCallback(
    async (body) => {
      const res = await fetch(apiBase, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.message || `HTTP ${res.status}`);
      }
      const d = await res.json();
      return d.data ?? d;
    },
    [apiBase],
  );

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBase);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      const fresh = d.data ?? d;
      setMatch(fresh);
      broadcast(fresh);
    } catch {
      toast.error("Failed to refresh match data");
    } finally {
      setLoading(false);
    }
  }, [apiBase, broadcast]);

  const startMatch = useCallback(async () => {
    const updated = await run({
      optimisticFn: (m) => ({
        ...m,
        status: "LIVE",
        actualStartTime: new Date().toISOString(),
      }),
      apiFn: () => patch({ action: "START_MATCH" }),
      successMsg: "Match started! 🏑",
      errorMsg: "Failed to start match",
    });

    if (!updated) return;

    const s = getSocket();
    if (!s) return;

    selfEmittedRef.current.add(`started-${matchId}`);
    s.emit("matchStarted", { matchId: String(matchId), data: updated });
    s.emit("gameData", {
      matchId: String(matchId),
      fromSocketId: s.id,
      ...updated,
    });
  }, [run, patch, matchId]);

  const endMatch = useCallback(() => {
    const m = matchRef.current;
    const [p1, p2] = m?.participants ?? [];

    const goals1 = p1?.hockeyData?.goals ?? 0;
    const goals2 = p2?.hockeyData?.goals ?? 0;

    const so1Results = p1?.hockeyData?.shootoutResults ?? [];
    const so2Results = p2?.hockeyData?.shootoutResults ?? [];
    const so1 = so1Results.filter(Boolean).length;
    const so2 = so2Results.filter(Boolean).length;

    const hasShootout = so1Results.length > 0 || so2Results.length > 0;

    let winnerId = null;
    let isDraw = false;

    if (goals1 !== goals2) {
      winnerId = goals1 > goals2 ? p1?.familyId : p2?.familyId;
    } else if (hasShootout) {
      if (so1 !== so2) {
        winnerId = so1 > so2 ? p1?.familyId : p2?.familyId;
      } else {
        isDraw = true;
      }
    } else {
      isDraw = true;
    }

    return run({
      optimisticFn: (m) => ({
        ...m,
        status: "COMPLETED",
        actualEndTime: new Date().toISOString(),
        winnerId,
        isDraw,
      }),
      apiFn: () => patch({ action: "END_MATCH", winnerId, isDraw }),
      successMsg: isDraw ? "Match ended — Draw" : "Match ended — Winner set 🏆",
      errorMsg: "Failed to end match",
    }).then((updated) => {
      if (!updated) return;
      const s = getSocket();
      if (!s) return;

      selfEmittedRef.current.add(`ended-${matchId}`);
      s.emit("matchEnded", { matchId: String(matchId), data: updated });
    });
  }, [run, patch, matchId]);

  const setPeriod = useCallback(
    (period) =>
      run({
        optimisticFn: (m) => ({ ...m, currentPeriod: period }),
        apiFn: () => patch({ action: "SET_PERIOD", period }),
        errorMsg: "Failed to update period",
      }),
    [run, patch],
  );

  const setStatus = useCallback(
    (status) =>
      run({
        optimisticFn: (m) => ({ ...m, status }),
        apiFn: () => patch({ action: "SET_STATUS", status }),
        successMsg: `Status → ${status}`,
        errorMsg: "Failed to update status",
      }),
    [run, patch],
  );

  const setWinner = useCallback(
    (familyId) =>
      run({
        optimisticFn: (m) => ({ ...m, winnerId: familyId, isDraw: false }),
        apiFn: () => patch({ action: "SET_WINNER", familyId }),
        successMsg: "Winner declared 🏆",
        errorMsg: "Failed to set winner",
      }),
    [run, patch],
  );

  const setDraw = useCallback(
    () =>
      run({
        optimisticFn: (m) => ({ ...m, isDraw: true, winnerId: null }),
        apiFn: () => patch({ action: "SET_DRAW" }),
        successMsg: "Match declared a draw",
        errorMsg: "Failed to set draw",
      }),
    [run, patch],
  );

  const setManOfMatch = useCallback(
    (playerId) =>
      run({
        optimisticFn: (m) => ({ ...m, manOfTheMatchId: playerId }),
        apiFn: () =>
          patch({ action: "MAN_OF_THE_MATCH", manOfTheMatchId: playerId }),
        successMsg: "Player of the match set 🌟",
        errorMsg: "Failed to set player of match",
      }),
    [run, patch],
  );

  const addHockeyGoal = useCallback(
    (familyId, goalForm) =>
      run({
        optimisticFn: (m) => ({
          ...m,
          participants: m.participants.map((p) =>
            p.familyId !== familyId
              ? p
              : {
                  ...p,
                  hockeyData: {
                    ...p.hockeyData,
                    goals: (p.hockeyData?.goals ?? 0) + 1,
                    goalDetails: [
                      ...(p.hockeyData?.goalDetails ?? []),
                      {
                        playerId: goalForm.playerId,
                        playerName: goalForm.playerName,
                        minute: goalForm.minute,
                        jerseyNumber: goalForm.jerseyNumber,
                        type: goalForm.type,
                      },
                    ],
                  },
                },
          ),
        }),
        apiFn: () =>
          patch({ action: "ADD_HOCKEY_GOAL", familyId, goal: goalForm }),
        successMsg: "Goal logged! ⚽",
        errorMsg: "Failed to log goal",
      }),
    [run, patch],
  );

  const deleteHockeyGoal = useCallback(
    (familyId, goalIndex) =>
      run({
        optimisticFn: (m) => ({
          ...m,
          participants: m.participants.map((p) => {
            if (p.familyId !== familyId) return p;
            const details = [...(p.hockeyData?.goalDetails ?? [])];
            details.splice(goalIndex, 1);
            return {
              ...p,
              hockeyData: {
                ...p.hockeyData,
                goals: Math.max(0, (p.hockeyData?.goals ?? 1) - 1),
                goalDetails: details,
              },
            };
          }),
        }),
        apiFn: () =>
          patch({ action: "DELETE_HOCKEY_GOAL", familyId, goalIndex }),
        successMsg: "Goal removed",
        errorMsg: "Failed to remove goal",
      }),
    [run, patch],
  );

  const addShootout = useCallback(
    (familyId, scored) =>
      run({
        optimisticFn: (m) => ({
          ...m,
          participants: m.participants.map((p) =>
            p.familyId !== familyId
              ? p
              : {
                  ...p,
                  hockeyData: {
                    ...p.hockeyData,
                    shootoutResults: [
                      ...(p.hockeyData?.shootoutResults ?? []),
                      scored,
                    ],
                  },
                },
          ),
        }),
        apiFn: () => patch({ action: "ADD_SHOOTOUT", familyId, scored }),
        errorMsg: "Failed to record penalty",
      }),
    [run, patch],
  );

  const deleteShootout = useCallback(
    (familyId, index) =>
      run({
        optimisticFn: (m) => ({
          ...m,
          participants: m.participants.map((p) => {
            if (p.familyId !== familyId) return p;
            const results = [...(p.hockeyData?.shootoutResults ?? [])];
            results.splice(index, 1);
            return {
              ...p,
              hockeyData: { ...p.hockeyData, shootoutResults: results },
            };
          }),
        }),
        apiFn: () =>
          patch({ action: "DELETE_SHOOTOUT", familyId, shootoutIndex: index }),
        successMsg: "Penalty removed",
        errorMsg: "Failed to remove penalty",
      }),
    [run, patch],
  );

  const setWalkover = useCallback(
    (familyId) =>
      run({
        optimisticFn: (m) => ({
          ...m,
          status: "COMPLETED",
          winnerId: familyId,
          participants: m.participants.map((p) => ({
            ...p,
            walkover: p.familyId === familyId,
          })),
        }),
        apiFn: () => patch({ action: "SET_WALKOVER", familyId }),
        successMsg: "Walkover awarded",
        errorMsg: "Failed to set walkover",
      }),
    [run, patch],
  );

  const addNote = useCallback(
    (notes) =>
      run({
        optimisticFn: (m) => ({ ...m, notes }),
        apiFn: () => patch({ action: "ADD_NOTE", notes }),
        successMsg: "Notes saved",
        errorMsg: "Failed to save notes",
      }),
    [run, patch],
  );

  const addPlayer = useCallback(
    async (familyId, playerName) => {
      const res = await fetch(`/api/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, familyId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.message || "Failed to add player");
      }
      await refetch();
    },
    [refetch],
  );

  return {
    match,
    error,
    loading,
    isConnected,
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
    userCount,
  };
}

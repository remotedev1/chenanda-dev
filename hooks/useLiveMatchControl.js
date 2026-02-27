// hooks/useLiveMatchControl.js
"use client";

import { useCallback, useRef, useReducer, useEffect } from "react";
import { toast } from "sonner";
import { io } from "socket.io-client";

/* ─────────────────────────────────────────────
   Reducer
───────────────────────────────────────────── */

const initialState = {
  pending: new Set(),
  match: null,
  error: null,
  socket: null,
  isConnected: false,
  activeUsers: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "INIT":
      return { ...state, match: action.payload, error: null };

    case "ACTION_START":
      return {
        ...state,
        error: null,
        pending: new Set([...state.pending, action.key]),
        match: action.optimistic
          ? deepMergeMatch(state.match, action.optimistic)
          : state.match,
      };

    case "ACTION_SUCCESS":
      return {
        ...state,
        match: action.payload,
        pending: new Set([...state.pending].filter((k) => k !== action.key)),
      };

    case "ACTION_REVERT":
      return {
        ...state,
        match: action.previous,
        error: action.error,
        pending: new Set([...state.pending].filter((k) => k !== action.key)),
      };

    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };

    case "SET_ACTIVE_USERS":
      return { ...state, activeUsers: action.payload };

    default:
      return state;
  }
}

/* Deep merge helper for nested participant data */
function deepMergeMatch(match, patch) {
  if (!match) return patch;
  return { ...match, ...patch };
}

/* ─────────────────────────────────────────────
   Optimistic patches per action type
───────────────────────────────────────────── */

function getOptimisticPatch(actionType, payload, currentMatch) {
  const now = new Date().toISOString();

  switch (actionType) {
    case "START_MATCH":
      return { status: "LIVE", actualStartTime: now, currentPeriod: "WARM_UP" };

    case "END_MATCH":
      return {
        status: "COMPLETED",
        actualEndTime: now,
        currentPeriod: "FULL_TIME",
      };

    case "SET_PERIOD":
      return { currentPeriod: payload.period };

    case "SET_STATUS":
      return {
        status: payload.status,
        ...(payload.status === "LIVE" ? { actualStartTime: now } : {}),
        ...(["COMPLETED", "ABANDONED", "WALKOVER"].includes(payload.status)
          ? { actualEndTime: now }
          : {}),
      };

    case "SET_WINNER":
      return {
        winnerId: payload.winnerId,
        winnerName: payload.winnerName,
        isDraw: false,
      };

    case "SET_DRAW":
      return { isDraw: true, winnerId: null, winnerName: null };

    case "SET_MAN_OF_MATCH":
      return { manOfTheMatchId: payload.manOfTheMatchId };

    case "ADD_NOTE":
      return { notes: payload.note };

    case "ADD_HOCKEY_GOAL": {
      const participants = (currentMatch?.participants || []).map((p) => {
        if (p.familyId !== payload.familyId) return p;
        const hockeyData = p.hockeyData || {
          goals: 0,
          shootoutResults: [],
          goalDetails: [],
        };
        return {
          ...p,
          hockeyData: {
            ...hockeyData,
            goals: hockeyData.goals + 1,
            goalDetails: [
              ...(hockeyData.goalDetails || []),
              {
                minute: payload.minute,
                period: payload.period,
                type: payload.type,
                playerId: payload.playerId,
                playerName: payload.playerName,
                jerseyNumber: payload.jerseyNumber || null,
              },
            ],
          },
        };
      });
      return { participants };
    }

    case "DELETE_HOCKEY_GOAL": {
      const participants = (currentMatch?.participants || []).map((p) => {
        if (p.familyId !== payload.familyId) return p;
        const hd = p.hockeyData || {
          goals: 0,
          shootoutResults: [],
          goalDetails: [],
        };
        const goalDetails = (hd.goalDetails || []).filter(
          (_, i) => i !== payload.index,
        );
        return {
          ...p,
          hockeyData: { ...hd, goals: Math.max(0, hd.goals - 1), goalDetails },
        };
      });
      return { participants };
    }

    case "ADD_SHOOTOUT": {
      const participants = (currentMatch?.participants || []).map((p) => {
        if (p.familyId !== payload.familyId) return p;
        const hd = p.hockeyData || {
          goals: 0,
          shootoutResults: [],
          goalDetails: [],
        };
        return {
          ...p,
          hockeyData: {
            ...hd,
            shootoutResults: [...(hd.shootoutResults || []), payload.scored],
          },
        };
      });
      return { participants };
    }

    case "DELETE_SHOOTOUT": {
      const participants = (currentMatch?.participants || []).map((p) => {
        if (p.familyId !== payload.familyId) return p;
        const hd = p.hockeyData || {
          goals: 0,
          shootoutResults: [],
          goalDetails: [],
        };
        return {
          ...p,
          hockeyData: {
            ...hd,
            shootoutResults: (hd.shootoutResults || []).filter(
              (_, i) => i !== payload.index,
            ),
          },
        };
      });
      return { participants };
    }

    case "SET_WALKOVER": {
      const participants = (currentMatch?.participants || []).map((p) => ({
        ...p,
        walkover: p.familyId === payload.familyId ? true : p.walkover,
      }));
      return { participants, status: "WALKOVER" };
    }

    case "ADD_FOOTBALL_GOAL":
    case "DELETE_FOOTBALL_GOAL":
    case "ADD_CRICKET_DATA":
      // For football/cricket, just do a refetch - complex to optimistically update
      return null;

    default:
      return null;
  }
}

/* ─────────────────────────────────────────────
   Main hook
───────────────────────────────────────────── */

export function useLiveMatchControl(
  matchId,
  tournamentId,
  initialMatch = null,
) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    match: initialMatch,
  });

  const abortRefs = useRef({});
  const socketRef = useRef(null);
  // Always keep a ref to the latest state to avoid stale closures in dispatch_action
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    if (initialMatch) {
      dispatch({ type: "INIT", payload: initialMatch });
    }
  }, [initialMatch]);

  /* ── Socket.IO setup ── */
  useEffect(() => {
    if (!matchId) return;

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
      },
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      dispatch({ type: "SET_CONNECTED", payload: true });
      toast.success("Connected to live server", {
        id: "socket-connect",
        duration: 2000,
      });
    });

    socket.on("disconnect", () => {
      dispatch({ type: "SET_CONNECTED", payload: false });
    });

    socket.on("connect_error", () => {
      dispatch({ type: "SET_CONNECTED", payload: false });
    });

    socket.on("gameDataUpdated", (updatedMatch) => {
      if (updatedMatch?.id === matchId) {
        dispatch({ type: "INIT", payload: updatedMatch });
      }
    });

    socket.on("userCount", (count) => {
      dispatch({ type: "SET_ACTIVE_USERS", payload: count });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("gameDataUpdated");
      socket.off("userCount");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [matchId]);

  /* ── Broadcast via socket after a server success ── */
  const broadcastUpdate = useCallback((updatedMatch) => {
    if (socketRef.current?.connected && updatedMatch) {
      socketRef.current.emit("gameData", updatedMatch);
    }
  }, []);

  /* ── Core PATCH dispatcher ── */
  const dispatch_action = useCallback(
    async (actionType, payload = {}, key = actionType) => {
      // Always read from ref to avoid stale closures — state.match is null on first render
      const { pending, match: currentMatch } = stateRef.current;

      if (pending.has(key)) return null;

      if (abortRefs.current[key]) {
        abortRefs.current[key].abort();
      }
      const controller = new AbortController();
      abortRefs.current[key] = controller;

      const previousMatch = currentMatch;
      const optimistic = getOptimisticPatch(actionType, payload, currentMatch);

      dispatch({ type: "ACTION_START", key, optimistic });

      try {
        const response = await fetch(
          `/api/tournaments/${tournamentId}/matches/${matchId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: actionType, ...payload }),
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || `${actionType} failed`);
        }

        const result = await response.json();

        const updatedMatch = result.data.data;
        dispatch({ type: "ACTION_SUCCESS", key, payload: updatedMatch });
        broadcastUpdate(updatedMatch);
        return updatedMatch;
      } catch (err) {
        if (err.name === "AbortError") return null;
        dispatch({
          type: "ACTION_REVERT",
          key,
          previous: previousMatch,
          error: err.message,
        });
        toast.error(err.message || "Action failed");
        throw err;
      } finally {
        delete abortRefs.current[key];
      }
    },
    [matchId, broadcastUpdate], // stateRef always has latest — no stale dep needed
  );

  /* ── Full refetch (for complex mutations) ── */
  const refetch = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/matches/${matchId}`,
      );
      if (!res.ok) throw new Error("Refetch failed");
      const data = await res.json();
      const match = data.data;
      dispatch({ type: "INIT", payload: match });
      broadcastUpdate(match);
      return match;
    } catch (err) {
      toast.error("Failed to refresh match data");
    }
  }, [matchId, broadcastUpdate]);

  /* ── Match lifecycle ── */
  const startMatch = useCallback(
    () => dispatch_action("START_MATCH"),
    [dispatch_action],
  );
  const endMatch = useCallback(
    () => dispatch_action("END_MATCH"),
    [dispatch_action],
  );

  /* ── Status & Period ── */
  const setPeriod = useCallback(
    (period) => dispatch_action("SET_PERIOD", { period }, `PERIOD_${period}`),
    [dispatch_action],
  );
  const setStatus = useCallback(
    (status) => dispatch_action("SET_STATUS", { status }, `STATUS_${status}`),
    [dispatch_action],
  );

  /* ── Result ── */
  const setWinner = useCallback(
    (winnerId, winnerName) =>
      dispatch_action("SET_WINNER", { winnerId, winnerName }),
    [dispatch_action],
  );
  const setDraw = useCallback(
    () => dispatch_action("SET_DRAW"),
    [dispatch_action],
  );
  const setManOfMatch = useCallback(
    (manOfTheMatchId) =>
      dispatch_action("SET_MAN_OF_MATCH", { manOfTheMatchId }),
    [dispatch_action],
  );

  /* ── Hockey specific ── */
  const addHockeyGoal = useCallback(
    (familyId, goalData) =>
      dispatch_action(
        "ADD_HOCKEY_GOAL",
        { familyId, ...goalData },
        `GOAL_${familyId}`,
      ),
    [dispatch_action],
  );
  const deleteHockeyGoal = useCallback(
    (familyId, index) =>
      dispatch_action(
        "DELETE_HOCKEY_GOAL",
        { familyId, index },
        `DEL_GOAL_${familyId}_${index}`,
      ),
    [dispatch_action],
  );
  const addShootout = useCallback(
    (familyId, scored) =>
      dispatch_action(
        "ADD_SHOOTOUT",
        { familyId, scored },
        `SHOOTOUT_${familyId}`,
      ),
    [dispatch_action],
  );
  const deleteShootout = useCallback(
    (familyId, index) =>
      dispatch_action(
        "DELETE_SHOOTOUT",
        { familyId, index },
        `DEL_SHOOTOUT_${familyId}_${index}`,
      ),
    [dispatch_action],
  );

  /* ── Football specific ── */
  const addFootballGoal = useCallback(
    (familyId, goalData) =>
      dispatch_action(
        "ADD_FOOTBALL_GOAL",
        { familyId, ...goalData },
        `FGOAL_${familyId}`,
      ).then(refetch),
    [dispatch_action, refetch],
  );
  const deleteFootballGoal = useCallback(
    (familyId, index) =>
      dispatch_action(
        "DELETE_FOOTBALL_GOAL",
        { familyId, index },
        `DEL_FGOAL_${familyId}_${index}`,
      ).then(refetch),
    [dispatch_action, refetch],
  );

  /* ── Walkover / Forfeit ── */
  const setWalkover = useCallback(
    (familyId) =>
      dispatch_action("SET_WALKOVER", { familyId }, `WALKOVER_${familyId}`),
    [dispatch_action],
  );

  /* ── Notes ── */
  const addNote = useCallback(
    (note) => dispatch_action("ADD_NOTE", { note }),
    [dispatch_action],
  );

  /* ── Player management ── */
  const addPlayer = useCallback(
    async (familyId, playerName) => {
      const res = await dispatch_action(
        "ADD_PLAYER",
        { familyId, playerName },
        `ADD_PLAYER_${familyId}`,
      );
      await refetch();
      return res;
    },
    [dispatch_action, refetch],
  );

  /* ── Sync from outside (socket, SSE, etc.) ── */
  const syncMatch = useCallback((match) => {
    dispatch({ type: "INIT", payload: match });
  }, []);

  /* ── Derived ── */
  const isAnyPending = state.pending.size > 0;
  const isActionPending = useCallback(
    (key) => stateRef.current.pending.has(key),
    [], // stateRef is stable
  );

  // Inside useLiveMatchControl, after all the callbacks are defined:
  useEffect(() => {
    refetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    match: state.match,
    error: state.error,
    isConnected: state.isConnected,
    activeUsers: state.activeUsers,

    // Loading
    loading: isAnyPending,
    isActionPending,
    pendingActions: state.pending,

    // Lifecycle
    startMatch,
    endMatch,

    // Status & Period
    setPeriod,
    setStatus,

    // Result
    setWinner,
    setDraw,
    setManOfMatch,

    // Hockey
    addHockeyGoal,
    deleteHockeyGoal,
    addShootout,
    deleteShootout,

    // Football
    addFootballGoal,
    deleteFootballGoal,

    // General
    setWalkover,
    addNote,
    addPlayer,

    // Utils
    syncMatch,
    refetch,
  };
}

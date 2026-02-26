// hooks/useLiveMatchControl.js
"use client";

import { useState, useCallback, useRef, useReducer } from "react";
import { toast } from "sonner";

const API_BASE = "/api/matches";

/* ─────────────────────────────────────────────
   State shape
   pending  : Set<string>  — which action keys are in-flight
   match    : object | null — optimistically updated match snapshot
   error    : string | null
───────────────────────────────────────────── */

const initialState = {
  pending: new Set(),
  match: null,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "INIT":
      return { ...state, match: action.payload };

    case "ACTION_START":
      return {
        ...state,
        error: null,
        pending: new Set([...state.pending, action.key]),
        // Apply optimistic patch immediately
        match: action.optimistic
          ? { ...state.match, ...action.optimistic }
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
        match: action.previous, // roll back on failure
        error: action.error,
        pending: new Set([...state.pending].filter((k) => k !== action.key)),
      };

    default:
      return state;
  }
}

/* ─────────────────────────────────────────────
   Optimistic patches per action type
   Returns a partial match object to merge in immediately
───────────────────────────────────────────── */

function getOptimisticPatch(actionType, payload) {
  switch (actionType) {
    case "START_MATCH":
      return { status: "LIVE", actualStartTime: new Date().toISOString(), currentPeriod: "WARM_UP" };

    case "END_MATCH":
      return { status: "COMPLETED", actualEndTime: new Date().toISOString(), currentPeriod: "FULL_TIME" };

    case "SET_PERIOD":
      return { currentPeriod: payload.period };

    case "SET_STATUS":
      return {
        status: payload.status,
        ...(payload.status === "LIVE" ? { actualStartTime: new Date().toISOString() } : {}),
        ...( ["COMPLETED", "ABANDONED", "WALKOVER"].includes(payload.status)
          ? { actualEndTime: new Date().toISOString() }
          : {}),
      };

    case "SET_WINNER":
      return { winnerId: payload.winnerId, winnerName: payload.winnerName, isDraw: false };

    case "SET_DRAW":
      return { isDraw: true, winnerId: null, winnerName: null };

    case "SET_MAN_OF_MATCH":
      // We can't fully optimistic-update the relation object, just the FK
      return { manOfTheMatchId: payload.manOfTheMatchId };

    case "ADD_NOTE":
      return { notes: payload.note };

    default:
      return null;
  }
}

/* ─────────────────────────────────────────────
   Main hook
───────────────────────────────────────────── */

export function useLiveMatchControl(matchId, initialMatch = null) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    match: initialMatch,
  });

  // Track in-flight AbortControllers per action key so we can cancel stale requests
  const abortRefs = useRef({});

  // Deduplicate: if same action key is already pending, skip
  const isPending = useCallback(
    (key) => state.pending.has(key),
    [state.pending]
  );

  /**
   * Core dispatcher — handles abort, optimistic update, and rollback.
   *
   * @param {string}  actionType  - e.g. "START_MATCH"
   * @param {object}  payload     - additional fields merged into PATCH body
   * @param {string}  [key]       - dedup key (defaults to actionType)
   */
  const dispatch_action = useCallback(
    async (actionType, payload = {}, key = actionType) => {
      // Deduplicate: don't fire the same logical action twice concurrently
      if (state.pending.has(key)) return null;

      // Cancel any previous request for this key (e.g. rapid status changes)
      if (abortRefs.current[key]) {
        abortRefs.current[key].abort();
      }
      const controller = new AbortController();
      abortRefs.current[key] = controller;

      const previousMatch = state.match;
      const optimistic = getOptimisticPatch(actionType, payload);

      dispatch({ type: "ACTION_START", key, optimistic });

      try {
        const response = await fetch(`${API_BASE}/${matchId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: actionType, ...payload }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || `${actionType} failed`);
        }

        const result = await response.json();
        const updatedMatch = result.data ?? result;

        dispatch({ type: "ACTION_SUCCESS", key, payload: updatedMatch });
        return updatedMatch;
      } catch (err) {
        if (err.name === "AbortError") return null; // silently ignore cancelled requests

        dispatch({ type: "ACTION_REVERT", key, previous: previousMatch, error: err.message });
        toast.error(err.message || "Action failed");
        throw err;
      } finally {
        delete abortRefs.current[key];
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matchId, state.pending, state.match]
  );

  // Sync external match data into the hook (e.g. after a full refetch)
  const syncMatch = useCallback((match) => {
    dispatch({ type: "INIT", payload: match });
  }, []);

  /* ── Stable action methods ── */

  const startMatch = useCallback(
    () => dispatch_action("START_MATCH"),
    [dispatch_action]
  );

  const endMatch = useCallback(
    () => dispatch_action("END_MATCH"),
    [dispatch_action]
  );

  const setPeriod = useCallback(
    (period) => dispatch_action("SET_PERIOD", { period }, `SET_PERIOD_${period}`),
    [dispatch_action]
  );

  const setStatus = useCallback(
    (status) => dispatch_action("SET_STATUS", { status }, `SET_STATUS_${status}`),
    [dispatch_action]
  );

  const setWinner = useCallback(
    (winnerId, winnerName) =>
      dispatch_action("SET_WINNER", { winnerId, winnerName, isDraw: false }),
    [dispatch_action]
  );

  const setDraw = useCallback(
    () => dispatch_action("SET_DRAW"),
    [dispatch_action]
  );

  const setManOfMatch = useCallback(
    (manOfTheMatchId) =>
      dispatch_action("SET_MAN_OF_MATCH", { manOfTheMatchId }),
    [dispatch_action]
  );

  const addNote = useCallback(
    (note) => dispatch_action("ADD_NOTE", { note }),
    [dispatch_action]
  );

  /* ── Derived helpers ── */

  // True if any action at all is in-flight
  const isAnyPending = state.pending.size > 0;

  // Check a specific action key
  const isActionPending = useCallback(
    (actionType, suffix = "") =>
      state.pending.has(suffix ? `${actionType}_${suffix}` : actionType),
    [state.pending]
  );

  return {
    // State
    match: state.match,
    error: state.error,

    // Loading indicators
    loading: isAnyPending,              // generic: any action pending
    isActionPending,                    // granular: specific action pending
    pendingActions: state.pending,      // full set for custom UI logic

    // Actions
    startMatch,
    endMatch,
    setPeriod,
    setStatus,
    setWinner,
    setDraw,
    setManOfMatch,
    addNote,

    // Utilities
    syncMatch,
  };
}
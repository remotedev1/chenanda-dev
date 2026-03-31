"use client";

import { useLiveMatches } from "@/hooks/useLiveMatches";
import LiveCard from "./LiveCard";

export default function LiveScoreCarousel() {
  const { matches, loading, error } = useLiveMatches();

  return (
    <main style={{ padding: "32px 24px", maxWidth: 960, margin: "0 auto" }}>
      <h1
        style={{
          color: "#e8eaf0",
          marginBottom: 24,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 32,
        }}
      >
        Live Matches
      </h1>

      {loading && (
        <p style={{ color: "#94a3b8", fontFamily: "monospace" }}>
          Loading matches…
        </p>
      )}

      {error && (
        <p style={{ color: "#f87171", fontFamily: "monospace" }}>
          Failed to load matches: {error}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 20,
        }}
      >
        {Array.isArray(matches?.data) &&
          matches.data.map((match) => (
            // Pass the live `match` object — useLiveMatches keeps it fresh
            // via socket. LiveCard is a pure display component; no socket
            // logic inside it so there is no double-subscription or
            // leaveMatch race condition.
            <LiveCard key={match.id} match={match} />
          ))}
      </div>
    </main>
  );
}

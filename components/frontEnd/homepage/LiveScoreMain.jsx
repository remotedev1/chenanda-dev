"use client";

import { useLiveMatches } from "@/hooks/useLiveMatches";
import LiveCard from "./LiveCard";

export default function LiveScoreCarousel() {
  const { matches, loading, error } = useLiveMatches();

  return (
    <main style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header with refresh button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          padding: "0 8px",
        }}
      ></div>

      {error && (
        <p style={{ color: "#f87171", fontFamily: "monospace" }}>
          Failed to load matches: {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-muted animate-pulse h-[160px]"
              />
            ))
          : matches.data.map((match) => (
              <LiveCard key={match.id} match={match} />
            ))}
      </div>
    </main>
  );
}

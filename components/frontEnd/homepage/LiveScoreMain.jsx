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

      <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-muted animate-pulse h-[160px] shrink-0 w-[300px] snap-start sm:w-auto sm:shrink"
              />
            ))
          : matches.data.map((match) => (
              <LiveCard
                key={match.id}
                match={match}
                className="shrink-0 w-[300px] snap-start sm:w-auto sm:shrink"
              />
            ))}
      </div>
    </main>
  );
}

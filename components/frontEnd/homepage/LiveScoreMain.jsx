"use client";

import { useLiveMatches } from "@/hooks/useLiveMatches";
import LiveCard from "./LiveCard";

export default function LiveScoreCarousel() {
  const { matches, loading, error } = useLiveMatches();

  return (
    <main style={{ maxWidth: 960, margin: "0 auto" }}>
      {error && (
        <p style={{ color: "#f87171", fontFamily: "monospace" }}>
          Failed to load matches: {error}
        </p>
      )}

      <div className="grid gap-2.5 mx-auto [grid-template-columns:repeat(auto-fill,minmax(340px,1fr))]">
        {loading
          ? // Render 3 placeholder skeletons while fetching
            Array.from({ length: 3 }).map((_, i) => (
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

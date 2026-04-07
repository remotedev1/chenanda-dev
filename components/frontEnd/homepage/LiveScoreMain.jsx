"use client";

import { useLiveMatches } from "@/hooks/useLiveMatches";
import LiveCard from "./LiveCard";

export default function LiveScoreCarousel() {
  const { matches, loading, error } = useLiveMatches();
  console.log(matches);
  return (
    <main style={{ maxWidth: 960, margin: "0 auto" }}>
      {error && (
        <p style={{ color: "#f87171", fontFamily: "monospace" }}>
          Failed to load matches: {error}
        </p>
      )}

      <div className="grid gap-2.5 mx-auto [grid-template-columns:repeat(auto-fill,minmax(340px,1fr))]">
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

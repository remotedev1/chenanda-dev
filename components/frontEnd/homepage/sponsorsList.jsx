"use client"
import { useMemo } from "react";

const sponsors = [
  { name: "SportTech", tier: "platinum" },
  { name: "AthletiCo", tier: "gold" },
  { name: "ProGear", tier: "gold" },
  { name: "EnergyMax", tier: "silver" },
  { name: "FitLife", tier: "silver" },
];

const SponsorsList = () => {
  // Shuffle once on mount
  const shuffledSponsors = useMemo(() => {
    return [...sponsors].sort(() => Math.random() - 0.5);
  }, []);

  return (
    <div className="py-20 bg-slate-900 overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black mb-4">Our Sponsors</h2>
        <p className="text-slate-400">Powered by industry leaders</p>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden">
        <div
          className="
            flex gap-12 whitespace-nowrap 
            animate-[marquee_15s_linear_infinite] 
            hover:[animation-play-state:paused]
          "
        >
          {[...shuffledSponsors, ...shuffledSponsors].map((s, i) => (
            <SponsorCard key={i} sponsor={s} />
          ))}
        </div>
      </div>
    </div>
  );
};

const SponsorCard = ({ sponsor }) => {
  return (
    <div className="group shrink-0">
      <div
        className={`px-8 py-6 rounded-2xl bg-white/5 backdrop-blur-xl border ${
          sponsor.tier === "platinum"
            ? "border-slate-300/30"
            : sponsor.tier === "gold"
            ? "border-yellow-500/30"
            : "border-slate-500/30"
        } hover:bg-white/10 transition-all duration-300`}
      >
        <div className="text-2xl font-black text-slate-300 group-hover:text-white transition-colors">
          {sponsor.name}
        </div>
      </div>
    </div>
  );
};

export default SponsorsList;

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
  // Fisher-Yates shuffle algorithm for true randomization
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle once on mount and create enough duplicates for seamless loop
  const displaySponsors = useMemo(() => {
    const shuffled = shuffleArray(sponsors);
    // Duplicate 4 times for truly seamless infinite scroll
    return [...shuffled, ...shuffled, ...shuffled, ...shuffled];
  }, []);

  return (
    <div className="py-12 sm:py-16 md:py-20 bg-slate-900 overflow-hidden">
      <div className="text-center mb-8 sm:mb-10 md:mb-12 px-4">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 md:mb-4">
          Our Sponsors
        </h2>
        <p className="text-xs xs:text-sm sm:text-base text-slate-400">
          Powered by industry leaders
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 md:w-40 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 md:w-40 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
        
        {/* Marquee Track */}
        <div className="flex overflow-hidden">
          <div className="flex gap-4 xs:gap-6 sm:gap-8 md:gap-10 lg:gap-12 animate-marquee">
            {displaySponsors.map((sponsor, i) => (
              <SponsorCard key={`set1-${i}`} sponsor={sponsor} />
            ))}
          </div>
          
          {/* Duplicate set for seamless loop */}
          <div className="flex gap-4 xs:gap-6 sm:gap-8 md:gap-10 lg:gap-12 animate-marquee" aria-hidden="true">
            {displaySponsors.map((sponsor, i) => (
              <SponsorCard key={`set2-${i}`} sponsor={sponsor} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-marquee {
          animation: marquee 60s linear infinite;
          will-change: transform;
        }

        @media (min-width: 640px) {
          .animate-marquee {
            animation-duration: 55s;
          }
        }

        @media (min-width: 768px) {
          .animate-marquee {
            animation-duration: 50s;
          }
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }

        /* Performance optimization */
        .flex {
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

const SponsorCard = ({ sponsor }) => {
  const borderColor = useMemo(() => {
    switch(sponsor.tier) {
      case "platinum": return "border-slate-300/30";
      case "gold": return "border-yellow-500/30";
      default: return "border-slate-500/30";
    }
  }, [sponsor.tier]);

  return (
    <div className="group shrink-0">
      <div
        className={`
          px-4 py-3 xs:px-5 xs:py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 
          rounded-lg xs:rounded-xl sm:rounded-2xl 
          bg-white/5 backdrop-blur-xl border ${borderColor}
          hover:bg-white/10 transition-all duration-300
          transform-gpu
        `}
      >
        <div className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-black text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">
          {sponsor.name}
        </div>
      </div>
    </div>
  );
};

export default SponsorsList;
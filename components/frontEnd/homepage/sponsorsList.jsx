"use client";
import { useMemo } from "react";
import { useSponsors } from "@/hooks/useSponsor";
import Image from "next/image";

// Outside component — never recreated
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const TIER_BORDER = {
  platinum: "border-slate-300/30",
  gold: "border-yellow-500/30",
  silver: "border-slate-500/30",
};

// Memoised — only re-renders if `sponsor` ref changes

const SponsorCard = ({ sponsor }) => {
  const borderColor = TIER_BORDER[sponsor.tier] ?? TIER_BORDER.silver;
  return (
    <div className=" shrink-0 cursor-pointer ">
      <div
        className={`
          p-0
          
           ${borderColor}
          transition-all duration-300 transform-gpu
          flex flex-col items-center 
        `}
      >
        {sponsor.logo[0]?.url && (
          <div className="relative h-6 sm:h-7 md:h-8 w-16 sm:w-20 md:w-24 shrink-0">
            <Image
              src={sponsor.logo[0].url}
              alt={sponsor.name}
              fill
              className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
            />
          </div>
        )}
        <div className=" text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-black text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">
         {sponsor.name.charAt(0).toUpperCase() + sponsor.name.slice(1)}
        </div>
      </div>
    </div>
  );
};

const Header = () => (
  <div className="text-center mb-8 sm:mb-10 md:mb-12 px-4">
    <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3 md:mb-4">
      Our Sponsors
    </h2>
    <p className="text-xs xs:text-sm sm:text-base text-slate-400">
      Powered by industry leaders
    </p>
  </div>
);

const SponsorsList = () => {
  const { sponsors, loading } = useSponsors({ status: "active", limit: 50 });

  // Single shuffle → duplicate once → animate to -50% for seamless loop
  // Total DOM nodes = sponsors.length × 2  (not × 8)
  const displaySponsors = useMemo(() => {
    if (!sponsors.length) return [];
    const shuffled = shuffleArray(sponsors);
    return [...shuffled, ...shuffled]; // duplicate once only
  }, [sponsors]);

  if (loading) {
    return (
      <div className="py-12 sm:py-16 md:py-20 bg-blue-900 overflow-hidden">
        <Header />
        <div className="flex justify-center gap-4 px-8">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="shrink-0 w-36 h-16 rounded-2xl bg-white/5 border border-slate-500/30 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!displaySponsors.length) return null;

  return (
    <div className="py-12 sm:py-16 md:py-20 bg-blue-900 overflow-hidden">
      <Header />

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 md:w-40 bg-gradient-to-r from-blue-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 md:w-40 bg-gradient-to-l from-blue-900 to-transparent z-10 pointer-events-none" />

        {/* Single track — animates to -50% so the duplicate snaps back perfectly */}
        <div className="flex overflow-hidden">
          <div className="flex gap-2  animate-marquee shrink-0">
            {displaySponsors.map((sponsor, i) => (
              <SponsorCard
                key={`${sponsor.id ?? sponsor.name}-${i}`}
                sponsor={sponsor}
              />
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
            transform: translateX(-50%);
          } /* -50% of doubled list = one full set */
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        @media (min-width: 640px) {
          .animate-marquee {
            animation-duration: 50s;
          }
        }
        @media (min-width: 768px) {
          .animate-marquee {
            animation-duration: 60s;
          }
        }
      `}</style>
    </div>
  );
};

export default SponsorsList;

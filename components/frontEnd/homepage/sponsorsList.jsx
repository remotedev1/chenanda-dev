"use client";
import { useMemo } from "react";
import { useSponsors } from "@/hooks/useSponsor";
import Image from "next/image";

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const SponsorCard = ({ sponsor }) => (
  <div className="shrink-0 flex flex-col items-center gap-2 px-6 sm:px-8">
    {sponsor.logo[0]?.url && (
      <div className="relative h-7 sm:h-8 w-20 sm:w-24">
        <Image
          src={sponsor.logo[0].url}
          alt={sponsor.name}
          fill
          className="object-contain opacity-50 hover:opacity-80 transition-opacity duration-300"
          sizes="(max-width: 640px) 80px, 96px"
        />
      </div>
    )}
    <span className="text-xs text-white/30 font-medium tracking-wide whitespace-nowrap">
      {sponsor.name.charAt(0).toUpperCase() + sponsor.name.slice(1)}
    </span>
  </div>
);

const SponsorsList = () => {
  const { sponsors, loading } = useSponsors({ status: true, limit: 50 });

  const displaySponsors = useMemo(() => {
    if (!sponsors.length) return [];
    const shuffled = shuffleArray(sponsors);
    return [...shuffled, ...shuffled];
  }, [sponsors]);

  if (loading) return (
    <div className="py-16 bg-primary overflow-hidden">
      <div className="flex justify-center gap-8 px-8">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="shrink-0 w-20 h-8 rounded bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );

  if (!displaySponsors.length) return null;

  return (
    <div className="py-16 bg-primary overflow-hidden">

      {/* Header */}
      <div className="text-center mb-10 px-4">
        <p className="text-white/25 text-xs uppercase tracking-widest font-semibold">
          Proudly supported by
        </p>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden">
          <div className="flex animate-marquee shrink-0">
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
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        @media (min-width: 640px)  { .animate-marquee { animation-duration: 50s; } }
        @media (min-width: 768px)  { .animate-marquee { animation-duration: 60s; } }
      `}</style>
    </div>
  );
};

export default SponsorsList;
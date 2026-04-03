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
  <div className="shrink-0 flex flex-col items-center gap-2 md:px-4">
    {sponsor.logo[0]?.url && (
      <div className="relative h-[4rem] md:h-[8rem] w-[4rem] md:w-[8rem] ">
        <Image
          src={sponsor.logo[0].url}
          alt={sponsor.name}
          fill
          className="object-contain opacity-90 hover:scale-105 transition-transform duration-300"
        />
      </div>
    )}
    <span className="text-xl text-white font-medium tracking-wide whitespace-nowrap">
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

  if (loading)
    return (
      <div className="py-16 bg-primary overflow-hidden">
        <div className="flex justify-center gap-8 px-8">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="shrink-0 w-20 h-8 rounded bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    );

  if (!displaySponsors.length) return null;

  return (
    <div className="py-8 bg-gradient-to-r from-amber-600 to-orange-600 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-10 px-4">
        <p className="text-white text-xl lg:text-2xl uppercase tracking-widest font-semibold">
          Proudly supported by
        </p>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-amber-600 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-orange-600 transparent to-transparent  z-10 pointer-events-none" />

        <div className="flex overflow-hidden">
          <div className="overflow-hidden w-full">
            <div className="flex animate-marquee gap-6 w-max ">
              {[...displaySponsors, ...displaySponsors].map((sponsor, i) => (
                <SponsorCard
                  key={`${sponsor.id ?? sponsor.name}-${i}`}
                  sponsor={sponsor}
                />
              ))}
            </div>
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
          }
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

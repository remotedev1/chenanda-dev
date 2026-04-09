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
      <div className="relative h-[9rem] w-[10rem] md:h-[10rem]  md:w-[14rem] ">
        <Image
          src={sponsor.logo[0].url}
          alt={sponsor.name}
          fill
          className="object-contain opacity-90 hover:scale-105 transition-transform duration-300"
        />
      </div>
    )}
  </div>
);

const SponsorsList = () => {
  const { sponsors, loading } = useSponsors({ status: true, limit: 50 });

  const displaySponsors = (() => {
    if (!sponsors.length) return [];
    const shuffled = shuffleArray(sponsors);
    return [...shuffled, ...shuffled];
  })();

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
    <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-amber-600 to-orange-600 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-10 px-4">
        <p className="text-white text-xl md:text-4xl uppercase tracking-widest font-semibold">
          Our Proud Sponsors
        </p>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Fade edges */}

        <div className="flex overflow-hidden">
          <div className="overflow-hidden w-full">
            <div className="flex animate-marquee gap-4 w-max ">
              {displaySponsors.map((sponsor, i) => (
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

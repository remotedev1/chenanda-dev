import EventCountdown from "@/components/frontEnd/homepage/EventCountdown";
import MatchSchedule from "@/components/frontEnd/homepage/MatchSchedule";
import SponsorsList from "@/components/frontEnd/homepage/sponsorsList";
import VenueDetails from "@/components/frontEnd/homepage/venueDetails";
import HomeAboutPreview from "@/components/frontEnd/homepage/HomeAboutPreview";
import HeroCarousel from "@/components/frontEnd/homepage/HeroCarousel";
import ExhibitionMatch from "@/components/frontEnd/homepage/exhibition";
import Link from "next/link";

export default function Page() {
  return (
    <main className="relative min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-white to-orange-50  text-white overflow-hidden">
      <HeroCarousel />
      <EventCountdown />

      <div className="fixed bottom-6 right-6 z-50 group">
        <Link
          href="#live"
          className="relative inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white text-xs font-semibold tracking-widest px-4 py-2 rounded-full transition-all duration-150 no-underline"
        >
          {/* Pulse rings */}
          <span className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </span>

          {/* Text toggles on hover */}
          <span className="group-hover:hidden">LIVE</span>
          <span className="hidden group-hover:inline">Click ↓</span>
        </Link>
      </div>

      <HomeAboutPreview />
      <MatchSchedule />
      <SponsorsList />
      <VenueDetails />
    </main>
  );
}

import EventCountdown from "@/components/frontEnd/homepage/EventCountdown";
import Hero from "@/components/frontEnd/homepage/Hero";
import MatchSchedule from "@/components/frontEnd/homepage/MatchSchedule";
import SponsorsList from "@/components/frontEnd/homepage/sponsorsList";
import VenueDetails from "@/components/frontEnd/homepage/venueDetails";
import Payment from "@/components/frontEnd/secure";
import LiveScoreCarousel from "@/components/frontEnd/homepage/LiveScoreCarousel;";

export default function Page() {
  return (
    <main className="relative min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Hero />
      <EventCountdown />
      <LiveScoreCarousel />
      <MatchSchedule />
      <Payment />
      <VenueDetails />
      <SponsorsList />
    </main>
  );
}

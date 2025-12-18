import EventCountdown from "@/components/frontEnd/homepage/EventCountdown";
import Hero from "@/components/frontEnd/homepage/Hero";
import MatchSchedule from "@/components/frontEnd/homepage/MatchSchedule";
import SponsorsList from "@/components/frontEnd/homepage/sponsorsList";
import VenueDetails from "@/components/frontEnd/homepage/venueDetails";
import LiveScoreCarousel from "@/components/frontEnd/homepage/LiveScoreCarousel";
import PaymentBanner from "@/components/frontEnd/payment";

export default function Page() {
  return (
    <main className="relative min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Hero />
      <EventCountdown />
      {/* <PaymentBanner /> */}
      {/* <LiveScoreCarousel /> */}
      {/* <MatchSchedule /> */}
      <VenueDetails />
      {/* <SponsorsList /> */}
    </main>
  );
}

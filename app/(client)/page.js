import EventCountdown from "@/components/frontEnd/homepage/EventCountdown";
import Hero from "@/components/frontEnd/homepage/Hero";
import MatchSchedule from "@/components/frontEnd/homepage/MatchSchedule";
import SponsorsList from "@/components/frontEnd/homepage/sponsorsList";
import VenueDetails from "@/components/frontEnd/homepage/venueDetails";
import LiveScoreCarousel from "@/components/frontEnd/homepage/LiveScoreCarousel";
import HomeAboutPreview from "@/components/frontEnd/homepage/HomeAboutPreview";
import PaymentBanner from "@/components/frontEnd/homepage/payment";
import TournamentContactCard from "@/components/frontEnd/homepage/TournamentContactCard";

export default function Page() {
  return (
    <main className="relative min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-white to-orange-50  text-white overflow-hidden">
      <Hero />
      <HomeAboutPreview />
      <EventCountdown />
      {/* <PaymentBanner /> */}
      <TournamentContactCard />
      <LiveScoreCarousel />
      {/* <MatchSchedule /> */}
      {/* <VenueDetails /> */}
      <SponsorsList />
    </main>
  );
}

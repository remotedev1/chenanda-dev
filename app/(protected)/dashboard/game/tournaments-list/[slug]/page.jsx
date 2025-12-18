import { TournamentForm } from "@/components/backOffice/tournament/tournamentForm";
import { notFound } from "next/navigation";

function isValidSlug(slug) {
  if (slug === "new") return true;
  return /^[a-f\d]{24}$/i.test(slug); // MongoDB ObjectId validation
}

export default function TournamentFormPage({ params }) {
  const { slug } = params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  return (
    <div className="container py-8">
      <TournamentForm slug={slug} />
    </div>
  );
}

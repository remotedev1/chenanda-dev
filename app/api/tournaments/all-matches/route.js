import { db } from "@/lib/db";

// app/api/tournaments/live/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const matches = await db.matches.findMany({
    where: { status: "COMPLETED" },
  });

  return Response.json(
    { data: matches },
    {
      headers: {
        "Cache-Control": "no-store",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    },
  );
}

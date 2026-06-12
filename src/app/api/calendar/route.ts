import { NextRequest } from "next/server";
import { buildCalendarIcs, getTeam } from "@/lib/site";

export function GET(request: NextRequest) {
  const teamSlug = request.nextUrl.searchParams.get("team") ?? undefined;
  const team = teamSlug ? getTeam(teamSlug) : undefined;
  const calendar = buildCalendarIcs(team?.slug);
  const fileName = team ? `${team.slug}-world-cup.ics` : "world-cup-local-time.ics";

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`
    }
  });
}

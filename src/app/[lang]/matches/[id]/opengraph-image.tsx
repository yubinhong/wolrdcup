import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { SocialCard } from "@/components/social-card";
import {
  Lang,
  formatDateTime,
  getMatch,
  getMatchBadge,
  getParticipantLabel,
  getScoreline
} from "@/lib/site";

export const alt = "World Cup match kickoff time";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ lang: Lang; id: string }>;
};

export default async function Image({ params }: Props) {
  const { lang, id } = await params;
  const match = getMatch(id);

  if (!match) {
    notFound();
  }

  const score = getScoreline(match);
  const home = getParticipantLabel(match.home, match.homeSlug, lang);
  const away = getParticipantLabel(match.away, match.awaySlug, lang);

  return new ImageResponse(
    <SocialCard
      eyebrow={getMatchBadge(match)}
      title={`${home} ${score ?? "vs"} ${away}`}
      subtitle={formatDateTime(match.kickoffUtc, "America/New_York", lang)}
      badge={match.homeCode && match.awayCode ? `${match.homeCode}/${match.awayCode}` : "2026"}
      detail={[match.venue, match.city].filter(Boolean).join(" · ")}
    />,
    size
  );
}

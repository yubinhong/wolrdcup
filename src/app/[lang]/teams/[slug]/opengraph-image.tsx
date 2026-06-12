import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { SocialCard } from "@/components/social-card";
import { Lang, getTeam, getTeamLabel } from "@/lib/site";

export const alt = "World Cup team schedule";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ lang: Lang; slug: string }>;
};

export default async function Image({ params }: Props) {
  const { lang, slug } = await params;
  const team = getTeam(slug);

  if (!team) {
    notFound();
  }

  return new ImageResponse(
    <SocialCard
      eyebrow={lang === "zh" ? "球队赛程" : "Team schedule"}
      title={getTeamLabel(team, lang)}
      subtitle={lang === "zh" ? "世界杯本地开球时间与赛程" : "World Cup fixtures in your local time"}
      badge={team.code}
      detail={lang === "zh" ? "比赛时间 · 球场 · 日历订阅" : "Kickoff times · venues · calendar download"}
    />,
    size
  );
}

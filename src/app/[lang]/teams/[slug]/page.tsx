import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoJsonLd } from "@/components/seo-json-ld";
import {
  Lang,
  buildInternalPath,
  copy,
  formatDateTime,
  getCanonicalUrl,
  getLanguageAlternates,
  getMatchBadge,
  getScoreline,
  getTeam,
  getTeamLabel,
  getTeamMatches,
  teams
} from "@/lib/site";

type Props = {
  params: Promise<{ lang: Lang; slug: string }>;
};

export function generateStaticParams() {
  return teams.flatMap((team) => [{ lang: "en", slug: team.slug }, { lang: "zh", slug: team.slug }]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const team = getTeam(slug);

  if (!team) {
    return {};
  }

  const title =
    lang === "zh" ? `${team.nameZh} 世界杯赛程` : `${team.name} World Cup Schedule`;
  const description =
    lang === "zh"
      ? `${team.nameZh} 的世界杯比赛时间、本地开球时间和球队专属日历订阅页面。`
      : `${team.name} match times, local kickoff conversions, and a team-specific World Cup calendar download.`;
  const url = getCanonicalUrl(`/${lang}/teams/${team.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...getLanguageAlternates(`/teams/${team.slug}`)
    },
    openGraph: {
      title,
      description,
      type: "website",
      url
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function TeamPage({ params }: Props) {
  const { lang, slug } = await params;
  const dict = copy[lang];
  const team = getTeam(slug);

  if (!team) {
    notFound();
  }

  const list = getTeamMatches(slug);

  return (
    <section className="page-hero">
      <div className="shell stack">
        <SeoJsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SportsTeam",
                "@id": `${getCanonicalUrl(`/${lang}/teams/${team.slug}`)}#team`,
                name: lang === "zh" ? team.nameZh : team.name,
                alternateName: lang === "zh" ? team.name : team.nameZh,
                url: getCanonicalUrl(`/${lang}/teams/${team.slug}`),
                sport: "Football",
                memberOf: {
                  "@type": "SportsOrganization",
                  name: "FIFA World Cup 2026"
                }
              },
              {
                "@type": "ItemList",
                name:
                  lang === "zh"
                    ? `${team.nameZh} 世界杯比赛列表`
                    : `${team.name} World Cup match list`,
                numberOfItems: list.length,
                itemListElement: list.map((match, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: `${match.home} vs ${match.away}`,
                  url: getCanonicalUrl(`/${lang}/matches/${match.id}`)
                }))
              }
            ]
          }}
        />
        <div>
          <p className="eyebrow">{dict.common.teamSchedule}</p>
          <h1>{lang === "zh" ? `${team.nameZh} 世界杯赛程` : `${team.name} World Cup schedule`}</h1>
          <p className="lede">{team.summary[lang]}</p>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div className="inline-row">
            <strong>{lang === "zh" ? "比赛列表" : "Match list"}</strong>
            <Link href={`/api/calendar?team=${team.slug}`} className="button button--secondary">
              {dict.common.download}
            </Link>
          </div>

          <div className="timeline" style={{ marginTop: "1rem" }}>
            {list.map((match) => (
              <Link
                key={match.id}
                href={buildInternalPath(lang, `/matches/${match.id}`)}
                className="timeline-item match-link"
              >
                <div className="match-card__top">
                  <strong>
                    {match.home} vs {match.away}
                  </strong>
                  <span className="badge">{getMatchBadge(match)}</span>
                </div>
                <p className="muted">
                  {formatDateTime(match.kickoffUtc, "America/Los_Angeles", lang)}
                </p>
                <p className="small">
                  {match.status === "finished" ? dict.common.finished : dict.common.scheduled}
                  {getScoreline(match) ? ` · ${dict.common.score}: ${getScoreline(match)}` : ""}
                </p>
                <p className="small">
                  {[match.venue, match.city].filter(Boolean).join(", ")}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="link-grid">
          <Link href={buildInternalPath(lang, "/today")} className="mini-card">
            <h3>/today</h3>
            <p className="muted">
              {lang === "zh"
                ? "回到今日比赛页，按当天筛选全部比赛。"
                : "Jump back to the today page to browse all matches by date."}
            </p>
          </Link>
          <Link href={buildInternalPath(lang, "/calendar")} className="mini-card">
            <h3>/calendar</h3>
            <p className="muted">
              {lang === "zh"
                ? "把球队订阅和全部比赛订阅放到同一个收口页。"
                : "Offer both team-only and full tournament subscriptions in one place."}
            </p>
          </Link>
          <div className="mini-card">
            <h3>{lang === "zh" ? "页面用途" : "Why this page matters"}</h3>
            <p className="muted">
              {lang === "zh"
                ? `${getTeamLabel(team, lang)} 页面适合承接赛程搜索、开球时间搜索和球队订阅需求。`
                : `${team.name} pages work well for fixture searches, kickoff-time intent, and team-specific calendar subscriptions.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

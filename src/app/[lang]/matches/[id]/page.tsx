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
  getMatch,
  getMatchBadge,
  getParticipantLabel,
  getScoreline,
  getStageLabel,
  matches
} from "@/lib/site";

type Props = {
  params: Promise<{ lang: Lang; id: string }>;
};

const usefulTimezones = [
  "America/Mexico_City",
  "America/New_York",
  "Europe/London",
  "Asia/Shanghai",
  "Asia/Seoul"
];

export function generateStaticParams() {
  return matches.flatMap((match) => [
    { lang: "en", id: match.id },
    { lang: "zh", id: match.id }
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const match = getMatch(id);

  if (!match) {
    return {};
  }

  const home = getParticipantLabel(match.home, match.homeSlug, lang);
  const away = getParticipantLabel(match.away, match.awaySlug, lang);

  const title =
    lang === "zh"
      ? `${home} 对 ${away} 开球时间`
      : `${home} vs ${away} Kickoff Time`;
  const description =
    lang === "zh"
      ? `${home} 对 ${away} 的世界杯比赛时间、球场、比分状态与多时区开球时间。`
      : `Kickoff time, venue, match status, and timezone conversions for ${home} vs ${away}.`;
  const url = getCanonicalUrl(`/${lang}/matches/${match.id}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...getLanguageAlternates(`/matches/${match.id}`)
    },
    openGraph: {
      title,
      description,
      type: "article",
      url
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function MatchPage({ params }: Props) {
  const { lang, id } = await params;
  const match = getMatch(id);

  if (!match) {
    notFound();
  }

  const dict = copy[lang];
  const score = getScoreline(match);
  const home = getParticipantLabel(match.home, match.homeSlug, lang);
  const away = getParticipantLabel(match.away, match.awaySlug, lang);
  const canonicalUrl = getCanonicalUrl(`/${lang}/matches/${match.id}`);
  const statusLabel =
    match.status === "finished" ? dict.common.finished : dict.common.scheduled;
  const eventStatus =
    match.status === "finished"
      ? "https://schema.org/EventCompleted"
      : "https://schema.org/EventScheduled";

  const renderTeam = (name: string, slug: string | null) =>
    slug ? (
      <Link href={buildInternalPath(lang, `/teams/${slug}`)}>{name}</Link>
    ) : (
      <span>{name}</span>
    );

  return (
    <section className="page-hero">
      <div className="shell stack">
        <SeoJsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: `${home} vs ${away}`,
            url: canonicalUrl,
            inLanguage: lang === "zh" ? "zh-CN" : "en-US",
            startDate: match.kickoffUtc,
            eventStatus,
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            sport: "Football",
            organizer: {
              "@type": "SportsOrganization",
              name: "FIFA"
            },
            location: {
              "@type": "Place",
              name: match.venue,
              address: {
                "@type": "PostalAddress",
                addressLocality: match.city
              }
            },
            homeTeam: {
              "@type": "SportsTeam",
              name: home,
              url: match.homeSlug
                ? getCanonicalUrl(`/${lang}/teams/${match.homeSlug}`)
                : undefined
            },
            awayTeam: {
              "@type": "SportsTeam",
              name: away,
              url: match.awaySlug
                ? getCanonicalUrl(`/${lang}/teams/${match.awaySlug}`)
                : undefined
            },
            sameAs: match.reportUrl ?? undefined
          }}
        />

        <div>
          <p className="eyebrow">{getMatchBadge(match)}</p>
          <h1 className="match-title">
            {renderTeam(home, match.homeSlug)}
            <span className="match-title__separator">{score ?? "vs"}</span>
            {renderTeam(away, match.awaySlug)}
          </h1>
          <p className="lede">
            {lang === "zh"
              ? `${statusLabel} · ${getStageLabel(match.stage, lang)}${match.group ? ` · ${match.group.replace("Group ", "")}组` : ""}`
              : `${statusLabel} · ${match.stage}${match.group ? ` · ${match.group}` : ""}`}
          </p>
        </div>

        <div className="match-detail-grid">
          <div className="card match-detail-card">
            <span className="small muted">{dict.common.localKickoff}</span>
            <strong>{formatDateTime(match.kickoffUtc, "America/New_York", lang)}</strong>
            <span className="small muted">America/New_York</span>
          </div>
          <div className="card match-detail-card">
            <span className="small muted">{dict.common.venue}</span>
            <strong>{match.venue}</strong>
            <span className="small muted">{match.city}</span>
          </div>
          <div className="card match-detail-card">
            <span className="small muted">{lang === "zh" ? "比赛状态" : "Match status"}</span>
            <strong>{statusLabel}</strong>
            <span className="small muted">{score ? `${dict.common.score}: ${score}` : match.heading}</span>
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div className="section-header">
            <div>
              <p className="eyebrow">{lang === "zh" ? "多时区时间" : "Timezone board"}</p>
              <h2 className="section-title">
                {lang === "zh" ? "这场比赛在世界各地几点开球" : "Kickoff around the world"}
              </h2>
            </div>
          </div>
          <div className="timezone-grid">
            {usefulTimezones.map((timeZone) => (
              <div key={timeZone} className="mini-card">
                <strong>{formatDateTime(match.kickoffUtc, timeZone, lang)}</strong>
                <p className="small muted">{timeZone}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="cta-row">
          <Link href={buildInternalPath(lang, "/today")} className="button button--secondary">
            {lang === "zh" ? "查看全部比赛" : "Browse all matches"}
          </Link>
          <Link href="/api/calendar" className="button button--secondary">
            {dict.common.download}
          </Link>
          {match.reportUrl ? (
            <a href={match.reportUrl} className="button button--primary" target="_blank" rel="noreferrer">
              {lang === "zh" ? "查看官方比赛报告" : "Open official match report"}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

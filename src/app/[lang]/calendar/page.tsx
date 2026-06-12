import type { Metadata } from "next";
import Link from "next/link";
import { SeoJsonLd } from "@/components/seo-json-ld";
import {
  Lang,
  buildInternalPath,
  copy,
  formatUpdatedAt,
  getCanonicalUrl,
  getLanguageAlternates,
  getTeamMatches,
  teams
} from "@/lib/site";

type Props = {
  params: Promise<{ lang: Lang }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  return lang === "zh"
    ? {
        title: "订阅世界杯赛程日历",
        description: "下载全部比赛或单支球队的世界杯 ICS 日历文件，方便导入日历应用。",
        alternates: {
          canonical: getCanonicalUrl("/zh/calendar"),
          ...getLanguageAlternates("/calendar")
        }
      }
    : {
        title: "Subscribe to World Cup Calendars",
        description:
          "Download full-tournament or team-specific World Cup ICS calendar files for your calendar app.",
        alternates: {
          canonical: getCanonicalUrl("/en/calendar"),
          ...getLanguageAlternates("/calendar")
        }
      };
}

export default async function CalendarPage({ params }: Props) {
  const { lang } = await params;
  const dict = copy[lang];

  return (
    <section className="page-hero">
      <div className="shell stack">
        <SeoJsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: lang === "zh" ? "订阅世界杯赛程日历" : "Subscribe to World Cup Calendars",
            url: getCanonicalUrl(`/${lang}/calendar`),
            inLanguage: lang === "zh" ? "zh-CN" : "en-US"
          }}
        />
        <div>
          <p className="eyebrow">{dict.common.subscribe}</p>
          <h1>
            {lang === "zh" ? "订阅世界杯赛程日历" : "Subscribe to World Cup calendars"}
          </h1>
          <p className="lede">
            {lang === "zh"
              ? `当前数据已同步到 ${formatUpdatedAt(lang)} UTC，先提供通用 ICS 下载，后续可以继续接 Google Calendar、Apple Calendar、Telegram 和邮件提醒。`
              : `The calendar data was refreshed at ${formatUpdatedAt(lang)} UTC. This page starts with simple ICS downloads and leaves room for Google Calendar, Apple Calendar, Telegram, and email reminders later.`}
          </p>
        </div>

        <div className="calendar-grid">
          <Link href="/api/calendar" className="mini-card">
            <h3>{lang === "zh" ? "全部比赛" : "All matches"}</h3>
            <p className="muted">
              {lang === "zh"
                ? "下载整个赛程的 ICS 文件。"
                : "Download a single ICS file for the current starter schedule."}
            </p>
          </Link>

          {teams.map((team) => (
            <Link
              key={team.slug}
              href={`/api/calendar?team=${team.slug}`}
              className="mini-card"
            >
              <h3>{lang === "zh" ? `${team.nameZh} 赛程` : `${team.name} schedule`}</h3>
              <p className="muted">
                {lang === "zh" ? "比赛场次" : "Match count"}: {getTeamMatches(team.slug).length}
              </p>
            </Link>
          ))}
        </div>

        <div className="link-grid">
          <a href="webcal://worldcup-local-time.example/api/calendar" className="mini-card">
            <h3>webcal://</h3>
            <p className="muted">
              {lang === "zh"
                ? "上线到正式域名后，可以把这里换成真正的 `webcal` 订阅地址。"
                : "Once deployed on your real domain, replace this with a proper `webcal` subscription URL."}
            </p>
          </a>
          <Link href={buildInternalPath(lang, "/today")} className="mini-card">
            <h3>{lang === "zh" ? "配合今日页" : "Pair with the today page"}</h3>
            <p className="muted">
              {lang === "zh"
                ? "先用今日页看本地时间，再决定要不要订阅。"
                : "Let visitors verify kickoff times first, then subscribe from here."}
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

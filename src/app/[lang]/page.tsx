import type { Metadata } from "next";
import Link from "next/link";
import { MatchBrowser } from "@/components/match-browser";
import { SeoJsonLd } from "@/components/seo-json-ld";
import {
  DATA_SOURCE,
  Lang,
  REFERENCE_DATE,
  buildInternalPath,
  copy,
  formatDateTime,
  formatUpdatedAt,
  getCanonicalUrl,
  getFeaturedTeams,
  getLanguageAlternates,
  getMatchBadge,
  getMatchesForDate,
  getTeamMatches,
  getScoreline,
  teams
} from "@/lib/site";

type Props = {
  params: Promise<{ lang: Lang }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  return lang === "zh"
    ? {
        title: "世界杯本地时间赛程",
        description: "查看 2026 世界杯今日比赛、本地开球时间、球队专页和日历订阅。",
        alternates: {
          canonical: getCanonicalUrl("/zh"),
          ...getLanguageAlternates("")
        }
      }
    : {
        title: "World Cup 2026 Match Schedule in Your Local Time",
        description:
          "Track today's World Cup matches, convert kickoffs into local time, browse team pages, and download calendar files.",
        alternates: {
          canonical: getCanonicalUrl("/en"),
          ...getLanguageAlternates("")
        }
      };
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const dict = copy[lang];
  const leadMatches = getMatchesForDate(REFERENCE_DATE, "America/New_York").slice(0, 4);
  const featuredTeams = getFeaturedTeams();
  const finishedMatches = getMatchesForDate(REFERENCE_DATE, "America/New_York").filter(
    (match) => match.status === "finished"
  ).length;

  return (
    <>
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name:
            lang === "zh"
              ? "世界杯本地时间赛程"
              : "World Cup 2026 Match Schedule in Your Local Time",
          url: getCanonicalUrl(`/${lang}`),
          inLanguage: lang === "zh" ? "zh-CN" : "en-US",
          description:
            lang === "zh"
              ? "2026 世界杯赛程、本地时间换算、球队页面与日历订阅。"
              : "2026 World Cup schedule, local kickoff conversion, team pages, and calendar subscriptions."
        }}
      />
      <section className="hero">
        <div className="shell hero__grid">
          <div className="hero__panel">
            <div className="eyebrow">
              <span>2026</span>
              <span>{dict.common.unofficial}</span>
            </div>
            <h1>
              {lang === "zh"
                ? "把世界杯开球时间换成你的本地时间"
                : "Convert World Cup kickoffs into your local time"}
            </h1>
            <p className="lede">
              {lang === "zh"
                ? "这是一个从分享内容直接落地的 MVP：先做今日比赛、本地时间换算、球队专页、日历订阅，再把流量导向商家服务页。"
                : "This MVP turns the shared idea into a working site: today matches, local time conversion, team landing pages, calendar subscriptions, and a service funnel for bars."}
            </p>
            <div className="cta-row">
              <Link href={buildInternalPath(lang, "/today")} className="button button--primary">
                {lang === "zh" ? "查看今日比赛" : "See today's matches"}
              </Link>
              <Link
                href={buildInternalPath(lang, "/for-bars")}
                className="button button--secondary"
              >
                {lang === "zh" ? "查看商家服务页" : "Open the bar sales page"}
              </Link>
            </div>
          </div>

          <div className="hero__panel">
            <div className="inline-row">
              <strong>{lang === "zh" ? "MVP 范围" : "MVP scope"}</strong>
              <span className="badge">
                {lang === "zh" ? "真实赛程" : "Live-backed data"}
              </span>
            </div>
            <div className="score-grid" style={{ marginTop: "1rem" }}>
              <div className="match-card">
                <strong>{teams.length}</strong>
                <p className="muted">{lang === "zh" ? "真实球队" : "Qualified teams"}</p>
              </div>
              <div className="match-card">
                <strong>104</strong>
                <p className="muted">{lang === "zh" ? "完整赛程位" : "Match slots"}</p>
              </div>
              <div className="match-card">
                <strong>{finishedMatches}</strong>
                <p className="muted">{lang === "zh" ? "当日已完赛" : "Finished today"}</p>
              </div>
            </div>
            <p className="small muted">
              {lang === "zh"
                ? `当前默认聚焦 ${REFERENCE_DATE}，数据同步时间为 ${formatUpdatedAt(lang)} UTC。`
                : `The default matchday is ${REFERENCE_DATE}, and the synced dataset was refreshed at ${formatUpdatedAt(lang)} UTC.`}
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-header">
            <div>
              <p className="eyebrow">{lang === "zh" ? "首页预览" : "Homepage preview"}</p>
              <h2 className="section-title">
                {lang === "zh" ? "默认展示今日热门比赛" : "Lead with the most useful match snapshot"}
              </h2>
            </div>
            <span className="badge">
              {dict.common.todaySnapshot}: {REFERENCE_DATE}
            </span>
          </div>

          <div className="score-grid">
            {leadMatches.map((match) => (
              <Link
                key={match.id}
                href={buildInternalPath(lang, `/matches/${match.id}`)}
                className="match-card match-link"
              >
                <div className="match-card__top">
                  <strong>
                    {match.home} vs {match.away}
                  </strong>
                  <span className="badge">{getMatchBadge(match)}</span>
                </div>
                <p className="muted">
                  {formatDateTime(match.kickoffUtc, "America/New_York", lang)}
                </p>
                <p className="small">
                  {match.status === "finished" ? dict.common.finished : dict.common.scheduled}
                  {getScoreline(match) ? ` · ${dict.common.score}: ${getScoreline(match)}` : ""}
                </p>
                <p className="small">{[match.venue, match.city].filter(Boolean).join(", ")}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-header">
            <div>
              <p className="eyebrow">{lang === "zh" ? "工具能力" : "Product blocks"}</p>
              <h2 className="section-title">
                {lang === "zh"
                  ? "先把用户真正会搜的功能做出来"
                  : "Ship the exact features people search for during the tournament"}
              </h2>
            </div>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <h3>{lang === "zh" ? "本地时间换算" : "Local kickoff conversion"}</h3>
              <p className="muted">
                {lang === "zh"
                  ? "按用户所在时区展示开球时间，适合承接 `what time is Korea match` 这类搜索。"
                  : "Show kickoff times in the viewer's own timezone for search-intent pages like `what time is Korea match`."}
              </p>
            </div>
            <div className="feature-card">
              <h3>{lang === "zh" ? "球队专页" : "Team SEO pages"}</h3>
              <p className="muted">
                {lang === "zh"
                  ? "先做墨西哥和韩国，后续按同样模板扩成 20 个以上 SEO 页面。"
                  : "Start with Mexico and Korea, then expand the same template into 20+ SEO pages."}
              </p>
            </div>
            <div className="feature-card">
              <h3>{lang === "zh" ? "日历订阅" : "Calendar subscriptions"}</h3>
              <p className="muted">
                {lang === "zh"
                  ? "直接生成 ICS 下载，后面再接 Google Calendar 或 Telegram 提醒。"
                  : "Offer ICS downloads now, then later attach Google Calendar or Telegram reminders."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-header">
            <div>
              <p className="eyebrow">{lang === "zh" ? "交互预览" : "Interactive preview"}</p>
              <h2 className="section-title">
                {lang === "zh" ? "首页直接带一个可用的时间转换器" : "Put a working converter right on the landing page"}
              </h2>
            </div>
          </div>
          <div className="card" style={{ padding: "1.4rem" }}>
            <MatchBrowser
              lang={lang}
              labels={{
                timezone: dict.common.timezone,
                date: dict.common.date,
                stage: dict.common.stage,
                venue: dict.common.venue,
                noMatches: dict.common.noMatches,
                localKickoff: dict.common.localKickoff,
                finished: dict.common.finished,
                scheduled: dict.common.scheduled,
                score: dict.common.score
              }}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-header">
            <div>
              <p className="eyebrow">{lang === "zh" ? "落地页矩阵" : "Landing page matrix"}</p>
              <h2 className="section-title">
                {lang === "zh"
                  ? "用少量页面先形成一个小闭环"
                  : "Build a small but complete loop with a few high-intent pages"}
              </h2>
            </div>
          </div>

          <div className="link-grid">
            <Link href={buildInternalPath(lang, "/today")} className="mini-card">
              <h3>/today</h3>
              <p className="muted">
                {lang === "zh"
                  ? "给搜索用户一个最短路径，直接看到今日比赛和本地时间。"
                  : "Shortest path for visitors who only want today's matches and local kickoff times."}
              </p>
            </Link>
            {featuredTeams.map((team) => (
              <Link key={team.slug} href={buildInternalPath(lang, `/teams/${team.slug}`)} className="mini-card">
                <h3>/teams/{team.slug}</h3>
                <p className="muted">{team.summary[lang]}</p>
              </Link>
            ))}
            <Link href={buildInternalPath(lang, "/calendar")} className="mini-card">
              <h3>/calendar</h3>
              <p className="muted">
                {lang === "zh"
                  ? "把订阅动作独立成页面，方便接提醒、邮件和再营销。"
                  : "A dedicated subscription page helps later with reminders, email capture, and remarketing."}
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-header">
            <div>
              <p className="eyebrow">{lang === "zh" ? "服务变现" : "Service monetization"}</p>
              <h2 className="section-title">
                {lang === "zh"
                  ? "工具站负责引流，商家页负责成交"
                  : "Let the tool bring traffic and the sales page close revenue"}
              </h2>
            </div>
          </div>

          <div className="service-grid">
            <div className="service-card">
              <h3>$49</h3>
              <p className="muted">
                {lang === "zh"
                  ? "世界杯活动页搭建：适合餐厅、酒吧、咖啡馆。"
                  : "World Cup event page setup for bars, cafes, and restaurants."}
              </p>
            </div>
            <div className="service-card">
              <h3>$99</h3>
              <p className="muted">
                {lang === "zh"
                  ? "整周营销素材包：社媒文案、海报文字、预约 CTA。"
                  : "Weekly marketing assets: social copy, poster text, and booking CTAs."}
              </p>
            </div>
            <div className="service-card">
              <h3>{lang === "zh" ? "真实数据" : "Real data"}</h3>
              <p className="muted">
                {lang === "zh"
                  ? "赛程已经切到真实比赛数据，后面只需要继续同步和加提醒渠道。"
                  : "The schedule now runs on a real tournament dataset, so the next gains come from sync cadence and reminder channels."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="team-grid">
            {teams.map((team) => (
              <div key={team.slug} className="team-card">
                <div className="inline-row">
                  <h3>{lang === "zh" ? team.nameZh : team.name}</h3>
                  <span className="badge">{team.badge}</span>
                </div>
                <p className="muted">{team.summary[lang]}</p>
                <p className="small">
                  {lang === "zh" ? "已同步比赛" : "Matches synced"}: {getTeamMatches(team.slug).length}
                </p>
                <div className="cta-row">
                  <Link
                    href={buildInternalPath(lang, `/teams/${team.slug}`)}
                    className="button button--secondary"
                  >
                    {lang === "zh" ? "打开球队页" : "Open page"}
                  </Link>
                  <Link
                    href={`/api/calendar?team=${team.slug}`}
                    className="button button--secondary"
                  >
                    {lang === "zh" ? "下载日历" : "Get calendar"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="mini-card">
            <h3>{lang === "zh" ? "数据来源说明" : "Data source note"}</h3>
            <p className="muted">
              {lang === "zh"
                ? `${DATA_SOURCE.primary}。当前站点使用同步后的本地 JSON，适合稳定部署；后续你可以继续把同步脚本接到定时任务。`
                : `${DATA_SOURCE.primary}. The site now runs on a synced local JSON dataset, which is stable for deployment and easy to refresh with a cron job later.`}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

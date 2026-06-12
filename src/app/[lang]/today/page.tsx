import type { Metadata } from "next";
import { MatchBrowser } from "@/components/match-browser";
import { SeoJsonLd } from "@/components/seo-json-ld";
import {
  Lang,
  copy,
  getCanonicalUrl,
  getLanguageAlternates
} from "@/lib/site";

type Props = {
  params: Promise<{ lang: Lang }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  return lang === "zh"
    ? {
        title: "今日世界杯比赛与本地开球时间",
        description: "按你的时区查看今天的世界杯比赛、比赛阶段和实时比分状态。",
        alternates: {
          canonical: getCanonicalUrl("/zh/today"),
          ...getLanguageAlternates("/today")
        }
      }
    : {
        title: "Today's World Cup Matches in Your Local Time",
        description:
          "See today's World Cup fixtures, kickoff times in your timezone, match stages, and score status.",
        alternates: {
          canonical: getCanonicalUrl("/en/today"),
          ...getLanguageAlternates("/today")
        }
      };
}

export default async function TodayPage({ params }: Props) {
  const { lang } = await params;
  const dict = copy[lang];

  return (
    <section className="page-hero">
      <div className="shell stack">
        <SeoJsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name:
              lang === "zh"
                ? "今日世界杯比赛与本地开球时间"
                : "Today's World Cup Matches in Your Local Time",
            url: getCanonicalUrl(`/${lang}/today`),
            inLanguage: lang === "zh" ? "zh-CN" : "en-US"
          }}
        />
        <div>
          <p className="eyebrow">{dict.common.unofficial}</p>
          <h1>
            {lang === "zh"
              ? "今日世界杯比赛与本地开球时间"
              : "Today's World Cup matches in your local time"}
          </h1>
          <p className="lede">
            {lang === "zh"
              ? "这个页面就是分享内容里提到的 `/today`。它优先解决最直接的用户需求：今天有哪些比赛、我所在时区几点开球。"
              : "This is the `/today` page from the original plan. It solves the sharpest user need first: what is on today, and what time does it start where I live?"}
          </p>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
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
  );
}

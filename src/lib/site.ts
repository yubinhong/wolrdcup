import worldcupData from "@/data/worldcup-data.json";

export const SITE_NAME = "World Cup Local Time";
const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.CF_PAGES_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL;
export const SITE_URL = configuredSiteUrl
  ? `${configuredSiteUrl.startsWith("http") ? "" : "https://"}${configuredSiteUrl}`.replace(
      /\/+$/g,
      ""
    )
  : "https://worldcup-local-time.example";
export const LANGUAGES = ["en", "zh"] as const;
export type Lang = (typeof LANGUAGES)[number];

export type Match = {
  id: string;
  stage: string;
  group: string;
  heading: string;
  kickoffUtc: string;
  venue: string;
  city: string;
  home: string;
  away: string;
  homeCode: string | null;
  awayCode: string | null;
  homeSlug: string | null;
  awaySlug: string | null;
  homePlaceholder: boolean;
  awayPlaceholder: boolean;
  status: "scheduled" | "finished";
  homeScore: number | null;
  awayScore: number | null;
  reportUrl: string | null;
};

type TeamRecord = {
  name: string;
  code: string;
  slug: string;
  nameZh: string;
};

export type Team = {
  slug: string;
  name: string;
  nameZh: string;
  badge: string;
  code: string;
  summary: {
    en: string;
    zh: string;
  };
};

type WorldCupData = {
  generatedAt: string;
  source: {
    primary: string;
    urls: string[];
  };
  teams: TeamRecord[];
  matches: Match[];
};

const rawData = worldcupData as WorldCupData;

export const DATA_GENERATED_AT = rawData.generatedAt;
export const DATA_SOURCE = rawData.source;

export const timezones = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Mexico_City",
  "America/Toronto",
  "Europe/London",
  "Europe/Madrid",
  "Asia/Dubai",
  "Asia/Shanghai",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Australia/Sydney"
];

export const matches = rawData.matches;

function createTeamSummary(name: string, nameZh: string) {
  return {
    en: `${name} match times, venue details, and a one-click calendar file for World Cup fans in any timezone.`,
    zh: `${nameZh} 的世界杯赛程页，包含本地开球时间、球场信息和一键日历订阅入口。`
  };
}

export const teams: Team[] = rawData.teams.map((team) => ({
  slug: team.slug,
  name: team.name,
  nameZh: team.nameZh,
  badge: team.code,
  code: team.code,
  summary: createTeamSummary(team.name, team.nameZh)
}));

export const spotlightTeamSlugs = ["mexico", "korea", "usa"];

export const copy = {
  en: {
    nav: {
      home: "Home",
      today: "Today",
      calendar: "Calendar",
      bars: "For Bars",
      template: "Watch Party Template"
    },
    common: {
      unofficial: "Independent World Cup schedule and local time converter",
      timezone: "Timezone",
      date: "Date",
      localKickoff: "Local kickoff",
      stage: "Stage",
      venue: "Venue",
      noMatches: "No matches are available for the selected day in this timezone.",
      subscribe: "Subscribe",
      download: "Download ICS",
      todaySnapshot: "Default matchday",
      teamSchedule: "Team schedule",
      allMatches: "All matches",
      updated: "Updated",
      source: "Source",
      finished: "Finished",
      scheduled: "Scheduled",
      score: "Score"
    }
  },
  zh: {
    nav: {
      home: "首页",
      today: "今日比赛",
      calendar: "日历订阅",
      bars: "商家服务",
      template: "观赛活动模板"
    },
    common: {
      unofficial: "独立制作的世界杯赛程与本地时间换算工具",
      timezone: "时区",
      date: "日期",
      localKickoff: "本地开球时间",
      stage: "阶段",
      venue: "球场",
      noMatches: "这个时区下，当前所选日期没有比赛。",
      subscribe: "订阅",
      download: "下载 ICS",
      todaySnapshot: "默认比赛日",
      teamSchedule: "球队赛程",
      allMatches: "全部比赛",
      updated: "更新时间",
      source: "数据来源",
      finished: "已结束",
      scheduled: "未开赛",
      score: "比分"
    }
  }
} as const;

export function isLang(value: string): value is Lang {
  return LANGUAGES.includes(value as Lang);
}

export function getLang(value: string): Lang {
  return isLang(value) ? value : "en";
}

export function getTeam(slug: string) {
  return teams.find((team) => team.slug === slug);
}

export function getMatch(id: string) {
  return matches.find((match) => match.id === id);
}

export function getFeaturedTeams() {
  return teams.filter((team) => spotlightTeamSlugs.includes(team.slug));
}

export function getTeamMatches(slug: string) {
  return matches.filter(
    (match) => match.homeSlug === slug || match.awaySlug === slug
  );
}

export function getDateKey(dateLike: string, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(new Date(dateLike));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function getAllDateKeys(timeZone: string) {
  return Array.from(
    new Set(matches.map((match) => getDateKey(match.kickoffUtc, timeZone)))
  ).sort();
}

export function getPreferredDateKey(timeZone: string) {
  const dates = getAllDateKeys(timeZone);
  const todayKey = getDateKey(new Date().toISOString(), timeZone);
  const upcoming = dates.find((dateKey) => dateKey >= todayKey);

  return upcoming ?? dates[0] ?? todayKey;
}

export const REFERENCE_DATE = getPreferredDateKey("America/New_York");

export function formatDateTime(
  dateLike: string,
  timeZone: string,
  lang: Lang,
  opts?: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
    ...opts
  }).format(new Date(dateLike));
}

export function formatDateOnly(dateLike: string, timeZone: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    timeZone,
    dateStyle: "full"
  }).format(new Date(`${dateLike}T12:00:00Z`));
}

export function getMatchesForDate(date: string, timeZone: string) {
  return matches.filter((match) => getDateKey(match.kickoffUtc, timeZone) === date);
}

export function getScoreline(match: Match) {
  if (match.homeScore === null || match.awayScore === null) {
    return null;
  }

  return `${match.homeScore}-${match.awayScore}`;
}

export function getMatchBadge(match: Match) {
  return match.group || match.stage;
}

export function getTeamLabel(team: Team, lang: Lang) {
  return lang === "zh" ? team.nameZh : team.name;
}

export function getParticipantLabel(name: string, slug: string | null, lang: Lang) {
  if (lang === "en" || !slug) {
    return name;
  }

  return getTeam(slug)?.nameZh ?? name;
}

export function getStageLabel(stage: string, lang: Lang) {
  if (lang === "en") {
    return stage;
  }

  const labels: Record<string, string> = {
    "Group Stage": "小组赛",
    "Round of 32": "三十二强赛",
    "Round of 16": "十六强赛",
    "Quarter-finals": "四分之一决赛",
    "Semi-finals": "半决赛",
    "Third place play-off": "季军赛",
    Final: "决赛"
  };

  return labels[stage] ?? stage;
}

export function formatUpdatedAt(lang: Lang) {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  }).format(new Date(DATA_GENERATED_AT));
}

export function buildInternalPath(lang: Lang, path = "") {
  return `/${lang}${path}`;
}

export function getCanonicalUrl(path = "") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function getLanguageAlternates(path = "") {
  return {
    languages: {
      "en-US": getCanonicalUrl(buildInternalPath("en", path)),
      "zh-CN": getCanonicalUrl(buildInternalPath("zh", path)),
      "x-default": getCanonicalUrl(buildInternalPath("en", path))
    }
  };
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildCalendarIcs(teamSlug?: string) {
  const selected = teamSlug ? getTeamMatches(teamSlug) : matches;
  const stamp = new Date(DATA_GENERATED_AT)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(".000", "");

  const body = selected
    .map((match) => {
      const start = match.kickoffUtc.replace(/[-:]/g, "").replace(".000", "");
      const end = new Date(
        new Date(match.kickoffUtc).getTime() + 2 * 60 * 60 * 1000
      )
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(".000", "");

      const title = `${match.home} vs ${match.away}`;
      const description = [
        "Independent World Cup Local Time calendar event.",
        `Stage: ${match.stage}${match.group ? ` (${match.group})` : ""}.`,
        "Double-check official kickoff updates before match day."
      ].join(" ");

      return [
        "BEGIN:VEVENT",
        `UID:${match.id}@worldcup-local-time`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeIcs(title)}`,
        `LOCATION:${escapeIcs([match.venue, match.city].filter(Boolean).join(", "))}`,
        `DESCRIPTION:${escapeIcs(description)}`,
        "END:VEVENT"
      ].join("\n");
    })
    .join("\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//World Cup Local Time//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    body,
    "END:VCALENDAR"
  ].join("\n");
}

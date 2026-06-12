import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GROUP_IDS = "ABCDEFGHIJKL".split("");
const GROUP_PAGE_BASE = "https://en.wikipedia.org/w/index.php?title=2026_FIFA_World_Cup_Group_";
const KNOCKOUT_PAGE =
  "https://en.wikipedia.org/w/index.php?title=2026_FIFA_World_Cup_knockout_stage&action=raw";
const FINAL_PAGE =
  "https://en.wikipedia.org/w/index.php?title=2026_FIFA_World_Cup_final&action=raw";

const TEAM_NAME_OVERRIDES = {
  "South Korea": "Korea Republic",
  "Czech Republic": "Czechia",
  Turkey: "Türkiye",
  "Ivory Coast": "Cote d'Ivoire",
  "Côte d’Ivoire": "Cote d'Ivoire",
  "DR Congo": "Congo DR",
  "United States": "USA",
  Iran: "IR Iran"
};

const TEAM_ZH = {
  Algeria: "阿尔及利亚",
  Argentina: "阿根廷",
  Australia: "澳大利亚",
  Austria: "奥地利",
  Belgium: "比利时",
  "Bosnia and Herzegovina": "波黑",
  Brazil: "巴西",
  "Cape Verde": "佛得角",
  Canada: "加拿大",
  Colombia: "哥伦比亚",
  Croatia: "克罗地亚",
  Curacao: "库拉索",
  "Congo DR": "刚果（金）",
  Czechia: "捷克",
  Ecuador: "厄瓜多尔",
  Egypt: "埃及",
  England: "英格兰",
  France: "法国",
  Germany: "德国",
  Ghana: "加纳",
  Haiti: "海地",
  Iraq: "伊拉克",
  "IR Iran": "伊朗",
  Japan: "日本",
  Jordan: "约旦",
  "Korea Republic": "韩国",
  Mexico: "墨西哥",
  Morocco: "摩洛哥",
  Netherlands: "荷兰",
  "New Zealand": "新西兰",
  Norway: "挪威",
  Panama: "巴拿马",
  Paraguay: "巴拉圭",
  Portugal: "葡萄牙",
  Qatar: "卡塔尔",
  "Saudi Arabia": "沙特阿拉伯",
  Scotland: "苏格兰",
  Senegal: "塞内加尔",
  "South Africa": "南非",
  Spain: "西班牙",
  Sweden: "瑞典",
  Switzerland: "瑞士",
  Tunisia: "突尼斯",
  Türkiye: "土耳其",
  Uruguay: "乌拉圭",
  USA: "美国",
  Uzbekistan: "乌兹别克斯坦"
};

const SLUG_OVERRIDES = {
  "Korea Republic": "korea",
  USA: "usa",
  "Bosnia and Herzegovina": "bosnia-and-herzegovina",
  "South Africa": "south-africa",
  "New Zealand": "new-zealand",
  "Saudi Arabia": "saudi-arabia",
  "Congo DR": "congo-dr",
  "IR Iran": "ir-iran",
  "Cape Verde": "cape-verde",
  "Cote d'Ivoire": "cote-divoire"
};

function normalizeText(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, "$1")
    .replace(/\{\{nowrap\|([^}]+)\}\}/g, "$1")
    .replace(/\{\{sortname\|([^|}]+)\|([^}]+)\}\}/g, "$1 $2")
    .replace(/\{\{flagicon\|[^}]+\}\}/g, "")
    .replace(/\{\{small\|([^}]+)\}\}/g, "$1")
    .replace(/'''/g, "")
    .replace(/''/g, "")
    .replace(/<br\s*\/?>/g, ", ")
    .replace(/\{\{!}}/g, "|")
    .replace(/\s+/g, " ")
    .trim();
}

function toDisplayName(value) {
  const normalized = normalizeText(value);
  return TEAM_NAME_OVERRIDES[normalized] ?? normalized;
}

function slugify(name) {
  if (SLUG_OVERRIDES[name]) {
    return SLUG_OVERRIDES[name];
  }

  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function extractField(block, field) {
  const match = block.match(new RegExp(`\\|${field}=([^\\n]*)`));
  return match ? match[1].trim() : "";
}

function parseDateField(value) {
  const match = value.match(/\{\{Start date\|(\d{4})\|(\d{1,2})\|(\d{1,2})/);
  if (!match) {
    throw new Error(`Unable to parse date field: ${value}`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
}

function parseTimeField(value) {
  const clean = normalizeText(value).replace("UTC−", "UTC-");
  const timeMatch = clean.match(/(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)/i);
  const offsetMatch = clean.match(/UTC([+-]\d{1,2})/i);

  if (!timeMatch || !offsetMatch) {
    throw new Error(`Unable to parse time field: ${value}`);
  }

  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const meridian = timeMatch[3].toLowerCase();
  const utcOffset = Number(offsetMatch[1]);

  if (meridian === "p.m." && hour !== 12) {
    hour += 12;
  }

  if (meridian === "a.m." && hour === 12) {
    hour = 0;
  }

  return { hour, minute, utcOffset };
}

function toKickoffUtc(dateField, timeField) {
  const { year, month, day } = parseDateField(dateField);
  const { hour, minute, utcOffset } = parseTimeField(timeField);
  const utcMillis = Date.UTC(year, month - 1, day, hour - utcOffset, minute, 0);

  return new Date(utcMillis).toISOString();
}

function parseVenue(value) {
  const normalized = normalizeText(value);
  const parts = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    venue: parts[0] ?? "",
    city: parts.slice(1).join(", ")
  };
}

function parseScore(value) {
  const raw = normalizeText(value);
  const match = raw.match(/(\d+)[–-](\d+)/);

  if (!match) {
    return {
      status: "scheduled",
      homeScore: null,
      awayScore: null
    };
  }

  return {
    status: "finished",
    homeScore: Number(match[1]),
    awayScore: Number(match[2])
  };
}

function extractGroupTeamNames(raw, groupId) {
  const introMatch = raw.match(/The group consists of ([\s\S]+?)\. The top two teams/);
  if (!introMatch) {
    throw new Error(`Unable to parse intro for Group ${groupId}`);
  }

  const linkMatches = [...introMatch[1].matchAll(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g)];
  return linkMatches.slice(0, 4).map((match) => toDisplayName(match[1]));
}

function extractGroupCodes(raw, groupId) {
  const regex = new RegExp(
    `\\|\\s*${groupId}[1-4]\\s*\\|\\|[^\\n]*?\\{\\{#invoke:flag\\|fb\\|([A-Z0-9]+)`,
    "g"
  );

  return [...raw.matchAll(regex)].map((match) => match[1]);
}

function parseTeamFromBlock(rawValue, codeMap) {
  const codeMatch = rawValue.match(/fb(?:-rt)?\|([A-Z0-9]+)/);
  if (codeMatch) {
    const code = codeMatch[1];
    const name = codeMap.get(code);

    if (!name) {
      throw new Error(`Missing code mapping for ${code}`);
    }

    return {
      name,
      code,
      slug: slugify(name),
      isPlaceholder: false
    };
  }

  const placeholder = toDisplayName(rawValue.replace(/<!--.*?-->/g, ""));

  return {
    name: placeholder,
    code: null,
    slug: null,
    isPlaceholder: true
  };
}

function inferStage(pageTitle, heading, sectionKey) {
  if (!pageTitle.includes("knockout") && !pageTitle.includes("_final")) {
    return "Group Stage";
  }

  if (sectionKey === "3rd") {
    return "Third place";
  }

  if (sectionKey === "Final") {
    return "Final";
  }

  if (sectionKey.startsWith("R32")) {
    return "Round of 32";
  }

  if (sectionKey.startsWith("R16")) {
    return "Round of 16";
  }

  if (sectionKey.startsWith("QF")) {
    return "Quarter-finals";
  }

  if (sectionKey.startsWith("SF")) {
    return "Semi-finals";
  }

  return heading.includes("Match for third place") ? "Third place" : "Final";
}

function parseMatches(raw, pageTitle, codeMap = new Map()) {
  const headings = [...raw.matchAll(/^={2,3}([^=]+)={2,3}\s*$/gm)].map((entry) => ({
    heading: normalizeText(entry[1]),
    index: entry.index
  }));
  const matchRegex =
    /<section begin="?([^" >]+)"?\s*\/>\{\{#invoke:football box\|main([\s\S]*?)\}\}<section end="?[^" >]+"?\s*\/>/g;

  return [...raw.matchAll(matchRegex)].map((entry) => {
    const sectionKey = entry[1];
    const blockIndex = entry.index ?? 0;
    let heading =
      headings.filter((item) => item.index < blockIndex).at(-1)?.heading ?? "Match";
    if (sectionKey === "Final") {
      heading = "Final";
    }
    const block = entry[2];
    const dateField = extractField(block, "date");
    const timeField = extractField(block, "time");
    const scoreField = extractField(block, "score");
    const stadiumField = extractField(block, "stadium");
    const home = parseTeamFromBlock(extractField(block, "team1"), codeMap);
    const away = parseTeamFromBlock(extractField(block, "team2"), codeMap);
    const score = parseScore(scoreField);
    const venue = parseVenue(stadiumField);
    const groupMatch = pageTitle.match(/Group_([A-L])/);
    const group = groupMatch ? `Group ${groupMatch[1]}` : "";
    const stage = inferStage(pageTitle, heading, sectionKey);
    const referenceMatch = block.match(/match\/17\/285023\/289273\/(\d+)/);
    const reportMatch = block.match(/\[(https:\/\/www\.fifa\.com\/en\/match-centre\/match\/[^\s"]+)/);

    return {
      id: referenceMatch ? `fifa-${referenceMatch[1]}` : slugify(`${stage}-${heading}`),
      stage,
      group,
      heading,
      kickoffUtc: toKickoffUtc(dateField, timeField),
      venue: venue.venue,
      city: venue.city,
      home: home.name,
      away: away.name,
      homeCode: home.code,
      awayCode: away.code,
      homeSlug: home.slug,
      awaySlug: away.slug,
      homePlaceholder: home.isPlaceholder,
      awayPlaceholder: away.isPlaceholder,
      status: score.status,
      homeScore: score.homeScore,
      awayScore: score.awayScore,
      reportUrl: reportMatch ? reportMatch[1] : null
    };
  });
}

async function fetchRaw(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "worldcup-local-time-sync/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function buildDataset() {
  const groupPages = await Promise.all(
    GROUP_IDS.map(async (groupId) => {
      const url = `${GROUP_PAGE_BASE}${groupId}&action=raw`;
      const raw = await fetchRaw(url);
      const names = extractGroupTeamNames(raw, groupId);
      const codes = extractGroupCodes(raw, groupId);
      const codeMap = new Map(codes.map((code, index) => [code, names[index]]));

      return {
        page: `2026_FIFA_World_Cup_Group_${groupId}`,
        groupId,
        matches: parseMatches(raw, `2026_FIFA_World_Cup_Group_${groupId}`, codeMap)
      };
    })
  );

  const knockoutRaw = await fetchRaw(KNOCKOUT_PAGE);
  const finalRaw = await fetchRaw(FINAL_PAGE);
  const knockoutMatches = parseMatches(knockoutRaw, "2026_FIFA_World_Cup_knockout_stage");
  const finalMatches = parseMatches(finalRaw, "2026_FIFA_World_Cup_final");
  const allMatches = [
    ...groupPages.flatMap((page) => page.matches),
    ...knockoutMatches,
    ...finalMatches
  ].sort((left, right) => new Date(left.kickoffUtc).getTime() - new Date(right.kickoffUtc).getTime());

  const actualTeams = Array.from(
    new Map(
      allMatches
        .flatMap((match) => [
          match.homePlaceholder
            ? null
            : {
                name: match.home,
                code: match.homeCode,
                slug: match.homeSlug,
                nameZh: TEAM_ZH[match.home] ?? match.home
              },
          match.awayPlaceholder
            ? null
            : {
                name: match.away,
                code: match.awayCode,
                slug: match.awaySlug,
                nameZh: TEAM_ZH[match.away] ?? match.away
              }
        ])
        .filter(Boolean)
        .map((team) => [team.slug, team])
    ).values()
  ).sort((left, right) => left.name.localeCompare(right.name));

  return {
    generatedAt: new Date().toISOString(),
    source: {
      primary: "Wikipedia raw tournament pages referencing FIFA match reports",
      urls: [
        ...groupPages.map(
          (page) => `https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_${page.groupId}`
        ),
        "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage",
        "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_final"
      ]
    },
    teams: actualTeams,
    matches: allMatches
  };
}

async function main() {
  const data = await buildDataset();
  const here = path.dirname(fileURLToPath(import.meta.url));
  const defaultOutputFile = path.resolve(here, "../src/data/worldcup-data.json");
  const outputFile = process.env.WORLDCUP_DATA_FILE
    ? path.resolve(process.env.WORLDCUP_DATA_FILE)
    : defaultOutputFile;
  const outputDir = path.dirname(outputFile);

  let existingData = null;

  try {
    existingData = JSON.parse(await readFile(outputFile, "utf8"));
  } catch {
    // The first sync creates the generated data file.
  }

  const comparableData = ({ source, teams, matches }) => ({ source, teams, matches });
  const hasChanges =
    !existingData ||
    JSON.stringify(comparableData(existingData)) !==
      JSON.stringify(comparableData(data));

  if (hasChanges) {
    await mkdir(outputDir, { recursive: true });
    await writeFile(outputFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }

  console.log(
    JSON.stringify(
      {
        updated: hasChanges,
        outputFile,
        teams: data.teams.length,
        matches: data.matches.length,
        generatedAt: data.generatedAt
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

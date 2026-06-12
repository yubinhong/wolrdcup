import type { MetadataRoute } from "next";
import { SITE_URL, matches, teams } from "@/lib/site";

const corePaths = [
  "/en",
  "/zh",
  "/en/today",
  "/zh/today",
  "/en/calendar",
  "/zh/calendar",
  "/en/watch-party-template",
  "/zh/watch-party-template",
  "/en/for-bars",
  "/zh/for-bars"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = corePaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "daily" as const,
    priority: path.endsWith("/today") ? 0.9 : 0.8
  }));

  const teamEntries = teams.flatMap((team) => [
    {
      url: `${SITE_URL}/en/teams/${team.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7
    },
    {
      url: `${SITE_URL}/zh/teams/${team.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7
    }
  ]);

  const matchEntries = matches.flatMap((match) => [
    {
      url: `${SITE_URL}/en/matches/${match.id}`,
      lastModified: new Date(match.kickoffUtc),
      changeFrequency: "hourly" as const,
      priority: 0.8
    },
    {
      url: `${SITE_URL}/zh/matches/${match.id}`,
      lastModified: new Date(match.kickoffUtc),
      changeFrequency: "hourly" as const,
      priority: 0.8
    }
  ]);

  return [...staticEntries, ...teamEntries, ...matchEntries];
}

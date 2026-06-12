import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`
  },
  description:
    "Independent 2026 World Cup schedule, team pages, local kickoff converter, and downloadable calendar subscriptions.",
  keywords: [
    "world cup schedule",
    "local time converter",
    "today matches",
    "world cup calendar",
    "watch party template"
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "Independent 2026 World Cup schedule, team pages, local kickoff converter, and downloadable calendar subscriptions.",
    url: SITE_URL
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Independent 2026 World Cup schedule, team pages, local kickoff converter, and downloadable calendar subscriptions."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

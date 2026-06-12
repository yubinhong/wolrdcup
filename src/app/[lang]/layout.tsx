import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { LANGUAGES, isLang } from "@/lib/site";

export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  return <SiteShell lang={lang}>{children}</SiteShell>;
}

import Link from "next/link";
import { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  DATA_SOURCE,
  Lang,
  SITE_NAME,
  buildInternalPath,
  copy,
  formatUpdatedAt
} from "@/lib/site";

type Props = {
  lang: Lang;
  children: ReactNode;
};

export function SiteShell({ lang, children }: Props) {
  const dict = copy[lang];

  return (
    <>
      <header className="site-header">
        <div className="shell site-header__inner">
          <Link href={buildInternalPath(lang)} className="brand">
            <span className="brand__badge">26</span>
            <span>{SITE_NAME}</span>
          </Link>

          <nav className="nav">
            <Link href={buildInternalPath(lang)}>{dict.nav.home}</Link>
            <Link href={buildInternalPath(lang, "/today")}>{dict.nav.today}</Link>
            <Link href={buildInternalPath(lang, "/calendar")}>{dict.nav.calendar}</Link>
            <Link href={buildInternalPath(lang, "/watch-party-template")}>
              {dict.nav.template}
            </Link>
            <Link href={buildInternalPath(lang, "/for-bars")}>{dict.nav.bars}</Link>
          </nav>

          <LanguageSwitcher current={lang} />
        </div>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="shell">
          <div className="footer__box">
            <strong>{SITE_NAME}</strong>
            <p className="small">
              {dict.common.unofficial}. {dict.common.updated}: {formatUpdatedAt(lang)} UTC.
            </p>
            <p className="small">
              {dict.common.source}: {DATA_SOURCE.primary}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

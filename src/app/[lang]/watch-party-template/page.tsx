import type { Metadata } from "next";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { getCanonicalUrl, getLanguageAlternates, Lang } from "@/lib/site";

type Props = {
  params: Promise<{ lang: Lang }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  return lang === "zh"
    ? {
        title: "世界杯观赛活动页模板",
        description: "给酒吧和餐厅用的世界杯观赛活动页模板，可继续升级成收费定制服务。",
        alternates: {
          canonical: getCanonicalUrl("/zh/watch-party-template"),
          ...getLanguageAlternates("/watch-party-template")
        }
      }
    : {
        title: "World Cup Watch Party Landing Page Template",
        description:
          "A reusable World Cup watch-party template for bars and restaurants, with a built-in path to paid customization.",
        alternates: {
          canonical: getCanonicalUrl("/en/watch-party-template"),
          ...getLanguageAlternates("/watch-party-template")
        }
      };
}

export default async function WatchPartyTemplatePage({ params }: Props) {
  const { lang } = await params;

  return (
    <section className="page-hero">
      <div className="shell stack">
        <SeoJsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name:
              lang === "zh"
                ? "世界杯观赛活动页模板"
                : "World Cup Watch Party Landing Page Template",
            url: getCanonicalUrl(`/${lang}/watch-party-template`),
            inLanguage: lang === "zh" ? "zh-CN" : "en-US"
          }}
        />
        <div>
          <p className="eyebrow">{lang === "zh" ? "免费模板" : "Free template"}</p>
          <h1>
            {lang === "zh"
              ? "世界杯观赛活动页模板"
              : "World Cup watch party landing page template"}
          </h1>
          <p className="lede">
            {lang === "zh"
              ? "这个页面是分享内容里建议的免费入口：先给酒吧和餐厅一个能直接复制的模板，再把定制需求导向付费页。"
              : "This page acts as the free funnel asset from the original plan: publish a ready-made template, then route customization requests to the paid sales page."}
          </p>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div className="stack">
            <div className="mini-card">
              <h3>{lang === "zh" ? "标题区域" : "Hero block"}</h3>
              <p className="muted">
                {lang === "zh"
                  ? "示例：今晚一起看 Mexico vs South Africa。大屏直播、啤酒特价、提前预约。"
                  : "Example: Watch Mexico vs South Africa with us tonight. Big screen, drink specials, and early bookings."}
              </p>
            </div>
            <div className="mini-card">
              <h3>{lang === "zh" ? "必备模块" : "Must-have sections"}</h3>
              <p className="muted">
                {lang === "zh"
                  ? "比赛时间、商家地址、菜单亮点、WhatsApp/Telegram 预约按钮、二维码海报。"
                  : "Match time, venue address, menu highlights, WhatsApp or Telegram booking button, and poster QR code."}
              </p>
            </div>
            <div className="mini-card">
              <h3>{lang === "zh" ? "升级方向" : "Upsell path"}</h3>
              <p className="muted">
                {lang === "zh"
                  ? "把模板页导向 `$49 setup`、`$99 weekly content` 或整届套餐。"
                  : "Point template visitors toward your $49 setup, $99 weekly content pack, or full tournament bundle."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

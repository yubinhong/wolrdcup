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
        title: "给酒吧和餐厅的世界杯活动页服务",
        description: "面向酒吧和餐厅的世界杯活动页搭建与营销素材服务页。",
        alternates: {
          canonical: getCanonicalUrl("/zh/for-bars"),
          ...getLanguageAlternates("/for-bars")
        }
      }
    : {
        title: "World Cup Event Pages for Bars and Restaurants",
        description:
          "Sales page for bars and restaurants that want World Cup event pages, booking buttons, and promo content.",
        alternates: {
          canonical: getCanonicalUrl("/en/for-bars"),
          ...getLanguageAlternates("/for-bars")
        }
      };
}

export default async function ForBarsPage({ params }: Props) {
  const { lang } = await params;

  return (
    <section className="page-hero">
      <div className="shell stack">
        <SeoJsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Service",
            name:
              lang === "zh"
                ? "给酒吧和餐厅的世界杯活动页服务"
                : "World Cup Event Pages for Bars and Restaurants",
            url: getCanonicalUrl(`/${lang}/for-bars`),
            inLanguage: lang === "zh" ? "zh-CN" : "en-US",
            offers: [
              { "@type": "Offer", priceCurrency: "USD", price: "49" },
              { "@type": "Offer", priceCurrency: "USD", price: "99" },
              { "@type": "Offer", priceCurrency: "USD", price: "199" }
            ]
          }}
        />
        <div>
          <p className="eyebrow">{lang === "zh" ? "商家服务页" : "Sales page"}</p>
          <h1>
            {lang === "zh"
              ? "给酒吧和餐厅的世界杯活动页服务"
              : "World Cup event pages for bars and restaurants"}
          </h1>
          <p className="lede">
            {lang === "zh"
              ? "这是分享内容里最容易尽快收钱的部分。工具站负责吸引流量，这个页面负责把商家需求转成订单。"
              : "This is the fastest path to revenue from the shared plan. The tool site attracts visitors, and this page converts bar or restaurant owners into customers."}
          </p>
        </div>

        <div className="service-grid">
          <div className="service-card">
            <h3>$49</h3>
            <p className="muted">
              {lang === "zh"
                ? "单个活动页：比赛时间、菜单亮点、地图、预约按钮、二维码。"
                : "Single event page with match times, menu highlights, map, booking button, and QR code."}
            </p>
          </div>
          <div className="service-card">
            <h3>$99</h3>
            <p className="muted">
              {lang === "zh"
                ? "一周营销素材：海报文案、社媒贴文、活动标题、预约文案。"
                : "Weekly marketing assets with poster copy, social posts, event titles, and booking text."}
            </p>
          </div>
          <div className="service-card">
            <h3>$199</h3>
            <p className="muted">
              {lang === "zh"
                ? "整届基础包：活动页、更新维护、文案、观赛海报。"
                : "Full-tournament starter bundle with event page, updates, promo copy, and posters."}
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 className="section-title">
            {lang === "zh" ? "冷邮件示例" : "Outreach email example"}
          </h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              margin: "1rem 0 0",
              padding: "1rem",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(40, 33, 22, 0.12)"
            }}
          >
{`Hi,

I built simple World Cup event pages for bars and restaurants.

It includes:
- Today's World Cup match schedule
- Your food and drink specials
- Google Maps location
- WhatsApp booking button
- QR code for posters and tables

I can set one up for your business for $49.

Best,
[Your Name]`}
          </pre>
        </div>
      </div>
    </section>
  );
}

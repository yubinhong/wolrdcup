# Cloudflare Pages 部署文档

## 先说结论

当前仓库**不适合直接按 Cloudflare Pages 的静态导出方式上线**，原因不是构建脚本，而是功能形态本身。

Cloudflare 官方在 2026 年 4 月更新的文档里已经明确区分：

- `Pages` 里的 Next.js 静态站点方案，适合 `static export`
- 完整的 Next.js 应用，尤其是带 `Route Handlers`、动态 OG 图、SSR/ISR 的，更推荐走 `Cloudflare Workers`

这个项目目前包含以下动态能力：

- `GET /api/calendar`
- `/[lang]/teams/[slug]/opengraph-image`
- `/[lang]/matches/[id]/opengraph-image`

所以如果你坚持使用 Pages，就要先把它改造成**纯静态导出项目**。

## 当前仓库状态

现状可以分成两部分看：

- 可以静态生成的页面：
  - 首页、`today`、`calendar`
  - 球队页
  - 比赛页
  - `sitemap.xml` / `robots.txt`
- 不能直接进入静态导出的能力：
  - [src/app/api/calendar/route.ts](/Users/ybh/PycharmProjects/worldcup/src/app/api/calendar/route.ts)
  - [src/app/[lang]/teams/[slug]/opengraph-image.tsx](/Users/ybh/PycharmProjects/worldcup/src/app/%5Blang%5D/teams/%5Bslug%5D/opengraph-image.tsx)
  - [src/app/[lang]/matches/[id]/opengraph-image.tsx](/Users/ybh/PycharmProjects/worldcup/src/app/%5Blang%5D/matches/%5Bid%5D/opengraph-image.tsx)

## 方案建议

### 方案 A：保留现有功能，改用 Cloudflare Workers

如果你的目标是：

- 保留 `ICS` 下载接口
- 保留动态 Open Graph 图
- 后续继续加动态提醒、订阅、Webhook 或埋点

那就不要强行上 Pages 静态导出，直接部署到 Cloudflare Workers 更稳。

这也是 Cloudflare 现在对完整 Next.js 应用的官方推荐方向。

### 方案 B：必须上 Cloudflare Pages，就先做静态化改造

如果你的目标是“先尽快上线一个纯静态 SEO 站点到 Pages”，那需要接受下面这些改动：

1. 移除或替换 `/api/calendar`
2. 把动态 OG 图改成预生成图片或统一静态分享图
3. 在 `next.config.ts` 中启用 `output: "export"`
4. 把所有依赖运行时请求的能力清理掉
5. 最终输出目录变成 `out/`

## Cloudflare Pages 静态导出配置

这是 Cloudflare 官方静态导出方案对应的配置组合：

- Framework preset: `Next.js (Static HTML Export)`
- Production branch: `main`
- Build command: `npx next build`
- Build output directory: `out`

补充说明：

- Cloudflare 的 Pages 构建环境会自动注入 `CF_PAGES_URL`
- 我已经在项目里把 `CF_PAGES_URL` 纳入站点 URL 兜底识别
- 如果你有正式域名，仍然建议显式配置 `NEXT_PUBLIC_SITE_URL`

## 推荐的 Pages 环境变量

生产环境建议设置：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

预览环境可以先不配正式域名，项目会回退使用：

```bash
CF_PAGES_URL
```

## 如果你一定要按 Pages 上线，改造步骤

下面是一条最稳的改造路线。

### 第 1 步：把日历下载改成静态文件

当前的 `ICS` 依赖路由处理器返回：

- [src/app/api/calendar/route.ts](/Users/ybh/PycharmProjects/worldcup/src/app/api/calendar/route.ts)

要改成 Pages 静态导出，需要把这些内容在构建阶段预生成成文件，例如：

- `/public/calendars/world-cup-local-time.ics`
- `/public/calendars/mexico-world-cup.ics`
- `/public/calendars/korea-world-cup.ics`

然后前端下载链接直接指向静态文件。

### 第 2 步：把动态 OG 图改成静态资源

当前的分享图由 `next/og` 动态生成：

- [src/app/[lang]/teams/[slug]/opengraph-image.tsx](/Users/ybh/PycharmProjects/worldcup/src/app/%5Blang%5D/teams/%5Bslug%5D/opengraph-image.tsx)
- [src/app/[lang]/matches/[id]/opengraph-image.tsx](/Users/ybh/PycharmProjects/worldcup/src/app/%5Blang%5D/matches/%5Bid%5D/opengraph-image.tsx)

静态导出时，建议改成二选一：

- 统一使用一张站点级默认分享图
- 在构建阶段预生成球队图和比赛图，再把 metadata 指向静态图片 URL

### 第 3 步：切换到静态导出配置

在 [next.config.ts](/Users/ybh/PycharmProjects/worldcup/next.config.ts) 中加入静态导出配置，例如：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export"
};

export default nextConfig;
```

如果后续引入 `next/image`，通常还要继续补：

```ts
images: {
  unoptimized: true
}
```

## Cloudflare Pages 控制台操作步骤

当项目已经完成静态化以后，再按下面流程部署：

1. 把仓库推到 GitHub 或 GitLab
2. 登录 Cloudflare Dashboard
3. 进入 `Workers & Pages`
4. 选择 `Create application`
5. 切换到 `Pages`
6. 选择 `Import an existing Git repository`
7. 连接这个仓库
8. Framework preset 选择 `Next.js (Static HTML Export)`
9. 确认 Build command 为 `npx next build`
10. 确认 Build output directory 为 `out`
11. 在 `Settings > Environment variables` 配置 `NEXT_PUBLIC_SITE_URL`
12. 开始第一次部署

## 自动部署与数据同步

当前生产方案已经切换为 Docker Compose + VPS 本机定时同步，不再使用 GitHub Actions。

相关文件：

- [deploy/sync-and-redeploy.sh](/Users/ybh/PycharmProjects/worldcup/deploy/sync-and-redeploy.sh)
- [deploy/systemd/worldcup-sync.timer.example](/Users/ybh/PycharmProjects/worldcup/deploy/systemd/worldcup-sync.timer.example)

这套同步方式会在数据变化后重新构建 Docker 应用，不适用于 Cloudflare Pages 自动部署。

## 风险提示

如果你不做静态化改造，直接把当前仓库按 Pages 静态导出部署，会遇到这些问题：

- `ICS` 下载接口不可用
- 动态 OG 图不可用
- 元数据里的分享图路径可能失效
- 部分功能会在本地构建正常、上线后失真

## 我建议的下一步

如果你的优先级是“尽快上线”，最省事的路径是二选一：

1. 保留现状，改部署到 Cloudflare Workers
2. 我继续帮你把这个项目改造成纯静态 Pages 版本

如果你要，我下一步可以直接开始做第 2 条，把它真正改到能上 Cloudflare Pages。

# World Cup Local Time

一个面向 2026 世界杯的本地时间赛程站点，核心目标是把比赛开球时间、球队页、比赛页、结构化数据、社交分享图和日历订阅整理成一套可被搜索引擎收录的落地页体系。

## 当前能力

- 48 支球队与 104 场比赛的真实数据集
- 双语页面：`/en` 与 `/zh`
- 球队页、比赛页、`Today`、`Calendar`、商家页与活动模板页
- `SportsEvent` / `SportsTeam` 结构化数据
- 球队页与比赛页的 Open Graph 图
- ICS 日历下载接口：`/api/calendar`
- VPS 本机定时同步真实赛程数据

## 技术栈

- Next.js 16
- React 19
- TypeScript
- pnpm

## 本地开发

```bash
pnpm install
pnpm dev
```

常用脚本：

```bash
pnpm lint
pnpm build
pnpm sync:data
```

## 环境变量

建议至少配置：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

项目也会自动识别以下平台变量作为兜底：

- `CF_PAGES_URL`
- `VERCEL_PROJECT_PRODUCTION_URL`
- `VERCEL_URL`

## Docker Compose 部署

如果你有自己的 VPS，推荐直接用 Docker Compose 部署。这个项目当前包含路由处理器和动态 OG 图，比起 Cloudflare Pages 静态导出，更适合走容器化生产部署。

项目里已经包含：

- [Dockerfile](/Users/ybh/PycharmProjects/worldcup/Dockerfile)
- [docker-compose.yml](/Users/ybh/PycharmProjects/worldcup/docker-compose.yml)
- [.env.production.example](/Users/ybh/PycharmProjects/worldcup/.env.production.example)
- [docs/docker-compose-deploy.md](/Users/ybh/PycharmProjects/worldcup/docs/docker-compose-deploy.md)

最简流程：

```bash
cp .env.production.example .env.production
./deploy/redeploy.sh
```

## 数据同步

Docker Compose 部署使用 VPS 本机定时任务，不再依赖 GitHub Actions。

- Compose 的 `sync` 服务负责拉取数据
- 同步结果保存在被 Git 忽略的 `.runtime/` 目录
- [deploy/sync-and-redeploy.sh](/Users/ybh/PycharmProjects/worldcup/deploy/sync-and-redeploy.sh) 比较候选数据和已部署数据的哈希
- [deploy/redeploy.sh](/Users/ybh/PycharmProjects/worldcup/deploy/redeploy.sh) 统一处理首次部署、代码更新和数据重建
- 数据真正变化时才重建并重启应用容器
- `systemd timer` 默认每 30 分钟执行一次

手动执行：

```bash
./deploy/sync-and-redeploy.sh
```

定时任务安装方式见 [docs/docker-compose-deploy.md](/Users/ybh/PycharmProjects/worldcup/docs/docker-compose-deploy.md)。

## Cloudflare 说明

Cloudflare 最新官方文档已经把 Next.js 分成两类：

- `Cloudflare Pages`：更适合静态导出站点
- `Cloudflare Workers`：更适合保留 SSR、Route Handlers、动态 OG 图等完整 Next.js 能力

当前这个项目包含：

- [src/app/api/calendar/route.ts](/Users/ybh/PycharmProjects/worldcup/src/app/api/calendar/route.ts)
- [src/app/[lang]/teams/[slug]/opengraph-image.tsx](/Users/ybh/PycharmProjects/worldcup/src/app/%5Blang%5D/teams/%5Bslug%5D/opengraph-image.tsx)
- [src/app/[lang]/matches/[id]/opengraph-image.tsx](/Users/ybh/PycharmProjects/worldcup/src/app/%5Blang%5D/matches/%5Bid%5D/opengraph-image.tsx)

这意味着它不是“直接可静态导出”的 Pages 项目。

如果你只是要一份 Cloudflare Pages 部署与改造说明，请看：

- [docs/cloudflare-pages-deploy.md](/Users/ybh/PycharmProjects/worldcup/docs/cloudflare-pages-deploy.md)

如果你希望我下一步直接把这个项目改造成“可上 Cloudflare Pages 静态导出”的版本，我可以继续把 `ICS` 下载和 OG 图改成静态产物。

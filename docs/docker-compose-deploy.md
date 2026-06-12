# Docker Compose 部署文档

## 适用场景

这份文档适合下面这种部署方式：

- 你已经有一台自己的 VPS
- 你希望保留当前 Next.js 项目的完整能力
- 你不想为了平台限制去砍掉 `ICS` 下载接口和动态 OG 图

当前项目更适合这种部署方式，因为它包含：

- [src/app/api/calendar/route.ts](/Users/ybh/PycharmProjects/worldcup/src/app/api/calendar/route.ts)
- [src/app/[lang]/teams/[slug]/opengraph-image.tsx](/Users/ybh/PycharmProjects/worldcup/src/app/%5Blang%5D/teams/%5Bslug%5D/opengraph-image.tsx)
- [src/app/[lang]/matches/[id]/opengraph-image.tsx](/Users/ybh/PycharmProjects/worldcup/src/app/%5Blang%5D/matches/%5Bid%5D/opengraph-image.tsx)

这些能力在 Docker Compose + VPS 上都可以直接保留。

## 仓库里已经准备好的文件

- [Dockerfile](/Users/ybh/PycharmProjects/worldcup/Dockerfile)
- [docker-compose.yml](/Users/ybh/PycharmProjects/worldcup/docker-compose.yml)
- [.dockerignore](/Users/ybh/PycharmProjects/worldcup/.dockerignore)
- [.env.production.example](/Users/ybh/PycharmProjects/worldcup/.env.production.example)

## VPS 前置条件

机器上需要有：

- Docker
- Docker Compose Plugin
- Git

如果是 Ubuntu/Debian，一般会是这类检查命令：

```bash
docker --version
docker compose version
git --version
```

## 第一次部署

### 1. 拉代码

```bash
git clone <your-repo-url> worldcup
cd worldcup
```

### 2. 配环境变量

复制示例文件：

```bash
cp .env.production.example .env.production
```

然后编辑 `.env.production`，至少改这两个值：

```bash
APP_PORT=3000
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

说明：

- `APP_PORT` 是宿主机暴露端口
- `NEXT_PUBLIC_SITE_URL` 一定要填正式域名，不然 canonical、OG、结构化数据里的 URL 会不准

### 3. 启动容器

```bash
chmod +x deploy/redeploy.sh deploy/sync-and-redeploy.sh
./deploy/redeploy.sh
```

### 4. 查看状态

```bash
docker compose ps
docker compose logs -f app
```

如果启动正常，服务会监听：

```bash
http://127.0.0.1:3000
```

或者你在 `.env.production` 里设定的其他 `APP_PORT`。端口只绑定到本机回环地址，由 Nginx 对外提供访问，避免绕过 HTTPS 直接访问应用端口。

## 域名接入

推荐让 Nginx 或 Caddy 反向代理到容器暴露端口。

常见做法是：

- 域名 `A` 记录指向 VPS IP
- 反向代理监听 `80/443`
- 代理到 `127.0.0.1:3000`

仓库里已经放好一个可改域名即可使用的 Nginx 示例：

- [deploy/nginx/worldcup.example.conf](/Users/ybh/PycharmProjects/worldcup/deploy/nginx/worldcup.example.conf)

### Nginx 使用步骤

1. 把 `worldcup.example.com` 改成你的正式域名
2. 把证书路径改成你机器上的实际路径
3. 把文件放到 Nginx 站点目录，例如 `/etc/nginx/sites-available/worldcup.conf`
4. 建立软链接到启用目录
5. 检查配置并重载 Nginx

常见操作会像这样：

```bash
sudo ln -s /etc/nginx/sites-available/worldcup.conf /etc/nginx/sites-enabled/worldcup.conf
sudo nginx -t
sudo systemctl reload nginx
```

### Let’s Encrypt 证书

如果你使用 Certbot，常见流程通常是：

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

拿到证书后，再把示例配置里的域名和证书路径对齐即可。

## 更新部署

以后每次发布新版本，可以在 VPS 上执行：

```bash
git pull
./deploy/redeploy.sh
```

统一使用 `redeploy.sh` 可以确保代码更新时仍然带上 `.runtime/` 中最近一次同步的赛程数据。

如果你想顺手清理旧镜像，可以追加：

```bash
docker image prune -f
```

## 数据同步怎么处理

Docker Compose 部署不再依赖 GitHub Actions。仓库中已经提供：

- Compose `sync` 服务
- [deploy/redeploy.sh](/Users/ybh/PycharmProjects/worldcup/deploy/redeploy.sh)
- [deploy/sync-and-redeploy.sh](/Users/ybh/PycharmProjects/worldcup/deploy/sync-and-redeploy.sh)
- [deploy/systemd/worldcup-sync.service.example](/Users/ybh/PycharmProjects/worldcup/deploy/systemd/worldcup-sync.service.example)
- [deploy/systemd/worldcup-sync.timer.example](/Users/ybh/PycharmProjects/worldcup/deploy/systemd/worldcup-sync.timer.example)

同步流程是：

- 启动一次性的 `sync` 容器拉取真实赛程
- 把候选数据保存到被 Git 忽略的 `.runtime/` 目录
- 比较候选数据和已部署数据的哈希
- 数据无变化时直接结束
- 数据变化时临时注入构建目录，重新构建并重启 `app` 容器
- 构建结束后恢复仓库中的数据文件，避免影响以后 `git pull`

只更新 JSON 而不重建容器是不够的，因为球队页、比赛页和 SEO 元数据会在 Next.js 构建时生成。

### 手动测试同步

```bash
chmod +x deploy/redeploy.sh deploy/sync-and-redeploy.sh
./deploy/sync-and-redeploy.sh
```

第一次运行会构建 `sync` 镜像。后续如果数据没有变化，不会重建应用。

### 安装 systemd 定时任务

示例默认假设项目位于 `/opt/worldcup`。如果实际路径不同，先修改 service 文件中的 `WorkingDirectory` 和 `ExecStart`。

```bash
sudo cp deploy/systemd/worldcup-sync.service.example /etc/systemd/system/worldcup-sync.service
sudo cp deploy/systemd/worldcup-sync.timer.example /etc/systemd/system/worldcup-sync.timer
sudo systemctl daemon-reload
sudo systemctl enable --now worldcup-sync.timer
```

检查定时器：

```bash
systemctl list-timers worldcup-sync.timer
systemctl status worldcup-sync.timer
```

手动触发一次：

```bash
sudo systemctl start worldcup-sync.service
```

查看同步日志：

```bash
journalctl -u worldcup-sync.service -n 100 --no-pager
journalctl -u worldcup-sync.service -f
```

默认每 30 分钟运行一次，并加入最多 90 秒随机延迟。修改 timer 文件后执行：

```bash
sudo systemctl daemon-reload
sudo systemctl restart worldcup-sync.timer
```

## 常见命令

重启：

```bash
docker compose --env-file .env.production restart app
```

停止：

```bash
docker compose --env-file .env.production down
```

只看日志：

```bash
docker compose --env-file .env.production logs -f app
```

进入容器：

```bash
docker compose --env-file .env.production exec app sh
```

## 回滚思路

如果某次更新有问题，最简单的回滚方式是：

1. 在仓库切回上一个稳定提交
2. 重新执行构建启动

```bash
git checkout <stable-commit-sha>
./deploy/redeploy.sh
```

## 备注

这个项目现在已经启用了 Next.js `standalone` 输出，比较适合做容器化生产部署，镜像会比直接把整个开发目录丢进容器更干净。

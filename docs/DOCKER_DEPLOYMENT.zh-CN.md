# OpenVox Docker 本地部署

Docker Compose 会启动 OpenVox 前端、账号 API 和 PostgreSQL。实时音频、录音与导入文件仍在浏览器本地处理；登录后只有训练摘要和练习目标会同步到 PostgreSQL。

## 前置条件

- Docker Desktop 已安装并正在运行；
- 当前目录为 OpenVox 仓库根目录。

## 启动

首次启动前建议复制 `.env.example` 为 `.env`，并把 `POSTGRES_PASSWORD` 改成长随机密码。本机仅通过 `localhost` 使用时保持 `COOKIE_SECURE=false`。

```powershell
docker compose up -d --build
docker compose ps
```

浏览器访问：

```text
http://localhost:8080
```

`localhost` 属于浏览器认可的安全上下文例外，可以在本机使用麦克风和 Service Worker。

查看全部服务：

```powershell
docker compose ps
docker compose logs -f openvox api postgres
```

停止服务：

```powershell
docker compose down
```

## 修改端口

例如改用 8090：

```powershell
$env:OPENVOX_PORT="8090"
$env:OPENVOX_PUBLIC_URL="http://localhost:8090"
docker compose up -d --build
```

随后访问 `http://localhost:8090`。

## 更新代码或翻译后重新部署

```powershell
git pull --ff-only
docker compose up -d --build
```

镜像构建时会执行 `npm run build` 和 `npm run verify`。如果代码、翻译、PWA 资源或路由不完整，镜像构建会直接失败，不会用未校验的产物替换现有容器。

## 手机或局域网访问

可以把端口绑定到局域网，但手机通过 `http://电脑IP:8080` 访问时，浏览器通常不会授予麦克风和 Service Worker 权限。完整训练功能需要 HTTPS。推荐在容器前配置 Caddy、Traefik 或 Nginx TLS 反向代理，并使用浏览器信任的证书。

部署到正式域名时同步设置构建 URL：

```powershell
$env:OPENVOX_PUBLIC_URL="https://voice.example.com"
docker compose up -d --build
```

## 数据说明

- 删除容器不会删除浏览器中的 OpenVox 数据；
- 登录账号的用户资料、会话、训练摘要和目标保存在 `openvox-postgres-data` Docker 卷中；
- 数据按访问来源隔离，更换域名或端口后会看到一套新的浏览器存储；
- 清除浏览器站点数据会删除本机项目和录音，重要内容应先从 OpenVox 导出；
- 原始录音、麦克风音频、导入文件和项目内容不会被账号同步接口上传；
- 当前构建不加载 Google Analytics 或其他跟踪服务。

仅在确定不再需要服务器账号和同步记录时，才使用 `docker compose down -v` 删除容器及 PostgreSQL 数据卷。

## 正式部署

正式域名必须使用 HTTPS，并设置：

```powershell
$env:OPENVOX_PUBLIC_URL="https://voice.example.com"
$env:COOKIE_SECURE="true"
$env:POSTGRES_PASSWORD="请替换为长随机密码"
docker compose up -d --build
```

请让 TLS 反向代理只公开前端端口，PostgreSQL 和 API 无需直接暴露到公网。账号密码使用 scrypt 加盐哈希保存，会话使用 HttpOnly、SameSite=Lax Cookie。

## 许可证

OpenVox 使用 AGPL-3.0-only。仅个人本机使用通常不需要额外发布操作；如果通过网络向其他用户提供修改后的版本，应同时向这些用户提供对应源代码，并遵守项目的品牌与商标说明。

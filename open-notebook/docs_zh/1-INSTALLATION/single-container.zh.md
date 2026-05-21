# 单容器安装（已弃用）

> **弃用说明：** 单容器镜像（`v1-latest-single`）**已弃用**，将在 v2 中移除。请迁移至 [Docker Compose](docker-compose.zh.md)，这是面向所有用户的推荐安装方式。单容器镜像在 v2 发布前仍会更新，但不再面向其开发新功能或文档。

一体化容器部署。**比 Docker Compose 更简单，但灵活性较低。**

**适合：** PikaPods、Railway、共享主机、极简部署

> **替代注册表：** 镜像同时提供于 Docker Hub（`lfnovo/open_notebook:v1-latest-single`）与 GitHub Container Registry（`ghcr.io/lfnovo/open-notebook:v1-latest-single`）。

## 前置条件

- 已安装 Docker（用于本地测试）
- OpenAI、Anthropic 或其他提供商的 API 密钥
- 5 分钟

## 快速设置

### 本地测试（Docker）

```yaml
# docker-compose.yml
services:
  open_notebook:
    image: lfnovo/open_notebook:v1-latest-single
    pull_policy: always
    ports:
      - "8502:8502"  # Web UI (React frontend)
      - "5055:5055"  # API
    environment:
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=change-me-to-a-secret-string
      - SURREAL_URL=ws://localhost:8000/rpc
      - SURREAL_USER=root
      - SURREAL_PASSWORD=root
      - SURREAL_NAMESPACE=open_notebook
      - SURREAL_DATABASE=open_notebook
    volumes:
      - ./data:/app/data
    restart: always
```

运行：
```bash
docker compose up -d
```

访问：`http://localhost:8502`

然后配置 AI 提供商：
1. 前往 **Settings** → **API Keys**
2. 点击 **Add Credential** → 选择提供商 → 粘贴 API 密钥
3. 点击 **Save**，然后 **Test Connection**
4. 点击 **Discover Models** → **Register Models**

### 云平台

**PikaPods：**
1. 点击 "New App"
2. 搜索 "Open Notebook"
3. 设置环境变量（至少：`OPEN_NOTEBOOK_ENCRYPTION_KEY`）
4. 点击 "Deploy"
5. 打开应用 → 前往 **Settings → API Keys** 配置 AI 提供商

**Railway：**
1. 创建新项目
2. 添加 `lfnovo/open_notebook:v1-latest-single`
3. 设置环境变量（至少：`OPEN_NOTEBOOK_ENCRYPTION_KEY`）
4. 部署
5. 打开应用 → 前往 **Settings → API Keys** 配置 AI 提供商

**Render：**
1. 创建新 Web Service
2. 使用 Docker 镜像：`lfnovo/open_notebook:v1-latest-single`
3. 在控制台设置环境变量（至少：`OPEN_NOTEBOOK_ENCRYPTION_KEY`）
4. 为 `/app/data` 和 `/mydata` 配置持久磁盘

**DigitalOcean App Platform：**
1. 从 Docker Hub 创建新应用
2. 镜像：`lfnovo/open_notebook:v1-latest-single`
3. 端口设为 8502
4. 添加环境变量（至少：`OPEN_NOTEBOOK_ENCRYPTION_KEY`）
5. 配置持久存储

**Heroku：**
```bash
# Using heroku.yml
heroku container:push web
heroku container:release web
heroku config:set OPEN_NOTEBOOK_ENCRYPTION_KEY=your-secret-key
```

**Coolify：**
1. 添加新服务 → Docker Image
2. 镜像：`lfnovo/open_notebook:v1-latest-single`
3. 端口：8502
4. 添加环境变量（至少：`OPEN_NOTEBOOK_ENCRYPTION_KEY`）
5. 启用持久卷
6. Coolify 自动处理 HTTPS

---

## 环境变量

| 变量 | 用途 | 示例 |
|----------|---------|---------|
| `OPEN_NOTEBOOK_ENCRYPTION_KEY` | 凭据加密密钥（必需） | `my-secret-key` |
| `SURREAL_URL` | 数据库 | `ws://localhost:8000/rpc` |
| `SURREAL_USER` | 数据库用户 | `root` |
| `SURREAL_PASSWORD` | 数据库密码 | `root` |
| `SURREAL_NAMESPACE` | 数据库命名空间 | `open_notebook` |
| `SURREAL_DATABASE` | 数据库名 | `open_notebook` |
| `API_URL` | 外部 URL（远程访问） | `https://myapp.example.com` |

AI 提供商 API 密钥在部署后通过 **Settings → API Keys** 界面配置。

---

## 与 Docker Compose 的限制对比

| 功能 | 单容器 | Docker Compose |
|---------|------------------|-----------------|
| 设置时间 | 2 分钟 | 5 分钟 |
| 复杂度 | 最低 | 中等 |
| 服务 | 全部打包 | 分离 |
| 可扩展性 | 有限 | 优秀 |
| 内存占用 | 约 800MB | 约 1.2GB |

---

## 下一步

与 Docker Compose 设置相同 — 本地通过 `http://localhost:8502` 访问，云端使用平台 URL。

1. 前往 **Settings → API Keys** 添加 AI 提供商凭据
2. **Test Connection** 并 **Discover Models**

安装后完整指南见 [Docker Compose](docker-compose.zh.md)。

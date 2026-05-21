# Docker Compose 安装（推荐）

多容器部署，服务分离。**适合大多数用户。**

> **替代镜像仓库：** 所有镜像同时提供于 Docker Hub（`lfnovo/open_notebook`）与 GitHub Container Registry（`ghcr.io/lfnovo/open-notebook`）。若 Docker Hub 不可用或偏好 GitHub 工作流，可使用 GHCR。

## 前置条件

- **已安装 Docker Desktop**（[下载](https://www.docker.com/products/docker-desktop/)）
- **5–10 分钟**时间
- 至少一家 AI 提供商的 **API 密钥**（新手推荐 OpenAI）

## 步骤 1：获取 docker-compose.yml（1 分钟）

**选项 A：从仓库下载**
```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/lfnovo/open-notebook/main/docker-compose.yml
```

**选项 B：使用仓库中的官方文件**

官方 `docker-compose.yml` 位于仓库根目录：[在 GitHub 上查看](https://github.com/lfnovo/open-notebook/blob/main/docker-compose.yml)

将该文件复制到你的项目文件夹。

**选项 C：手动创建**

创建名为 `docker-compose.yml` 的文件，内容如下：

```yaml
services:
  surrealdb:
    image: surrealdb/surrealdb:v2
    command: start --log info --user root --pass root rocksdb:/mydata/mydatabase.db
    user: root  # Linux 绑定挂载需要
    ports:
      - "8000:8000"
    volumes:
      - ./surreal_data:/mydata
    environment:
      - SURREAL_EXPERIMENTAL_GRAPHQL=true
    restart: always
    pull_policy: always

  speaches:
    image: ghcr.io/speaches-ai/speaches:latest-cpu
    container_name: speaches
    ports:
      - "8969:8000"
    volumes:
      - hf-hub-cache:/home/ubuntu/.cache/huggingface/hub
    restart: unless-stopped

  searxng:
    image: searxng/searxng:latest
    container_name: searxng
    ports:
      - "8080:8080"
    volumes:
      - ./searxng:/etc/searxng:rw
    restart: unless-stopped
    pull_policy: always

  open_notebook:
    image: lfnovo/open_notebook:v1-latest
    ports:
      - "8502:8502"  # Web UI
      - "5055:5055"  # REST API
    environment:
      # 必填：改为你自己的密钥
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=change-me-to-a-secret-string

      # 数据库连接（默认值通常无需修改）
      - SURREAL_URL=ws://surrealdb:8000/rpc
      - SURREAL_USER=root
      - SURREAL_PASSWORD=root
      - SURREAL_NAMESPACE=open_notebook
      - SURREAL_DATABASE=open_notebook
    volumes:
      - ./notebook_data:/app/data
    depends_on:
      - surrealdb
      - speaches
    restart: always
    pull_policy: always

volumes:
  hf-hub-cache:
```

**编辑文件：**
- 将 `change-me-to-a-secret-string` 替换为你自己的密钥（任意字符串即可，例如 `my-super-secret-key-123`）

---

## 步骤 2：启动服务（2 分钟）

在 `open-notebook` 文件夹中打开终端：

```bash
docker compose up -d
```

等待 15–20 秒让所有服务启动：
```
✅ surrealdb running on :8000
✅ speaches running on :8969（本地 TTS/STT）
✅ searxng running on :8080（可选 — 关键词网页搜索）
✅ open_notebook running on :8502 (UI) and :5055 (API)
```

检查状态：
```bash
docker compose ps
```

---

## 步骤 3：验证安装（1 分钟）

**API 健康检查：**
```bash
curl http://localhost:5055/health
# Should return: {"status": "healthy"}
```

**前端访问：**
在浏览器中打开：
```
http://localhost:8502
```

你应能看到 Open Notebook 界面！

---

## 步骤 4：配置 AI 提供商（2 分钟）

1. 前往 **Settings** → **API Keys**
2. 点击 **Add Credential**
3. 选择你的提供商（如 OpenAI、Anthropic、Google）
4. 命名并粘贴 API 密钥
5. 点击 **Save**
6. 点击 **Test Connection** — 应显示成功
7. 点击 **Discover Models** → **Register Models**

你的模型现已可用！

> **需要 API 密钥？** 从所选提供商获取：
> - **OpenAI**：https://platform.openai.com/api-keys
> - **Anthropic**：https://console.anthropic.com/
> - **Google**：https://aistudio.google.com/
> - **Groq**：https://console.groq.com/

### 可选：本地语音（Speaches）

默认 compose 已包含 **Speaches**（免费本地 TTS/STT，端口 **8969**）。首次启动后下载模型：

```bash
# TTS（文本转语音）
docker compose exec speaches uv tool run speaches-cli model download speaches-ai/Kokoro-82M-v1.0-ONNX

# STT（语音转文字）
docker compose exec speaches uv tool run speaches-cli model download Systran/faster-whisper-small
```

然后在 **Settings → API Keys → OpenAI-Compatible** 中，将 TTS/STT Base URL 设为 `http://host.docker.internal:8969/v1`（Mac/Windows 上的 Docker Desktop）。详见 [本地 TTS](../5-CONFIGURATION/local-tts.zh.md) 与 [本地 STT](../5-CONFIGURATION/local-stt.zh.md)。

---

## 步骤 5：第一个笔记本（2 分钟）

1. 点击 **New Notebook**
2. 名称："My Research"
3. 描述："Getting started"
4. 点击 **Create**

完成！你已拥有一个完整可用的 Open Notebook 实例。

---

## 配置

### 添加 Ollama（免费本地模型）

无需手动编辑，使用现成示例：

```bash
# Download the Ollama example
curl -o docker-compose.yml https://raw.githubusercontent.com/lfnovo/open-notebook/main/examples/docker-compose-ollama.yml

# Or copy from repo
cp examples/docker-compose-ollama.yml docker-compose.yml
```

完整设置见 [examples/docker-compose-ollama.yml](../../examples/docker-compose-ollama.yml)。

**手动设置：** 在现有 `docker-compose.yml` 中添加：

```yaml
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    restart: always

volumes:
  ollama_models:
```

然后重启并拉取模型：
```bash
docker compose restart
docker exec open-notebook-local-ollama-1 ollama pull mistral
```

在 Settings 界面配置 Ollama：
1. 前往 **Settings** → **API Keys**
2. 点击 **Add Credential** → 选择 **Ollama**
3. 输入 base URL：`http://ollama:11434`
4. 点击 **Save**，然后 **Test Connection**
5. 点击 **Discover Models** → **Register Models**

### 添加 SearXNG（互联网关键词搜索）

根目录 [`docker-compose.yml`](../../docker-compose.yml) 已包含 **SearXNG** 服务（端口 **8080**，配置见 [`searxng/settings.yml`](../../searxng/settings.yml)）。需在 `search.formats` 中启用 **`json`**，并设置非默认的 `server.secret_key`（仓库内文件已预配置）。

**在应用中启用搜索** — 在 `open_notebook` 服务的 `environment` 中添加（或由 API 读取的 `.env`）：

```yaml
      - SEARXNG_ENABLED=true
      - SEARXNG_BASE_URL=http://searxng:8080
```

本地源码开发（非 Docker 应用镜像）时，在 `.env` 中设置相同变量，并使用 `SEARXNG_BASE_URL=http://localhost:8080`。

**Windows 一键开发：** 当 `.env` 中 `SEARXNG_ENABLED=true` 时，`.\start-dev.ps1` 会自动启动 SearXNG；`.\stop-dev.ps1` 会停止本次脚本启动的容器（除非使用 `-KeepDatabase`）。

**一体化示例**（所有服务已接线）：

```bash
docker compose -f examples/docker-compose-searxng.yml up -d
```

详见 [examples/README.md](../../examples/README.md) 与[环境变量参考](../5-CONFIGURATION/environment-reference.zh.md#searxng互联网关键词搜索)。

---

## 环境变量参考

| Variable | Purpose | Example |
|----------|---------|---------|
| `OPEN_NOTEBOOK_ENCRYPTION_KEY` | Encryption key for credentials | `my-secret-key` |
| `SURREAL_URL` | Database connection | `ws://surrealdb:8000/rpc` |
| `SURREAL_USER` | Database user | `root` |
| `SURREAL_PASSWORD` | Database password | `root` |
| `SURREAL_NAMESPACE` | Database namespace | `open_notebook` |
| `SURREAL_DATABASE` | Database name | `open_notebook` |
| `API_URL` | API external URL | `http://localhost:5055` |
| `OPEN_NOTEBOOK_EMBEDDING_BATCH_SIZE` | Override embedding batch size for stricter/local providers (recommended: `8` for CPU-only local setups) | `50` |

完整列表见[环境变量参考](../5-CONFIGURATION/environment-reference.zh.md)。

---

## 常用操作

### 停止服务
```bash
docker compose down
```

### 查看日志
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
```

### 重启服务
```bash
docker compose restart
```

### 更新到最新版本
```bash
docker compose down
docker compose pull
docker compose up -d
```

### 删除全部数据
```bash
docker compose down -v
```

---

## 故障排除

### "Cannot connect to API" Error

1. 检查 Docker 是否运行：
```bash
docker ps
```

2. 检查服务是否运行：
```bash
docker compose ps
```

3. 查看 API 日志：
```bash
docker compose logs api
```

4. 多等一会 — 首次启动可能需要 20–30 秒

---

### 端口已被占用

若出现 "Port 8502 already in use"，更改端口：

```yaml
ports:
  - "8503:8502"  # Use 8503 instead
  - "5055:5055"  # Keep API port same
```

然后通过 `http://localhost:8503` 访问

---

### 凭据问题

1. 前往 **Settings** → **API Keys**
2. 对凭据点击 **Test Connection**
3. 若失败，在提供商网站验证密钥
4. 确认账户有余额
5. 必要时删除并重新创建凭据

---

### 数据库连接问题

检查 SurrealDB 是否运行：
```bash
docker compose logs surrealdb
```

重置数据库：
```bash
docker compose down -v
docker compose up -d
```

### 数据库权限被拒绝（Linux）

若在 SurrealDB 日志中看到 `Permission denied` 或 `Failed to create RocksDB directory`：

```bash
docker compose logs surrealdb | grep -i permission
```

原因是 SurrealDB 以非 root 用户运行，而 Docker 将绑定挂载目录创建为 root。在 surrealdb 服务中添加 `user: root`：

```yaml
surrealdb:
  image: surrealdb/surrealdb:v2
  user: root  # Fix for Linux bind mount permissions
  # ... rest of config
```

然后重启：
```bash
docker compose down -v
docker compose up -d
```

---

## 替代部署

需要不同配置？查看 [examples/](../../examples/) 文件夹：

- **[Ollama 设置](../../examples/docker-compose-ollama.yml)** — 运行本地 AI 模型（免费、私密）
- **[SearXNG 设置](../../examples/docker-compose-searxng.yml)** — 关键词网页搜索 + Open Notebook
- **[Speaches 设置](../../examples/docker-compose-speaches.yml)** — 本地 TTS/STT + Open Notebook
- **[完全本地部署](../../examples/docker-compose-full-local.yml)** — Ollama + Speaches（100% 本地）
- **[单容器](../../examples/docker-compose-single.yml)** — 一体化容器（已弃用，将在 v2 移除）
- **[开发](../../examples/docker-compose-dev.yml)** — 面向贡献者与开发者

每个示例均含详细注释与使用说明。

---

## 下一步

1. **添加内容**：来源、笔记本、文档
2. **配置模型**：Settings → Models（选择偏好）
3. **探索功能**：聊天、搜索、转换
4. **阅读指南**：[用户指南](../3-USER-GUIDE/index.zh.md)

---

## 生产环境部署

生产使用请参阅：
- [安全加固](../5-CONFIGURATION/security.zh.md)
- [反向代理](../5-CONFIGURATION/reverse-proxy.zh.md)

---

## 获取帮助

- **Discord**：[社区支持](https://discord.gg/37XJPXfz2w)
- **Issues**：[GitHub Issues](https://github.com/lfnovo/open-notebook/issues)
- **文档**：[完整文档](../index.zh.md)

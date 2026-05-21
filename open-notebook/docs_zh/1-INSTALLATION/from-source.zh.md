# 从源码安装

克隆仓库并在本地运行。**面向开发者与贡献者。**

## 前置条件

- **Python 3.11+** - [下载](https://www.python.org/)
- **Node.js 18+** - [下载](https://nodejs.org/)
- **Git** - [下载](https://git-scm.com/)
- **Docker**（用于 SurrealDB）- [下载](https://docker.com/)
- **uv**（Python 包管理器）- `curl -LsSf https://astral.sh/uv/install.sh | sh`
- OpenAI 或类似提供商的 API 密钥（或使用免费的 Ollama）

## Windows：一键开发（Windows 推荐）

在 **Windows 10/11** 上，请使用 PowerShell 启动脚本，而非 `make start-all`（Makefile 依赖 Unix 命令）：

```powershell
git clone https://github.com/lfnovo/open-notebook.git
cd open-notebook
.\start-dev.ps1
```

脚本会启动 SurrealDB、Speaches（本地 TTS/STT）、API、后台 worker 与前端。首次运行会安装依赖，并可能下载约 3GB 语音模型。

| 参数 | 作用 |
|------|------|
| `-SkipInstall` | 跳过 `uv sync` / `npm install` |
| `-KeepDatabase` | 退出时保留 SurrealDB 与 Speaches 容器 |
| `-SkipSpeaches` | 不启动本地 TTS/STT |
| `-SkipSpeachesModels` | 跳过首次模型下载 |

在同一终端按 **Ctrl+C** 停止，或运行 `.\stop-dev.ps1`。完整说明：**[Windows 部署指南](../spec/windows-deployment.zh.md)**。

---

## 快速设置（10 分钟）

### 1. 克隆仓库

```bash
git clone https://github.com/lfnovo/open-notebook.git
cd open-notebook

# If you forked it:
git clone https://github.com/YOUR_USERNAME/open-notebook.git
cd open-notebook
git remote add upstream https://github.com/lfnovo/open-notebook.git
```

### 2. 安装 Python 依赖

```bash
uv sync
uv pip install python-magic
```

#### 2.1 替代方案：Conda 设置（可选）

若偏好使用 **Conda** 管理环境，按以下步骤代替标准 `uv sync`：

```bash
# Create and activate the environment
conda create -n open-notebook python=3.11 -y
conda activate open-notebook

# Install uv inside conda to maintain compatibility with the Makefile
conda install -c conda-forge uv nodejs -y

# Sync dependencies
uv sync
```

> **注意**：在 Conda 环境中安装 `uv` 可确保 `make start-all`、`make api` 等命令正常工作。

### 3. 启动 SurrealDB

```bash
# Terminal 1
make database
# or: docker compose up surrealdb
```

### 4. 设置环境变量

```bash
cp .env.example .env
# Edit .env and set:
# OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-key
```

启动应用后，在浏览器的 **Settings → API Keys** 界面配置 AI 提供商。

### 5. 启动 API

```bash
# Terminal 2
make api
# or: uv run --env-file .env uvicorn api.main:app --host 0.0.0.0 --port 5055
```

### 6. 启动前端

```bash
# Terminal 3
cd frontend && npm install && npm run dev
```

### 7. 访问

- **前端**：http://localhost:3000
- **API 文档**：http://localhost:5055/docs
- **数据库**：http://localhost:8000

### 8. 配置 AI 提供商

1. 打开 http://localhost:3000
2. 前往 **Settings** → **API Keys**
3. 点击 **Add Credential** → 选择提供商 → 粘贴 API 密钥
4. 点击 **Save**，然后 **Test Connection**
5. 点击 **Discover Models** → **Register Models**

---

## 开发工作流

### 代码质量

```bash
# Format and lint Python
make ruff
# or: ruff check . --fix

# Type checking
make lint
# or: uv run python -m mypy .
```

### 运行测试

```bash
uv run pytest tests/
```

### 常用命令

```bash
# Start everything
make start-all

# View API docs
open http://localhost:5055/docs

# Check database migrations
# (Auto-run on API startup)

# Clean up
make clean
```

---

## 故障排除

### Python 版本过旧

```bash
python --version  # Check version
uv sync --python 3.11  # Use specific version
```

### npm: command not found

从 https://nodejs.org/ 安装 Node.js

### 数据库连接错误

```bash
docker ps  # Check SurrealDB running
docker logs surrealdb  # View logs
```

### 端口 5055 已被占用

```bash
# Use different port
uv run uvicorn api.main:app --port 5056
```

---

## 下一步

1. 阅读[开发指南](../7-DEVELOPMENT/quick-start.zh.md)
2. 查看[架构概览](../7-DEVELOPMENT/architecture.zh.md)
3. 参阅[贡献指南](../7-DEVELOPMENT/contributing.zh.md)

---

## 获取帮助

- **Discord**：[社区](https://discord.gg/37XJPXfz2w)
- **Issues**：[GitHub Issues](https://github.com/lfnovo/open-notebook/issues)

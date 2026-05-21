# 本地开发环境搭建

本指南帮助您在本地搭建 Open Notebook 开发环境。按以下步骤在机器上运行完整技术栈。

## 前置要求

开始前请确保已安装：

- **Python 3.11+** — 检查：`python --version`
- **uv**（推荐）或 **pip** — 安装：https://github.com/astral-sh/uv
- **SurrealDB** — 通过 Docker 或二进制（见下文）
- **Docker**（可选）— 用于容器化数据库
- **Node.js 18+**（可选）— 用于前端开发
- **Git** — 版本控制

## Windows 快速入门

Windows 上请优先使用 PowerShell 启动脚本，而非 `make start-all`：

```powershell
git clone https://github.com/lfnovo/open-notebook.git
cd open-notebook
.\start-dev.ps1
```

- 启动 SurrealDB + Speaches（Docker）、API、worker 与前端
- 首次运行：`uv sync`、`npm install`，以及可选的 Speaches 模型下载（约 3GB）
- 前端：http://localhost:3000 · API：http://localhost:5055/docs
- 停止：**Ctrl+C** 或 `.\stop-dev.ps1`

详见 **[Windows 部署指南](../spec/windows-deployment.zh.md)**（参数 `-SkipInstall`、`-SkipSpeaches` 等及故障排除）。

## 步骤 1：克隆与初始设置

```bash
# Clone the repository
git clone https://github.com/lfnovo/open-notebook.git
cd open-notebook

# Add upstream remote for keeping your fork updated
git remote add upstream https://github.com/lfnovo/open-notebook.git
```

## 步骤 2：安装 Python 依赖

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install -e .
```

## 步骤 3：环境变量

在项目根目录创建 `.env` 并配置：

```bash
# Copy from example
cp .env.example .env
```

编辑 `.env`：

```bash
# Database
SURREAL_URL=ws://localhost:8000/rpc
SURREAL_USER=root
SURREAL_PASSWORD=password
SURREAL_NAMESPACE=open_notebook
SURREAL_DATABASE=development

# Credential encryption (required for storing API keys)
OPEN_NOTEBOOK_ENCRYPTION_KEY=my-dev-secret-key

# Application
APP_PASSWORD=  # Optional password protection
DEBUG=true
LOG_LEVEL=DEBUG
```

### AI 提供商配置

启动 API 与前端后，通过设置 UI 配置 AI 提供商：

1. 打开 **http://localhost:3000** → **Settings** → **API Keys**
2. 点击 **Add Credential** → 选择提供商
3. 输入 API 密钥（从提供商控制台获取）
4. 点击 **Save**，然后 **Test Connection**
5. 点击 **Discover Models** → **Register Models**

常用提供商：
- **OpenAI** - https://platform.openai.com/api-keys
- **Anthropic (Claude)** - https://console.anthropic.com/
- **Google** - https://ai.google.dev/
- **Groq** - https://console.groq.com/

本地开发也可使用：
- **Ollama** — 本地运行，无需 API 密钥（见下文「本地 Ollama」）

> **注意：** API 密钥环境变量（如 `OPENAI_API_KEY`）已弃用。请通过设置 UI 管理凭据。

## 步骤 4：启动 SurrealDB

### 选项 A：使用 Docker（推荐）

```bash
# Start SurrealDB in memory
docker run -d --name surrealdb -p 8000:8000 \
  surrealdb/surrealdb:v2 start \
  --user root --pass password \
  --bind 0.0.0.0:8000 memory

# Or with persistent storage
docker run -d --name surrealdb -p 8000:8000 \
  -v surrealdb_data:/data \
  surrealdb/surrealdb:v2 start \
  --user root --pass password \
  --bind 0.0.0.0:8000 file:/data/surreal.db
```

### 选项 B：使用 Make

```bash
make database
```

### 选项 C：使用 Docker Compose

```bash
docker compose up -d surrealdb
```

### 验证 SurrealDB 运行中

```bash
# Should show server information
curl http://localhost:8000/
```

## 步骤 5：运行数据库迁移

启动 API 时会自动运行数据库迁移。首次启动将应用所有待处理迁移。

手动验证迁移：

```bash
# API will run migrations on startup
uv run python -m api.main
```

查看日志 — 应看到类似消息：
```
Running migration 001_initial_schema
Running migration 002_add_vectors
...
Migrations completed successfully
```

## 步骤 6：启动 API 服务

在新终端窗口中：

```bash
# Terminal 2: Start API (port 5055)
uv run --env-file .env uvicorn api.main:app --host 0.0.0.0 --port 5055

# Or using the shortcut
make api
```

应看到：
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:5055
```

### 验证 API 运行中

```bash
# Check health endpoint
curl http://localhost:5055/health

# View API documentation
open http://localhost:5055/docs
```

## 步骤 7：启动前端（可选）

若需开发前端，在另一终端启动 Next.js：

```bash
# Terminal 3: Start Next.js frontend (port 3000)
cd frontend
npm install  # First time only
npm run dev
```

应看到：
```
> next dev
  ▲ Next.js 16.x
  - Local:        http://localhost:3000
```

### 访问前端

在浏览器打开：http://localhost:3000

## 验证清单

搭建完成后，请验证：

- [ ] **SurrealDB**：`curl http://localhost:8000/` 有返回内容
- [ ] **API**：`curl http://localhost:5055/health` 返回 `{"status": "ok"}`
- [ ] **API 文档**：`open http://localhost:5055/docs` 可访问
- [ ] **数据库**：API 日志显示迁移完成
- [ ] **前端**（可选）：`http://localhost:3000` 可加载

## 一并启动服务

### 快速启动全部服务

```bash
make start-all
```

一条命令启动 SurrealDB、API 与前端。

### 分终端启动（开发推荐）

**终端 1 — 数据库：**
```bash
make database
```

**终端 2 — API：**
```bash
make api
```

**终端 3 — 前端：**
```bash
cd frontend && npm run dev
```

## 开发工具设置

### Pre-commit Hooks（可选但推荐）

安装 git hooks 以在提交前自动检查代码质量：

```bash
uv run pre-commit install
```

之后每次提交前会自动检查。

### 代码质量命令

```bash
# Lint Python code (auto-fix)
make ruff
# or: ruff check . --fix

# Type check Python code
make lint
# or: uv run python -m mypy .

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=open_notebook
```

## 常见开发任务

### 运行测试

```bash
# Run all tests
uv run pytest

# Run specific test file
uv run pytest tests/test_notebooks.py

# Run with coverage report
uv run pytest --cov=open_notebook --cov-report=html
```

### 创建功能分支

```bash
# Create and switch to new branch
git checkout -b feature/my-feature

# Make changes, then commit
git add .
git commit -m "feat: add my feature"

# Push to your fork
git push origin feature/my-feature
```

### 从上游更新

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Push updated branch
git push origin feature/my-feature -f
```

## 故障排除

### SurrealDB「Connection refused」

**问题**：API 无法连接 SurrealDB

**解决方案**：
1. 检查 SurrealDB 是否运行：`docker ps | grep surrealdb`
2. 验证 `.env` 中的 URL：应为 `ws://localhost:8000/rpc`
3. 重启 SurrealDB：`docker stop surrealdb && docker rm surrealdb`
4. 然后重新启动：`docker run -d --name surrealdb -p 8000:8000 surrealdb/surrealdb:v2 start --user root --pass password --bind 0.0.0.0:8000 memory`

### 「Address already in use」

**问题**：端口 5055 或 3000 已被占用

**解决方案**：
```bash
# Find process using port
lsof -i :5055  # Check port 5055

# Kill process (macOS/Linux)
kill -9 <PID>

# Or use different port
uvicorn api.main:app --port 5056
```

### 模块未找到错误

**问题**：运行 API 时出现导入错误

**解决方案**：
```bash
# Reinstall dependencies
uv sync

# Or with pip
pip install -e .
```

### 数据库迁移失败

**问题**：API 因迁移错误无法启动

**解决方案**：
1. 检查 SurrealDB 是否运行：`curl http://localhost:8000/`
2. 检查 `.env` 中的凭据是否与 SurrealDB 配置一致
3. 查看具体迁移错误：`make api 2>&1 | grep -i migration`
4. 验证数据库存在：在 http://localhost:8000/ 查看 SurrealDB 控制台

### 迁移未应用

**问题**：数据库 schema 似乎过时

**解决方案**：
1. 重启 API — 启动时运行迁移：`make api`
2. 检查日志是否显示「Migrations completed successfully」
3. 验证 `/migrations/` 目录存在且包含文件
4. 检查 SurrealDB 可写且非只读模式

## 可选：本地 Ollama 设置

使用本地 AI 模型测试：

```bash
# Install Ollama from https://ollama.ai

# Pull a model (e.g., Mistral 7B)
ollama pull mistral
```

然后通过设置 UI 配置：
1. 进入 **Settings** → **API Keys** → **Add Credential** → **Ollama**
2. 输入 base URL：`http://localhost:11434`
3. 点击 **Save**，然后 **Test Connection**
4. 点击 **Discover Models** → **Register Models**

## 可选：Docker 开发环境

在 Docker 中运行完整技术栈：

```bash
# Start all services
docker compose --profile multi up

# Logs
docker compose logs -f

# Stop services
docker compose down
```

## 下一步

搭建完成后：

1. **阅读贡献指南** — [contributing.zh.md](contributing.zh.md)
2. **了解架构** — 查阅文档
3. **寻找 Issue** — 在 GitHub 查找「good first issue」
4. **设置 Pre-commit** — 安装 git hooks 保证代码质量
5. **加入 Discord** — https://discord.gg/37XJPXfz2w

## 获取帮助

若遇到问题：

- **Discord**：[加入服务器](https://discord.gg/37XJPXfz2w) 获取实时帮助
- **GitHub Issues**：查看是否有类似问题的已有 issue
- **GitHub Discussions**：在讨论区提问
- **文档**：参见 [code-standards.zh.md](code-standards.zh.md) 与 [testing.zh.md](testing.zh.md)

---

**准备贡献？** 请前往 [contributing.zh.md](contributing.zh.md) 了解贡献工作流程。

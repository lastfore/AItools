# 快速开始 - 开发

5 分钟内在本地运行 Open Notebook。

## 前置条件

- **Python 3.11+**
- **Git**
- **uv**（包管理器）- 安装：`curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Docker**（可选，用于 SurrealDB）

## 1. 克隆仓库（2 分钟）

```bash
# Fork the repository on GitHub first, then clone your fork
git clone https://github.com/YOUR_USERNAME/open-notebook.git
cd open-notebook

# Add upstream remote for updates
git remote add upstream https://github.com/lfnovo/open-notebook.git
```

## 2. 安装依赖（2 分钟）

```bash
# Install Python dependencies
uv sync

# Verify uv is working
uv --version
```

## 3. 启动服务（1 分钟）

**Windows：** 在仓库根目录运行 `.\start-dev.ps1`（见 [Windows 部署指南](../spec/windows-deployment.zh.md)）。

**macOS/Linux：** 在独立终端窗口中：

```bash
# Terminal 1: Start SurrealDB (database)
make database
# or: docker run -d --name surrealdb -p 8000:8000 surrealdb/surrealdb:v2 start --user root --pass password --bind 0.0.0.0:8000 memory

# Terminal 2: Start API (backend on port 5055)
make api
# or: uv run --env-file .env uvicorn api.main:app --host 0.0.0.0 --port 5055

# Terminal 3: Start Frontend (UI on port 3000)
cd frontend && npm run dev
```

## 4. 验证一切正常（即时）

- **API 健康检查**：http://localhost:5055/health → 应返回 `{"status": "ok"}`
- **API 文档**：http://localhost:5055/docs → 交互式 API 文档
- **前端**：http://localhost:3000 → Open Notebook UI

**三者均可访问？** ✅ 可以开始开发了！

---

## 后续步骤

- **首个 issue？** 选择 [good first issue](https://github.com/lfnovo/open-notebook/issues?q=label%3A%22good+first+issue%22)
- **理解代码？** 阅读 [架构概览](architecture.zh.md)
- **进行修改？** 遵循 [贡献指南](contributing.zh.md)
- **搭建细节？** 参见 [开发环境搭建](development-setup.zh.md)

---

## 故障排除

### 「端口 5055 已被占用」 [原文: Port 5055 already in use]
```bash
# Find what's using the port
lsof -i :5055

# Use a different port
uv run uvicorn api.main:app --port 5056
```

### 「无法连接 SurrealDB」 [原文: Can't connect to SurrealDB]
```bash
# Check if SurrealDB is running
docker ps | grep surrealdb

# Restart it
make database
```

### 「Python 版本过旧」 [原文: Python version is too old]
```bash
# Check your Python version
python --version  # Should be 3.11+

# Use Python 3.11 specifically
uv sync --python 3.11
```

### 「npm: command not found」
```bash
# Install Node.js from https://nodejs.org/
# Then install frontend dependencies
cd frontend && npm install
```

---

## 常用开发命令

```bash
# Run tests
uv run pytest

# Format code
make ruff

# Type checking
make lint

# Run the full stack
make start-all

# View API documentation
open http://localhost:5055/docs
```

---

需要更多帮助？详见 [开发环境搭建](development-setup.zh.md)，或加入 [Discord](https://discord.gg/37XJPXfz2w)。

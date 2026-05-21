# From Source Installation

Clone the repository and run locally. **For developers and contributors.**

## Prerequisites

- **Python 3.11+** - [Download](https://www.python.org/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Docker** (for SurrealDB) - [Download](https://docker.com/)
- **uv** (Python package manager) - `curl -LsSf https://astral.sh/uv/install.sh | sh`
- API key from OpenAI or similar (or use Ollama for free)

## Windows: One-Click Dev (Recommended on Windows)

On **Windows 10/11**, use the PowerShell launcher instead of `make start-all` (Makefile uses Unix-only commands):

```powershell
git clone https://github.com/lfnovo/open-notebook.git
cd open-notebook
.\start-dev.ps1
```

This starts SurrealDB, Speaches (local TTS/STT), API, background worker, and frontend. First run installs dependencies and may download ~3GB of speech models.

| Flag | Purpose |
|------|---------|
| `-SkipInstall` | Skip `uv sync` / `npm install` |
| `-KeepDatabase` | Leave SurrealDB + Speaches running on exit |
| `-SkipSpeaches` | Do not start local TTS/STT |
| `-SkipSpeachesModels` | Skip first-run model download |

Stop with **Ctrl+C** in the same terminal, or run `.\stop-dev.ps1`. Full details: **[Windows 部署指南](../../docs_zh/spec/windows-deployment.zh.md)**.

---

## Quick Setup (10 minutes)

### 1. Clone Repository

```bash
git clone https://github.com/lfnovo/open-notebook.git
cd open-notebook

# If you forked it:
git clone https://github.com/YOUR_USERNAME/open-notebook.git
cd open-notebook
git remote add upstream https://github.com/lfnovo/open-notebook.git
```

### 2. Install Python Dependencies

```bash
uv sync
uv pip install python-magic
```

#### 2.1 Alternative: Conda Setup (Optional)

If you prefer using **Conda** to manage your environments, follow these steps instead of the standard `uv sync`:

```bash
# Create and activate the environment
conda create -n open-notebook python=3.11 -y
conda activate open-notebook

# Install uv inside conda to maintain compatibility with the Makefile
conda install -c conda-forge uv nodejs -y

# Sync dependencies
uv sync
```

> **Note**: Installing `uv` inside your Conda environment ensures that commands like `make start-all` and `make api` continue to work seamlessly.

### 3. Start SurrealDB

```bash
# Terminal 1
make database
# or: docker compose up surrealdb
```

### 4. Set Environment Variables

```bash
cp .env.example .env
# Edit .env and set:
# OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-key
```

After starting the app, configure AI providers via the **Settings → API Keys** UI in the browser.

### 5. Start API

```bash
# Terminal 2
make api
# or: uv run --env-file .env uvicorn api.main:app --host 0.0.0.0 --port 5055
```

### 6. Start Frontend

```bash
# Terminal 3
cd frontend && npm install && npm run dev
```

### 7. Access

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:5055/docs
- **Database**: http://localhost:8000

### 8. Configure AI Provider

1. Open http://localhost:3000
2. Go to **Settings** → **API Keys**
3. Click **Add Credential** → Select your provider → Paste API key
4. Click **Save**, then **Test Connection**
5. Click **Discover Models** → **Register Models**

---

## Development Workflow

### Code Quality

```bash
# Format and lint Python
make ruff
# or: ruff check . --fix

# Type checking
make lint
# or: uv run python -m mypy .
```

### Run Tests

```bash
uv run pytest tests/
```

### Common Commands

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

## Troubleshooting

### Python version too old

```bash
python --version  # Check version
uv sync --python 3.11  # Use specific version
```

### npm: command not found

Install Node.js from https://nodejs.org/

### Database connection errors

```bash
docker ps  # Check SurrealDB running
docker logs surrealdb  # View logs
```

### Port 5055 already in use

```bash
# Use different port
uv run uvicorn api.main:app --port 5056
```

---

## Next Steps

1. Read [Development Guide](../7-DEVELOPMENT/quick-start.md)
2. See [Architecture Overview](../7-DEVELOPMENT/architecture.md)
3. Check [Contributing Guide](../7-DEVELOPMENT/contributing.md)

---

## Getting Help

- **Discord**: [Community](https://discord.gg/37XJPXfz2w)
- **Issues**: [GitHub Issues](https://github.com/lfnovo/open-notebook/issues)

# 高级配置

性能调优、调试与高级功能。

---

## 性能调优

### 并发控制

```env
# Max concurrent database operations (default: 5)
# Increase: Faster processing, more conflicts
# Decrease: Slower, fewer conflicts
SURREAL_COMMANDS_MAX_TASKS=5
```

**指导原则：**
- CPU：2 核 → 2–3 个任务
- CPU：4 核 → 5 个任务（默认）
- CPU：8 核及以上 → 10–20 个任务

并发越高，吞吐量越大，但数据库冲突也越多（重试机制会处理此类情况）。

### 重试策略

```env
# How to wait between retries
SURREAL_COMMANDS_RETRY_WAIT_STRATEGY=exponential_jitter

# Options:
# - exponential_jitter (recommended)
# - exponential
# - fixed
# - random
```

在高并发部署中，建议使用 `exponential_jitter`，以避免惊群效应。

### 超时调优

```env
# Client timeout (default: 300 seconds)
API_CLIENT_TIMEOUT=300

# LLM timeout (default: 60 seconds)
ESPERANTO_LLM_TIMEOUT=60
```

**指导原则：** 将 `API_CLIENT_TIMEOUT` 设置为大于 `ESPERANTO_LLM_TIMEOUT` 并预留缓冲时间

```
Example:
  ESPERANTO_LLM_TIMEOUT=120
  API_CLIENT_TIMEOUT=180  # 120 + 60 second buffer
```

---

## 批处理

### TTS 批大小

播客生成时，可控制并发 TTS 请求数：

```env
# Default: 5
TTS_BATCH_SIZE=2
```

**各提供商建议值：**
- OpenAI：5（可承受较高并发）
- Google：4（并发能力良好）
- ElevenLabs：2（并发请求受限）
- 本地 TTS：1（单线程）

数值越低，速度越慢但更稳定；数值越高，速度越快但对提供商负载越大。

---

## 日志与调试

### 启用详细日志

```bash
# Start with debug logging
RUST_LOG=debug  # For Rust components
LOGLEVEL=DEBUG  # For Python components
```

### 调试特定组件

```bash
# Only surreal operations
RUST_LOG=surrealdb=debug

# Only langchain
LOGLEVEL=langchain:debug

# Only specific module
RUST_LOG=open_notebook::database=debug
```

### LangSmith 追踪

用于调试 LLM 工作流：

```env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
LANGCHAIN_API_KEY=your-key
LANGCHAIN_PROJECT="Open Notebook"
```

随后访问 https://smith.langchain.com 查看追踪记录。

---

## 端口配置

### 默认端口

```
Frontend: 8502 (Docker deployment)
Frontend: 3000 (Development from source)
API: 5055
SurrealDB: 8000
```

### 修改前端端口

编辑 `docker-compose.yml`：

```yaml
services:
  open-notebook:
    ports:
      - "8001:8502"  # Change from 8502 to 8001
```

访问地址：`http://localhost:8001`

API 将自动检测为：`http://localhost:5055` ✓

### 修改 API 端口

```yaml
services:
  open-notebook:
    ports:
      - "127.0.0.1:8502:8502"  # Frontend
      - "5056:5055"            # Change API from 5055 to 5056
    environment:
      - API_URL=http://localhost:5056  # Update API_URL
```

直接访问 API：`http://localhost:5056/docs`

**注意：** 修改 API 端口后，必须显式设置 `API_URL`，因为自动检测默认假定端口为 5055。

### 修改 SurrealDB 端口

```yaml
services:
  surrealdb:
    ports:
      - "8001:8000"  # Change from 8000 to 8001
    environment:
      - SURREAL_URL=ws://surrealdb:8001/rpc  # Update connection URL
```

**重要：** Docker 内部网络使用容器名称（`surrealdb`），而非 `localhost`。

---

## SSL/TLS 配置

### 自定义 CA 证书

用于本地提供商的自签名证书：

```env
ESPERANTO_SSL_CA_BUNDLE=/path/to/ca-bundle.pem
```

### 禁用验证（仅开发环境）

```env
# WARNING: Only for testing/development
# Vulnerable to MITM attacks
ESPERANTO_SSL_VERIFY=false
```

---

## 多提供商配置

### 为不同任务使用不同提供商

通过 **设置 → API 密钥** 配置多个 AI 提供商。每个提供商使用独立的凭证：

1. 为主语言模型提供商添加凭证（例如 OpenAI、Anthropic）
2. 为嵌入模型添加凭证（例如 Voyage AI，或与主提供商相同）
3. 为 TTS 添加凭证（例如 ElevenLabs，或使用 OpenAI-Compatible 连接本地 Speaches）
4. 各凭证下的模型将独立注册并可用

### OpenAI-Compatible 多端点

使用 OpenAI-Compatible 提供商时，可在单个凭证中按服务配置不同 URL：

1. 前往 **设置** → **API 密钥**
2. 点击 **添加凭证** → 选择 **OpenAI-Compatible**
3. 分别为 LLM、Embedding、TTS 和 STT 配置独立 URL
4. 点击 **保存**，然后 **测试连接**

---

## 安全加固

### 修改默认凭据

```env
# Don't use defaults in production
SURREAL_USER=your_secure_username
SURREAL_PASSWORD=$(openssl rand -base64 32)  # Generate secure password
```

### 添加密码保护

```env
# Protect your Open Notebook instance
OPEN_NOTEBOOK_PASSWORD=your_secure_password
```

### 使用 HTTPS

```env
# Always use HTTPS in production
API_URL=https://mynotebook.example.com
```

### 防火墙规则

限制对 Open Notebook 的访问：
- 端口 8502（前端）：仅允许来自您的 IP
- 端口 5055（API）：仅允许来自前端
- 端口 8000（SurrealDB）：切勿暴露至公网

---

## 网页抓取与内容提取

Open Notebook 使用多种服务进行内容提取：

### Firecrawl

用于高级网页抓取：

```env
FIRECRAWL_API_KEY=your-key
```

获取密钥：https://firecrawl.dev/

### Jina AI

替代性网页提取方案：

```env
JINA_API_KEY=your-key
```

获取密钥：https://jina.ai/

---

## 环境变量分组

### 凭证存储（必需）
```env
OPEN_NOTEBOOK_ENCRYPTION_KEY    # Required for storing credentials
```

AI 提供商 API 密钥通过 **设置 → API 密钥** 配置（非环境变量）。

### 数据库
```env
SURREAL_URL
SURREAL_USER
SURREAL_PASSWORD
SURREAL_NAMESPACE
SURREAL_DATABASE
```

### 性能
```env
SURREAL_COMMANDS_MAX_TASKS
SURREAL_COMMANDS_RETRY_ENABLED
SURREAL_COMMANDS_RETRY_MAX_ATTEMPTS
SURREAL_COMMANDS_RETRY_WAIT_STRATEGY
SURREAL_COMMANDS_RETRY_WAIT_MIN
SURREAL_COMMANDS_RETRY_WAIT_MAX
```

### API 设置
```env
API_URL
INTERNAL_API_URL
API_CLIENT_TIMEOUT
ESPERANTO_LLM_TIMEOUT
```

### 音频/TTS
```env
TTS_BATCH_SIZE
```

> **注意：** `ELEVENLABS_API_KEY` 已弃用。请通过 **设置 → API 密钥** 配置 ElevenLabs。

### 调试
```env
LANGCHAIN_TRACING_V2
LANGCHAIN_ENDPOINT
LANGCHAIN_API_KEY
LANGCHAIN_PROJECT
```

---

## 测试配置

### 快速测试

```bash
# Test API health
curl http://localhost:5055/health

# Test with sample (requires configured credential and registered models)
curl -X POST http://localhost:5055/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

### 验证配置

```bash
# Check environment variables are set
env | grep OPEN_NOTEBOOK_ENCRYPTION_KEY

# Verify database connection
python -c "import os; print(os.getenv('SURREAL_URL'))"
```

---

## 性能故障排除

### 内存占用过高

```env
# Reduce concurrency
SURREAL_COMMANDS_MAX_TASKS=2

# Reduce TTS batch size
TTS_BATCH_SIZE=1
```

### CPU 占用过高

```env
# Check worker count
SURREAL_COMMANDS_MAX_TASKS

# Reduce if maxed out:
SURREAL_COMMANDS_MAX_TASKS=5
```

### 响应缓慢

```env
# Check timeout settings
API_CLIENT_TIMEOUT=300

# Check retry config
SURREAL_COMMANDS_RETRY_MAX_ATTEMPTS=3
```

### 数据库冲突

```env
# Reduce concurrency
SURREAL_COMMANDS_MAX_TASKS=3

# Use jitter strategy
SURREAL_COMMANDS_RETRY_WAIT_STRATEGY=exponential_jitter
```

---

## 备份与恢复

### 数据位置

| 路径 | 内容 |
|------|------|
| `./data` 或 `/app/data` | 上传文件、播客、检查点 |
| `./surreal_data` 或 `/mydata` | SurrealDB 数据库文件 |

### 快速备份

```bash
# Stop services (recommended for consistency)
docker compose down

# Create timestamped backup
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  notebook_data/ surreal_data/

# Restart services
docker compose up -d
```

### 自动备份脚本

```bash
#!/bin/bash
# backup.sh - Run daily via cron

BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup
tar -czf "$BACKUP_DIR/open-notebook-$DATE.tar.gz" \
  /path/to/notebook_data \
  /path/to/surreal_data

# Keep only last 7 days
find "$BACKUP_DIR" -name "open-notebook-*.tar.gz" -mtime +7 -delete

echo "Backup complete: open-notebook-$DATE.tar.gz"
```

添加到 cron：
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/open-notebook-backup.log 2>&1
```

### 恢复

```bash
# Stop services
docker compose down

# Remove old data (careful!)
rm -rf notebook_data/ surreal_data/

# Extract backup
tar -xzf backup-20240115-120000.tar.gz

# Restart services
docker compose up -d
```

### 跨服务器迁移

```bash
# On source server
docker compose down
tar -czf open-notebook-migration.tar.gz notebook_data/ surreal_data/

# Transfer to new server
scp open-notebook-migration.tar.gz user@newserver:/path/

# On new server
tar -xzf open-notebook-migration.tar.gz
docker compose up -d
```

---

## 容器管理

### 常用命令

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f api

# Restart specific service
docker compose restart api

# Update to latest version
docker compose down
docker compose pull
docker compose up -d

# Check resource usage
docker stats

# Check service health
docker compose ps
```

### 清理

```bash
# Remove stopped containers
docker compose rm

# Remove unused images
docker image prune

# Full cleanup (careful!)
docker system prune -a
```

---

## 摘要

**大多数部署仅需：**
- 一个 AI 提供商 API 密钥
- 默认数据库设置
- 默认超时配置

**仅在以下情况调优性能：**
- 存在特定性能瓶颈
- 高并发工作负载
- 特殊硬件（极快或极慢）

**高级功能：**
- Firecrawl：更优的网页抓取
- LangSmith：调试工作流
- 自定义 CA 证书包：支持自签名证书

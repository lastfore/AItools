# Ollama 设置指南

Ollama 可在您自己的硬件上运行免费的本地 AI 模型。本指南涵盖将 Ollama 与 Open Notebook 配合使用所需的全部内容，包括不同部署场景与网络配置。

## 为何选择 Ollama？

- **🆓 完全免费**：完成初始设置后无 API 费用
- **🔒 完全隐私**：数据始终保留在本地网络内
- **📱 支持离线**：无需互联网连接即可工作
- **🚀 速度快**：本地推理，无网络延迟
- **🧠 推理模型**：支持 DeepSeek-R1 等高级推理模型
- **💾 模型丰富**：可使用数百种开源模型

## 快速开始

### 1. 安装 Ollama

**Linux/macOS：**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows：**
从 [ollama.ai](https://ollama.ai/download) 下载并安装

### 2. 拉取所需模型

```bash
# Language models (choose one or more)
ollama pull qwen3              # Excellent general purpose, 7B parameters
ollama pull gemma3            # Google's model, good performance
ollama pull deepseek-r1       # Advanced reasoning model
ollama pull phi4              # Microsoft's efficient model

# Embedding model (required for search)
ollama pull mxbai-embed-large  # Best embedding model for Ollama
```

### 3. 配置 Open Notebook

**通过设置界面（推荐）：**
1. 进入 **Settings** → **API Keys**
2. 点击 **Add Credential** → 选择 **Ollama**
3. 输入基础 URL（正确 URL 见下方[网络配置指南](#网络配置指南)）
4. 点击 **Save**，然后 **Test Connection**
5. 点击 **Discover Models** → **Register Models**

**旧版方式（已弃用）— 环境变量：**
```bash
# For local installation:
export OLLAMA_API_BASE=http://localhost:11434
# For Docker installation:
export OLLAMA_API_BASE=http://host.docker.internal:11434
```

> **注意**：`OLLAMA_API_BASE` 环境变量已弃用。请通过 Settings → API Keys 配置 Ollama。

## 网络配置指南

在 **Settings → API Keys** 中添加 Ollama 凭据时，需输入正确的基础 URL。正确 URL 取决于您的部署场景：

### 场景 1：本地安装（同一台机器）

当 Open Notebook 与 Ollama 均直接运行在您的机器上时：

**在 Settings → API Keys 中输入的基础 URL：** `http://localhost:11434`

备选：`http://127.0.0.1:11434`（若 localhost 存在 DNS 解析问题时使用）

### 场景 2：Open Notebook 在 Docker 中，Ollama 在宿主机上

当 Open Notebook 在 Docker 中运行而 Ollama 在宿主机上运行时：

**在 Settings → API Keys 中输入的基础 URL：** `http://host.docker.internal:11434`

**⚠️ 关键：Ollama 必须接受外部连接：**
```bash
# Start Ollama with external access enabled
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

**⚠️ Linux 用户：需要额外配置！**

在 Linux 上，`host.docker.internal` 不会像 macOS/Windows 那样自动解析。您必须在 docker-compose.yml 中添加 `extra_hosts`：

```yaml
# Add to your docker-compose.yml (requires surrealdb service, see installation guide)
services:
  open_notebook:
    image: lfnovo/open_notebook:v1-latest
    # ... other settings ...
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

否则会出现如下连接错误：
```
httpcore.ConnectError: [Errno -2] Name or service not known
```

**为何使用 `host.docker.internal`？**
- Docker 容器无法访问宿主机上的 `localhost`
- `host.docker.internal` 是 Docker 用于指向宿主机的特殊主机名
- 在 Docker Desktop for Mac/Windows 上可用；在 Linux 上**需要配置 `extra_hosts`**

**为何设置 `OLLAMA_HOST=0.0.0.0:11434`？**
- 默认情况下，Ollama 仅绑定到 localhost 并拒绝外部连接
- 即使在同一台机器上运行，Docker 容器也被视为「外部」
- 设置 `OLLAMA_HOST=0.0.0.0:11434` 可允许来自 Docker 容器的连接

### 场景 3：均在 Docker 中（同一 Compose）

当 Open Notebook 与 Ollama 在同一 Docker Compose 栈中运行时：

**在 Settings → API Keys 中输入的基础 URL：** `http://ollama:11434`

**Docker Compose 示例：**

```yaml
# Requires surrealdb service — see full base setup:
# https://github.com/lfnovo/open-notebook/blob/main/docker-compose.yml
services:
  open-notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    ports:
      - "8502:8502"
      - "5055:5055"
    environment:
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=change-me-to-a-secret-string
    volumes:
      - ./notebook_data:/app/data
    depends_on:
      - ollama

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    # Optional: GPU support
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  ollama_data:
```

### 场景 4：远程 Ollama 服务器

当 Ollama 在网络中另一台机器上运行时：

**在 Settings → API Keys 中输入的基础 URL：** `http://192.168.1.100:11434`（替换为您的 Ollama 服务器 IP）

**安全提示：** 仅在受信任的网络中使用。Ollama 无内置身份验证。

### 场景 5：Ollama 使用自定义端口

若您已将 Ollama 配置为使用其他端口：

```bash
# Start Ollama on custom port
OLLAMA_HOST=0.0.0.0:8080 ollama serve
```

**在 Settings → API Keys 中输入的基础 URL：** `http://localhost:8080`

## 模型推荐

### 语言模型

| 模型 | 规模 | 适用场景 | 质量 | 速度 |
|-------|------|----------|------|------|
| **qwen3** | 7B | 通用、编程 | 优秀 | 快 |
| **deepseek-r1** | 7B | 推理、问题解决 | 卓越 | 中等 |
| **gemma3** | 7B | 均衡性能 | 很好 | 快 |
| **phi4** | 14B | 低配硬件高效运行 | 良好 | 很快 |
| **llama3** | 8B | 通用 | 很好 | 中等 |

### 嵌入模型

| 模型 | 适用场景 | 性能 |
|-------|----------|------|
| **mxbai-embed-large** | 通用搜索 | 优秀 |
| **nomic-embed-text** | 文档相似度 | 良好 |
| **all-minilm** | 轻量选项 | 一般 |

### 安装命令

```bash
# Essential models
ollama pull qwen3                 # Primary language model
ollama pull mxbai-embed-large     # Search embeddings

# Optional reasoning model
ollama pull deepseek-r1           # Advanced reasoning

# Alternative language models
ollama pull gemma3                # Google's model
ollama pull phi4                  # Microsoft's efficient model
```

## 硬件要求

### 最低要求
- **RAM**：8GB（用于 7B 模型）
- **存储**：每个模型约 10GB 可用空间
- **CPU**：现代多核处理器

### 推荐配置
- **RAM**：16GB 及以上（用于多个模型）
- **存储**：SSD，50GB 及以上可用空间
- **GPU**：8GB 及以上显存的 NVIDIA GPU（可选，但可显著提速）

### GPU 加速

**NVIDIA GPU（CUDA）：**
```bash
# Install NVIDIA Container Toolkit for Docker
# Then use the Docker Compose example above with GPU support

# For local installation, Ollama auto-detects CUDA
ollama pull qwen3
```

**Apple Silicon（M1/M2/M3）：**
```bash
# Ollama automatically uses Metal acceleration
# No additional setup required
ollama pull qwen3
```

**AMD GPU：**
```bash
# ROCm support varies by model and system
# Check Ollama documentation for latest compatibility
```

## 故障排除

### 模型名称配置（关键）

**⚠️ 重要：模型名称必须与 `ollama list` 的输出完全一致**

这是导致「Failed to send message」错误的最常见原因。Open Notebook 要求使用 Ollama 中显示的**精确模型名称**。

**步骤 1：获取精确模型名称**
```bash
ollama list
```

示例输出：
```
NAME                        ID              SIZE      MODIFIED
mxbai-embed-large:latest    468836162de7    669 MB    7 minutes ago
gemma3:12b                  f4031aab637d    8.1 GB    2 months ago
qwen3:32b                   030ee887880f    20 GB     9 days ago
```

**步骤 2：在 Open Notebook 中添加模型时使用精确名称**

| ✅ 正确 | ❌ 错误 |
|-----------|----------|
| `gemma3:12b` | `gemma3`（缺少标签） |
| `qwen3:32b` | `qwen3-32b`（格式错误） |
| `mxbai-embed-large:latest` | `mxbai-embed-large`（缺少标签） |

**说明：** 部分模型默认使用 `:latest` 标签。若 `ollama list` 显示 `model:latest`，在 Open Notebook 中必须使用 `model:latest`，而不能仅写 `model`。

**步骤 3：在 Open Notebook 中配置**

1. 进入 **Settings → Models**
2. 点击 **Add Model**
3. 输入 `ollama list` 中的**精确名称**
4. 选择提供商：`ollama`
5. 选择类型：`language`（对话）或 `embedding`（搜索）
6. 保存模型
7. 将其设为相应任务的默认模型（对话、转换等）

### 常见问题

**1. Open Notebook 中显示「Ollama unavailable」**

**检查 Ollama 是否在运行：**
```bash
curl http://localhost:11434/api/tags
```

**验证凭据是否已配置：**
在 **Settings → API Keys** 中检查 Ollama 凭据及其基础 URL 是否正确。

**⚠️ 重要：启用外部连接（最常见修复方法）：**
```bash
# If Open Notebook runs in Docker or on a different machine,
# Ollama must bind to all interfaces, not just localhost
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```
> **原因说明：** 默认情况下，Ollama 仅接受来自 `localhost`（127.0.0.1）的连接。当 Open Notebook 在 Docker 中或运行于另一台机器时，必须配置 `OLLAMA_HOST=0.0.0.0:11434` 以接受外部连接，否则无法访问 Ollama。

**重启 Ollama：**
```bash
# Linux/macOS
sudo systemctl restart ollama
# or
ollama serve

# Windows
# Restart from system tray or Services
```

**2. Docker 网络问题**

**在 Open Notebook 容器内测试 Ollama：**
```bash
# Get into container
docker exec -it open-notebook bash

# Test connection
curl http://host.docker.internal:11434/api/tags
```

**若在 Linux 上出现「Name or service not known」**，需在 docker-compose.yml 中添加 `extra_hosts`。请参阅下方 [Docker 专属故障排除](#docker-专属故障排除) 一节。

**3. 模型无法下载**

**检查磁盘空间：**
```bash
df -h
```

**手动拉取模型：**
```bash
ollama pull qwen3 --verbose
```

**清除失败的下载：**
```bash
ollama rm qwen3
ollama pull qwen3
```

**4. 性能缓慢**

**检查模型规模与可用 RAM：**
```bash
ollama ps  # Show running models
free -h    # Check available memory
```

**使用更小的模型：**
```bash
ollama pull phi4         # Instead of larger models
ollama pull gemma3:2b   # 2B parameter variant
```

**5. 端口冲突**

**检查占用 11434 端口的进程：**
```bash
lsof -i :11434
netstat -tulpn | grep 11434
```

**使用自定义端口：**
```bash
OLLAMA_HOST=0.0.0.0:8080 ollama serve
```
然后在 **Settings → API Keys** 中将基础 URL 更新为 `http://localhost:8080`

**6. 对话中出现「Failed to send message」**

**症状：** 对话界面显示「Failed to send message」 toast 通知。日志可能显示：
```
Error executing chat: Model is not a LanguageModel: None
```

**原因（按可能性排序）：**

1. **模型名称不匹配**：Open Notebook 中的模型名称与 `ollama list` 不完全一致
2. **未配置默认模型**：未在 Settings → Models 中设置默认对话模型
3. **模型已删除**：已从 Ollama 中删除模型，但未更新 Open Notebook 的默认设置
4. **模型记录已删除**：已从 Open Notebook 中移除模型，但仍设为默认

**解决方案：**

**检查 1：验证模型名称完全一致**
```bash
# Get exact model names from Ollama
ollama list

# Compare with what's configured in Open Notebook
# Go to Settings → Models and verify the names match EXACTLY
```

**检查 2：验证已设置默认模型**
1. 进入 **Settings → Models**
2. 滚动至 **Default Models** 部分
3. 确认 **Default Chat Model** 已选择值
4. 若为空，请选择可用的语言模型

**检查 3：变更后刷新**
若在 Ollama 中增删了模型：
1. 刷新 Open Notebook 页面
2. 进入 Settings → Models
3. 使用 `ollama list` 中的精确名称重新添加缺失模型
4. 必要时重新选择默认模型

**检查 4：直接测试模型**
```bash
# Verify Ollama can use the model
ollama run gemma3:12b "Hello, world"
```

### Docker 专属故障排除

**1. Linux：`host.docker.internal` 无法解析（最常见）**

若在 Linux 上出现 `Name or service not known` 错误，请在 docker-compose.yml 中添加 `extra_hosts`：

```yaml
# Add to your docker-compose.yml (requires surrealdb service, see installation guide)
services:
  open_notebook:
    image: lfnovo/open_notebook:v1-latest
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
    # ... rest of your config
```

然后在 **Settings → API Keys** 中使用基础 URL：`http://host.docker.internal:11434`

这会将 `host.docker.internal` 映射到宿主机 IP。macOS/Windows 的 Docker Desktop 会自动完成此映射，但 Linux 需要显式配置。

**2. Linux 宿主机网络（备选方案）：**
```bash
# Use host networking if host.docker.internal doesn't work
docker run --network host lfnovo/open_notebook:v1-latest  # for quick testing only
```
然后在 **Settings → API Keys** 中使用基础 URL：`http://localhost:11434`

**3. 自定义桥接网络：**
```yaml
version: '3.8'
networks:
  ollama_network:
    driver: bridge

services:
  open-notebook:
    networks:
      - ollama_network
    environment:
  ollama:
    networks:
      - ollama_network
```

然后在 **Settings → API Keys** 中使用基础 URL：`http://ollama:11434`

**4. 防火墙问题：**
```bash
# Allow Ollama port through firewall
sudo ufw allow 11434
# or
sudo firewall-cmd --add-port=11434/tcp --permanent
```

## 性能优化

### 模型管理

**列出已安装模型：**
```bash
ollama list
```

**移除未使用的模型：**
```bash
ollama rm model_name
```

**显示正在运行的模型：**
```bash
ollama ps
```

**预加载模型以加快启动：**
```bash
# Keep model in memory
curl http://localhost:11434/api/generate -d '{
  "model": "qwen3",
  "prompt": "test",
  "keep_alive": -1
}'
```

### 系统优化

**Linux：提高文件描述符限制：**
```bash
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
```

**macOS：提高内存相关限制：**
```bash
# Add to ~/.zshrc or ~/.bash_profile
export OLLAMA_MAX_LOADED_MODELS=2
export OLLAMA_NUM_PARALLEL=4
```

**Docker：资源分配：**
```yaml
services:
  ollama:
    deploy:
      resources:
        limits:
          memory: 8G
          cpus: '4'
```

## 高级配置

### 环境变量

```bash
# Ollama server configuration
export OLLAMA_HOST=0.0.0.0:11434      # Bind to all interfaces
export OLLAMA_KEEP_ALIVE=5m            # Keep models in memory
export OLLAMA_MAX_LOADED_MODELS=3      # Max concurrent models
export OLLAMA_MAX_QUEUE=512            # Request queue size
export OLLAMA_NUM_PARALLEL=4           # Parallel request handling
export OLLAMA_FLASH_ATTENTION=1        # Enable flash attention (if supported)

# Open Notebook configuration (configure via Settings → API Keys instead)
# OLLAMA_API_BASE=http://localhost:11434  # Deprecated — use Settings UI
```

### SSL 配置（自签名证书）

若 Ollama 运行在带有自签名 SSL 证书的反向代理之后（例如 Caddy、使用自定义证书的 nginx），可能遇到 SSL 验证错误：

```
[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate
```

**解决方案：**

**方案 1：使用自定义 CA 包（推荐）**
```bash
# Point to your CA certificate file
export ESPERANTO_SSL_CA_BUNDLE=/path/to/your/ca-bundle.pem
```

**方案 2：禁用 SSL 验证（仅用于开发环境）**
```bash
# WARNING: Only use in trusted development environments
export ESPERANTO_SSL_VERIFY=false
```

**带 SSL 配置的 Docker Compose 示例：**
```yaml
# Add to your docker-compose.yml (requires surrealdb service, see installation guide)
services:
  open-notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    environment:
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=change-me-to-a-secret-string
      # Option 1: Custom CA bundle (if Ollama uses self-signed SSL)
      - ESPERANTO_SSL_CA_BUNDLE=/certs/ca-bundle.pem
      # Option 2: Disable verification (dev only)
      # - ESPERANTO_SSL_VERIFY=false
    volumes:
      - /path/to/your/ca-bundle.pem:/certs/ca-bundle.pem:ro
```

> **安全提示：** 禁用 SSL 验证会使您面临中间人攻击风险。生产环境中应优先使用自定义 CA 包。

### 自定义模型导入

**导入自定义模型：**
```bash
# Create Modelfile
cat > Modelfile << EOF
FROM qwen3
PARAMETER temperature 0.7
PARAMETER top_p 0.9
SYSTEM "You are a helpful research assistant."
EOF

# Create custom model
ollama create my-research-model -f Modelfile
```

**在 Open Notebook 中使用：**
1. 进入 **Settings → Models**
2. 添加新模型：`my-research-model`
3. 设为特定任务的默认模型

### 监控与日志

**查看 Ollama 日志：**
```bash
# Linux (systemd)
journalctl -u ollama -f

# Docker
docker logs -f ollama

# Manual run with verbose logging
OLLAMA_DEBUG=1 ollama serve
```

**资源监控：**
```bash
# CPU and memory usage
htop

# GPU usage (NVIDIA)
nvidia-smi -l 1

# Model-specific metrics
ollama ps
```

## 集成示例

### Python 脚本集成

```python
import requests
import os

# Test Ollama connection
ollama_base = os.environ.get('OLLAMA_API_BASE', 'http://localhost:11434')
response = requests.get(f'{ollama_base}/api/tags')
print(f"Available models: {response.json()}")

# Generate text
payload = {
    "model": "qwen3",
    "prompt": "Explain quantum computing",
    "stream": False
}
response = requests.post(f'{ollama_base}/api/generate', json=payload)
print(response.json()['response'])
```

### 健康检查脚本

```bash
#!/bin/bash
# ollama-health-check.sh

OLLAMA_API_BASE=${OLLAMA_API_BASE:-"http://localhost:11434"}

echo "Checking Ollama health..."
if curl -s "${OLLAMA_API_BASE}/api/tags" > /dev/null; then
    echo "✅ Ollama is running"
    echo "Available models:"
    curl -s "${OLLAMA_API_BASE}/api/tags" | jq -r '.models[].name'
else
    echo "❌ Ollama is not accessible at ${OLLAMA_API_BASE}"
    exit 1
fi
```

## 从其他提供商迁移

### 从 OpenAI 迁移

**性能相近的模型：**
- GPT-4 → `qwen3` 或 `deepseek-r1`
- GPT-3.5 → `gemma3` 或 `phi4`
- text-embedding-ada-002 → `mxbai-embed-large`

**成本对比：**
- OpenAI：每 1K token 约 $0.01–0.06
- Ollama：硬件投入后为 $0

### 从 Anthropic 迁移

**Claude 替代建议：**
- Claude 3.5 Sonnet → `deepseek-r1`（推理）
- Claude 3 Haiku → `phi4`（速度）

## 最佳实践

### 安全

1. **网络安全：**
   - 仅在受信任的网络中运行 Ollama
   - 使用防火墙规则限制访问
   - 远程访问可考虑 VPN

2. **模型验证：**
   - 仅从可信来源拉取模型
   - 尽可能验证模型校验和

3. **资源限制：**
   - 在生产环境中设置内存与 CPU 限制
   - 定期监控资源使用情况

### 性能

1. **模型选择：**
   - 根据硬件选择合适规模的模型
   - 简单任务使用较小模型
   - 仅在需要时使用推理模型

2. **资源管理：**
   - 预加载常用模型
   - 定期移除未使用模型
   - 监控系统资源

3. **网络优化：**
   - 使用本地网络以降低延迟
   - 考虑使用 SSD 存储以加快模型加载

## 获取帮助

**社区资源：**
- [Ollama GitHub](https://github.com/jmorganca/ollama) — 官方仓库
- [Ollama Discord](https://discord.gg/ollama) — 社区支持
- [Open Notebook Discord](https://discord.gg/37XJPXfz2w) — 集成相关帮助

**调试资源：**
- 查看 Ollama 日志中的错误信息
- 使用 curl 命令测试连接
- 验证环境变量
- 监控系统资源

本指南应能帮助您成功部署并优化与 Open Notebook 配合使用的 Ollama。请从快速开始部分入手，并按需查阅具体场景说明。

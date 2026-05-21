# 本地语音转文字（STT）配置

使用与 OpenAI 兼容的 STT 服务在本地运行语音转文字，实现免费、私密的音频/视频转录。

---

## 为何使用本地 STT？

| 优势 | 说明 |
|------|------|
| **免费** | 完成部署后无按分钟计费 |
| **私密** | 音频数据不离开本机 |
| **无限制** | 无速率限制或配额 |
| **离线** | 无需互联网即可工作 |

---

## 使用 Speaches 快速开始

[Speaches](https://github.com/speaches-ai/speaches) 是开源、与 OpenAI 兼容的服务端，同时支持 TTS 与 STT。转录基于 [faster-whisper](https://github.com/SYSTRAN/faster-whisper)。

> **💡 提供现成的 Docker Compose 文件：**
> - **[docker-compose-speaches.yml](../../examples/docker-compose-speaches.yml)** — Speaches + Open Notebook
> - **[docker-compose-full-local.yml](../../examples/docker-compose-full-local.yml)** — Speaches + Ollama（完全本地部署）
>
> 内含完整安装说明与配置示例，复制后即可运行。

### 步骤 1：创建 Docker Compose 文件

新建目录并添加 `docker-compose.yml`：

```yaml
services:
  speaches:
    image: ghcr.io/speaches-ai/speaches:latest-cpu
    container_name: speaches
    ports:
      - "8969:8000"
    volumes:
      - hf-hub-cache:/home/ubuntu/.cache/huggingface/hub
    restart: unless-stopped

volumes:
  hf-hub-cache:
```

### 步骤 2：启动并下载模型

```bash
# Start Speaches
docker compose up -d

# Wait for startup
sleep 10

# Download Whisper model (~500MB for small)
docker compose exec speaches uv tool run speaches-cli model download Systran/faster-whisper-small
```

模型也可在首次使用时自动下载，但预先下载可避免等待。

### 步骤 3：测试

```bash
# Create a test audio file (or use your own)
# Then transcribe it:
curl "http://localhost:8969/v1/audio/transcriptions" \
  -F "file=@test.mp3" \
  -F "model=Systran/faster-whisper-small"
```

响应中应包含转录文本。

### 步骤 4：配置 Open Notebook

**通过设置界面（推荐）：**
1. 进入 **Settings** → **API Keys**
2. 点击 **Add Credential** → 选择 **OpenAI-Compatible**
3. 填写 STT 基础 URL：`http://host.docker.internal:8969/v1`（Docker）或 `http://localhost:8969/v1`（本地）
4. 点击 **Save**，再点击 **Test Connection**

**旧版方式（已弃用）— 环境变量：**
```yaml
# In your Open Notebook docker-compose.yml
environment:
  - OPENAI_COMPATIBLE_BASE_URL_STT=http://host.docker.internal:8969/v1
```

```bash
# Local development
export OPENAI_COMPATIBLE_BASE_URL_STT=http://localhost:8969/v1
```

### 步骤 5：在 Open Notebook 中添加模型

1. 进入 **Settings** → **Models**
2. 在 Speech-to-Text 区域点击 **Add Model**
3. 配置：
   - **Provider**：`openai_compatible`
   - **Model Name**：`Systran/faster-whisper-small`
   - **Display Name**：`Local Whisper`
4. 点击 **Save**
5. 如需可设为默认模型

---

## 可用模型

Speaches 支持多种 Whisper 模型规格。模型越大，精度越高，但速度越慢：

| 模型 | 体积 | 速度 | 精度 | 显存（GPU） |
|------|------|------|------|-------------|
| `Systran/faster-whisper-tiny` | ~75 MB | 最快 | 基础 | ~1 GB |
| `Systran/faster-whisper-base` | ~150 MB | 快 | 良好 | ~1 GB |
| `Systran/faster-whisper-small` | ~500 MB | 中等 | 较好 | ~2 GB |
| `Systran/faster-whisper-medium` | ~1.5 GB | 慢 | 优秀 | ~5 GB |
| `Systran/faster-whisper-large-v3` | ~3 GB | 最慢 | 最佳 | ~10 GB |
| `Systran/faster-distil-whisper-small.en` | ~400 MB | 快 | 良好（仅英语） | ~2 GB |

### 列出可用模型

```bash
docker compose exec speaches uv tool run speaches-cli registry ls --task automatic-speech-recognition
```

### 推荐模型

- **追求速度**：`Systran/faster-whisper-tiny` 或 `Systran/faster-whisper-base`
- **平衡性能**：`Systran/faster-whisper-small`（推荐）
- **追求精度**：`Systran/faster-whisper-large-v3`

---

## GPU 加速

在配备 NVIDIA GPU 时可加快转录速度：

```yaml
services:
  speaches:
    image: ghcr.io/speaches-ai/speaches:latest-cuda
    container_name: speaches
    ports:
      - "8969:8000"
    volumes:
      - hf-hub-cache:/home/ubuntu/.cache/huggingface/hub
    environment:
      - WHISPER__TTL=-1  # Keep model in VRAM (recommended if you have enough memory)
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  hf-hub-cache:
```

### 保持模型驻留内存

默认情况下，Speaches 会在一段时间后卸载模型。若需保持 Whisper 模型常驻以实现即时转录：

```yaml
environment:
  - WHISPER__TTL=-1  # Never unload
```

在内存/显存充足时建议启用，因为加载模型可能需要数秒。

---

## Docker 网络

在 **Settings → API Keys** 中配置 OpenAI-Compatible 凭据时，请根据部署方式选择对应的 STT 基础 URL：

### Open Notebook 运行于 Docker（macOS/Windows）

**STT Base URL：** `http://host.docker.internal:8969/v1`

### Open Notebook 运行于 Docker（Linux）

**STT Base URL（方案 1 — Docker 网桥 IP）：** `http://172.17.0.1:8969/v1`

**方案 2：** 使用宿主机网络模式（`docker run --network host ...`），然后使用：`http://localhost:8969/v1`

### 远程服务器

在另一台机器上运行 Speaches：

**STT Base URL：** `http://server-ip:8969/v1`（替换为服务器 IP）

---

## 语言支持

Whisper 支持 99 种以上语言。指定语言可提升识别准确度：

```bash
curl "http://localhost:8969/v1/audio/transcriptions" \
  -F "file=@audio.mp3" \
  -F "model=Systran/faster-whisper-small" \
  -F "language=ru"
```

常用语言代码：
- `en` - English
- `ru` - Russian
- `es` - Spanish
- `fr` - French
- `de` - German
- `zh` - Chinese
- `ja` - Japanese

---

## 故障排除

### 服务无法启动

```bash
# Check logs
docker compose logs speaches

# Verify port available
lsof -i :8969

# Restart
docker compose down && docker compose up -d
```

### 连接被拒绝

```bash
# Test Speaches is running
curl http://localhost:8969/v1/models

# From inside Open Notebook container
docker exec -it open-notebook curl http://host.docker.internal:8969/v1/models
```

### 模型下载失败

模型会在首次使用时自动下载。若下载失败：

```bash
# Check available disk space
df -h

# Check Docker logs for errors
docker compose logs speaches

# Restart and try again
docker compose restart speaches
```

### 转录质量不佳

- 使用更大模型（`faster-whisper-medium` 或 `large-v3`）
- 指定正确语言
- 确保音频质量良好（语音清晰、背景噪声少）
- 尝试不同音频格式（WAV 通常优于 MP3）

### 转录速度慢

| 解决方案 | 做法 |
|----------|------|
| 使用 GPU | 切换为 `latest-cuda` 镜像 |
| 更小模型 | 使用 `faster-whisper-tiny` 或 `base` |
| 增加 CPU | 在 Docker 中分配更多核心 |
| SSD 存储 | 将 Docker 卷迁移至 SSD |

---

## 性能建议

### 推荐硬件规格

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 2 核 | 4 核及以上 |
| 内存 | 2 GB | 8 GB 及以上 |
| 存储 | 5 GB | 10 GB（多模型） |
| GPU | 无 | NVIDIA（可选，显著加速） |

### 资源限制

```yaml
services:
  speaches:
    # ... other config
    mem_limit: 4g
    cpus: 2
```

### 监控资源占用

```bash
docker stats speaches
```

---

## 对比：本地与云端

| 维度 | 本地（Speaches） | 云端（OpenAI Whisper） |
|------|------------------|------------------------|
| **费用** | 免费 | $0.006/分钟 |
| **隐私** | 完全本地 | 数据发送至服务商 |
| **速度** | 取决于硬件 | 通常更快 |
| **质量** | 优秀（同为 Whisper） | 优秀 |
| **部署** | 中等复杂度 | 仅需 API 密钥 |
| **离线** | 支持 | 不支持 |
| **语言** | 99+ | 99+ |

### 适合使用本地的场景

- 对隐私敏感的内容
- 大批量转录
- 开发/测试
- 离线环境
- 成本控制

### 适合使用云端的场景

- 硬件资源有限
- 时间紧迫的项目
- 无可用 GPU
- 偏好简单部署

---

## 同时使用 TTS 与 STT

Speaches 可在单一服务中同时提供 TTS 与 STT。在 **Settings → API Keys** 中添加一条 **OpenAI-Compatible** 凭据，并将 TTS 与 STT 基础 URL 均指向同一 Speaches 服务（例如 `http://localhost:8969/v1`）。

TTS 配置请参阅 **[本地 TTS 配置](local-tts.zh.md)**。

---

## 其他本地 STT 方案

任何与 OpenAI 兼容的 STT 服务均可使用：

| 服务 | 说明 |
|------|------|
| [Speaches](https://github.com/speaches-ai/speaches) | TTS + STT 一体化（推荐） |
| [faster-whisper-server](https://github.com/fedirz/faster-whisper-server) | 轻量 STT 专用 |
| [whisper.cpp](https://github.com/ggerganov/whisper.cpp) | C++ 实现，支持服务端模式 |
| [LocalAI](https://github.com/mudler/LocalAI) | 多模型本地 AI 服务端 |

关键要求：

1. 服务实现 `/v1/audio/transcriptions` 端点
2. 在 **Settings → API Keys** 中添加 OpenAI-Compatible 凭据并配置 STT 基础 URL
3. 添加 Provider 为 `openai_compatible` 的模型

---

## 相关文档

- **[本地 TTS 配置](local-tts.zh.md)** — 使用 Speaches 进行文本转语音
- **[OpenAI 兼容提供商](openai-compatible.zh.md)** — 通用兼容提供商配置
- **[AI 提供商](ai-providers.zh.md)** — 全部提供商配置

# 本地文本转语音（TTS）配置

使用与 OpenAI 兼容的 TTS 服务在本地运行文本转语音，实现免费、私密的播客生成。

---

## 为何使用本地 TTS？

| 优势 | 说明 |
|------|------|
| **免费** | 完成部署后无按字符计费 |
| **私密** | 音频数据不离开本机 |
| **无限制** | 无速率限制或配额 |
| **离线** | 无需互联网即可工作 |

---

## 使用 Speaches 快速开始

[Speaches](https://github.com/speaches-ai/speaches) 是开源、与 OpenAI 兼容的 TTS 服务端。

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

# Download voice model (~500MB)
docker compose exec speaches uv tool run speaches-cli model download speaches-ai/Kokoro-82M-v1.0-ONNX
```

### 步骤 3：测试

```bash
curl "http://localhost:8969/v1/audio/speech" -s \
  -H "Content-Type: application/json" \
  --output test.mp3 \
  --data '{
    "input": "Hello! Local TTS is working.",
    "model": "speaches-ai/Kokoro-82M-v1.0-ONNX",
    "voice": "af_bella"
  }'
```

播放 `test.mp3` 以验证。

### 步骤 4：配置 Open Notebook

**通过设置界面（推荐）：**
1. 进入 **Settings** → **API Keys**
2. 点击 **Add Credential** → 选择 **OpenAI-Compatible**
3. 填写 TTS 基础 URL：`http://host.docker.internal:8969/v1`（Docker）或 `http://localhost:8969/v1`（本地）
4. 点击 **Save**，再点击 **Test Connection**

**旧版方式（已弃用）— 环境变量：**
```yaml
# In your Open Notebook docker-compose.yml
environment:
  - OPENAI_COMPATIBLE_BASE_URL_TTS=http://host.docker.internal:8969/v1
```

```bash
# Local development
export OPENAI_COMPATIBLE_BASE_URL_TTS=http://localhost:8969/v1
```

### 步骤 5：在 Open Notebook 中添加模型

1. 进入 **Settings** → **Models**
2. 在 Text-to-Speech 区域点击 **Add Model**
3. 配置：
   - **Provider**：`openai_compatible`
   - **Model Name**：`speaches-ai/Kokoro-82M-v1.0-ONNX`
   - **Display Name**：`Local TTS`
4. 点击 **Save**
5. 如需可设为默认模型

---

## 可用音色

Kokoro 模型提供多种音色：

### 女声

| Voice ID | 说明 |
|----------|------|
| `af_bella` | 清晰、专业 |
| `af_sarah` | 温暖、亲切 |
| `af_nicole` | 活泼、富有表现力 |

### 男声

| Voice ID | 说明 |
|----------|------|
| `am_adam` | 低沉、权威 |
| `am_michael` | 友好、对话感 |

### 英式口音

| Voice ID | 说明 |
|----------|------|
| `bf_emma` | 英式女声、专业 |
| `bm_george` | 英式男声、正式 |

### 试听不同音色

```bash
for voice in af_bella af_sarah am_adam am_michael; do
  curl "http://localhost:8969/v1/audio/speech" -s \
    -H "Content-Type: application/json" \
    --output "test_${voice}.mp3" \
    --data "{
      \"input\": \"Hello, this is the ${voice} voice.\",
      \"model\": \"speaches-ai/Kokoro-82M-v1.0-ONNX\",
      \"voice\": \"${voice}\"
    }"
done
```

---

## GPU 加速

在配备 NVIDIA GPU 时可加快生成速度：

```yaml
services:
  speaches:
    image: ghcr.io/speaches-ai/speaches:latest-cuda
    container_name: speaches
    ports:
      - "8969:8000"
    volumes:
      - hf-hub-cache:/home/ubuntu/.cache/huggingface/hub
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

---

## Docker 网络

在 **Settings → API Keys** 中配置 OpenAI-Compatible 凭据时，请根据部署方式选择对应的 TTS 基础 URL：

### Open Notebook 运行于 Docker（macOS/Windows）

**TTS Base URL：** `http://host.docker.internal:8969/v1`

### Open Notebook 运行于 Docker（Linux）

**TTS Base URL（方案 1 — Docker 网桥 IP）：** `http://172.17.0.1:8969/v1`

**方案 2：** 使用宿主机网络模式（`docker run --network host ...`），然后使用：`http://localhost:8969/v1`

### 远程服务器

在另一台机器上运行 Speaches：

**TTS Base URL：** `http://server-ip:8969/v1`（替换为服务器 IP）

---

## 多说话人播客

为每位说话人配置不同音色：

```
Speaker 1 (Host):
  Model: speaches-ai/Kokoro-82M-v1.0-ONNX
  Voice: af_bella

Speaker 2 (Guest):
  Model: speaches-ai/Kokoro-82M-v1.0-ONNX
  Voice: am_adam

Speaker 3 (Narrator):
  Model: speaches-ai/Kokoro-82M-v1.0-ONNX
  Voice: bf_emma
```

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

### 模型未找到

```bash
# List downloaded models
docker compose exec speaches uv tool run speaches-cli model list

# Download if missing
docker compose exec speaches uv tool run speaches-cli model download speaches-ai/Kokoro-82M-v1.0-ONNX
```

### 音质不佳

- 尝试其他音色
- 调整语速：`"speed": 0.9` 至 `1.2`
- 确认模型已完整下载
- 分配更多内存

### 生成速度慢

| 解决方案 | 做法 |
|----------|------|
| 使用 GPU | 切换为 `latest-cuda` 镜像 |
| 增加 CPU | 在 Docker 中分配更多核心 |
| 更快模型 | 使用更小或量化模型 |
| SSD 存储 | 将 Docker 卷迁移至 SSD |

---

## 性能建议

### 推荐硬件规格

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 2 核 | 4 核及以上 |
| 内存 | 2 GB | 4 GB 及以上 |
| 存储 | 5 GB | 10 GB（多模型） |
| GPU | 无 | NVIDIA（可选） |

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

| 维度 | 本地（Speaches） | 云端（OpenAI/ElevenLabs） |
|------|------------------|---------------------------|
| **费用** | 免费 | $0.015–0.10/分钟 |
| **隐私** | 完全本地 | 数据发送至服务商 |
| **速度** | 取决于硬件 | 通常更快 |
| **质量** | 良好 | 优秀 |
| **部署** | 中等复杂度 | 仅需 API 密钥 |
| **离线** | 支持 | 不支持 |
| **音色** | 有限 | 选择丰富 |

### 适合使用本地的场景

- 对隐私敏感的内容
- 大批量生成
- 开发/测试
- 离线环境
- 成本控制

### 适合使用云端的场景

- 需要高品质输出
- 多语言需求
- 时间紧迫的项目
- 硬件资源有限

---

## 其他本地 TTS 方案

任何与 OpenAI 兼容的 TTS 服务均可使用。关键要求：

1. 服务实现 `/v1/audio/speech` 端点
2. 在 **Settings → API Keys** 中添加 OpenAI-Compatible 凭据并配置 TTS 基础 URL
3. 添加 Provider 为 `openai_compatible` 的模型

---

## 相关文档

- **[本地 STT 配置](local-stt.zh.md)** — 使用 Speaches 进行语音转文字
- **[OpenAI 兼容提供商](openai-compatible.zh.md)** — 通用兼容提供商配置
- **[AI 提供商](ai-providers.zh.md)** — 全部提供商配置
- **[创建播客](../3-USER-GUIDE/creating-podcasts.zh.md)** — 使用 TTS 生成播客

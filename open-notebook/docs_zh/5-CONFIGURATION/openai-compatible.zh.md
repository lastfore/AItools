# OpenAI 兼容提供商

将任何实现 OpenAI API 格式的服务器与 Open Notebook 配合使用，包括 LM Studio、Text Generation WebUI、vLLM 等。

---

## 什么是 OpenAI 兼容？

许多 AI 工具实现与 OpenAI 相同的 API 格式：

```
POST /v1/chat/completions
POST /v1/embeddings
POST /v1/audio/speech
```

Open Notebook 可连接任何采用该格式的服务器。

---

## 常见兼容服务器

| 服务器 | 用途 | URL |
|--------|------|-----|
| **LM Studio** | 本地模型的桌面 GUI | https://lmstudio.ai |
| **Text Generation WebUI** | 功能完整的本地推理 | https://github.com/oobabooga/text-generation-webui |
| **vLLM** | 高性能服务 | https://github.com/vllm-project/vllm |
| **Ollama** | 简易本地模型 | （请改用原生 Ollama 提供商） |
| **LocalAI** | 本地 AI 推理 | https://github.com/mudler/LocalAI |
| **llama.cpp server** | 轻量推理 | https://github.com/ggerganov/llama.cpp |

---

## 快速设置：LM Studio

### 步骤 1：安装并启动 LM Studio

1. 从 https://lmstudio.ai 下载
2. 安装并启动
3. 下载模型（例如 Llama 3）
4. 启动本地服务器（默认端口：1234）

### 步骤 2：在设置界面配置（推荐）

1. 前往 **Settings** → **API Keys**
2. 点击 **Add Credential** → 选择 **OpenAI-Compatible**
3. 填写 base URL：`http://host.docker.internal:1234/v1`（Docker）或 `http://localhost:1234/v1`（本地）
4. API key：`lm-studio`（占位符，LM Studio 不要求密钥）
5. 点击 **Save**，然后 **Test Connection**

**旧版（已弃用）— 环境变量：**
```bash
export OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1
export OPENAI_COMPATIBLE_API_KEY=not-needed
```

### 步骤 3：在 Open Notebook 中添加模型

1. 前往 **Settings** → **Models**
2. 点击 **Add Model**
3. 配置：
   - **Provider**：`openai_compatible`
   - **Model Name**：LM Studio 中的模型名称
   - **Display Name**：`LM Studio - Llama 3`
4. 点击 **Save**

---

## 通过设置界面配置

推荐通过设置界面配置 OpenAI 兼容提供商：

1. 前往 **Settings** → **API Keys**
2. 点击 **Add Credential** → 选择 **OpenAI-Compatible**
3. 填写 base URL 与 API key（如需要）
4. 可选：为 LLM、Embedding、TTS、STT 分别配置服务 URL
5. 点击 **Save**，然后 **Test Connection**

## 旧版：环境变量（已弃用）

> **已弃用**：以下环境变量已弃用，请改用设置界面。

### 语言模型（Chat）

```bash
OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1
OPENAI_COMPATIBLE_API_KEY=optional-api-key
```

### Embeddings

```bash
OPENAI_COMPATIBLE_BASE_URL_EMBEDDING=http://localhost:1234/v1
OPENAI_COMPATIBLE_API_KEY_EMBEDDING=optional-api-key
```

### 文本转语音（TTS）

```bash
OPENAI_COMPATIBLE_BASE_URL_TTS=http://localhost:8969/v1
OPENAI_COMPATIBLE_API_KEY_TTS=optional-api-key
```

### 语音转文本（STT）

```bash
OPENAI_COMPATIBLE_BASE_URL_STT=http://localhost:9000/v1
OPENAI_COMPATIBLE_API_KEY_STT=optional-api-key
```

---

## Docker 网络

当 Open Notebook 在 Docker 中运行、兼容服务器在宿主机上时，在 **Settings → API Keys** 添加凭据时使用合适的 base URL：

### macOS / Windows

**Base URL：** `http://host.docker.internal:1234/v1`

### Linux

**Base URL（选项 1 — Docker 网桥 IP）：** `http://172.17.0.1:1234/v1`

**选项 2：** 使用宿主机网络模式：`docker run --network host ...`  
然后使用 base URL：`http://localhost:1234/v1`

### 同一 Docker 网络

```yaml
# docker-compose.yml
services:
  open-notebook:
    # ...

  lm-studio:
    # your LM Studio container
    ports:
      - "1234:1234"
```

**Settings → API Keys 中的 Base URL：** `http://lm-studio:1234/v1`

---

## Text Generation WebUI 设置

### 启用 API 后启动

```bash
python server.py --api --listen
```

### 配置 Open Notebook

在 **Settings → API Keys** 中添加 **OpenAI-Compatible** 凭据，base URL：`http://localhost:5000/v1`

### Docker Compose 示例

```yaml
# Add to your docker-compose.yml (requires surrealdb service, see installation guide)
services:
  text-gen:
    image: atinoda/text-generation-webui:default
    ports:
      - "5000:5000"
      - "7860:7860"
    volumes:
      - ./models:/app/models
    command: --api --listen

  open-notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    depends_on:
      - text-gen
```

然后在 **Settings → API Keys** 中添加 **OpenAI-Compatible** 凭据，base URL：`http://text-gen:5000/v1`

---

## vLLM 设置

### 启动 vLLM 服务器

```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B-Instruct \
  --port 8000
```

### 配置 Open Notebook

在 **Settings → API Keys** 中添加 **OpenAI-Compatible** 凭据，base URL：`http://localhost:8000/v1`

### 带 GPU 的 Docker Compose

```yaml
# Add to your docker-compose.yml (requires surrealdb service, see installation guide)
services:
  vllm:
    image: vllm/vllm-openai:latest
    command: --model meta-llama/Llama-3.1-8B-Instruct
    ports:
      - "8000:8000"
    volumes:
      - ~/.cache/huggingface:/root/.cache/huggingface
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  open-notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    depends_on:
      - vllm
```

然后在 **Settings → API Keys** 中添加 **OpenAI-Compatible** 凭据，base URL：`http://vllm:8000/v1`

---

## 在 Open Notebook 中添加模型

### 通过设置界面

1. 前往 **Settings** → **Models**
2. 在对应分类中点击 **Add Model**
3. 选择 **Provider**：`openai_compatible`
4. 填写 **Model Name**：与服务器期望的名称完全一致
5. 填写 **Display Name**：您偏好的显示名称
6. 点击 **Save**

### 模型名称格式

模型名称须与服务器期望一致：

| 服务器 | 模型名称格式 |
|--------|----------------|
| LM Studio | 与 LM Studio 界面显示一致 |
| vLLM | HuggingFace 模型路径 |
| Text Gen WebUI | 与界面中加载的名称一致 |
| llama.cpp | 模型文件名 |

---

## 测试连接

### 测试 API 端点

```bash
# Test chat completions
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "your-model-name",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 在 Docker 内测试

```bash
docker exec -it open-notebook curl http://host.docker.internal:1234/v1/models
```

---

## 故障排除

### 连接被拒绝

```
Problem: Cannot connect to server

Solutions:
1. Verify server is running
2. Check port is correct
3. Test with curl directly
4. Check Docker networking (use host.docker.internal)
5. Verify firewall allows connection
```

### 找不到模型

```
Problem: Server returns "model not found"

Solutions:
1. Check model is loaded in server
2. Verify exact model name spelling
3. List available models: curl http://localhost:1234/v1/models
4. Update model name in Open Notebook
```

### 响应缓慢

```
Problem: Requests take very long

Solutions:
1. Check server resources (RAM, GPU)
2. Use smaller/quantized model
3. Reduce context length
4. Enable GPU acceleration if available
```

### 认证错误

```
Problem: 401 or authentication failed

Solutions:
1. Check if server requires API key
2. Set the API key in your credential (Settings → API Keys)
3. Some servers need any non-empty key (use a placeholder like "not-needed")
```

### 超时错误

```
Problem: Request times out

Solutions:
1. Model may be loading (first request slow)
2. Increase timeout settings
3. Check server logs for errors
4. Reduce request size
```

---

## 多个兼容端点

可为不同用途使用不同的兼容服务器。在 **Settings → API Keys** 添加 **OpenAI-Compatible** 凭据时，可配置各服务 URL：

- **LLM URL**：例如 `http://localhost:1234/v1`（LM Studio）
- **Embedding URL**：例如 `http://localhost:8080/v1`（另一台服务器）
- **TTS URL**：例如 `http://localhost:8969/v1`（Speaches）
- **STT URL**：例如 `http://localhost:9000/v1`（Speaches）

也可分别添加多条凭据，各自使用独立的 base URL。

---

## 性能建议

### 模型选型

| 模型规模 | 所需 RAM | 速度 |
|----------|----------|------|
| 7B | 8GB | 快 |
| 13B | 16GB | 中等 |
| 70B | 64GB+ | 慢 |

### 量化

使用量化模型（Q4、Q5）可在更少 RAM 下获得更快推理：

```
llama-3-8b-q4_k_m.gguf  → ~4GB RAM, fast
llama-3-8b-f16.gguf     → ~16GB RAM, slower
```

### GPU 加速

在服务器中启用 GPU 可显著加快推理：
- LM Studio：Settings → GPU layers
- vLLM：CUDA 下自动启用
- llama.cpp：`--n-gpu-layers 35`

---

## 对比：原生提供商与兼容模式

| 方面 | 原生提供商 | OpenAI Compatible |
|------|------------|-------------------|
| **设置** | 仅需 API key | 服务器 + 配置 |
| **模型** | 提供商模型 | 任意兼容模型 |
| **成本** | 按 token 计费 | 免费（本地） |
| **速度** | 通常较快 | 取决于硬件 |
| **功能** | 完整支持 | 基础功能 |

在以下情况使用 OpenAI 兼容模式：
- 运行本地模型
- 使用自定义/微调模型
- 有隐私要求
- 需要控制成本

---

## 相关文档

- **[本地 TTS 设置](local-tts.zh.md)** - 使用 Speaches 的文本转语音
- **[本地 STT 设置](local-stt.zh.md)** - 使用 Speaches 的语音转文本
- **[AI 提供商](ai-providers.zh.md)** - 全部提供商选项
- **[Ollama 设置](ollama.zh.md)** - 原生 Ollama 集成

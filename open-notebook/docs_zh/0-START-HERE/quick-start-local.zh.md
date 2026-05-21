# 快速入门 - 本地与私密（5 分钟）

使用 **100% 本地 AI**（Ollama）运行 Open Notebook。无需云端 API 密钥，完全私密。

## 前置条件

1. **已安装 Docker Desktop**
   - [在此下载](https://www.docker.com/products/docker-desktop/)
   - 已安装？跳到第 2 步

2. **本地 LLM** - 任选其一：
   - **Ollama**（推荐）：[在此下载](https://ollama.ai/)
   - **LM Studio**（图形界面替代）：[在此下载](https://lmstudio.ai)

## 步骤 1：选择部署方式（1 分钟）

### 本机（同一台电脑）
一切在本机运行。适合测试/学习。

### 远程服务器（树莓派、NAS、云 VM）
在另一台计算机运行，从其他设备访问。需要网络配置。

---

## 步骤 2：创建配置（1 分钟）

> **现成示例：** 若需 Ollama + Speaches（LLM + 本地语音），使用 [`examples/docker-compose-full-local.yml`](../../examples/docker-compose-full-local.yml)。

新建文件夹 `open-notebook-local` 并添加以下文件：

**docker-compose.yml**：
```yaml
services:
  surrealdb:
    image: surrealdb/surrealdb:v2
    command: start --user root --pass password --bind 0.0.0.0:8000 rocksdb:/mydata/mydatabase.db
    user: root
    ports:
      - "8000:8000"
    volumes:
      - ./surreal_data:/mydata

  open_notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    ports:
      - "8502:8502"  # Web UI (React frontend)
      - "5055:5055"  # API (required!)
    environment:
      # Encryption key for credential storage (required)
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=change-me-to-a-secret-string

      # Database (required)
      - SURREAL_URL=ws://surrealdb:8000/rpc
      - SURREAL_USER=root
      - SURREAL_PASSWORD=password
      - SURREAL_NAMESPACE=open_notebook
      - SURREAL_DATABASE=open_notebook
    volumes:
      - ./notebook_data:/app/data
    depends_on:
      - surrealdb
    restart: always

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ./ollama_models:/root/.ollama
    restart: always
    # Optional: set GPU support if available
    #deploy:
    #  resources:
    #    reservations:
    #      devices:
    #        - driver: nvidia
    #          count: 1
    #          capabilities: [gpu]

```

**编辑文件：**
- 将 `change-me-to-a-secret-string` 替换为你自己的密钥（任意字符串即可）

---

## 步骤 3：启动服务（1 分钟）

在 `open-notebook-local` 文件夹中打开终端：

```bash
docker compose up -d
```

等待 10–15 秒让所有服务启动。

---

## 步骤 4：下载模型（2–3 分钟）

Ollama 至少需要一个大语言模型。任选其一：

```bash
# Fastest & smallest (recommended for testing)
docker exec open-notebook-local-ollama-1 ollama pull mistral

# OR: Better quality but slower
docker exec open-notebook-local-ollama-1 ollama pull neural-chat

# OR: Even better quality, more VRAM needed
docker exec open-notebook-local-ollama-1 ollama pull llama2
```

将下载模型（视网络情况需 1–5 分钟）。

---

## 步骤 5：访问 Open Notebook（即时）

在浏览器中打开：
```
http://localhost:8502
```

你应能看到 Open Notebook 界面。

---

## 步骤 6：配置 Ollama 提供商（1 分钟）

1. 前往 **Settings** → **API Keys**
2. 点击 **Add Credential**
3. 选择提供商：**Ollama**
4. 命名（例如 "Local Ollama"）
5. 输入 base URL：`http://ollama:11434`
6. 点击 **Save**
7. 点击 **Test Connection** — 应显示成功
8. 点击 **Discover Models** → **Register Models**

---

## 步骤 7：配置本地模型（1 分钟）

1. 前往 **Settings** → **Models**
2. 设置：
   - **Language Model**：`ollama/mistral`（或你下载的模型）
   - **Embedding Model**：`ollama/nomic-embed-text`（缺失时会自动下载）
3. 点击 **Save**

---

## 步骤 8：创建第一个笔记本（1 分钟）

1. 点击 **New Notebook**
2. 名称："My Private Research"
3. 点击 **Create**

---

## 步骤 9：添加本地内容（1 分钟）

1. 点击 **Add Source**
2. 选择 **Text**
3. 粘贴文本或本地文档
4. 点击 **Add**

---

## 步骤 10：与内容对话（1 分钟）

1. 前往 **Chat**
2. 输入："What did you learn from this?"
3. 点击 **Send**
4. 观看本地 Ollama 模型回复！

---

## 验证清单

- [ ] Docker 正在运行
- [ ] 可访问 `http://localhost:8502`
- [ ] Ollama 凭据已配置并测试通过
- [ ] 模型已注册
- [ ] 已创建笔记本
- [ ] 本地模型聊天可用

**全部勾选？** 你已拥有一套完全**私密、可离线**的研究助手！

---

## 本地部署的优势

- **无 API 费用** - 永久免费
- **无需互联网** - 真正离线
- **隐私优先** - 数据永不离开本机
- **无订阅** - 无月费

**权衡：** 比云端模型慢（取决于 CPU/GPU）

---

## 故障排除

### "ollama: command not found"

Docker 镜像名可能不同：
```bash
docker ps  # Find the Ollama container name
docker exec <container_name> ollama pull mistral
```

### 模型下载卡住

检查网络并重启：
```bash
docker compose restart ollama
```

然后重试模型拉取命令。

### "Address already in use" 错误

```bash
docker compose down
docker compose up -d
```

### 性能较低

检查是否有 GPU：
```bash
# Show available GPUs
docker exec open-notebook-local-ollama-1 ollama ps

# Enable GPU in docker-compose.yml
```

然后重启：`docker compose restart ollama`

### 添加更多模型

```bash
# List available models
docker exec open-notebook-local-ollama-1 ollama list

# Pull additional model
docker exec open-notebook-local-ollama-1 ollama pull neural-chat
```

---

## 下一步

**运行起来之后：**

1. **添加你自己的内容**：PDF、文档、文章（见 3-USER-GUIDE）
2. **探索功能**：播客、转换、搜索
3. **完整文档**：[查看全部功能](../3-USER-GUIDE/index.zh.md)
4. **扩展部署**：在硬件更好的服务器上部署以获得更快响应
5. **模型基准测试**：尝试不同模型以找到你偏好的速度/质量平衡

---

## 替代方案：使用 LM Studio 代替 Ollama

**偏好图形界面？** LM Studio 对非技术用户更友好：

1. 下载 LM Studio：https://lmstudio.ai
2. 打开应用，从库中下载模型
3. 进入 "Local Server" 标签页，启动服务器（端口 1234）
4. 在 Open Notebook 中，前往 **Settings** → **API Keys**
5. 点击 **Add Credential** → 选择 **OpenAI-Compatible**
6. 输入 base URL：`http://host.docker.internal:1234/v1`
7. 输入 API key：`lm-studio`（占位符）
8. 点击 **Save**，然后 **Test Connection**
9. 在 Settings → Models 中配置并选择 LM Studio 模型

**注意**：LM Studio 在 Docker 外运行，使用 `host.docker.internal` 连接。

---

## 进一步

- **切换模型**：随时在 Settings → Models 中更改
- **添加更多模型**：
  - Ollama：运行 `ollama pull <model>`，然后从凭据重新发现模型
  - LM Studio：从应用库下载
- **部署到服务器**：同一 docker-compose.yml 可在任意环境使用
- **混合云端**：保留部分本地模型，为复杂任务添加云端提供商凭据

---

## 常用模型选择

| 模型 | 速度 | 质量 | 显存 | 最适合 |
|-------|-------|---------|------|----------|
| **mistral** | 快 | 良好 | 4GB | 测试、通用 |
| **neural-chat** | 中等 | 更好 | 6GB | 平衡，推荐 |
| **llama2** | 慢 | 最佳 | 8GB+ | 复杂推理 |
| **phi** | 极快 | 一般 | 2GB | 最低硬件 |

---

**需要帮助？** 加入我们的 [Discord 社区](https://discord.gg/37XJPXfz2w) — 许多用户运行本地部署！

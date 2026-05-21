# 快速入门 - 云端 AI 提供商（5 分钟）

使用 **Anthropic、Google、Groq 或其他云端提供商** 运行 Open Notebook。与 OpenAI 同样简单，选择更多。

## 前置条件

1. **已安装 Docker Desktop**
   - [在此下载](https://www.docker.com/products/docker-desktop/)
   - 已安装？跳到第 2 步

2. **所选提供商的 API 密钥**：
   - **OpenRouter**（100+ 模型，一个密钥）：https://openrouter.ai/keys
   - **Anthropic (Claude)**：https://console.anthropic.com/
   - **Google (Gemini)**：https://aistudio.google.com/
   - **Groq**（快速，有免费额度）：https://console.groq.com/
   - **Mistral**：https://console.mistral.ai/
   - **DeepSeek**：https://platform.deepseek.com/
   - **xAI (Grok)**：https://console.x.ai/

## 步骤 1：创建配置（1 分钟）

新建文件夹 `open-notebook` 并添加以下文件：

**docker-compose.yml**：
```yaml
services:
  surrealdb:
    image: surrealdb/surrealdb:v2
    command: start --log info --user root --pass root rocksdb:/mydata/mydatabase.db
    user: root
    ports:
      - "8000:8000"
    volumes:
      - ./surreal_data:/mydata
    restart: always

  speaches:
    image: ghcr.io/speaches-ai/speaches:latest-cpu
    container_name: speaches
    ports:
      - "8969:8000"
    volumes:
      - hf-hub-cache:/home/ubuntu/.cache/huggingface/hub
    restart: unless-stopped

  open_notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    ports:
      - "8502:8502"  # Web UI
      - "5055:5055"  # API
    environment:
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=change-me-to-a-secret-string
      - SURREAL_URL=ws://surrealdb:8000/rpc
      - SURREAL_USER=root
      - SURREAL_PASSWORD=root
      - SURREAL_NAMESPACE=open_notebook
      - SURREAL_DATABASE=open_notebook
    volumes:
      - ./notebook_data:/app/data
    depends_on:
      - surrealdb
      - speaches
    restart: always

volumes:
  hf-hub-cache:
```

**编辑文件：**
- 将 `change-me-to-a-secret-string` 替换为你自己的密钥（任意字符串即可）

---

## 步骤 2：启动服务（1 分钟）

在 `open-notebook` 文件夹中打开终端：

```bash
docker compose up -d
```

等待 15–20 秒让服务启动。

---

## 步骤 3：访问 Open Notebook（即时）

在浏览器中打开：
```
http://localhost:8502
```

你应能看到 Open Notebook 界面！

---

## 步骤 4：配置 AI 提供商（1 分钟）

1. 前往 **Settings** → **API Keys**
2. 点击 **Add Credential**
3. 选择你的提供商（如 Anthropic、Google、Groq、OpenRouter）
4. 命名并粘贴 API 密钥
5. 点击 **Save**
6. 点击 **Test Connection** — 应显示成功
7. 点击 **Discover Models** → **Register Models**

该提供商的模型现已可用！

> **多个提供商**：可添加任意多个提供商的凭据，对每个提供商重复本步骤即可。

---

## 步骤 5：配置模型（1 分钟）

1. 前往 **Settings**（齿轮图标）
2. 进入 **Models**
3. 选择该提供商的模型：

| 提供商 | 推荐模型 | 说明 |
|----------|-------------------|-------|
| **OpenRouter** | `anthropic/claude-3.5-sonnet` | 访问 100+ 模型 |
| **Anthropic** | `claude-3-5-sonnet-latest` | 最佳推理能力 |
| **Google** | `gemini-2.0-flash` | 大上下文、快速 |
| **Groq** | `llama-3.3-70b-versatile` | 极快 |
| **Mistral** | `mistral-large-latest` | 欧洲强势选项 |

4. 点击 **Save**

---

## 步骤 6：创建第一个笔记本（1 分钟）

1. 点击 **New Notebook**
2. 名称："My Research"
3. 点击 **Create**

---

## 步骤 7：添加内容并对话（2 分钟）

1. 点击 **Add Source**
2. 选择 **Web Link**
3. 粘贴任意文章 URL
4. 等待处理
5. 前往 **Chat** 提问！

---

## 验证清单

- [ ] Docker 正在运行
- [ ] 可访问 `http://localhost:8502`
- [ ] 提供商凭据已配置并测试通过
- [ ] 模型已注册
- [ ] 已创建笔记本
- [ ] 聊天可用

**全部勾选？** 可以开始研究了！

---

## 提供商对比

| 提供商 | 速度 | 质量 | 上下文 | 成本 |
|----------|-------|---------|---------|------|
| **OpenRouter** | 各异 | 各异 | 各异 | 各异（100+ 模型） |
| **Anthropic** | 中等 | 优秀 | 200K | $$$ |
| **Google** | 快 | 很好 | 1M+ | $$ |
| **Groq** | 极快 | 良好 | 128K | $（免费额度） |
| **Mistral** | 快 | 良好 | 128K | $$ |
| **DeepSeek** | 中等 | 很好 | 64K | $ |

---

## 故障排除

### "Model not found" 错误

1. 前往 **Settings** → **API Keys**
2. 对凭据点击 **Test Connection**
3. 若有效，点击 **Discover Models** → **Register Models**
4. 确认对该模型有额度/访问权限

### "Cannot connect to server"

```bash
docker ps  # Check all services running
docker compose logs  # View logs
docker compose restart  # Restart everything
```

### 提供商特定问题

**Anthropic**：确保密钥以 `sk-ant-` 开头
**Google**：使用 AI Studio 密钥，而非 Cloud Console
**Groq**：免费额度有速率限制；需要时可升级

---

## 成本估算

每 1K tokens 约计：

| 提供商 | 输入 | 输出 |
|----------|-------|--------|
| Anthropic (Sonnet) | $0.003 | $0.015 |
| Google (Flash) | $0.0001 | $0.0004 |
| Groq (Llama 70B) | 有免费额度 | - |
| Mistral (Large) | $0.002 | $0.006 |

当前定价请查看各提供商网站。

---

## 下一步

1. **添加你的内容**：PDF、网页链接、文档
2. **探索功能**：播客、转换、搜索
3. **完整文档**：[查看全部功能](../3-USER-GUIDE/index.zh.md)

---

**需要帮助？** 加入我们的 [Discord 社区](https://discord.gg/37XJPXfz2w)！

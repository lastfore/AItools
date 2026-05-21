# 快速入门 - OpenAI（5 分钟）

使用 OpenAI 的 GPT 模型运行 Open Notebook。快速、强大、简单。

## 前置条件

1. **已安装 Docker Desktop**
   - [在此下载](https://www.docker.com/products/docker-desktop/)
   - 已安装？跳到第 2 步

2. **OpenAI API 密钥**（必需）
   - 前往 https://platform.openai.com/api-keys
   - 创建账户 → 创建新的 secret key
   - 在账户中充值至少 $5
   - 复制密钥（以 `sk-` 开头）

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
      # 凭证加密密钥（必填）
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=change-me-to-a-secret-string

      # 数据库（必填）
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

## 步骤 4：配置 OpenAI 提供商（1 分钟）

1. 前往 **Settings** → **API Keys**
2. 点击 **Add Credential**
3. 选择提供商：**OpenAI**
4. 命名（例如 "My OpenAI Key"）
5. 粘贴你的 OpenAI API 密钥
6. 点击 **Save**
7. 点击 **Test Connection** — 应显示成功
8. 点击 **Discover Models** → **Register Models**

你的 OpenAI 模型现已可用！

---

## 步骤 5：创建第一个笔记本（1 分钟）

1. 点击 **New Notebook**
2. 名称："My Research"
3. 点击 **Create**

---

## 步骤 6：添加来源（1 分钟）

1. 点击 **Add Source**
2. 选择 **Web Link**
3. 粘贴：`https://en.wikipedia.org/wiki/Artificial_intelligence`
4. 点击 **Add**
5. 等待处理（30–60 秒）

---

## 步骤 7：与内容对话（1 分钟）

1. 前往 **Chat**
2. 输入："What is artificial intelligence?"
3. 点击 **Send**
4. 观看 GPT 根据你的来源作答！

---

## 验证清单

- [ ] Docker 正在运行
- [ ] 可访问 `http://localhost:8502`
- [ ] OpenAI 凭据已配置并测试通过
- [ ] 已创建笔记本
- [ ] 已添加来源
- [ ] 聊天可用

**全部勾选？** 你已拥有一个完整可用的 AI 研究助手！

---

## 使用不同模型

在笔记本中，前往 **Settings** → **Models** 选择：
- `gpt-4o` - 最佳质量（推荐）
- `gpt-4o-mini` - 快速且便宜（适合测试）

---

## 故障排除

### "Port 8502 already in use"

在 docker-compose.yml 中更改端口：
```yaml
ports:
  - "8503:8502"  # Use 8503 instead
```

然后通过 `http://localhost:8503` 访问

### "API key not working"

1. 前往 **Settings** → **API Keys**
2. 对你的 OpenAI 凭据点击 **Test Connection**
3. 若失败，在 https://platform.openai.com 验证密钥
4. 删除凭据并用正确密钥重新创建

### "Cannot connect to server"

```bash
docker ps  # Check all services running
docker compose logs  # View logs
docker compose restart  # Restart everything
```

---

## 下一步

1. **添加你自己的内容**：PDF、网页链接、文档
2. **探索功能**：播客、转换、搜索
3. **完整文档**：[查看全部功能](../3-USER-GUIDE/index.zh.md)

---

## 成本估算

OpenAI 定价（约）：
- **对话**：每 1K tokens $0.01–0.10
- **嵌入（Embeddings）**：每 1M tokens $0.02
- **典型用量**：轻度使用约 $1–5/月，重度使用约 $20–50/月

当前费率见 https://openai.com/pricing。

---

**需要帮助？** 加入我们的 [Discord 社区](https://discord.gg/37XJPXfz2w)！

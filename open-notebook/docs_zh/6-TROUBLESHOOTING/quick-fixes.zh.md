# 快速修复 - 11 个常见问题与解决方案

常见问题及一分钟解决方案。

---

## #1：「无法连接服务器」 [原文: Cannot connect to server]

**症状：** 浏览器显示「无法连接服务器」[原文: Cannot connect to server] 或「无法访问 API」[原文: Unable to reach API]

**原因：** 前端无法访问 API

**解决方案（1 分钟）：**

```bash
# Step 1: Check if API is running
docker ps | grep api

# Step 2: Verify port 5055 is accessible
curl http://localhost:5055/health

# Expected output: {"status":"ok"}

# If that doesn't work:
# Step 3: Restart services
docker compose restart

# Step 4: Try again
# Open http://localhost:8502 in browser
```

**若仍失败：**
- 检查 `.env` 中的 `API_URL`（应与前端 URL 一致）
- 参见 [连接问题](connection-issues.zh.md)

---

## #2：「Invalid API key」或模型不显示

**症状：** 设置 → 模型 显示「无可用模型」[原文: No models available]

**原因：** 未配置凭据，或凭据中的 API 密钥无效

**解决方案（1 分钟）：**

```
1. Go to Settings → API Keys
2. If no credential exists, click "Add Credential" and add one
3. If a credential exists, click "Test Connection"
4. If test fails, delete and re-create with correct key
5. After test passes, click "Discover Models" → "Register Models"
6. Go to Settings → Models to verify models appear
```

**若仍失败：**
- 确保密钥无多余空格
- 在提供商控制台生成新密钥
- 确认 `docker-compose.yml` 中已设置 `OPEN_NOTEBOOK_ENCRYPTION_KEY`
- 参见 [AI 与聊天问题](ai-chat-issues.zh.md)

---

## #3：「端口 X 已被占用」 [原文: Port X already in use]

**症状：** Docker 报错「Port 8502 is already allocated」[原文: Port 8502 is already allocated]

**原因：** 其他服务占用该端口

**解决方案（1 分钟）：**

```bash
# Option 1: Stop the other service
# Find what's using port 8502
lsof -i :8502
# Kill it or close the app

# Option 2: Use different port
# Edit docker-compose.yml
# Change: - "8502:8502"
# To:     - "8503:8502"

# Then restart
docker compose restart
# Access at: http://localhost:8503
```

---

## #4：「无法处理文件」或「格式不支持」

**症状：** 上传失败或提示「文件格式不支持」[原文: File format not supported]

**原因：** 文件类型不支持或文件过大

**解决方案（1 分钟）：**

```bash
# Check if file format is supported:
# ✓ PDF, DOCX, PPTX, XLSX (documents)
# ✓ MP3, WAV, M4A (audio)
# ✓ MP4, AVI, MOV (video)
# ✓ URLs/web links

# ✗ Pure images (.jpg without OCR)
# ✗ Files > 100MB

# Try these:
# - Convert to PDF if possible
# - Split large files
# - Try uploading again
```

---

## #5：「聊天很慢」

**症状：** 聊天响应需数分钟或超时

**原因：** AI 提供商慢、上下文过大或系统负载高

**解决方案（1 分钟）：**

```bash
# Step 1: Check which model you're using
# Settings → Models
# Note the model name

# Step 2: Try a cheaper/faster model
# OpenAI: Switch to gpt-4o-mini (10x cheaper, slightly faster)
# Anthropic: Switch to claude-3-5-haiku (fastest)
# Groq: Use any model (ultra-fast)

# Step 3: Reduce context
# Chat: Select fewer sources
# Use "Summary Only" instead of "Full Content"

# Step 4: Check if API is overloaded
docker stats
# Look at CPU/memory usage
```

深入排查：参见 [AI 与聊天问题](ai-chat-issues.zh.md)

---

## #6：「聊天回答质量差」

**症状：** AI 回答笼统、错误或无关

**原因：** 上下文不佳、问题模糊或模型不当

**解决方案（1 分钟）：**

```bash
# Step 1: Make sure sources are in context
# Click "Select Sources" in Chat
# Verify relevant sources are checked and set to "Full Content"

# Step 2: Ask a specific question
# Bad: "What do you think?"
# Good: "Based on the paper's methodology section, what are the 3 main limitations?"

# Step 3: Try a more powerful model
# OpenAI: Use gpt-4o (better reasoning)
# Anthropic: Use claude-3-5-sonnet (best reasoning)

# Step 4: Check citations
# Click citations to verify AI actually saw those sources
```

详细帮助：参见 [高效聊天](../3-USER-GUIDE/chat-effectively.md)

---

## #7：「搜索无结果」

**症状：** 搜索显示 0 条结果，但内容确实存在

**原因：** 搜索类型不当或查询不佳

**解决方案（1 分钟）：**

```bash
# Try a different search type:

# If you searched with KEYWORDS:
# Try VECTOR SEARCH instead
# (Concept-based, not keyword-based)

# If you searched for CONCEPTS:
# Try TEXT SEARCH instead
# (Look for specific words in your query)

# Try simpler search:
# Instead of: "How do transformers work in neural networks?"
# Try: "transformers" or "neural networks"

# Check sources are processed:
# Go to notebook
# All sources should show green "Ready" status
```

详细帮助：参见 [高效搜索](../3-USER-GUIDE/search.md)

---

## #8：「播客生成失败」

**症状：** 显示「播客生成失败」[原文: Podcast generation failed] 错误

**原因：** 内容不足、API 配额或网络问题

**解决方案（1 分钟）：**

```bash
# Step 1: Make sure you have content
# Select at least 1-2 sources
# Avoid single-sentence sources

# Step 2: Try again
# Sometimes it's a temporary API issue
# Wait 30 seconds and retry

# Step 3: Check your TTS provider has quota
# OpenAI: Check account has credits
# ElevenLabs: Check monthly quota
# Google: Check API quota

# Step 4: Try different TTS provider
# In podcast generation, choose "Google" or "Local"
# instead of "ElevenLabs"
```

详细帮助：参见 [常见问题](faq.zh.md)

---

## #9：「服务无法启动」或 Docker 错误

**症状：** 运行 `docker compose up` 时出现 Docker 错误

**原因：** 配置损坏、权限问题或资源不足

**解决方案（1 分钟）：**

```bash
# Step 1: Check logs
docker compose logs

# Step 2: Try restart
docker compose restart

# Step 3: If that fails, rebuild
docker compose down
docker compose up --build

# Step 4: Check disk space
df -h
# Need at least 5GB free

# Step 5: Check Docker has enough memory
# Docker settings → Resources → Memory: 4GB+
```

---

## #10：「数据库连接数过多」 [原文: too many connections]

**症状：** 数据库连接相关错误

**原因：** 并发操作过多

**解决方案（1 分钟）：**

```bash
# In .env, reduce concurrency:
SURREAL_COMMANDS_MAX_TASKS=2

# Then restart:
docker compose restart

# This makes it slower but more stable
```

---

## #11：启动慢或下载超时（中国/慢速网络）

**症状：** 容器启动崩溃、worker 进入 FATAL 状态，或 pip/uv 下载失败

**原因：** 网络慢或无法访问 Python 包仓库

**解决方案：**

### 增加下载超时
```yaml
# In docker-compose.yml environment:
environment:
  - UV_HTTP_TIMEOUT=600  # 10 minutes (default is 30s)
```

### 使用国内镜像（若在中国）
```yaml
environment:
  - UV_HTTP_TIMEOUT=600
  - UV_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
  - PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
```

**其他国内镜像：**
- 清华：`https://pypi.tuna.tsinghua.edu.cn/simple`
- 阿里云：`https://mirrors.aliyun.com/pypi/simple/`
- 华为：`https://repo.huaweicloud.com/repository/pypi/simple`

**说明：** 首次启动可能需数分钟下载依赖，后续启动会更快。

---

## 快速故障排除清单

出现问题时：

- [ ] **重启服务：** `docker compose restart`
- [ ] **查看日志：** `docker compose logs`
- [ ] **验证连通性：** `curl http://localhost:5055/health`
- [ ] **检查 .env：** API 密钥是否设置？`API_URL` 是否正确？
- [ ] **检查资源：** `docker stats`（CPU/内存）
- [ ] **清理缓存：** `docker system prune`（释放空间）
- [ ] **必要时重建：** `docker compose up --build`

---

## 最后手段

**完全重置（将丢失 Docker 内所有数据）：**

```bash
docker compose down -v
docker compose up --build
```

**恢复默认：**
```bash
# Backup your .env first!
cp .env .env.backup

# Reset to example
cp .env.example .env

# Edit with your API keys
# Restart
docker compose up
```

---

## 预防建议

1. **定期备份** — 定期导出笔记本
2. **监控日志** — 定期查看 `docker compose logs`
3. **及时更新** — 拉取最新镜像：`docker pull lfnovo/open_notebook:latest`
4. **记录配置** — 记下您的配置项
5. **更新后测试** — 确认一切正常

---

## 仍然无法解决？

- **按确切错误查找** [故障排除索引](index.zh.md)
- **查看** [常见问题](faq.zh.md)
- **查看日志：** `docker compose logs | head -50`
- **寻求帮助：** [Discord](https://discord.gg/37XJPXfz2w) 或 [GitHub Issues](https://github.com/lfnovo/open-notebook/issues)

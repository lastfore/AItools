# 故障排除 - 问题解决指南

遇到问题？使用本指南诊断并修复。

---

## 如何使用本指南

**步骤 1：识别问题**
- 症状是什么？（错误信息、行为异常、功能不工作？）
- 何时发生？（安装时、使用中、更新后？）

**步骤 2：找到对应指南**
- 在下方查找你的症状
- 前往具体故障排除指南

**步骤 3：按步骤操作**
- 指南按症状而非根因组织
- 每篇包含诊断步骤与解决方案

---

## 快速问题地图

### 安装期间

- **Docker 无法启动** → [快速修复](quick-fixes.zh.md#9-services-wont-start-or-docker-error)
- **端口已被占用** → [快速修复](quick-fixes.zh.md#3-port-x-already-in-use)
- **权限被拒绝** [原文: Permission denied] → [快速修复](quick-fixes.zh.md#9-services-wont-start-or-docker-error)
- **无法连接数据库** → [连接问题](connection-issues.zh.md)

### 启动时

- **API 无法启动** → [快速修复](quick-fixes.zh.md#9-services-wont-start-or-docker-error)
- **前端无法加载** → [连接问题](connection-issues.zh.md)
- **"Cannot connect to server" 错误** → [连接问题](connection-issues.zh.md)

### 设置 / 配置

- **模型不显示** → [AI 与聊天问题](ai-chat-issues.zh.md)
- **"Invalid API key"** → [AI 与聊天问题](ai-chat-issues.zh.md)
- **找不到 Settings** → [快速修复](quick-fixes.zh.md)

### 使用功能

- **聊天不工作** → [AI 与聊天问题](ai-chat-issues.zh.md)
- **聊天响应很慢** → [AI 与聊天问题](ai-chat-issues.zh.md)
- **聊天回答质量差** → [AI 与聊天问题](ai-chat-issues.zh.md)

### 添加内容

- **无法上传 PDF** → [快速修复](quick-fixes.zh.md#4-cannot-process-file-or-unsupported-format)
- **文件无法处理** → [快速修复](quick-fixes.zh.md#4-cannot-process-file-or-unsupported-format)
- **网页链接无法提取** → [快速修复](quick-fixes.zh.md#4-cannot-process-file-or-unsupported-format)

### 搜索

- **搜索无结果** → [快速修复](quick-fixes.zh.md#7-search-returns-nothing)
- **搜索结果错误** → [快速修复](quick-fixes.zh.md#7-search-returns-nothing)

### 播客

- **无法生成播客** → [快速修复](quick-fixes.zh.md#8-podcast-generation-failed)
- **播客显示 "FAILED" 徽章** → 查看剧集上的错误信息，然后使用 **Retry** 按钮。见[播客说明](../2-CORE-CONCEPTS/podcasts-explained.zh.md#when-things-go-wrong-failures--retry)
- **播客音频生硬** → [快速修复](quick-fixes.zh.md#8-podcast-generation-failed)
- **播客生成超时** → [快速修复](quick-fixes.zh.md#8-podcast-generation-failed)

---

## 按错误信息排查

### "Cannot connect to server"
→ [连接问题](connection-issues.zh.md) — 前端无法访问 API

### "Invalid API key"
→ [AI 与聊天问题](ai-chat-issues.zh.md) — API 密钥错误或缺失

### "Models not available"
→ [AI 与聊天问题](ai-chat-issues.zh.md) — 模型未配置

### "Connection refused"
→ [连接问题](connection-issues.zh.md) — 服务未运行或端口错误

### "Port already in use"
→ [快速修复](quick-fixes.zh.md#3-port-x-already-in-use) — 端口冲突

### "Permission denied"
→ [快速修复](quick-fixes.zh.md#9-services-wont-start-or-docker-error) — 文件权限问题

### "Unsupported file type"
→ [快速修复](quick-fixes.zh.md#4-cannot-process-file-or-unsupported-format) — 不支持的文件格式

### "Processing timeout"
→ [快速修复](quick-fixes.zh.md#5-chat-is-very-slow) — 文件过大或处理过慢

---

## 按组件排查

### 前端（浏览器/UI）
- 无法访问 UI → [连接问题](connection-issues.zh.md)
- UI 很慢 → [快速修复](quick-fixes.zh.md)
- 按钮/功能缺失 → [快速修复](quick-fixes.zh.md)

### API（后端）
- API 无法启动 → [快速修复](quick-fixes.zh.md#9-services-wont-start-or-docker-error)
- API 日志报错 → [快速修复](quick-fixes.zh.md#9-services-wont-start-or-docker-error)
- API 很慢 → [快速修复](quick-fixes.zh.md)

### 数据库
- 无法连接数据库 → [连接问题](connection-issues.zh.md)
- 重启后数据丢失 → [FAQ](faq.zh.md#how-do-i-backup-my-data)

### AI / 聊天
- 聊天不工作 → [AI 与聊天问题](ai-chat-issues.zh.md)
- 回答质量差 → [AI 与聊天问题](ai-chat-issues.zh.md)
- 成本过高 → [AI 与聊天问题](ai-chat-issues.zh.md#high-api-costs)

### 来源
- 无法上传文件 → [快速修复](quick-fixes.zh.md#4-cannot-process-file-or-unsupported-format)
- 文件无法处理 → [快速修复](quick-fixes.zh.md#4-cannot-process-file-or-unsupported-format)

### 播客
- 无法生成 → [快速修复](quick-fixes.zh.md#8-podcast-generation-failed)
- 音质差 → [快速修复](quick-fixes.zh.md#8-podcast-generation-failed)

---

## 诊断清单

**当某功能不工作时：**

- [ ] 检查服务是否运行：`docker ps`
- [ ] 查看日志：`docker compose logs api`（或 frontend、surrealdb）
- [ ] 验证端口已暴露：`netstat -tlnp` 或 `lsof -i :5055`
- [ ] 测试连通性：`curl http://localhost:5055/health`
- [ ] 检查环境变量：`docker inspect <container>`
- [ ] 尝试重启：`docker compose restart`
- [ ] 检查防火墙/杀毒软件是否拦截

---

## 获取帮助

若此处找不到答案：

1. **阅读相关指南** — 完整阅读并尝试所有步骤
2. **查看 FAQ** — [常见问题](faq.zh.md)
3. **在 Discord 搜索** — 他人可能遇到过相同问题
4. **查看日志** — 多数问题会在日志中显示错误信息
5. **在 GitHub 报告** — 附上错误信息、复现步骤

### 如何报告 Issue

请包含：
1. 错误信息（原文）
2. 复现步骤
3. 日志：`docker compose logs`
4. 你的环境：Docker/本地、提供商、操作系统
5. 你已尝试的措施

→ [在 GitHub 报告](https://github.com/lfnovo/open-notebook/issues)

---

## 指南

### [快速修复](quick-fixes.zh.md)
十大最常见问题及 1 分钟解决方案。

### [连接问题](connection-issues.zh.md)
前端无法访问 API、网络问题。

### [AI 与聊天问题](ai-chat-issues.zh.md)
聊天不工作、回答质量差、性能慢。

### [FAQ](faq.zh.md)
关于使用、成本与最佳实践的常见问题。

---

## 常见解决方案

**服务无法启动？**
```bash
# Check logs
docker compose logs

# Restart everything
docker compose restart

# Nuclear option: rebuild
docker compose down
docker compose up --build
```

**端口冲突？**
```bash
# Find what's using port 5055
lsof -i :5055
# Kill it or use different port
```

**无法连接？**
```bash
# Test API directly
curl http://localhost:5055/health
# Should return: {"status":"ok"}
```

**性能慢？**
```bash
# Check resource usage
docker stats

# Reduce concurrency in .env
SURREAL_COMMANDS_MAX_TASKS=2
```

**成本过高？**
```bash
# Switch to cheaper model
# In Settings → Models → Choose gpt-4o-mini (OpenAI)
# Or use Ollama (free)
```

---

## 仍然卡住？

**求助前：**
1. 完整阅读相关指南
2. 尝试所有步骤
3. 查看日志
4. 重启服务
5. 在 GitHub 搜索已有 Issue

**然后：**
- **Discord**：https://discord.gg/37XJPXfz2w（响应最快）
- **GitHub Issues**：https://github.com/lfnovo/open-notebook/issues

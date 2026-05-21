# 常见问题

关于 Open Notebook 使用、配置与最佳实践的常见问题。

---

## 一般使用

### 什么是 Open Notebook？

Open Notebook 是开源、注重隐私的 Google Notebook LM 替代方案，支持：
- 创建与管理研究笔记本
- 使用 AI 与文档对话
- 根据内容生成播客
- 通过语义搜索检索所有来源
- 转换与分析内容

### 与 Google Notebook LM 有何不同？

**隐私**：数据默认保留在本地，仅您选择的 AI 提供商会收到查询。
**灵活性**：支持 17+ 家 AI 提供商（OpenAI、Anthropic、Google、本地模型等）
**可定制**：开源，可修改与扩展功能
**可控**：您掌控数据、模型与处理流程

### 能否离线使用 Open Notebook？

**部分可以**：应用本地运行，但需要网络用于：
- AI 模型 API 调用（除非使用 Ollama 等本地模型）
- 网页内容抓取

**完全离线**：配合本地模型（Ollama）可实现基础功能。

### 支持哪些文件类型？

**文档**：PDF、DOCX、TXT、Markdown
**网页内容**：URL、YouTube 视频
**媒体**：MP3、WAV、M4A（音频），MP4、AVI、MOV（视频）
**其他**：直接文本输入、CSV、代码文件

### 费用如何？

**软件**：免费（开源）
**AI API 费用**：按提供商用量计费：
- OpenAI：约 $0.50–5 / 100 万 token
- Anthropic：约 $3–75 / 100 万 token
- Google：常有免费额度
- 本地模型：初次配置后免费

**典型月费**：中等使用量约 $5–50。

---

## AI 模型与提供商

### 应选择哪家 AI 提供商？

**新手**：OpenAI（稳定、文档完善）
**注重隐私**：本地模型（Ollama）或欧洲提供商（Mistral）
**控制成本**：Groq、Google（免费层）或 OpenRouter
**长上下文**：Anthropic（200K token）或 Google Gemini（1M token）

### 能否使用多家提供商？

**可以**：为不同任务配置不同提供商：
- OpenAI 用于聊天
- Google 用于嵌入
- ElevenLabs 用于文本转语音
- Anthropic 用于复杂推理

### 推荐的模型组合？

**经济型**：
- 语言：`gpt-4o-mini`（OpenAI）或 `deepseek-chat`
- 嵌入：`text-embedding-3-small`（OpenAI）

**高质量**：
- 语言：`claude-3-5-sonnet`（Anthropic）或 `gpt-4o`（OpenAI）
- 嵌入：`text-embedding-3-large`（OpenAI）

**注重隐私**：
- 语言：本地 Ollama 模型（mistral、llama3）
- 嵌入：本地嵌入模型

### 如何优化 AI 费用？

**模型选择**：
- 简单任务使用较小模型（gpt-4o-mini、claude-3-5-haiku）
- 仅在复杂推理时使用大模型
- 善用免费额度

**使用优化**：
- 对背景来源使用「仅摘要」上下文
- 提出更具体的问题
- 频繁任务使用本地模型（Ollama）

---

## 数据管理

### 数据存储在哪里？

**本地存储**：默认所有数据存于本地：
- 数据库：`surreal_data/` 中的 SurrealDB 文件
- 上传：`data/uploads/` 中的文件
- 播客：生成的音频在 `data/podcasts/`
- 无外部数据传输（除所选 AI 提供商外）

### 如何备份数据？

```bash
# Create backup
tar -czf backup-$(date +%Y%m%d).tar.gz data/ surreal_data/

# Restore backup
tar -xzf backup-20240101.tar.gz
```

### 能否在设备间同步数据？

**目前**：无内置同步功能。
**变通**：
- 对数据目录使用共享网络存储
- 在设备间手动备份/恢复

### 删除笔记本会怎样？

**软删除**：笔记本标记为已归档，非永久删除。
**恢复**：可从数据库恢复已归档笔记本。

---

## 最佳实践

### 如何组织笔记本？

- **按主题**：不同研究领域使用独立笔记本
- **按项目**：每个项目或课程一个笔记本
- **按时间段**：按月或按季度划分

**建议规模**：每个笔记本 20–100 个来源以获得最佳性能。

### 如何获得最佳搜索结果？

- 使用描述性查询（如「数据分析方法」而非仅「数据」）
- 组合多个相关术语
- 使用自然语言（像对人提问一样）
- 同时尝试文本搜索（关键词）与向量搜索（概念）

### 如何提升聊天回答质量？

- 提供上下文：引用具体来源或主题
- 具体提问：详细问题优于笼统问题
- 要求引用：「请附页码引用作答」
- 使用追问：在前一轮回答基础上继续

### 安全最佳实践有哪些？

- 切勿公开分享 API 密钥
- 公开部署时使用 `OPEN_NOTEBOOK_PASSWORD`
- 生产环境通过反向代理使用 HTTPS
- 保持 Docker 镜像更新
- 若备份含敏感数据请加密

---

## 技术问题

### 能否以编程方式使用 Open Notebook？

**可以**：Open Notebook 提供 REST API：
- 完整 API 文档：`http://localhost:5055/docs`
- 支持所有 UI 功能
- 通过密码请求头认证

### 能否在生产环境运行 Open Notebook？

**可以**：面向生产设计，具备：
- Docker 部署
- 安全特性（密码保护）
- 监控与日志
- 反向代理支持（nginx、Caddy、Traefik）

### 系统要求是什么？

**最低**：
- 4GB 内存
- 2 核 CPU
- 10GB 磁盘

**推荐**：
- 8GB+ 内存
- 4+ 核 CPU
- SSD 存储
- 本地模型：16GB+ 内存，建议 GPU

---

## 超时与性能

### 为何出现超时错误？

**常见原因**：
- 上下文过大（来源过多）
- AI 提供商响应慢
- CPU 上运行本地模型（慢）
- 首次请求（模型加载）

**解决方案**：
```bash
# In .env:
API_CLIENT_TIMEOUT=600  # 10 minutes for slow setups
ESPERANTO_LLM_TIMEOUT=180  # 3 minutes for model inference
```

### 按部署环境推荐的超时：

| 部署方式 | API_CLIENT_TIMEOUT |
|-------|-------------------|
| 云端 API（OpenAI、Anthropic） | 300（默认） |
| 带 GPU 的本地 Ollama | 600 |
| 仅 CPU 的本地 Ollama | 1200 |
| 远程 LM Studio | 900 |

---

## 获取帮助

### 此处未解答我的问题

1. 查看本节的故障排除指南
2. 搜索已有 GitHub issue
3. 在 Discord 社区提问
4. 创建 GitHub issue 并提供详细信息

### 如何报告缺陷？

请包含：
- 复现步骤
- 预期与实际行为
- 错误消息与日志
- 系统信息
- 配置详情（勿含 API 密钥）

提交至：[GitHub Issues](https://github.com/lfnovo/open-notebook/issues)

### 在哪里获取帮助？

- **Discord**：https://discord.gg/37XJPXfz2w（最快）
- **GitHub Issues**：缺陷报告与功能请求
- **文档**：本站文档

---

## 相关

- [快速修复](quick-fixes.zh.md) - 常见问题一分钟解决
- [AI 与聊天问题](ai-chat-issues.zh.md) - 模型与聊天问题
- [连接问题](connection-issues.zh.md) - 网络与 API 问题

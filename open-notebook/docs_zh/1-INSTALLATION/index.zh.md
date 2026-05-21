# 安装指南

根据你的环境与使用场景选择安装方式。

## 快速决策：选哪条路径？

### 🚀 我想要最简单的部署（推荐大多数用户）
**→ [Docker Compose](docker-compose.zh.md)** — 多容器部署，可用于生产
- ✅ 全部功能可用
- ✅ 服务清晰分离
- ✅ 易于扩展
- ✅ 支持 Mac、Windows、Linux
- ⏱️ 约 5 分钟即可运行

---

### 🏠 我想要单容器一体化（已弃用）
**→ [单容器](single-container.zh.md)** — 已弃用，将在 v2 中移除
- ⚠️ **已弃用** — 请改用 Docker Compose
- v2 发布前仍受支持

---

### 👨‍💻 我想开发/贡献（仅开发者）
**→ [从源码安装](from-source.zh.md)** — 克隆仓库并在本地运行
- ✅ 完全掌控代码
- ✅ 易于调试
- ✅ 可修改与测试
- ⚠️ 需要 Python 3.11+、Node.js
- ⏱️ 约 10 分钟即可运行
- **Windows：** 使用 `.\start-dev.ps1` — 见 [Windows 部署指南](../spec/windows-deployment.zh.md)

---


## 系统要求

### 最低配置
- **内存**：4GB
- **存储**：应用 2GB + 文档空间
- **CPU**：任意现代处理器
- **网络**：互联网（离线部署可选）

### 推荐配置
- **内存**：8GB+
- **存储**：文档与模型 10GB+
- **CPU**：多核处理器
- **GPU**：可选（加速本地 AI 模型）

---

## AI 提供商选项

### 云端（按量付费）
- **OpenAI** — GPT-4、GPT-4o，快速且能力强
- **Anthropic (Claude)** — Claude 3.5 Sonnet，推理出色
- **Google Gemini** — 多模态，性价比高
- **Groq** — 推理极快
- **其他**：Mistral、DeepSeek、xAI、OpenRouter

**成本**：通常每 1K tokens $0.01–$0.10
**速度**：快（亚秒级）
**隐私**：数据发送至云端

### 本地（免费、私密）
- **Ollama** — 本地运行开源模型
- **LM Studio** — 本地模型的桌面应用
- **Hugging Face 模型** — 下载并运行

**成本**：$0（仅电费）
**速度**：取决于硬件（慢到中等）
**隐私**：100% 离线

---

## 选择路径

**已确定方向？** 选择你的安装路径：

- [Docker Compose](docker-compose.zh.md) - **大多数用户**
- [单容器](single-container.zh.md) - **已弃用**
- [从源码安装](from-source.zh.md) - **开发者**
- [Windows 部署](../spec/windows-deployment.zh.md) - **Windows 用户**

> **注重隐私？** 任意安装方式均可配合 Ollama 实现 100% 本地 AI。见[本地快速入门](../0-START-HERE/quick-start-local.zh.md)。

---

## 安装前检查清单

安装前请准备：

- [ ] **Docker**（Docker 路径）或 **Node.js 18+**（源码路径）
- [ ] **AI 提供商 API 密钥**（OpenAI、Anthropic 等）或愿意使用免费本地模型
- [ ] **至少 4GB 可用内存**
- [ ] **稳定网络**（或使用 Ollama 离线部署）

---

## 详细安装说明

### Docker 用户
1. 安装 [Docker Desktop](https://docker.com/products/docker-desktop)
2. 跟随 [Docker Compose](docker-compose.zh.md) 安装
3. 按分步指南操作
4. 在 `http://localhost:8502` 访问

### 源码安装（开发者）
1. 安装 Python 3.11+、Node.js 18+、Git
2. 跟随[从源码安装](from-source.zh.md)
3. **macOS/Linux：** 运行 `make start-all` · **Windows：** 运行 `.\start-dev.ps1`（[指南](../spec/windows-deployment.zh.md)）
4. 在 `http://localhost:3000`（前端）或 `http://localhost:5055`（API）访问

---

## 安装之后

运行起来后：

1. **配置模型** — 在 Settings 中选择 AI 提供商
2. **创建第一个笔记本** — 开始整理研究
3. **添加来源** — PDF、网页链接、文档
4. **探索功能** — 聊天、搜索、转换
5. **阅读完整指南** — [用户指南](../3-USER-GUIDE/index.zh.md)

---

## 安装期间故障排除

**遇到问题？** 查看所选安装指南中的故障排除部分，或参阅[快速修复](../6-TROUBLESHOOTING/quick-fixes.zh.md)。

---

## 需要帮助？

- **Discord**：[加入社区](https://discord.gg/37XJPXfz2w)
- **GitHub Issues**：[报告问题](https://github.com/lfnovo/open-notebook/issues)
- **文档**：见[完整文档](../index.zh.md)

---

## 生产环境部署

用于生产？请参阅额外资源：

- [安全加固](../5-CONFIGURATION/security.zh.md)
- [反向代理设置](../5-CONFIGURATION/reverse-proxy.zh.md)
- [性能调优](../5-CONFIGURATION/advanced.zh.md)

---

**准备安装？** 在上方选择路径！ ⬆️

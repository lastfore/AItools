# Open Notebook 文档

欢迎使用 Open Notebook——一款注重隐私的 AI 研究助手。本文档按不同需求分类组织。

---

## 🎯 选择你的路径

### 我是全新用户
→ 从这里开始：**[0-START-HERE](0-START-HERE/index.zh.md)**
- 了解 Open Notebook 是什么
- 选择你的部署路径（OpenAI、云端、本地/Ollama）
- 5 分钟快速入门

### 我需要安装/部署
→ 前往：**[1-INSTALLATION](1-INSTALLATION/index.zh.md)**
- 多种安装方式
- Docker Compose（推荐）
- 从源码安装（开发者）
- **[Windows 部署指南](spec/windows-deployment.zh.md)**（Docker Compose + `start-dev.ps1`）
- ~~单容器~~（已弃用，请参阅 Docker Compose）

### 我想了解其工作原理
→ 阅读：**[2-CORE-CONCEPTS](2-CORE-CONCEPTS/index.zh.md)**
- 心智模型与架构
- RAG（检索增强生成）如何工作
- 笔记本、来源与笔记说明
- 聊天 vs. 转换 vs. 播客

### 我想学习如何使用（教程）
→ 跟随：**[3-USER-GUIDE](3-USER-GUIDE/index.zh.md)**
- 如何添加来源（PDF、URL、音频、视频）
- 创建与整理笔记
- 与研究内容高效对话
- 从研究生成播客
- 搜索技巧

### 我需要配置
→ 查看：**[5-CONFIGURATION](5-CONFIGURATION/index.zh.md)**
- 选择与配置 AI 提供商
- API 配置
- 数据库设置
- 高级调优

### 我需要提供商相关帮助
→ 前往：**[4-AI-PROVIDERS](4-AI-PROVIDERS/index.zh.md)**
- OpenAI、Anthropic、Google、Groq、Ollama、Azure
- 模型对比
- 成本估算
- 配置路径

### 遇到问题
→ 故障排除：**[6-TROUBLESHOOTING](6-TROUBLESHOOTING/index.zh.md)**
- 快速修复（前 10 大问题）
- 安装问题
- 连接问题
- AI/聊天问题
- 内容处理问题
- 播客问题

### 我想贡献/开发
→ 阅读：**[7-DEVELOPMENT](7-DEVELOPMENT/index.zh.md)**
- 架构与技术栈
- 贡献指南
- API 参考
- 测试

---

## 📊 文档概览

### 按章节

**[0-START-HERE](0-START-HERE/index.zh.md)** — 入口
- 什么是 Open Notebook？
- 快速入门指南（3 条路径）
- 前 5 分钟

**[1-INSTALLATION](1-INSTALLATION/index.zh.md)** — 运行部署
- 多种安装方式
- Docker Compose（推荐）、从源码安装
- 要求与设置

**[2-CORE-CONCEPTS](2-CORE-CONCEPTS/index.zh.md)** — 理解系统
- 笔记本、来源、笔记层级
- RAG（检索增强生成）
- 聊天、转换、播客
- 上下文管理

**[3-USER-GUIDE](3-USER-GUIDE/index.zh.md)** — 使用功能
- 添加来源（所有类型）
- 使用笔记
- 高效聊天
- 创建播客
- 搜索（文本与语义）

**[4-AI-PROVIDERS](4-AI-PROVIDERS/index.zh.md)** — AI 配置
- 提供商对比
- 各提供商配置
- 模型推荐
- 成本估算

**[5-CONFIGURATION](5-CONFIGURATION/index.zh.md)** — 完整参考
- AI 提供商设置（详细）
- 数据库配置
- 服务器/API 设置
- 高级调优
- 环境变量（完整参考）

**[6-TROUBLESHOOTING](6-TROUBLESHOOTING/index.zh.md)** — 问题解决
- 快速修复（前 10 项）
- 安装问题
- 连接问题
- AI/聊天问题
- 内容处理
- 播客生成
- 获取帮助

**[7-DEVELOPMENT](7-DEVELOPMENT/index.zh.md)** — 面向贡献者
- 架构
- 贡献指南
- API 参考
- 测试与开发

---

## 🔍 按需查找

### 按问题类型

**安装与设置**
- 全新安装？ → [0-START-HERE](0-START-HERE/index.zh.md)
- 详细安装方式？ → [1-INSTALLATION](1-INSTALLATION/index.zh.md)
- 配置参考？ → [5-CONFIGURATION](5-CONFIGURATION/index.zh.md)
- 提供商设置？ → [4-AI-PROVIDERS](4-AI-PROVIDERS/index.zh.md)

**使用 Open Notebook**
- 如何使用功能？ → [3-USER-GUIDE](3-USER-GUIDE/index.zh.md)
- 理解概念？ → [2-CORE-CONCEPTS](2-CORE-CONCEPTS/index.zh.md)
- 聊天不工作？ → [6-TROUBLESHOOTING - AI 问题](6-TROUBLESHOOTING/ai-chat-issues.zh.md)
- 文件无法上传？ → [6-TROUBLESHOOTING - 快速修复](6-TROUBLESHOOTING/quick-fixes.zh.md#4-cannot-process-file-or-unsupported-format)

**故障排除**
- 快速修复？ → [6-TROUBLESHOOTING - 快速修复](6-TROUBLESHOOTING/quick-fixes.zh.md)
- 无法连接？ → [6-TROUBLESHOOTING - 连接](6-TROUBLESHOOTING/connection-issues.zh.md)
- 聊天问题？ → [6-TROUBLESHOOTING - AI 问题](6-TROUBLESHOOTING/ai-chat-issues.zh.md)
- 播客问题？ → [6-TROUBLESHOOTING - 快速修复](6-TROUBLESHOOTING/quick-fixes.zh.md#8-podcast-generation-failed)

**开发**
- 架构？ → [7-DEVELOPMENT - 架构](7-DEVELOPMENT/architecture.zh.md)
- 贡献？ → [7-DEVELOPMENT - 贡献](7-DEVELOPMENT/contributing.zh.md)
- API 参考？ → [7-DEVELOPMENT - API 参考](7-DEVELOPMENT/api-reference.zh.md)

---

## 📚 阅读路径

### 路径 1：完全新手（1–2 小时）
1. [0-START-HERE/index.zh.md](0-START-HERE/index.zh.md) — 了解它是什么
2. [0-START-HERE 快速入门](0-START-HERE/index.zh.md) — 完成部署
3. [2-CORE-CONCEPTS/index.zh.md](2-CORE-CONCEPTS/index.zh.md) — 理解概念
4. [3-USER-GUIDE/index.zh.md](3-USER-GUIDE/index.zh.md) — 学习功能

**结果：** 全面理解如何使用 Open Notebook

### 路径 2：快速上手（15 分钟）
1. [0-START-HERE](0-START-HERE/index.zh.md) — 选择你的路径
2. 按你的环境跟随对应快速入门指南
3. 开始使用！

**结果：** 15 分钟内运行起来，细节稍后再学

### 路径 3：运维/部署（1–2 小时）
1. [1-INSTALLATION](1-INSTALLATION/index.zh.md) — 了解安装方式
2. [5-CONFIGURATION](5-CONFIGURATION/index.zh.md) — 参考配置
3. [7-DEVELOPMENT - 架构](../7-DEVELOPMENT/architecture.zh.md) — 理解系统

**结果：** 准备好部署到生产环境

### 路径 4：故障排除（5–30 分钟）
1. [6-TROUBLESHOOTING/index.zh.md](6-TROUBLESHOOTING/index.zh.md) — 定位问题
2. 找到对应指南
3. 按方案解决

**结果：** 问题解决！

---

## ❓ 常见问题

**问：从哪里开始？**
答：→ [0-START-HERE](0-START-HERE/index.zh.md) — 选择你的部署路径

**问：如何安装？**
答：→ [1-INSTALLATION](1-INSTALLATION/index.zh.md) — 提供多种安装方式

**问：如何使用 [某功能]？**
答：→ [3-USER-GUIDE](3-USER-GUIDE/index.zh.md) — 分步教程

**问：为什么 [某功能] 这样工作？**
答：→ [2-CORE-CONCEPTS](2-CORE-CONCEPTS/index.zh.md) — 理解心智模型

**问：如何配置 [某提供商]？**
答：→ [4-AI-PROVIDERS](4-AI-PROVIDERS/index.zh.md) 或 [5-CONFIGURATION](5-CONFIGURATION/index.zh.md)

**问：出问题了怎么办？**
答：→ [6-TROUBLESHOOTING](6-TROUBLESHOOTING/index.zh.md) — 问题解决

**问：系统如何工作？**
答：→ [2-CORE-CONCEPTS](2-CORE-CONCEPTS/index.zh.md) — 架构与概念

**问：可以贡献吗？**
答：→ [7-DEVELOPMENT](../7-DEVELOPMENT/index.zh.md) — 贡献指南

---

## 📖 文档组织方式

### 原则
- **渐进式披露**：从简单开始，需要时再深入
- **多入口路径**：不同用户走不同路线
- **高信噪比**：内容聚焦，无冗余
- **分步说明**：可跟随的清晰指令
- **决策树**：帮你选对路径
- **按症状排查**：按故障现象排除问题

### 结构
- **0-START-HERE** — 入口（人人从这里开始）
- **1-INSTALLATION** — 多种安装方式
- **2-CORE-CONCEPTS** — 心智模型（理解原因）
- **3-USER-GUIDE** — 如何使用（分步）
- **4-AI-PROVIDERS** — 提供商指南
- **5-CONFIGURATION** — 参考材料
- **6-TROUBLESHOOTING** — 问题解决
- **7-DEVELOPMENT** — 面向贡献者

---

## 🚀 快速导航

### 第一次使用？
→ **[从这里开始](0-START-HERE/index.zh.md)**

### 只想用起来？
→ **[快速入门](0-START-HERE/index.zh.md)**（5 分钟）

### 出问题了？
→ **[故障排除](6-TROUBLESHOOTING/index.zh.md)**

### 需要完整参考？
→ **[配置](5-CONFIGURATION/index.zh.md)**

### 开发者？
→ **[开发](7-DEVELOPMENT/index.zh.md)**

---

## 📞 获取帮助

- **Discord 社区** — https://discord.gg/37XJPXfz2w
- **GitHub Issues** — https://github.com/lfnovo/open-notebook/issues
- **文档** — 你正在阅读的就是！

---

## 📈 文档统计

- **8 个主要章节**
- **35+ 篇专题指南**
- **约 80,000 字**
- **覆盖全部功能**
- **多种入口路径**
- **难度递进**

---

## 🎯 从这里开始

**第一次使用 Open Notebook？**
→ 前往 **[0-START-HERE](0-START-HERE/index.zh.md)**

**已有经验，需要特定帮助？**
→ 使用上方导航找到对应章节

**遇到问题？**
→ 前往 **[故障排除](6-TROUBLESHOOTING/index.zh.md)**

---

最后更新：2026 年 1 月 | Open Notebook v1.2.4+

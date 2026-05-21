# AI 提供商 — 对比与选型指南

Open Notebook 支持 17+ 家 AI 提供商。本指南帮助您**根据需求选择合适的提供商**。

> 💡 **只想完成提供商配置？** 可直接跳转到[配置指南](../5-CONFIGURATION/ai-providers.zh.md)，查看详细设置说明。

---

## 快速决策：选哪家提供商？

### 云端提供商（最简单）

**OpenAI（推荐）**
- 成本：约 $0.03–0.15 / 1K tokens
- 速度：非常快
- 质量：优秀
- 最适合：大多数用户（质量与价格平衡最佳）

→ [设置指南](../5-CONFIGURATION/ai-providers.zh.md#openai)

**Anthropic（Claude）**
- 成本：约 $0.80–3.00 / 1M tokens
- 速度：快
- 质量：优秀
- 最适合：长上下文（200K tokens）、推理、最新 AI 能力
- 优势：长上下文处理能力突出

→ [设置指南](../5-CONFIGURATION/ai-providers.zh.md#anthropic-claude)

**Google Gemini**
- 成本：约 $0.075–0.30 / 1K tokens
- 速度：非常快
- 质量：良好至优秀
- 最适合：多模态（图像、音频、视频）
- 优势：最长上下文（最高 2M tokens）

→ [设置指南](../5-CONFIGURATION/ai-providers.zh.md#google-gemini)

**Groq（超高速）**
- 成本：约 $0.05 / 1M tokens（最便宜）
- 速度：超快（业界领先）
- 质量：良好
- 最适合：预算有限、转换任务、对速度敏感的场景
- 劣势：可选模型较少

→ [设置指南](../5-CONFIGURATION/ai-providers.zh.md#groq)

**OpenRouter（100+ 模型）**
- 成本：按模型计费（差异较大）
- 速度：因模型而异
- 质量：因模型而异
- 最适合：模型对比、测试、统一账单
- 优势：一个 API 密钥即可访问 100+ 家提供商的模型

→ [设置指南](../5-CONFIGURATION/ai-providers.zh.md#openrouter)

**DashScope（Qwen）**
- 成本：约 $0.01–0.06 / 1K tokens
- 速度：快
- 质量：良好
- 最适合：亚洲用户、阿里云生态
- 优势：价格有竞争力，多语言支持强

→ [设置指南](../5-CONFIGURATION/ai-providers.zh.md#dashscope-qwen)

**MiniMax**
- 成本：因模型而异
- 速度：快
- 质量：良好
- 最适合：长上下文任务（204K tokens）
- 优势：上下文窗口非常长

→ [设置指南](../5-CONFIGURATION/ai-providers.zh.md#minimax)

### 本地 / 自托管（免费）

**Ollama（本地推荐）**
- 成本：免费（仅电费）
- 速度：取决于硬件（CPU 较慢，GPU 较快）
- 质量：良好（开源模型）
- 部署：约 10 分钟
- 最适合：隐私优先、离线使用
- 隐私：完全本地，数据不离开本机

→ [设置指南](../5-CONFIGURATION/ai-providers.zh.md#ollama-recommended-for-local)

**LM Studio（替代方案）**
- 成本：免费（仅电费）
- 速度：取决于硬件
- 质量：良好（与 Ollama 同类模型）
- 部署：约 15 分钟（图形界面）
- 最适合：偏好 GUI 而非 CLI 的非技术用户
- 隐私：完全本地

→ [设置指南](../5-CONFIGURATION/ai-providers.zh.md#lm-studio-local-alternative)

### 企业级

**Azure OpenAI**
- 成本：与 OpenAI 相同（按用量）
- 速度：非常快
- 质量：优秀（与 OpenAI 同款模型）
- 部署：约 10 分钟（配置更复杂）
- 最适合：企业、合规（HIPAA、SOC2）、VPC 集成

→ [设置指南](../5-CONFIGURATION/ai-providers.zh.md#azure-openai)

---

## 对比表

| 提供商 | 速度 | 成本 | 质量 | 隐私 | 部署 | 上下文 |
|----------|-------|------|---------|---------|-------|---------|
| **OpenAI** | 非常快 | $$ | 优秀 | 低 | 5 分钟 | 128K |
| **Anthropic** | 快 | $$ | 优秀 | 低 | 5 分钟 | 200K |
| **Google** | 非常快 | $$ | 良好–优秀 | 低 | 5 分钟 | 2M |
| **Groq** | 超快 | $ | 良好 | 低 | 5 分钟 | 32K |
| **OpenRouter** | 不一 | 不一 | 不一 | 低 | 5 分钟 | 不一 |
| **DashScope** | 快 | $ | 良好 | 低 | 5 分钟 | 不一 |
| **MiniMax** | 快 | $$ | 良好 | 低 | 5 分钟 | 204K |
| **Ollama** | 慢–中 | 免费 | 良好 | 最高 | 10 分钟 | 不一 |
| **LM Studio** | 慢–中 | 免费 | 良好 | 最高 | 15 分钟 | 不一 |
| **Azure** | 非常快 | $$ | 优秀 | 高 | 10 分钟 | 128K |

---

## 如何选择提供商

### 我想要最简单的部署
→ **OpenAI** — 最流行，社区支持最好

### 预算充足
→ **OpenAI** — 质量最佳

### 想省钱
→ **Groq** — 最便宜的云端（$0.05 / 1M tokens）

### 重视隐私 / 离线
→ **Ollama** — 免费、本地、私密

### 想要 GUI（不要 CLI）
→ **LM Studio** — 桌面应用

### 企业环境
→ **Azure OpenAI** — 合规与支持

### 需要长上下文（200K+ tokens）
→ **Anthropic** — 长上下文模型最佳

### 需要多模态（图像、音频、视频）
→ **Google Gemini** — 多模态支持最好

### 希望一个 API 密钥访问多种模型
→ **OpenRouter** — 100+ 模型、统一账单

---

## 准备配置您的提供商？

选定提供商后，请按详细说明操作：

→ **[AI 提供商配置指南](../5-CONFIGURATION/ai-providers.zh.md)**

本指南包含：
- 通过设置界面为各提供商逐步配置
- 如何添加凭据、测试连接、发现模型
- 模型选择与推荐
- 各提供商专属故障排除
- 硬件要求（本地提供商）
- 成本优化建议

---

## 成本估算

### OpenAI
```
轻度使用（每天 10 次对话）：$1–5/月
中度使用（每天 50 次对话）：$10–30/月
重度使用（全天使用）：$50–100+/月
```

### Anthropic
```
轻度使用：$1–3/月
中度使用：$5–20/月
重度使用：$20–50+/月
```

### Groq
```
轻度使用：$0–1/月
中度使用：$2–5/月
重度使用：$5–20/月
```

### Ollama
```
任意用量：免费（仅电费）
8GB GPU 24/7 运行：约 $10/月 电费
```

---

## 后续步骤

1. **您已选定提供商**（来自本对比指南）
2. **按设置指南操作**：[AI 提供商配置](../5-CONFIGURATION/ai-providers.zh.md)
3. **在「设置 → API 密钥」中添加凭据**
4. **测试连接**并发现模型
5. **开始使用 Open Notebook！**

---

## 需要帮助？

- **设置问题？** 请参阅 [AI 提供商配置](../5-CONFIGURATION/ai-providers.zh.md) 中各提供商的故障排除
- **一般问题？** 查看[故障排除指南](../6-TROUBLESHOOTING/index.zh.md)
- **有疑问？** 加入 [Discord 社区](https://discord.gg/37XJPXfz2w)

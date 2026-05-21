# AI 提供商 — 配置指南

通过 **设置** 界面完成各 AI 提供商的完整配置说明。

> **v1.2 新特性**：所有 AI 提供商凭据现均通过设置界面管理。用于 API 密钥的环境变量已弃用。

---

## 提供商配置流程

Open Notebook 使用**基于凭据的系统**管理 AI 提供商：

1. 在提供商网站**获取 API 密钥**
2. 打开 **设置** → **API 密钥** → **添加凭据**
3. **测试连接**以验证配置是否可用
4. **发现并注册模型**，使其在应用中可用
5. 在笔记本中**开始使用**该提供商

> **前置条件**：存储凭据前，必须在 `docker-compose.yml` 中设置 `OPEN_NOTEBOOK_ENCRYPTION_KEY`。详见 [API 配置](../3-USER-GUIDE/api-configuration.zh.md#加密设置)。

---

## 云端提供商（多数用户推荐）

### OpenAI

**费用：** 约 $0.03–0.15 / 1K tokens（因模型而异）

**获取 API 密钥：**
1. 访问 https://platform.openai.com/api-keys
2. 创建账户（如尚未注册）
3. 创建新的 API 密钥（以 `sk-proj-` 开头）
4. 为账户充值 $5 及以上

**在 Open Notebook 中配置：**
1. 进入 **设置** → **API 密钥**
2. 点击 **添加凭据**
3. 选择提供商：**OpenAI**
4. 填写名称（例如「My OpenAI Key」）
5. 粘贴 API 密钥
6. 点击 **保存**，然后 **测试连接**
7. 点击 **发现模型** 以查找可用模型
8. 点击 **注册模型** 使其可用

**可用模型（在 Open Notebook 中）：**
- `gpt-4o` — 质量最佳、速度快（最新版本）
- `gpt-4o-mini` — 快速、便宜，适合测试
- `o1` — 高级推理模型（较慢、较贵）
- `o1-mini` — 更快的推理模型

**推荐：**
- 通用场景：`gpt-4o`（综合最佳）
- 测试/低成本：`gpt-4o-mini`（约便宜 90%）
- 复杂推理：`o1`（适合难题）

**费用估算：**
```
轻度使用：$1–5/月
中度使用：$10–30/月
重度使用：$50–100+/月
```

**故障排除：**
- 「Invalid API key」→ 确认密钥以 `sk-proj-` 开头，并在设置中测试连接
- 「Rate limit exceeded」→ 等待或升级账户
- 「Model not available」→ 改用 `gpt-4o-mini`，或重新发现模型

---

### Anthropic (Claude)

**费用：** 约 $0.80–3.00 / 1M tokens（长上下文场景通常比 OpenAI 更便宜）

**获取 API 密钥：**
1. 访问 https://console.anthropic.com/
2. 创建账户或登录
3. 进入 API 密钥区域
4. 创建新的 API 密钥（以 `sk-ant-` 开头）

**在 Open Notebook 中配置：**
1. 进入 **设置** → **API 密钥**
2. 点击 **添加凭据**
3. 选择提供商：**Anthropic**
4. 填写名称，粘贴 API 密钥
5. 点击 **保存**，然后 **测试连接**
6. 点击 **发现模型** → **注册模型**

**可用模型：**
- `claude-sonnet-4-5-20250929` — 最新、质量最佳（推荐）
- `claude-3-5-sonnet-20241022` — 上一代，仍表现优秀
- `claude-3-5-haiku-20241022` — 快速、便宜
- `claude-opus-4-5-20251101` — 能力最强、费用最高

**推荐：**
- 通用场景：`claude-sonnet-4-5`（综合最佳、最新）
- 低成本：`claude-3-5-haiku`（约便宜 80%）
- 复杂任务：`claude-opus-4-5`（能力最强）

**费用估算：**
```
Sonnet：$3–20/月（典型使用）
Haiku：$0.50–3/月
Opus：$10–50+/月
```

**优势：**
- 出色的长上下文支持（200K tokens）
- 推理能力强
- 处理速度快

**故障排除：**
- 「Invalid API key」→ 确认以 `sk-ant-` 开头，并在设置中测试
- 「Overloaded」→ Anthropic 服务繁忙，请稍后重试
- 「Model unavailable」→ 从该凭据重新发现模型

---

### Google Gemini

**费用：** 约 $0.075–0.30 / 1K tokens（与 OpenAI 相当）

**获取 API 密钥：**
1. 访问 https://aistudio.google.com/app/apikey
2. 创建账户或登录
3. 创建新的 API 密钥

**在 Open Notebook 中配置：**
1. 进入 **设置** → **API 密钥**
2. 点击 **添加凭据**
3. 选择提供商：**Google Gemini**
4. 填写名称，粘贴 API 密钥
5. 点击 **保存**，然后 **测试连接**
6. 点击 **发现模型** → **注册模型**

**可用模型：**
- `gemini-2.0-flash-exp` — 最新实验版、最快（推荐）
- `gemini-2.0-flash` — 稳定版、快速、便宜

**推荐：**
- 通用场景：`gemini-2.0-flash-exp`（性价比最佳、最新）
- 低成本：`gemini-1.5-flash`（非常便宜）
- 复杂/长上下文：`gemini-1.5-pro-latest`（2M token 上下文）

**优势：**
- 超长上下文（1M tokens）
- 多模态（图像、音频、视频）
- 适合播客场景

**故障排除：**
- 「API key invalid」→ 从 aistudio.google.com 重新获取密钥
- 「Quota exceeded」→ 免费额度有限，请升级账户
- 「Model not found」→ 从该凭据重新发现模型

---

### Groq

**费用：** 约 $0.05 / 1M tokens（最便宜，但模型选择有限）

**获取 API 密钥：**
1. 访问 https://console.groq.com/keys
2. 创建账户或登录
3. 创建新的 API 密钥

**在 Open Notebook 中配置：**
1. 进入 **设置** → **API 密钥**
2. 点击 **添加凭据**
3. 选择提供商：**Groq**
4. 填写名称，粘贴 API 密钥
5. 点击 **保存**，然后 **测试连接**
6. 点击 **发现模型** → **注册模型**

**可用模型：**
- `llama-3.3-70b-versatile` — Groq 上表现最佳（推荐）
- `llama-3.1-70b-versatile` — 快速、能力强
- `mixtral-8x7b-32768` — 良好备选
- `gemma2-9b-it` — 小型、极快

**推荐：**
- 追求质量：`llama-3.3-70b-versatile`（综合最佳）
- 追求速度：`gemma2-9b-it`（极快）
- 平衡选择：`llama-3.1-70b-versatile`

**优势：**
- 推理速度极快
- 费用极低
- 适合转换/批处理任务

**劣势：**
- 模型选择有限
- 规模小于 OpenAI/Anthropic

**故障排除：**
- 「Rate limited」→ 免费层有限制，请升级
- 「Model not available」→ 从该凭据重新发现模型

---

### OpenRouter

**费用：** 因模型而异（$0.05–15 / 1M tokens）

**获取 API 密钥：**
1. 访问 https://openrouter.ai/keys
2. 创建账户或登录
3. 为账户充值
4. 创建新的 API 密钥

**在 Open Notebook 中配置：**
1. 进入 **设置** → **API 密钥**
2. 点击 **添加凭据**
3. 选择提供商：**OpenRouter**
4. 填写名称，粘贴 API 密钥
5. 点击 **保存**，然后 **测试连接**
6. 点击 **发现模型** → **注册模型**

**可用模型（100+ 种）：**
- OpenAI：`openai/gpt-4o`、`openai/o1`
- Anthropic：`anthropic/claude-sonnet-4.5`、`anthropic/claude-3.5-haiku`
- Google：`google/gemini-2.0-flash-exp`、`google/gemini-1.5-pro`
- Meta：`meta-llama/llama-3.3-70b-instruct`、`meta-llama/llama-3.1-405b-instruct`
- Mistral：`mistralai/mistral-large-2411`
- DeepSeek：`deepseek/deepseek-chat`
- 以及更多……

**推荐：**
- 追求质量：`anthropic/claude-sonnet-4.5`（综合最佳）
- 追求速度/成本：`google/gemini-2.0-flash-exp`（极快、便宜）
- 开源模型：`meta-llama/llama-3.3-70b-instruct`
- 推理任务：`openai/o1`

**优势：**
- 一个 API 密钥访问 100+ 模型
- 统一计费
- 便于模型对比
- 可访问其他平台可能有候补名单的模型

**费用估算：**
```
轻度使用：$1–5/月
中度使用：$10–30/月
重度使用：取决于所选模型
```

**故障排除：**
- 「Invalid API key」→ 确认以 `sk-or-` 开头
- 「Insufficient credits」→ 在 openrouter.ai 充值
- 「Model not available」→ 检查模型 ID 拼写（需使用完整路径）

---

### DashScope (Qwen)

**费用：** 约 $0.01–0.06 / 1K tokens（因模型而异）

**获取 API 密钥：**
1. 访问 https://dashscope.console.aliyun.com/
2. 创建阿里云账户（如尚未注册）
3. 进入 API 密钥区域
4. 创建新的 API 密钥

**在 Open Notebook 中配置：**
1. 进入 **设置** → **API 密钥**
2. 点击 **添加凭据**
3. 选择提供商：**DashScope (Qwen)**
4. 填写名称，粘贴 API 密钥
5. 点击 **保存**，然后 **测试连接**
6. 点击 **发现模型** → **注册模型**

**可用模型：**
- `qwen-max` — 能力最强的 Qwen 模型
- `qwen-plus` — 质量与速度平衡良好
- `qwen-turbo` — 最快、最便宜

**推荐：**
- 追求质量：`qwen-max`（综合最佳）
- 通用场景：`qwen-plus`（平衡良好）
- 追求速度/成本：`qwen-turbo`（最便宜）

**故障排除：**
- 「Invalid API key」→ 在 DashScope 控制台核对密钥
- 「Model not available」→ 从该凭据重新发现模型

---

### MiniMax

**费用：** 因模型而异

**获取 API 密钥：**
1. 访问 https://platform.minimaxi.com/
2. 创建账户（如尚未注册）
3. 进入 API 密钥区域
4. 创建新的 API 密钥

**在 Open Notebook 中配置：**
1. 进入 **设置** → **API 密钥**
2. 点击 **添加凭据**
3. 选择提供商：**MiniMax**
4. 填写名称，粘贴 API 密钥
5. 点击 **保存**，然后 **测试连接**
6. 点击 **发现模型** → **注册模型**

**可用模型：**
- `MiniMax-M2.5` — 能力最强，204K 上下文
- `MiniMax-M2.5-highspeed` — 更快变体，204K 上下文

**推荐：**
- 追求质量：`MiniMax-M2.5`（综合最佳）
- 追求速度：`MiniMax-M2.5-highspeed`（响应更快）

**优势：**
- 超长上下文（204K tokens）
- 价格有竞争力

**故障排除：**
- 「Invalid API key」→ 在 MiniMax 平台核对密钥
- 「Model not available」→ 从该凭据重新发现模型

---

## 自托管 / 本地

### Ollama（本地部署推荐）

**费用：** 免费（仅电费）

**安装 Ollama：**
1. 安装 Ollama：https://ollama.ai
2. 在后台运行 Ollama：`ollama serve`
3. 下载模型：`ollama pull mistral`

**在 Open Notebook 中配置：**
1. 进入 **设置** → **API 密钥**
2. 点击 **添加凭据**
3. 选择提供商：**Ollama**
4. 填写名称（例如「Local Ollama」）
5. 输入 base URL：
   - 同机（非 Docker）：`http://localhost:11434`
   - Docker，Ollama 在宿主机：`http://host.docker.internal:11434`
   - Docker，Ollama 在容器内：`http://ollama:11434`
6. 点击 **保存**，然后 **测试连接**
7. 点击 **发现模型** → **注册模型**

详见 [Ollama 设置指南](ollama.zh.md) 了解详细网络配置。

**可用模型：**
- `llama3.3:70b` — 质量最佳（需 40GB+ RAM）
- `llama3.1:8b` — 推荐，平衡（8GB RAM）
- `qwen2.5:7b` — 代码与推理表现优秀
- `mistral:7b` — 通用场景良好
- `phi3:3.8b` — 小型、快速（4GB RAM）
- `gemma2:9b` — Google 模型，平衡
- 更多模型：运行 `ollama list` 查看可用项

**推荐：**
- 有 GPU 且追求质量：`llama3.3:70b`（最佳）
- 通用场景：`llama3.1:8b`（平衡最佳）
- 追求速度/低内存：`phi3:3.8b`（极快）
- 编码场景：`qwen2.5:7b`（代码能力强）

**硬件要求：**
```
GPU（NVIDIA/AMD）：
  8GB 显存：可流畅运行多数模型
  6GB 显存：可用，速度较慢
  4GB 显存：仅适合小型模型

仅 CPU：
  16GB+ RAM：可用但较慢
  8GB RAM：非常慢
  4GB RAM：不推荐
```

**优势：**
- 完全私密（本地运行）
- 免费（仅电费）
- 无需 API 密钥
- 可离线使用

**劣势：**
- 比云端慢（除非有 GPU）
- 模型规模小于云端
- 需要本地硬件

**故障排除：**
- 「Connection refused」→ Ollama 未运行或凭据中 URL 错误
- 「Model not found」→ 下载模型：`ollama pull modelname`
- 「Out of memory」→ 改用更小模型或增加内存

---

### LM Studio（本地备选）

**费用：** 免费

**安装 LM Studio：**
1. 下载 LM Studio：https://lmstudio.ai
2. 打开应用
3. 从库中下载模型
4. 进入「Local Server」标签页
5. 启动服务器（默认端口：1234）

**在 Open Notebook 中配置：**
1. 进入 **设置** → **API 密钥**
2. 点击 **添加凭据**
3. 选择提供商：**OpenAI-Compatible**
4. 填写名称（例如「LM Studio」）
5. 输入 base URL：`http://host.docker.internal:1234/v1`（Docker）或 `http://localhost:1234/v1`（本地）
6. API 密钥：`lm-studio`（占位符，LM Studio 不要求真实密钥）
7. 点击 **保存**，然后 **测试连接**

**优势：**
- 图形界面（比 Ollama CLI 更易用）
- 模型选择丰富
- 注重隐私
- 可离线使用

**劣势：**
- 仅桌面端（Mac/Windows/Linux）
- 比云端慢
- 需要本地 GPU

---

### 自定义 OpenAI 兼容端点

适用于 Text Generation UI、vLLM 或其他 OpenAI 兼容端点：

1. 进入 **设置** → **API 密钥**
2. 点击 **添加凭据**
3. 选择提供商：**OpenAI-Compatible**
4. 输入端点 base URL（例如 `http://localhost:8000/v1`）
5. 如需要，输入 API 密钥
6. 可选：按服务配置 URL（LLM、Embedding、TTS、STT）
7. 点击 **保存**，然后 **测试连接**

详见 [OpenAI 兼容设置](openai-compatible.zh.md) 了解详细说明。

---

## 企业版

### Azure OpenAI

**费用：** 与 OpenAI 相同（按用量计费）

**在 Open Notebook 中配置：**
1. 在 Azure 门户创建 Azure OpenAI 服务
2. 部署 GPT-4/3.5-turbo 模型
3. 获取 endpoint 与密钥
4. 进入 **设置** → **API 密钥**
5. 点击 **添加凭据**
6. 选择提供商：**Azure OpenAI**
7. 填写：API Key、Endpoint、API Version
8. 可选：配置各服务端点（LLM、Embedding）
9. 点击 **保存**，然后 **测试连接**

**优势：**
- 企业级支持
- VPC 集成
- 合规认证（HIPAA、SOC2 等）

**劣势：**
- 配置更复杂
- 运维开销更高
- 需要 Azure 账户

---

## 嵌入（用于搜索/语义功能）

默认情况下，Open Notebook 使用 LLM 提供商的嵌入模型。嵌入模型通过同一凭据系统发现与注册——从凭据发现模型时，嵌入模型会与语言模型一并列出。

---

## 如何选择提供商

**1. 不想本地部署，也不想折腾多家提供商：**

使用 OpenAI
- 云端部署
- 质量良好
- 费用合理
- 配置最简单，支持全部模式（text、embedding、tts、stt 等）

**预算有限：** Groq、OpenRouter 或 Ollama
- Groq：极便宜的云端方案
- Ollama：免费，但需本地运行
- OpenRouter：大量开源模型，接入便捷

**隐私优先：** Ollama 或 LM Studio，以及 Speaches（[TTS](local-tts.zh.md)、[STT](local-stt.zh.md)）
- 数据全部保留在本地
- 可离线使用
- 不向外部发送 API 密钥

**企业场景：** Azure OpenAI
- 合规
- VPC 集成
- 技术支持

---

## 后续步骤

1. 从上文**选择提供商**
2. **获取 API 密钥**（云端）或**本地安装**（Ollama）
3. 在 `docker-compose.yml` 中**设置 `OPEN_NOTEBOOK_ENCRYPTION_KEY`**（存储凭据所必需）
4. 打开 **设置** → **API 密钥** → **添加凭据**
5. **测试连接**以验证配置
6. **发现并注册模型**使其可用
7. 通过测试对话**验证是否正常工作**

> **多提供商**：可添加任意数量提供商的凭据。可为不同项目或团队成员创建独立凭据。

完成！

---

## 旧版：环境变量（已弃用）

> **已弃用**：通过环境变量配置 AI 提供商 API 密钥的方式已弃用。请改用设置界面。环境变量可能仍可作为回退方案，但不再推荐。

若从使用环境变量的旧版本迁移，请进入 **设置** → **API 密钥**，点击 **Migrate to Database** 将现有密钥导入凭据系统。

---

## 相关文档

- **[API 配置](../3-USER-GUIDE/api-configuration.zh.md)** — 凭据管理详细指南
- **[环境变量参考](environment-reference.zh.md)** — 全部环境变量完整列表
- **[高级配置](advanced.zh.md)** — 超时、SSL、性能调优
- **[Ollama 设置](ollama.zh.md)** — Ollama 详细配置指南
- **[OpenAI 兼容](openai-compatible.zh.md)** — LM Studio 及其他兼容提供商
- **[本地 TTS 设置](local-tts.zh.md)** — 使用 Speaches 的文本转语音
- **[本地 STT 设置](local-stt.zh.md)** — 使用 Speaches 的语音转文本
- **[故障排除](../6-TROUBLESHOOTING/quick-fixes.zh.md)** — 常见问题与修复

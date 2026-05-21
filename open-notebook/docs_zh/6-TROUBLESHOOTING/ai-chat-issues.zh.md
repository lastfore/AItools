# AI 与聊天问题 - 模型配置与回答质量

AI 模型、聊天与回答质量相关问题。

> **说明：** Open Notebook 现已为 AI 提供商失败显示描述性错误消息。不再仅显示通用「发生意外错误」[原文: An unexpected error occurred]，而会显示如「认证失败，请检查 API 密钥」[原文: Authentication failed. Please check your API key] 或「超出速率限制，请稍后再试」[原文: Rate limit exceeded. Please wait a moment and try again.] 等具体消息，便于更快诊断与修复。

---

## 「发送消息失败」错误 [原文: Failed to send message]

**症状：** 聊天显示「发送消息失败」[原文: Failed to send message] 提示。日志可能显示：
```
Error executing chat: Model is not a LanguageModel: None
```

**原因：** 未为聊天配置有效的语言模型

**解决方案：**

### 方案 1：检查默认模型配置
```
1. Go to Settings → Models
2. Scroll to "Default Models" section
3. Verify "Default Chat Model" has a model selected
4. If empty, select an available language model
5. Click Save
```

### 方案 2：验证模型名称（Ollama 用户）
```bash
# Get exact model names
ollama list

# Example output:
# NAME                   SIZE      MODIFIED
# gemma3:12b            8.1 GB    2 months ago

# The model name in Open Notebook must be EXACTLY "gemma3:12b"
# NOT "gemma3" or "gemma3-12b"
```

### 方案 3：重新添加缺失模型
```
1. Note the exact model names from your provider
2. Go to Settings → Models
3. Delete any misconfigured models
4. Add models with exact names
5. Set new defaults
```

### 方案 4：确认模型仍存在
```bash
# For Ollama: verify model is installed
ollama list

# For cloud providers: verify API key is valid
# and you have access to the model
```

> **提示：** 若在 Ollama 中删除模型却未更新 Open Notebook 中的默认模型，常会出现此错误。删除模型后请重新配置默认项。

---

## 「模型不可用」或模型不显示 [原文: Models not available / Models not showing]

**症状：** 设置 → 模型 为空，或显示「未配置模型」[原文: No models configured]

**原因：** 未配置凭据，或凭据中的 API 密钥无效

**解决方案：**

### 方案 1：通过设置 UI 添加凭据
```
1. Go to Settings → API Keys
2. Click "Add Credential"
3. Select your provider (e.g., OpenAI, Anthropic, Google)
4. Enter your API key
5. Click Save, then Test Connection
6. Click Discover Models → Register Models
7. Go to Settings → Models to verify
```

### 方案 2：确认密钥有效
```
1. Go to Settings → API Keys
2. Click "Test Connection" on your credential
3. If it shows "Invalid API key":
   - Get a fresh key from the provider's website
   - Delete the credential and create a new one
```

### 方案 3：更换提供商
```
1. Go to Settings → API Keys
2. Add a credential for a different provider
3. Test Connection → Discover Models → Register Models
4. Go to Settings → Models to select the new provider's models
```

---

## 「Invalid API key」或「未授权」 [原文: Unauthorized]

**症状：** 聊天时报错：「Invalid API key」

**原因：** 凭据中的 API 密钥错误、过期或已撤销

**解决方案：**

### 步骤 1：测试凭据
```
1. Go to Settings → API Keys
2. Click "Test Connection" on your credential
3. If it fails, proceed to Step 2
```

### 步骤 2：获取新密钥
```
Go to provider's dashboard:
- OpenAI: https://platform.openai.com/api-keys (starts with sk-proj-)
- Anthropic: https://console.anthropic.com/ (starts with sk-ant-)
- Google: https://aistudio.google.com/app/apikey (starts with AIzaSy)

Generate new key and copy exactly (no extra spaces)
```

### 步骤 3：更新凭据
```
1. Go to Settings → API Keys
2. Delete the old credential
3. Click "Add Credential" → select provider
4. Paste the new key
5. Click Save, then Test Connection
6. Re-discover and register models if needed
```

### 步骤 4：在 UI 中验证
```
1. Go to Settings → Models
2. Verify models are available
3. Try a test chat
```

---

## 聊天回答笼统/质量差

**症状：** AI 回答肤浅、笼统或错误

**原因：** 上下文不佳、问题模糊或模型不当

**解决方案：**

### 方案 1：检查上下文
```
1. In Chat, click "Select Sources"
2. Verify sources you want are CHECKED
3. Set them to "Full Content" (not "Summary Only")
4. Click "Save"
5. Try chat again
```

### 方案 2：提出更好的问题
```
Bad:     "What do you think?"
Good:    "Based on the paper's methodology, what are 3 limitations?"

Bad:     "Tell me about X"
Good:    "Summarize X in 3 bullet points with page citations"
```

### 方案 3：使用更强模型
```
OpenAI:
  Current: gpt-4o-mini → Switch to: gpt-4o

Anthropic:
  Current: claude-3-5-haiku → Switch to: claude-3-5-sonnet

To change:
1. Settings → Models
2. Select model
3. Try chat again
```

### 方案 4：增加来源
```
If:  "Response seems incomplete"
Try: Add more relevant sources to provide context
```

---

## 聊天很慢

**症状：** 聊天响应需数分钟

**原因：** 上下文过大、模型慢或 API 过载

**解决方案：**

### 方案 1：使用更快模型
```bash
Fastest: Groq (any model)
Fast: OpenAI gpt-4o-mini
Medium: Anthropic claude-3-5-haiku
Slow: Anthropic claude-3-5-sonnet

Switch in: Settings → Models
```

### 方案 2：减少上下文
```
1. Chat → Select Sources
2. Uncheck sources you don't need
3. Or switch to "Summary Only" for background sources
4. Save and try again
```

### 方案 3：增加超时
```bash
# In .env:
API_CLIENT_TIMEOUT=600  # 10 minutes

# Restart:
docker compose restart
```

### 方案 4：检查系统负载
```bash
# See if API is overloaded:
docker stats

# If CPU >80% or memory >90%:
# Reduce: SURREAL_COMMANDS_MAX_TASKS=2
# Restart: docker compose restart
```

---

## 聊天不记住历史

**症状：** 每条消息被单独处理，问题之间无上下文

**原因：** 聊天历史未保存或开始了新聊天

**解决方案：**

```
1. Make sure you're in same Chat (not new Chat)
2. Check Chat title at top
3. If it's blank, start new Chat with a title
4. Each named Chat keeps its history
5. If you start new Chat, history is separate
```

---

## 「超出速率限制」 [原文: Rate limit exceeded]

**症状：** 错误：「Rate limit exceeded」或「Too many requests」[原文: Too many requests]

**原因：** 达到提供商 API 速率限制

**解决方案：**

### 云端提供商（OpenAI、Anthropic 等）

**立即：**
- 等待 1–2 分钟
- 重试

**短期：**
- 使用更便宜/更小的模型
- 减少并发操作
- 拉开请求间隔

**长期：**
- 升级账户
- 更换提供商
- 使用 Ollama（本地，无限制）

### 检查账户状态
```
OpenAI: https://platform.openai.com/account/usage/overview
Anthropic: https://console.anthropic.com/account/billing/overview
Google: Google Cloud Console
```

### Ollama（本地）
- 无速率限制
- 使用 `ollama pull mistral` 获取较好模型
- 若遇资源限制可重启

---

## 「上下文长度超出」或「Token 限制」 [原文: Context length exceeded / Token limit]

**症状：** 关于 token 过多的错误

**原因：** 来源对当前模型过大

**解决方案：**

### 方案 1：使用更长上下文的模型
```
Current: GPT-4o (128K tokens) → Switch to: Claude (200K tokens)
Current: Claude Haiku (200K) → Switch to: Gemini (1M tokens)

To change: Settings → Models
```

### 方案 2：减少上下文
```
1. Select fewer sources
2. Or use "Summary Only" instead of "Full Content"
3. Or split large documents into smaller pieces
```

### 方案 3：Ollama（本地）
```bash
# Use smaller model:
ollama pull phi  # Very small
# Instead of: ollama pull neural-chat  # Large
```

---

## 「API 调用失败」或超时 [原文: API call failed]

**症状：** 通用 API 错误，响应超时

**原因：** 提供商 API 宕机、网络问题或服务慢

**解决方案：**

### 检查提供商状态
```
OpenAI: https://status.openai.com/
Anthropic: Check website
Google: Google Cloud Status
Groq: Check website
```

### 重试操作
```
1. Wait 30 seconds
2. Try again
```

### 使用其他模型/提供商
```
1. Settings → Models
2. Try different provider
3. If OpenAI down, use Anthropic
```

### 检查网络
```bash
# Verify internet working:
ping google.com

# Test API endpoint directly:
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY"
```

---

## 回答出现幻觉

**症状：** AI 编造来源中不存在的事实

**原因：** 来源未纳入上下文，或模型臆测

**解决方案：**

### 方案 1：验证上下文
```
1. Click citation in response
2. Check source actually says that
3. If not, sources weren't in context
4. Add source to context and try again
```

### 方案 2：要求引用
```
Ask: "Answer this with citations to specific pages"

The AI will be more careful if asked for citations
```

### 方案 3：使用更强模型
```
Weaker models hallucinate more
Switch to: GPT-4o or Claude Sonnet
```

---

## API 费用过高

**症状：** API 账单高于预期

**原因：** 使用昂贵模型、上下文过大、请求过多

**解决方案：**

### 使用更便宜模型
```
Expensive: gpt-4o
Cheaper: gpt-4o-mini (10x cheaper)

Expensive: Claude Sonnet
Cheaper: Claude Haiku (5x cheaper)

Groq: Ultra cheap but fewer models
```

### 减少上下文
```
In Chat:
1. Select fewer sources
2. Use "Summary Only" for background
3. Ask more specific questions
```

### 改用 Ollama（免费）
```bash
# Install Ollama
# Run: ollama serve
# Download: ollama pull mistral
# Set: OLLAMA_API_BASE=http://localhost:11434
# Cost: Free!
```

---

## 仍有聊天问题？

- 尝试 [快速修复](quick-fixes.zh.md)
- 尝试 [高效聊天指南](../3-USER-GUIDE/chat-effectively.md)
- 查看日志：`docker compose logs api | grep -i "error"`
- 寻求帮助：[故障排除索引](index.zh.md#getting-help)

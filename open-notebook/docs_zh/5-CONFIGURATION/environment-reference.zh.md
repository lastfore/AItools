# 环境变量完整参考

Open Notebook 中全部环境变量的完整列表。

---

## API 配置

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `API_URL` | 否 | 自动检测 | 前端访问 API 的 URL（例如 http://localhost:5055） |
| `INTERNAL_API_URL` | 否 | http://localhost:5055 | Next.js 服务端代理使用的内部 API URL |
| `API_CLIENT_TIMEOUT` | 否 | 300 | 客户端超时（秒），等待 API 响应的最长时间 |
| `OPEN_NOTEBOOK_PASSWORD` | 否 | 无 | 保护 Open Notebook 实例的密码 |
| `OPEN_NOTEBOOK_ENCRYPTION_KEY` | **是** | 无 | 加密数据库中凭据的密钥字符串（任意字符串即可）。凭据系统**必需**。支持通过 `_FILE` 后缀使用 Docker secrets。 |
| `HOSTNAME` | 否 | `0.0.0.0`（Docker 中） | Next.js 绑定的网络接口。默认 `0.0.0.0` 以便反向代理访问 |

> **重要**：通过设置界面存储 AI 提供商凭据需要 `OPEN_NOTEBOOK_ENCRYPTION_KEY`。未设置则无法保存凭据。若更改或丢失此密钥，已存储凭据将无法解密。

---

## 数据库：SurrealDB

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `SURREAL_URL` | 是 | ws://surrealdb:8000/rpc | SurrealDB WebSocket 连接 URL |
| `SURREAL_USER` | 是 | root | SurrealDB 用户名 |
| `SURREAL_PASSWORD` | 是 | root | SurrealDB 密码 |
| `SURREAL_NAMESPACE` | 是 | open_notebook | SurrealDB 命名空间 |
| `SURREAL_DATABASE` | 是 | open_notebook | SurrealDB 数据库名 |

---

## 数据库：重试配置

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `SURREAL_COMMANDS_RETRY_ENABLED` | 否 | true | 失败时启用重试 |
| `SURREAL_COMMANDS_RETRY_MAX_ATTEMPTS` | 否 | 3 | 最大重试次数 |
| `SURREAL_COMMANDS_RETRY_WAIT_STRATEGY` | 否 | exponential_jitter | 重试等待策略（exponential_jitter/exponential/fixed/random） |
| `SURREAL_COMMANDS_RETRY_WAIT_MIN` | 否 | 1 | 重试间最小等待时间（秒） |
| `SURREAL_COMMANDS_RETRY_WAIT_MAX` | 否 | 30 | 重试间最大等待时间（秒） |

---

## 数据库：并发

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `SURREAL_COMMANDS_MAX_TASKS` | 否 | 5 | 最大并发数据库任务数 |

---

## LLM 超时

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `ESPERANTO_LLM_TIMEOUT` | 否 | 60 | LLM 推理超时（秒） |
| `ESPERANTO_SSL_VERIFY` | 否 | true | 验证 SSL 证书（false = 仅开发环境） |
| `ESPERANTO_SSL_CA_BUNDLE` | 否 | 无 | 自定义 CA 证书包路径 |

---

## 嵌入

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `OPEN_NOTEBOOK_EMBEDDING_BATCH_SIZE` | 否 | 50 | 每批嵌入的文本数量。纯 CPU 或更严格的 OpenAI 兼容嵌入提供商可适当降低。 |

---

## API / CORS

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `CORS_ORIGINS` | 否 | `*` | 允许调用 API 的来源列表，逗号分隔（例如 `https://app.example.com,https://www.example.com`）。默认 `*` 接受任意来源；**生产环境请显式设置为前端来源**。修改后需重启 API。未设置时 API 启动会记录警告。 |

**何时修改**：
- 通过自定义域名（反向代理、HTTPS、公网部署）访问 UI。
- 前端运行在非 3000 端口。
- 前端与 API 不同主机（例如 CDN）。

生产环境反向代理示例：

```bash
CORS_ORIGINS=https://notebook.example.com
```

---

## 文字转语音（TTS）

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `TTS_BATCH_SIZE` | 否 | 5 | 并发 TTS 请求数（1–5，因提供商而异） |

---

## 内容提取

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `FIRECRAWL_API_KEY` | 否 | 无 | Firecrawl API 密钥，用于高级网页抓取 |
| `JINA_API_KEY` | 否 | 无 | Jina AI API 密钥，用于网页提取 |

**设置：**
- Firecrawl：https://firecrawl.dev/
- Jina：https://jina.ai/

---

## SearXNG（互联网关键词搜索）

用于 **笔记本 → 添加来源 → 关键词搜索网页**（启用后）。Open Notebook 调用自托管的 [SearXNG](https://github.com/searxng/searxng) 实例，不内置公网搜索 API。

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `SEARXNG_ENABLED` | 否 | `false` | 设为 `true` 以启用 `POST /api/web-search`。 |
| `SEARXNG_BASE_URL` | 启用时 | 无 | SearXNG 基础 URL（无尾部路径），Compose 内如 `http://searxng:8080`，本机开发如 `http://localhost:8080`。 |
| `SEARXNG_TIMEOUT_SECONDS` | 否 | `20` | 请求 SearXNG 的 HTTP 超时（秒）。 |
| `SEARXNG_MAX_RESULTS` | 否 | `30` | 默认返回 URL 上限（最大 50）。 |
| `SEARXNG_BLOCKED_DOMAINS` | 否 | 无 | 排除的域名，逗号分隔（如 `facebook.com,pinterest.com`）。 |
| `SEARXNG_ALLOWED_DOMAINS` | 否 | 无 | 若设置，仅保留主机名匹配其中之一的链接。 |
| `SEARXNG_DEFAULT_LLM_RANKING` | 否 | `false` | 为 `true` 时，在已配置默认对话模型的情况下默认启用 LLM 重排序。 |
| `SEARXNG_LLM_RELEVANCE_THRESHOLD` | 否 | `0.45` | LLM 重排序后保留结果的最低相关分（0–1）。 |

**SearXNG 容器配置：** 在 `settings.yml` 的 `search.formats` 中启用 JSON，并设置 `server.secret_key`（见仓库 [`searxng/settings.yml`](../../searxng/settings.yml) 与 [Search API](https://docs.searxng.org/dev/search_api.html)）。

**`.env` 注释：** 注释行须以 `# `（井号+空格）开头。形如 `#SEARXNG_ALLOWED_DOMAINS=…`（井号后无空格）仍会被 python-dotenv 解析为变量。

**结果过滤：** 无空格的单项查询（典型中文关键词）保留 SearXNG 排序；含空格的英文多词查询会额外按标题/摘要做关键词过滤。

**Windows 开发：** [`start-dev.ps1`](../../start-dev.ps1) 在 `SEARXNG_ENABLED=true` 时启动 `searxng` 容器；[`stop-dev.ps1`](../../stop-dev.ps1) 会停止它（除非 `-KeepDatabase`）。

---

## 网络 / 代理

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `HTTP_PROXY` | 否 | 无 | 出站 HTTP 请求的代理 URL |
| `HTTPS_PROXY` | 否 | 无 | 出站 HTTPS 请求的代理 URL |
| `NO_PROXY` | 否 | 无 | 不走代理的主机列表，逗号分隔 |

将所有出站 HTTP 请求经代理转发，适用于企业/防火墙环境。

底层库（esperanto、content-core、podcast-creator）会自动从这些标准环境变量读取代理设置。

**影响范围：**
- AI 提供商 API 调用（OpenAI、Anthropic、Google、Groq 等）
- 从 URL 提取内容（网页抓取、YouTube 字幕）
- 播客生成（LLM 与 TTS 提供商调用）

**格式：** `http://[user:pass@]host:port` 或 `https://[user:pass@]host:port`

**示例：**
```bash
# 基本代理
HTTP_PROXY=http://proxy.corp.com:8080
HTTPS_PROXY=http://proxy.corp.com:8080

# 需认证的代理
HTTP_PROXY=http://user:password@proxy.corp.com:8080
HTTPS_PROXY=http://user:password@proxy.corp.com:8080

# 本地主机不走代理
NO_PROXY=localhost,127.0.0.1,.local
```

---

## 调试与监控

| 变量 | 是否必需？ | 默认值 | 说明 |
|----------|-----------|---------|-------------|
| `LANGCHAIN_TRACING_V2` | 否 | false | 启用 LangSmith 追踪 |
| `LANGCHAIN_ENDPOINT` | 否 | https://api.smith.langchain.com | LangSmith 端点 |
| `LANGCHAIN_API_KEY` | 否 | 无 | LangSmith API 密钥 |
| `LANGCHAIN_PROJECT` | 否 | Open Notebook | LangSmith 项目名 |

**设置：** https://smith.langchain.com/

---

## 按用例的环境变量

### 最小设置（新安装）
```
OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-key
SURREAL_URL=ws://surrealdb:8000/rpc
SURREAL_USER=root
SURREAL_PASSWORD=password
SURREAL_NAMESPACE=open_notebook
SURREAL_DATABASE=open_notebook
```
然后在浏览器中通过 **设置 → API 密钥** 配置 AI 提供商。

### 生产部署
```
OPEN_NOTEBOOK_ENCRYPTION_KEY=your-strong-secret-key
OPEN_NOTEBOOK_PASSWORD=your-secure-password
API_URL=https://mynotebook.example.com
SURREAL_USER=production_user
SURREAL_PASSWORD=secure_password
```

### 反向代理后的自托管
```
OPEN_NOTEBOOK_ENCRYPTION_KEY=your-secret-key
API_URL=https://mynotebook.example.com
```

### 企业环境（代理后）
```
OPEN_NOTEBOOK_ENCRYPTION_KEY=your-secret-key
HTTP_PROXY=http://proxy.corp.com:8080
HTTPS_PROXY=http://proxy.corp.com:8080
NO_PROXY=localhost,127.0.0.1
```

### 高性能部署
```
OPEN_NOTEBOOK_ENCRYPTION_KEY=your-secret-key
SURREAL_COMMANDS_MAX_TASKS=10
TTS_BATCH_SIZE=5
API_CLIENT_TIMEOUT=600
```

### 调试
```
OPEN_NOTEBOOK_ENCRYPTION_KEY=your-secret-key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-key
```

---

## 验证

检查变量是否已设置：

```bash
# 检查单个变量
echo $OPEN_NOTEBOOK_ENCRYPTION_KEY

# 检查多个
env | grep -E "OPEN_NOTEBOOK|API_URL"

# 打印全部配置
env | grep -E "^[A-Z_]+=" | sort
```

---

## 说明

- **区分大小写：** `OPEN_NOTEBOOK_ENCRYPTION_KEY` ≠ `open_notebook_encryption_key`
- **不要空格：** 使用 `OPEN_NOTEBOOK_ENCRYPTION_KEY=my-key`，不要 `OPEN_NOTEBOOK_ENCRYPTION_KEY = my-key`
- **值加引号：** 含空格的值加引号：`API_URL="http://my server:5055"`
- **需重启：** 修改后需重启服务才生效
- **密钥安全：** 不要将加密密钥或密码提交到 git
- **AI 提供商：** 在浏览器 **设置 → API 密钥** 中配置（不要用环境变量）
- **迁移：** 使用设置界面将现有环境变量迁移到凭据系统。见 [API 配置](../3-USER-GUIDE/api-configuration.zh.md#migrating-from-environment-variables)

---

## 快速设置清单

- [ ] 在 docker-compose.yml 中设置 `OPEN_NOTEBOOK_ENCRYPTION_KEY`
- [ ] 设置数据库凭据（`SURREAL_*`）
- [ ] 启动服务
- [ ] 打开浏览器 → **设置 → API 密钥**
- [ ] **添加凭据**（AI 提供商）
- [ ] **测试连接**验证
- [ ] **发现并注册模型**
- [ ] 若在反向代理后，设置 `API_URL`
- [ ] 生产环境修改 `SURREAL_PASSWORD`
- [ ] 尝试测试聊天

完成！

---

## 旧版：AI 提供商环境变量（已弃用）

> **已弃用**：以下 AI 提供商 API 密钥环境变量已弃用。请通过设置界面配置。这些变量可能仍可作为回退，但不再推荐。

若旧安装中已配置这些变量，请在 **设置 → API 密钥** 中点击 **迁移到数据库**，导入凭据系统后从配置中移除。

| 变量 | 提供商 | 替代方式 |
|----------|----------|-------------|
| `OPENAI_API_KEY` | OpenAI | 设置 → API 密钥 → 添加 OpenAI 凭据 |
| `ANTHROPIC_API_KEY` | Anthropic | 设置 → API 密钥 → 添加 Anthropic 凭据 |
| `GOOGLE_API_KEY` | Google Gemini | 设置 → API 密钥 → 添加 Google 凭据 |
| `GEMINI_API_BASE_URL` | Google Gemini | 在 Google Gemini 凭据中配置 |
| `VERTEX_PROJECT` | Vertex AI | 设置 → API 密钥 → 添加 Vertex AI 凭据 |
| `VERTEX_LOCATION` | Vertex AI | 在 Vertex AI 凭据中配置 |
| `GOOGLE_APPLICATION_CREDENTIALS` | Vertex AI | 在 Vertex AI 凭据中配置 |
| `GROQ_API_KEY` | Groq | 设置 → API 密钥 → 添加 Groq 凭据 |
| `MISTRAL_API_KEY` | Mistral | 设置 → API 密钥 → 添加 Mistral 凭据 |
| `DEEPSEEK_API_KEY` | DeepSeek | 设置 → API 密钥 → 添加 DeepSeek 凭据 |
| `XAI_API_KEY` | xAI | 设置 → API 密钥 → 添加 xAI 凭据 |
| `OLLAMA_API_BASE` | Ollama | 设置 → API 密钥 → 添加 Ollama 凭据 |
| `OPENROUTER_API_KEY` | OpenRouter | 设置 → API 密钥 → 添加 OpenRouter 凭据 |
| `OPENROUTER_BASE_URL` | OpenRouter | 在 OpenRouter 凭据中配置 |
| `VOYAGE_API_KEY` | Voyage AI | 设置 → API 密钥 → 添加 Voyage AI 凭据 |
| `ELEVENLABS_API_KEY` | ElevenLabs | 设置 → API 密钥 → 添加 ElevenLabs 凭据 |
| `OPENAI_COMPATIBLE_BASE_URL` | OpenAI-Compatible | 设置 → API 密钥 → 添加 OpenAI-Compatible 凭据 |
| `OPENAI_COMPATIBLE_API_KEY` | OpenAI-Compatible | 在 OpenAI-Compatible 凭据中配置 |
| `OPENAI_COMPATIBLE_BASE_URL_LLM` | OpenAI-Compatible | 在凭据中按服务配置 URL |
| `OPENAI_COMPATIBLE_API_KEY_LLM` | OpenAI-Compatible | 在凭据中按服务配置密钥 |
| `OPENAI_COMPATIBLE_BASE_URL_EMBEDDING` | OpenAI-Compatible | 在凭据中按服务配置 URL |
| `OPENAI_COMPATIBLE_API_KEY_EMBEDDING` | OpenAI-Compatible | 在凭据中按服务配置密钥 |
| `OPENAI_COMPATIBLE_BASE_URL_STT` | OpenAI-Compatible | 在凭据中按服务配置 URL |
| `OPENAI_COMPATIBLE_API_KEY_STT` | OpenAI-Compatible | 在凭据中按服务配置密钥 |
| `OPENAI_COMPATIBLE_BASE_URL_TTS` | OpenAI-Compatible | 在凭据中按服务配置 URL |
| `OPENAI_COMPATIBLE_API_KEY_TTS` | OpenAI-Compatible | 在凭据中按服务配置密钥 |
| `DASHSCOPE_API_KEY` | DashScope (Qwen) | 设置 → API 密钥 → 添加 DashScope 凭据 |
| `MINIMAX_API_KEY` | MiniMax | 设置 → API 密钥 → 添加 MiniMax 凭据 |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI | 设置 → API 密钥 → 添加 Azure OpenAI 凭据 |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI | 在 Azure OpenAI 凭据中配置 |
| `AZURE_OPENAI_API_VERSION` | Azure OpenAI | 在 Azure OpenAI 凭据中配置 |
| `AZURE_OPENAI_API_KEY_LLM` | Azure OpenAI | 在凭据中按服务配置 |
| `AZURE_OPENAI_ENDPOINT_LLM` | Azure OpenAI | 在凭据中按服务配置 |
| `AZURE_OPENAI_API_VERSION_LLM` | Azure OpenAI | 在凭据中按服务配置 |
| `AZURE_OPENAI_API_KEY_EMBEDDING` | Azure OpenAI | 在凭据中按服务配置 |
| `AZURE_OPENAI_ENDPOINT_EMBEDDING` | Azure OpenAI | 在凭据中按服务配置 |
| `AZURE_OPENAI_API_VERSION_EMBEDDING` | Azure OpenAI | 在凭据中按服务配置 |

# Open Notebook 架构

## 高层概览

Open Notebook 采用三层架构，职责划分清晰：

```
┌─────────────────────────────────────────────────────────┐
│  Your Browser                                           │
│  Access: http://your-server-ip:8502                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │   Port 8502   │  ← Next.js Frontend (what you see)
         │   Frontend    │    Also proxies API requests internally!
         └───────┬───────┘
                 │ proxies /api/* requests ↓
                 ▼
         ┌───────────────┐
         │   Port 5055   │  ← FastAPI Backend (handles requests)
         │     API       │
         └───────┬───────┘
                 │
                 ▼
         ┌───────────────┐
         │   SurrealDB   │  ← Database (internal, auto-configured)
         │   (Port 8000) │
         └───────────────┘
```

**要点：**
- **v1.1+**：Next.js 会自动将 `/api/*` 请求代理到后端，简化反向代理配置
- 浏览器从 8502 端口加载前端
- 前端需要知道 API 的位置——远程访问时设置：`API_URL=http://your-server-ip:5055`
- **位于反向代理之后？** 现在只需代理到 8502 端口！参见[反向代理配置](../5-CONFIGURATION/reverse-proxy.zh.md)

---

## 详细架构

Open Notebook 基于**三层、异步优先的架构**构建，面向可扩展性、模块化以及多 AI 提供商的灵活性。系统在前后端与数据库层之间分离关注点，由 LangGraph 驱动智能工作流，由 Esperanto 实现与 8+ 家 AI 提供商的无缝集成。

**核心理念**：
- 隐私优先：用户掌控数据与 AI 提供商选择
- 全面采用 async/await：非阻塞操作，保障响应式用户体验
- 领域驱动设计（DDD）：领域模型、仓储与编排器清晰分离
- 多提供商灵活性：更换 AI 提供商无需修改应用代码
- 可自托管：所有组件均可在隔离环境中部署

---

## 三层架构

### 第 1 层：前端（React/Next.js @ 端口 3000）

**用途**：用于研究、笔记、聊天与播客管理的响应式交互界面。

**技术栈**：
- **框架**：Next.js 15 + React 19
- **语言**：TypeScript，启用严格类型检查
- **状态管理**：Zustand（轻量 store）+ TanStack Query（服务端状态）
- **样式**：Tailwind CSS + Shadcn/ui 组件库
- **构建工具**：Webpack（由 Next.js 打包）

**主要职责**：
- 渲染笔记本、资料源、笔记、聊天会话与播客
- 处理用户交互（增删改查）
- 管理复杂 UI 状态（模态框、文件上传、实时搜索）
- 流式接收 API 响应（聊天、播客生成）
- 展示嵌入向量、向量搜索结果与洞察

**通信模式**：
- 所有数据通过 REST API 获取（异步请求至端口 5055）
- 配置的基础 URL：`http://localhost:5055`（开发）或按环境配置（生产）
- TanStack Query 负责缓存、重新获取与数据同步
- Zustand 存储全局状态（用户、笔记本、所选上下文）
- API 端启用 CORS 以支持跨域请求

**组件架构**：
- `/src/app/`：Next.js App Router（页面、布局）
- `/src/components/`：可复用 React 组件（按钮、表单、卡片）
- `/src/hooks/`：自定义 Hook（useNotebook、useChat、useSearch）
- `/src/lib/`：工具函数、API 客户端、校验器
- `/src/styles/`：全局 CSS、Tailwind 配置

---

### 第 2 层：API（FastAPI @ 端口 5055）

**用途**：RESTful 后端，对外提供笔记本、资料源、笔记、聊天会话与 AI 模型的操作。

**技术栈**：
- **框架**：FastAPI 0.104+（异步 Python Web 框架）
- **语言**：Python 3.11+
- **校验**：Pydantic v2（请求/响应模式）
- **日志**：Loguru（结构化 JSON 日志）
- **测试**：Pytest（单元测试与集成测试）

**架构**：
```
FastAPI App (main.py)
  ├── Routers (HTTP endpoints)
  │   ├── routers/notebooks.py (CRUD operations)
  │   ├── routers/sources.py (content ingestion, upload)
  │   ├── routers/notes.py (note management)
  │   ├── routers/chat.py (conversation sessions)
  │   ├── routers/search.py (full-text + vector search)
  │   ├── routers/transformations.py (custom transformations)
  │   ├── routers/models.py (AI model configuration)
  │   └── routers/*.py (11 additional routers)
  │
  ├── Services (business logic)
  │   ├── *_service.py (orchestration, graph invocation)
  │   ├── command_service.py (async job submission)
  │   └── middleware (auth, logging)
  │
  ├── Models (Pydantic schemas)
  │   └── models.py (validation, serialization)
  │
  └── Lifespan (startup/shutdown)
      └── AsyncMigrationManager (database schema migrations)
```

**主要职责**：
1. **HTTP 接口**：接收 REST 请求、校验并返回 JSON 响应
2. **业务逻辑**：编排领域模型、仓储操作与工作流
3. **异步任务队列**：提交长时间运行的任务（播客生成、资料源处理）
4. **数据库迁移**：启动时执行模式更新
5. **错误处理**：捕获异常并返回合适的 HTTP 状态码
6. **日志**：记录操作以便调试与监控

**启动流程**：
1. 加载 `.env` 环境变量
2. 初始化带 CORS 与认证中间件的 FastAPI 应用
3. 运行 AsyncMigrationManager（创建/更新数据库模式）
4. 注册所有路由（20+ 个端点）
5. 服务在端口 5055 就绪

**请求-响应周期**：
```
HTTP Request → Router → Service → Domain/Repository → SurrealDB
                                       ↓
                                  LangGraph (optional)
                                       ↓
Response ← Pydantic serialization ← Service ← Result
```

---

### 第 3 层：数据库（SurrealDB @ 端口 8000）

**用途**：图数据库，内置向量嵌入、语义搜索与关系管理。

**技术栈**：
- **数据库**：SurrealDB（多模型、ACID 事务）
- **查询语言**：SurrealQL（类 SQL 语法，支持图操作）
- **异步驱动**：Python 异步 Rust 客户端
- **迁移**：`/migrations/` 中的手动 `.surql` 文件（API 启动时自动执行）

**核心表**：

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `notebook` | 研究项目容器 | id, name, description, archived, created, updated |
| `source` | 内容项（PDF、URL、文本） | id, title, full_text, topics, asset, created, updated |
| `source_embedding` | 用于语义搜索的向量嵌入 | id, source, embedding, chunk_text, chunk_index |
| `note` | 用户创建的研究笔记 | id, title, content, note_type (human/ai), created, updated |
| `chat_session` | 对话会话 | id, notebook_id, title, messages (JSON), created, updated |
| `transformation` | 自定义转换规则 | id, name, description, prompt, created, updated |
| `source_insight` | 转换输出 | id, source_id, insight_type, content, created, updated |
| `reference` | 关系：source → notebook | out (source), in (notebook) |
| `artifact` | 关系：note → notebook | out (note), in (notebook) |

**关系图**：
```
Notebook
  ↓ (referenced_by)
Source
  ├→ SourceEmbedding (1:many for chunked text)
  ├→ SourceInsight (1:many for transformation outputs)
  └→ Note (via artifact relationship)
    ├→ Embedding (semantic search)
    └→ Topics (tags)

ChatSession
  ├→ Notebook
  └→ Messages (stored as JSON array)
```

**向量搜索能力**：
- 嵌入向量原生存储于 SurrealDB
- 对 `source.full_text` 与 `note.content` 的全文搜索
- 对嵌入向量的余弦相似度搜索
- 语义搜索与搜索端点集成

**连接管理**：
- 异步连接池（可配置大小）
- 多记录操作的事务支持
- 通过迁移进行模式自动校验
- 查询超时保护（防止无限查询）

---

## 技术栈选型理由

### 为何选择 Python + FastAPI？

**Python**：
- 丰富的 AI/ML 生态（LangChain、LangGraph、transformers、scikit-learn）
- 快速原型与部署
- 完善的异步支持（asyncio、async/await）
- 强类型提示（Pydantic、mypy）

**FastAPI**：
- 现代、异步优先的框架
- 自动生成 OpenAPI 文档（Swagger UI @ /docs）
- 内置请求校验（Pydantic）
- 优异性能（基准测试接近 C/Rust 水平）
- 便捷的中间件/依赖注入

### 为何选择 Next.js + React + TypeScript？

**Next.js**：
- 具备 SSR/SSG 的全栈 React 框架
- 基于文件的路由（项目结构直观）
- 内置 API 路由（可选的后端同址部署）
- 优化的图片/代码分割
- 易于部署（Vercel、Docker、自托管）

**React 19**：
- 基于组件的 UI（可复用、可测试）
- 优秀的工具链与社区
- 客户端状态管理（Zustand）
- 服务端状态同步（TanStack Query）

**TypeScript**：
- 类型安全在编译期捕获错误
- 更好的 IDE 自动补全与重构
- 通过类型实现文档化（自描述代码）
- 降低新贡献者的上手成本

### 为何选择 SurrealDB？

**SurrealDB**：
- 原生图数据库（关系为一等公民）
- 内置向量嵌入（无需独立向量数据库）
- ACID 事务（数据一致性）
- 多模型（关系型 + 文档 + 图）
- 单次查询同时支持全文搜索与语义搜索
- 可自托管（不同于托管的 Pinecone/Weaviate）
- 灵活的 SurrealQL（类 SQL 语法）

**曾考虑的替代方案**：PostgreSQL + pgvector（更成熟但需额外扩展）

### 为何使用 Esperanto 对接 AI 提供商？

**Esperanto 库**：
- 统一接口对接 8+ 家 LLM 提供商（OpenAI、Anthropic、Google、Groq、Ollama、Mistral、DeepSeek、xAI）
- 多提供商嵌入（OpenAI、Google、Ollama、Mistral、Voyage）
- TTS/STT 集成（OpenAI、Groq、ElevenLabs、Google）
- 智能提供商选择（回退逻辑、成本优化）
- 支持按请求覆盖模型
- 支持本地 Ollama（完全自托管选项）

**曾考虑的替代方案**：LangChain 的提供商抽象（更冗长、灵活性较低）

---

## LangGraph 工作流

LangGraph 是用于编排多步 AI 工作流的状态机库。Open Notebook 使用五个核心工作流：

### 1. **资料源处理工作流**（`open_notebook/graphs/source.py`）

**用途**：摄取内容（PDF、URL、文本）并准备用于搜索/洞察。

**流程**：
```
Input (file/URL/text)
  ↓
Extract Content (content-core library)
  ↓
Clean & tokenize text
  ↓
Generate Embeddings (Esperanto)
  ↓
Create SourceEmbedding records (chunked + indexed)
  ↓
Extract Topics (LLM summarization)
  ↓
Save to SurrealDB
  ↓
Output (Source record with embeddings)
```

**状态字典**：
```python
{
  "content_state": {"file_path" | "url" | "content": str},
  "source_id": str,
  "full_text": str,
  "embeddings": List[Dict],
  "topics": List[str],
  "notebook_ids": List[str],
}
```

**调用方**：资料源 API（`POST /sources`）

---

### 2. **聊天工作流**（`open_notebook/graphs/chat.py`）

**用途**：与 AI 模型进行多轮对话，并引用笔记本上下文。

**流程**：
```
User Message
  ↓
Build Context (selected sources/notes)
  ↓
Add Message to Session
  ↓
Create Chat Prompt (system + history + context)
  ↓
Call LLM (via Esperanto)
  ↓
Stream Response
  ↓
Save AI Message to ChatSession
  ↓
Output (complete message)
```

**状态字典**：
```python
{
  "session_id": str,
  "messages": List[BaseMessage],
  "context": Dict[str, Any],  # sources, notes, snippets
  "response": str,
  "model_override": Optional[str],
}
```

**关键特性**：
- 消息历史持久化于 SurrealDB（SqliteSaver 检查点）
- 通过 `build_context_for_chat()` 工具构建上下文
- Token 计数以防止溢出
- 支持按消息覆盖模型

**调用方**：聊天 API（`POST /chat/execute`）

---

### 3. **Ask 工作流**（`open_notebook/graphs/ask.py`）

**用途**：通过搜索资料源并综合结果来回答用户问题。

**流程**：
```
User Question
  ↓
Plan Search Strategy (LLM generates searches)
  ↓
Execute Searches (vector + text search)
  ↓
Score & Rank Results
  ↓
Provide Answers (LLM synthesizes from results)
  ↓
Stream Responses
  ↓
Output (final answer)
```

**状态字典**：
```python
{
  "question": str,
  "strategy": SearchStrategy,
  "answers": List[str],
  "final_answer": str,
  "sources_used": List[Source],
}
```

**流式传输**：使用 `astream()` 实时发出更新（策略 → 答案 → 最终答案）

**调用方**：搜索 API（带流式传输的 `POST /ask`）

---

### 4. **转换工作流**（`open_notebook/graphs/transformation.py`）

**用途**：对资料源应用自定义转换（提取摘要、要点等）。

**流程**：
```
Source + Transformation Rule
  ↓
Generate Prompt (Jinja2 template)
  ↓
Call LLM
  ↓
Parse Output
  ↓
Create SourceInsight record
  ↓
Output (insight with type + content)
```

**转换示例**：
- Summary（五句话概述）
- Key Points（要点列表）
- Quotes（精彩摘录）
- Q&A（生成的问题与答案）

**调用方**：资料源 API（`POST /sources/{id}/insights`）

---

### 5. **Prompt 工作流**（`open_notebook/graphs/prompt.py`）

**用途**：通用 LLM 任务执行（例如自动生成笔记标题、分析内容）。

**流程**：
```
Input Text + Prompt
  ↓
Call LLM (simple request-response)
  ↓
Output (completion)
```

**用于**：笔记标题生成、内容分析等。

---

## AI 提供商集成模式

### ModelManager：集中式工厂

位于 `open_notebook/ai/models.py`，ModelManager 负责：

1. **提供商检测**：检查环境变量以确定可用提供商
2. **模型选择**：根据上下文大小与任务选择最佳模型
3. **回退逻辑**：主提供商不可用时尝试备用方案
4. **成本优化**：简单任务优先使用更便宜的模型
5. **Token 计算**：在调用 LLM 前估算成本

**用法**：
```python
from open_notebook.ai.provision import provision_langchain_model

# Get best LLM for context size
model = await provision_langchain_model(
    task="chat",  # or "search", "extraction"
    model_override="anthropic/claude-opus-4",  # optional
    context_size=8000,  # estimated tokens
)

# Invoke model
response = await model.ainvoke({"input": prompt})
```

### 多提供商支持

**LLM 提供商**：
- OpenAI（gpt-4、gpt-4-turbo、gpt-3.5-turbo）
- Anthropic（claude-opus、claude-sonnet、claude-haiku）
- Google（gemini-pro、gemini-1.5）
- Groq（mixtral、llama-2）
- Ollama（本地模型）
- Mistral（mistral-large、mistral-medium）
- DeepSeek（deepseek-chat）
- xAI（grok）

**嵌入提供商**：
- OpenAI（text-embedding-3-large、text-embedding-3-small）
- Google（embedding-001）
- Ollama（本地嵌入）
- Mistral（mistral-embed）
- Voyage（voyage-large-2）

**TTS 提供商**：
- OpenAI（tts-1、tts-1-hd）
- Groq（无 TTS，回退至 OpenAI）
- ElevenLabs（多语言语音）
- Google TTS（text-to-speech）

### 按请求覆盖

每次 LangGraph 调用均可通过 `config` 参数覆盖模型：

```python
result = await graph.ainvoke(
    input={...},
    config={
        "configurable": {
            "model_override": "anthropic/claude-opus-4"  # Use Claude instead
        }
    }
)
```

---

## 设计模式

### 1. **领域驱动设计（DDD）**

**领域对象**（`open_notebook/domain/`）：
- `Notebook`：研究容器，与资料源/笔记存在关系
- `Source`：内容项（PDF、URL、文本）及嵌入
- `Note`：用户创建或 AI 生成的研究笔记
- `ChatSession`：笔记本的对话历史
- `Transformation`：提取洞察的自定义规则

**仓储模式**：
- 数据库访问层（`open_notebook/database/repository.py`）
- `repo_query()`：执行 SurrealQL 查询
- `repo_create()`：插入记录
- `repo_upsert()`：合并记录
- `repo_delete()`：删除记录

**实体方法**：
```python
# Domain methods (business logic)
notebook = await Notebook.get(id)
await notebook.save()
notes = await notebook.get_notes()
sources = await notebook.get_sources()
```

### 2. **异步优先架构**

**所有 I/O 均为异步**：
- 数据库查询：`await repo_query(...)`
- LLM 调用：`await model.ainvoke(...)`
- 文件 I/O：`await upload_file.read()`
- 图调用：`await graph.ainvoke(...)`

**优势**：
- 非阻塞请求处理（FastAPI 可并发服务多个请求）
- 更好的资源利用（I/O 等待不阻塞 CPU）
- 与 Python async/await 语法天然契合

**示例**：
```python
@router.post("/sources")
async def create_source(source_data: SourceCreate):
    # All operations are non-blocking
    source = Source(title=source_data.title)
    await source.save()  # async database operation
    await graph.ainvoke({...})  # async LangGraph invocation
    return SourceResponse(...)
```

### 3. **服务模式**

服务编排领域对象、仓储与工作流：

```python
# api/notebook_service.py
class NotebookService:
    async def get_notebook_with_stats(notebook_id: str):
        notebook = await Notebook.get(notebook_id)
        sources = await notebook.get_sources()
        notes = await notebook.get_notes()
        return {
            "notebook": notebook,
            "source_count": len(sources),
            "note_count": len(notes),
        }
```

**职责**：
- 校验输入（Pydantic）
- 编排数据库操作
- 调用工作流（LangGraph 图）
- 处理错误并返回合适的状态码
- 记录操作日志

### 4. **流式模式**

对于长时间运行的操作（Ask 工作流、播客生成），以 Server-Sent Events 流式返回结果：

```python
@router.post("/ask", response_class=StreamingResponse)
async def ask(request: AskRequest):
    async def stream_response():
        async for chunk in ask_graph.astream(input={...}):
            yield f"data: {json.dumps(chunk)}\n\n"
    return StreamingResponse(stream_response(), media_type="text/event-stream")
```

### 5. **任务队列模式**

对于异步后台任务（资料源处理），使用 Surreal-Commands 任务队列：

```python
# Submit job
command_id = await CommandService.submit_command_job(
    app="open_notebook",
    command="process_source",
    input={...}
)

# Poll status
status = await source.get_status()
```

---

## 服务通信模式

### 前端 → API

1. **REST 请求**（HTTP GET/POST/PUT/DELETE）
2. **JSON 请求/响应体**
3. **标准 HTTP 状态码**（200、400、404、500）
4. **可选流式传输**（长时间操作使用 Server-Sent Events）

**示例**：
```typescript
// Frontend
const response = await fetch("http://localhost:5055/sources", {
  method: "POST",
  body: formData,  // multipart/form-data for file upload
});
const source = await response.json();
```

### API → SurrealDB

1. **SurrealQL 查询**（类似 SQL）
2. **异步驱动**与连接池
3. **类型安全的记录 ID**（record_id 语法）
4. **事务支持**用于多步操作

**示例**：
```python
# API
result = await repo_query(
    "SELECT * FROM source WHERE notebook = $notebook_id",
    {"notebook_id": ensure_record_id(notebook_id)}
)
```

### API → AI 提供商（通过 Esperanto）

1. **Esperanto 统一接口**
2. **按请求覆盖提供商**
3. **失败时自动回退**
4. **Token 计数与成本估算**

**示例**：
```python
# API
model = await provision_langchain_model(task="chat")
response = await model.ainvoke({"input": prompt})
```

### API → 任务队列（Surreal-Commands）

1. **异步任务提交**
2. **即发即忘模式**
3. **通过 `/commands/{id}` 端点轮询状态**
4. **任务完成回调（可选）**

**示例**：
```python
# Submit async source processing
command_id = await CommandService.submit_command_job(...)

# Client polls status
response = await fetch(f"http://localhost:5055/commands/{command_id}")
status = await response.json()  # returns { status: "running|queued|completed|failed" }
```

---

## 数据库模式概览

### 核心模式结构

**表**（20+）：
- Notebooks（通过 `archived` 标志软删除）
- Sources（内容 + 元数据）
- SourceEmbeddings（向量分块）
- Notes（用户创建 + AI 生成）
- ChatSessions（对话历史）
- Transformations（自定义规则）
- SourceInsights（转换输出）
- Relationships（notebook→source、notebook→note）

**迁移**：
- API 启动时自动执行
- 位于 `/migrations/` 目录
- 顺序编号（001_*.surql、002_*.surql 等）
- 在 `_sbl_migrations` 表中跟踪
- 通过 `_down.surql` 文件回滚（手动）

### 关系模型

**图关系**：
```
Notebook
  ← reference ← Source (many:many)
  ← artifact ← Note (many:many)

Source
  → source_embedding (one:many)
  → source_insight (one:many)
  → embedding (via source_embedding)

ChatSession
  → messages (JSON array in database)
  → notebook_id (reference to Notebook)

Transformation
  → source_insight (one:many)
```

**查询示例**（获取笔记本内所有资料源及计数）：
```sql
SELECT id, title,
  count(<-reference.in) as note_count,
  count(<-embedding.in) as embedded_chunks
FROM source
WHERE notebook = $notebook_id
ORDER BY updated DESC
```

---

## 关键架构决策

### 1. **全面异步**

所有 I/O 操作均为非阻塞，以最大化并发与响应性。

**权衡**：代码略复杂（async/await 语法） vs. 高吞吐量。

### 2. **自设计之初支持多提供商**

内置对 8+ 家 AI 提供商的支持，避免供应商锁定。

**权衡**：ModelManager 复杂度增加 vs. 灵活性与成本优化。

### 3. **以图为中心的工作流**

对复杂多步操作（Ask、聊天、转换）使用 LangGraph 状态机。

**权衡**：学习曲线更陡 vs. 可维护、可调试的工作流。

### 4. **自托管数据库**

SurrealDB 在单一系统中提供图 + 向量搜索（无外部依赖）。

**权衡**：运维责任 vs. 架构简化与成本节约。

### 5. **长时间任务使用任务队列**

异步任务提交（资料源处理、播客生成）避免请求超时。

**权衡**：最终一致性 vs. 流畅的用户体验。

---

## 重要注意事项与陷阱

### API 启动

- **每次启动都会自动运行迁移**；请检查日志中的错误
- **启动 API 前 SurrealDB 必须已运行**（lifespan 中会测试连接）
- **认证中间件较简单**（仅密码）；生产环境应升级为 OAuth/JWT

### 数据库操作

- **记录 ID 使用 SurrealDB 语法**（table:id 格式，例如 `notebook:abc123`）
- **`ensure_record_id()`** 辅助函数可防止格式错误的 ID
- **软删除**通过 `archived` 字段实现（数据不删除，仅标记为非活跃）
- **时间戳为 ISO 8601 格式**（created、updated 字段）

### LangGraph 工作流

- **状态持久化**通过 `/data/sqlite-db/` 中的 SqliteSaver
- **无内置超时**；长时间工作流可能阻塞请求（对用户体验使用流式传输）
- **模型回退**在主提供商不可用时自动触发
- **检查点 ID** 每个会话必须唯一（避免冲突）

### AI 提供商集成

- **Esperanto 库**处理所有提供商 API（无直接 API 调用）
- **按请求覆盖**通过 RunnableConfig（临时，非持久）
- **成本估算**通过 Token 计数（非 100% 准确，仅供参考）
- **回退逻辑**在主模型失败时尝试更便宜的模型

### 文件上传

- **存储于 `/data/uploads/`** 目录（非数据库）
- **唯一文件名生成**防止覆盖（计数器后缀）
- **content-core 库**从 50+ 种文件类型提取文本
- **大文件**可能短暂阻塞 API（同步内容提取）

---

## 性能考量

### 优化策略

1. **连接池**：可配置池大小的 SurrealDB 异步驱动
2. **查询缓存**：前端 TanStack Query（客户端缓存）
3. **嵌入复用**：向量搜索使用预计算嵌入
4. **分块**：资料源切分为块以提升搜索相关性
5. **异步操作**：非阻塞 I/O 实现高并发
6. **懒加载**：前端仅请求所需数据（分页）

### 瓶颈

1. **LLM 调用**：延迟取决于提供商（通常 1–30 秒）
2. **嵌入生成**：耗时与内容大小及提供商成正比
3. **向量搜索**：对所有嵌入进行相似度计算
4. **内容提取**：资料源处理中的同步操作

### 监控

- **API 日志**：查看 loguru 输出中的错误与慢操作
- **数据库查询**：管理 UI 可查看 SurrealDB 指标
- **Token 用量**：通过 `estimate_tokens()` 工具估算
- **任务状态**：对异步操作轮询 `/commands/{id}`

---

## 扩展点

### 添加新工作流

1. 创建 `open_notebook/graphs/workflow_name.py`
2. 定义 StateDict 与节点函数
3. 使用 `.add_node()` / `.add_edge()` 构建图
4. 在 `api/workflow_service.py` 中创建服务
5. 在 `api/main.py` 中注册路由
6. 在 `tests/test_workflow.py` 中添加测试

### 添加新数据模型

1. 在 `open_notebook/domain/model_name.py` 中创建模型
2. 继承 BaseModel（领域对象）
3. 实现 `save()`、`get()`、`delete()` 方法（CRUD）
4. 若查询复杂，添加仓储函数
5. 在 `migrations/` 中创建数据库迁移
6. 在 `api/` 中添加 API 路由与模型

### 添加新 AI 提供商

1. 在 Esperanto 中配置新提供商（参见 .env.example）
2. ModelManager 通过环境变量自动检测
3. 通过按请求 config 覆盖（无需改代码）
4. 在提供商不可用时测试回退逻辑

---

## 部署考量

### 开发

- 所有服务在 localhost（3000、5055、8000）
- 文件变更时自动重载（Next.js、FastAPI）
- 数据库迁移热重载
- OpenAPI 文档：http://localhost:5055/docs

### 生产

- **前端**：部署至 Vercel、Netlify 或 Docker
- **API**：Docker 容器（参见 Dockerfile）
- **数据库**：SurrealDB 容器或托管服务
- **环境**：使用 API 密钥的安全 `.env` 文件
- **SSL/TLS**：反向代理（Nginx、CloudFlare）
- **速率限制**：在代理层添加
- **认证**：将 PasswordAuthMiddleware 替换为 OAuth/JWT
- **监控**：日志聚合（CloudWatch、DataDog 等）

---

## 总结

Open Notebook 的架构为注重隐私的 AI 驱动研究提供了坚实基础。关注点分离（前端/API/数据库）、异步优先设计以及多提供商灵活性，支持快速开发与便捷部署。LangGraph 工作流编排复杂的 AI 任务，Esperanto 抽象提供商细节。最终形成一个可扩展、易维护的系统，让用户掌控自己的数据与 AI 提供商选择。

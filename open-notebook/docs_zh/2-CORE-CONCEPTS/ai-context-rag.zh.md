# AI 上下文与 RAG - Open Notebook 如何使用你的研究

Open Notebook 根据功能采用不同方式让 AI 模型感知你的研究。本节说明 **Ask 中使用的检索增强生成 (RAG)** 与 **Chat 中使用的全内容上下文**。

---

## 问题：让 AI 感知你的数据

### 传统方法（及其问题）

**选项 1：微调（Fine-Tuning）**
- 用你的数据训练模型
- 优点：模型更专精
- 缺点：昂贵、缓慢、永久（无法「遗忘」）

**选项 2：将全部数据发往云端**
- 将所有数据上传到 ChatGPT/Claude API
- 优点：效果好、速度快
- 缺点：隐私风险、数据脱离控制、昂贵

**选项 3：忽略你的数据**
- 仅使用未包含你研究的基础模型
- 优点：私密、免费
- 缺点：AI 不了解你的具体主题

### Open Notebook 的双重方法

**Chat（聊天）**：将所选内容的完整文本发送给大语言模型（LLM）
- 简单透明：你选择来源，完整发送
- 最大上下文：AI 看到你选择的一切
- 由你控制包含哪些来源

**Ask（提问，RAG）**：检索增强生成 (RAG)
- 检索增强生成 (RAG) = Retrieval-Augmented Generation
- 核心思路：*搜索你的内容，找到相关片段，仅发送那些片段*
- 自动：AI 根据你的问题判断何为相关

---

## RAG 如何工作：三个阶段

### 阶段 1：内容准备

上传来源时，Open Notebook 为其检索做准备：

```
1. EXTRACT TEXT
   PDF → text
   URL → webpage text
   Audio → transcribed text
   Video → subtitles + transcription

2. CHUNK INTO PIECES
   Long documents → break into ~500-word chunks
   Why? AI context has limits; smaller pieces are more precise

3. CREATE EMBEDDINGS
   Each chunk → semantic vector (numbers representing meaning)
   Why? Allows finding chunks by similarity, not just keywords

4. STORE IN DATABASE
   Chunks + embeddings + metadata → searchable storage
```

**示例：**
```
Source: "AI Safety Research 2026" (50-page PDF)
↓
Extracted: 50 pages of text
↓
Chunked: 150 chunks (~500 words each)
↓
Embedded: Each chunk gets a vector (1536 numbers for OpenAI)
↓
Stored: Ready for search
```

---

### 阶段 2：查询时（你搜索的内容）

提问时，系统找到相关内容：

```
1. YOU ASK A QUESTION
   "What does the paper say about alignment?"

2. SYSTEM CONVERTS QUESTION TO EMBEDDING
   Your question → vector (same way chunks are vectorized)

3. SIMILARITY SEARCH
   Find chunks most similar to your question
   (using vector math, not keyword matching)

4. RETURN TOP RESULTS
   Usually top 5-10 most similar chunks

5. YOU GET BACK
   ✓ The relevant chunks
   ✓ Where they came from (sources + page numbers)
   ✓ Relevance scores
```

**示例：**
```
Q: "What does the paper say about alignment?"
↓
Q vector: [0.23, -0.51, 0.88, ..., 0.12]
↓
Search: Compare to all chunk vectors
↓
Results:
  - Chunk 47 (alignment section): similarity 0.94
  - Chunk 63 (safety approaches): similarity 0.88
  - Chunk 12 (related work): similarity 0.71
```

---

### 阶段 3：增强（AI 如何使用）

现在你有了相关片段，AI 使用它们：

```
SYSTEM BUILDS A PROMPT:
  "You are an AI research assistant.

   The user has the following research materials:
   [CHUNK 47 CONTENT]
   [CHUNK 63 CONTENT]

   User question: 'What does the paper say about alignment?'

   Answer based on the above materials."

AI RESPONDS:
  "Based on the research materials, the paper approaches
   alignment through [pulls from chunks] and emphasizes
   [pulls from chunks]..."

SYSTEM ADDS CITATIONS:
  "- See research materials page 15 for approach details
   - See research materials page 23 for emphasis on X"
```

---

## 两种搜索模式：精确 vs. 语义

Open Notebook 为不同目标提供两种搜索策略。

### 1. 文本搜索（关键词匹配）

**工作原理：**
- 使用 BM25 排序（与 Google 相同算法）
- 查找包含你关键词的片段
- 按相关性排序（关键词出现频率、位置等）

**何时使用：**
- 「我记得确切短语 'X'，想找到它」
- 「我在找特定姓名或数字」
- 「我需要精确引用」

**示例：**
```
Search: "transformer architecture"
Results:
  1. Chunk with "transformer architecture" 3 times
  2. Chunk with "transformer" and "architecture" separately
  3. Chunk with "transformer-based models"
```

### 2. 向量搜索（语义相似度）

**工作原理：**
- 将问题转换为向量（数字嵌入）
- 查找向量相似的片段
- 无需关键词——查找概念相似内容

**何时使用：**
- 「查找关于 X 的内容（不必说出原词）」
- 「我在探索某个概念」
- 「查找表述不同但意思相近的内容」

**示例：**
```
Search: "what's the mechanism for model understanding?"
Results (no "understanding" in any chunk):
  1. Chunk about interpretability and mechanistic analysis
  2. Chunk about feature analysis
  3. Chunk about attention mechanisms

Why? The vectors are semantically similar to your concept.
```

---

## 上下文管理：你的控制面板

Open Notebook 的不同之处：**由你决定 AI 看到什么。**

### 三个层级

| Level | What's Shared | Example Cost | Privacy | Use Case |
|-------|---------------|--------------|---------|----------|
| **Full Content** | Complete source text | 10,000 tokens | Low | Detailed analysis, close reading |
| **Summary Only** | AI-generated summary | 2,000 tokens | High | Background material, references |
| **Not in Context** | Nothing | 0 tokens | Max | Confidential, irrelevant, or archived |

### 如何工作

**完整内容：**
```
You: "What's the methodology in paper A?"
System:
  - Searches paper A
  - Retrieves full paper content (or large chunks)
  - Sends to AI: "Here's paper A. Answer about methodology."
  - AI analyzes complete content
  - Result: Detailed, precise answer
```

**仅摘要：**
```
You: "I want to chat using paper A and B"
System:
  - For Paper A: Sends AI-generated summary (not full text)
  - For Paper B: Sends full content (detailed analysis)
  - AI sees 2 sources but in different detail levels
  - Result: Uses summaries for context, details for focused content
```

**不在上下文中：**
```
You: "I have 10 sources but only want 5 in context"
System:
  - Paper A-E: In context (sent to AI)
  - Paper F-J: Not in context (AI can't see them, doesn't search them)
  - AI never knows these 5 sources exist
  - Result: Tight, focused context
```

### 为何重要

**隐私**：你控制离开系统的数据
```
Scenario: Confidential company docs + public research
Control: Public research in context → Confidential docs excluded
Result: AI never sees confidential content
```

**成本**：你控制 token 用量
```
Scenario: 100 sources for background + 5 for detailed analysis
Control: Full content for 5 detailed, summaries for 95 background
Result: 80% lower token cost than sending everything
```

**质量**：你控制 AI 聚焦的内容
```
Scenario: 20 sources, question requires deep analysis
Control: Full content for relevant source, exclude others
Result: AI doesn't get distracted; gives better answer
```

---

## 差异：Chat vs. Ask

**重要**：两者采用完全不同的方法！

### Chat：全内容上下文（无 RAG）

**工作原理：**
```
YOU:
  1. Select which sources to include in context
  2. Set context level (full/summary/excluded)
  3. Ask question

SYSTEM:
  - Takes ALL selected sources (respecting context levels)
  - Sends the ENTIRE content to the LLM at once
  - NO search, NO retrieval, NO chunking
  - AI sees everything you selected

AI:
  - Responds based on the full content you provided
  - Can reference any part of selected sources
  - Conversational: context stays for follow-ups
```

**适用于**：
- 你知道哪些来源相关
- 需要对话式来回
- 希望 AI 看到完整上下文
- 精读或分析

**优点：**
- 简单透明
- AI 看到一切（不遗漏）
- 对话流畅

**局限：**
- 受大语言模型上下文窗口限制
- 须手动选择相关来源
- 来源多时发送更多 token（成本更高）

---

### Ask：RAG - 自动检索

**工作原理：**
```
YOU:
  Ask one complex question

SYSTEM:
  1. Analyzes your question
  2. Searches across ALL your sources automatically
  3. Finds relevant chunks using vector similarity
  4. Retrieves only the most relevant pieces
  5. Sends ONLY those chunks to the LLM
  6. Synthesizes into comprehensive answer

AI:
  - Sees ONLY the retrieved chunks (not full sources)
  - Answers based on what was found to be relevant
  - One-shot answer (not conversational)
```

**适用于**：
- 来源很多且不知哪些相关
- 希望 AI 自动搜索
- 需要对复杂问题的一次性综合回答
- 希望尽量减少发送给 LLM 的 token

**优点：**
- 自动搜索（无需挑选来源）
- 可同时跨多来源工作
- 成本效益高（仅发送相关片段）

**局限：**
- 非对话式（单次问答）
- AI 仅看到检索片段（可能遗漏上下文）
- 搜索质量取决于问题与内容的匹配度

---

## 含义：隐私设计

Open Notebook 的 RAG 方法提供 ChatGPT 或 Claude 直连所不具备的能力：

**你控制以下边界：**
- 什么保持私密（在你的系统上）
- 什么发送给 AI（显式选择）
- AI 能看到什么（上下文层级）

### 审计轨迹

因一切均为显式检索，你可以追问：
- 「AI 用哪些来源回答？」→ 查看引用
- 「AI 确切看到了什么？」→ 查看上下文层级中的片段
- 「AI 的论断是否在我的来源中？」→ 验证引用

这比多数系统更能减少幻觉或曲解。

---

## 嵌入如何工作（简化说明）

语义搜索的魔力来自嵌入。直观理解如下：

### 思路
不存储文本，而存储表示「含义」的数字列表（向量）。

```
Chunk: "The transformer uses attention mechanisms"
Vector: [0.23, -0.51, 0.88, 0.12, ..., 0.34]
        (1536 numbers for OpenAI)

Another chunk: "Attention allows models to focus on relevant parts"
Vector: [0.24, -0.48, 0.87, 0.15, ..., 0.35]
        (similar numbers = similar meaning!)
```

### 为何有效
语义相近的词产生相近向量。因此：
- 「alignment」与「interpretability」向量相似
- 「transformer」与 「attention」向量相关
- 「cat」与 「dog」比 「cat」与 「radiator」更相似

### 搜索如何工作
```
Your question: "How do models understand their decisions?"
Question vector: [0.25, -0.50, 0.86, 0.14, ..., 0.33]

Compare to all stored vectors. Find the most similar:
- Chunk about interpretability: similarity 0.94
- Chunk about explainability: similarity 0.91
- Chunk about feature attribution: similarity 0.88

Return the top matches.
```

因此语义搜索能在措辞不同时仍找到概念相似内容。

---

## 关键设计决策

### 1. 搜索，而非训练
**原因？** 微调慢且永久。搜索灵活可逆。

### 2. 显式检索，而非隐式知识
**原因？** 你可验证 AI 所见。有审计轨迹。你控制离开系统的数据。

### 3. 多种搜索类型
**原因？** 不同问题需要不同搜索（关键词 vs. 语义）。两者兼备更强大。

### 4. 上下文作为权限系统
**原因？** 并非你保存的一切都需要到达 AI。你可细粒度控制。

---

## 摘要

Open Notebook 提供**两种方式**与 AI 协作：

### Chat（全内容）
- 将所选来源的完整内容发送给 LLM
- 手动控制：你挑选来源
- 对话式：来回对话
- 透明：你确切知道 AI 看到什么
- 最适合：聚焦分析、精读

### Ask（RAG）
- 自动搜索并检索相关片段
- 自动：AI 找到相关内容
- 一次性：单次综合回答
- 高效：仅发送相关片段
- 最适合：跨多来源的宽泛问题

**两种方法均：**
1. 保持数据私密（默认不离开你的系统）
2. 给予你控制（你选择使用哪些功能）
3. 创建审计轨迹（引用显示使用了什么）
4. 支持多家 AI 提供商

**即将推出**：社区正在为 Chat 增加 RAG 能力，兼顾两者优势。

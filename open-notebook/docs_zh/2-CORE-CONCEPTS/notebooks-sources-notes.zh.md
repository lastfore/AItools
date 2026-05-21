# 笔记本、来源与笔记 - 容器模型

Open Notebook 在三个相互关联的层级上组织研究。理解这一层级结构是有效使用系统的关键。

## 三层结构

```
┌─────────────────────────────────────┐
│         NOTEBOOK (The Container)    │
│     "My AI Safety Research 2026"   │
├─────────────────────────────────────┤
│                                     │
│  SOURCES (The Raw Materials)        │
│  ├─ safety_paper.pdf                │
│  ├─ alignment_video.mp4             │
│  └─ prompt_injection_article.html   │
│                                     │
│  NOTES (The Processed Insights)     │
│  ├─ AI Summary (auto-generated)     │
│  ├─ Key Concepts (transformation)   │
│  ├─ My Research Notes (manual)      │
│  └─ Chat Insights (from conversation)
│                                     │
└─────────────────────────────────────┘
```

---

## 1. 笔记本（NOTEBOOKS）- 研究容器

### 什么是笔记本？

**笔记本**是某一研究项目或主题的*有范围容器*。它是你的研究工作区。

可将其想象为实体笔记本：其中一切围绕同一主题，共享同一上下文，并朝向同一目标推进。

### 包含什么？

- **描述** — 「本笔记本收集关于 X 主题的研究」
- **来源** — 你添加的原始材料
- **笔记** — 你的洞察与输出
- **对话历史** — 你的聊天与提问

### 为何重要

**隔离**：每个笔记本完全独立。笔记本 A 中的来源不会出现在笔记本 B 中。这使你可以：
- 将不同研究主题完全隔离
- 在不同笔记本中复用来源名称而无冲突
- 控制哪些 AI 上下文适用于哪项研究

**共享上下文**：笔记本内所有来源与笔记继承笔记本的上下文。若笔记本标题为「AI Safety 2026」，描述为「聚焦对齐与可解释性」，该上下文适用于该笔记本内的所有 AI 交互。

**并行项目**：可同时运行 10 个笔记本，每个都是独立的研究环境。

### 示例

```
Notebook: "Customer Research - Product Launch"
Description: "User interviews and feedback for Q1 2026 launch"

→ All sources added to this notebook are about customer feedback
→ All notes generated are in that context
→ When you chat, the AI knows you're analyzing product launch feedback
→ Different from your "Market Analysis - Competitors" notebook
```

---

## 2. 来源（SOURCES）- 原始材料

### 什么是来源？

**来源**是*单条输入材料* — 你引入的原始内容。来源不会变更；仅被处理与索引。

### 哪些可作为来源？

- **PDF** — 研究论文、报告、文档
- **网页链接** — 文章、博客、网页
- **音频文件** — 播客、访谈、讲座
- **视频文件** — 教程、演示、录像
- **纯文本** — 笔记、转录、段落
- **上传文本** — 直接粘贴内容

### 添加来源时发生什么？

```
1. EXTRACTION
   File/URL → Extract text and metadata
   (OCR for PDFs, web scraping for URLs, speech-to-text for audio)

2. CHUNKING
   Long text → Break into searchable chunks
   (Prevents "too much context" in single query)

3. EMBEDDING
   Each chunk → Generate semantic vector
   (Allows AI to find conceptually similar content)

4. STORAGE
   Chunks + vectors → Store in database
   (Ready for search and retrieval)
```

### 关键属性

**不可变**：添加后来源不再改变。若需新版本，作为新来源再次添加。

**已索引**：来源自动建立文本与语义搜索索引。

**有范围**：每个来源恰好属于一个笔记本。

**可引用**：其他来源与笔记可通过引用指向该来源。

### 示例

```
Source: "openai_charter.pdf"
Type: PDF document

What happens:
→ PDF is uploaded
→ Text is extracted (including images)
→ Text is split into 50 chunks (paragraphs, sections)
→ Each chunk gets an embedding vector
→ Now searchable by: "OpenAI's approach to safety"
```

---

## 3. 笔记（NOTES）- 处理后的洞察

### 什么是笔记？

**笔记**是*处理后的输出* — 你或 AI 基于来源创建的内容。笔记是研究工作的「成果」。

### 笔记类型

#### 手动笔记
由你亲自撰写，记录：
- 从来源中学到的内容
- 你的分析与解读
- 后续步骤与问题

#### AI 生成笔记
通过对来源应用 AI 处理创建：
- **转换（Transformations）** — 结构化提取（要点、关键概念、方法论）
- **聊天回复（Chat Responses）** — 你保存的对话回答
- **Ask 结果** — 保存到笔记本的综合回答

#### 捕获的洞察
你从交互中显式保存的内容：
- 「将此回复保存为笔记」
- 「保存此转换结果」
- 将任意 AI 输出转为永久笔记

### 笔记可包含什么？

- **文本** — 你的写作或 AI 生成内容
- **引用** — 指向特定来源
- **元数据** — 创建时间、创建方式（手动/AI）、受影响来源
- **标签** — 你的分类（可选但有用）

### 笔记为何重要

**知识积累**：笔记成为你的实际知识库，是研究带走的成果。

**可搜索**：笔记与来源一并可搜索。「查找关于 X 的一切」包含你的笔记，不仅是来源。

**可引用**：笔记可引用来源，形成洞察出处的审计轨迹。

**可分享**：笔记是你的输出，可分享、发布或在其他项目中复用。

---

## 它们如何连接：数据流

```
YOU
 │
 ├─→ Create Notebook ("AI Research")
 │
 ├─→ Add Sources (papers, articles, videos)
 │    └─→ System: Extract, embed, index
 │
 ├─→ Search Sources (text or semantic)
 │    └─→ System: Find relevant chunks
 │
 ├─→ Apply Transformations (extract insights)
 │    └─→ Creates Notes
 │
 ├─→ Chat with Sources (explore with context control)
 │    ├─→ Can save responses as Notes
 │    └─→ Notes include citations
 │
 ├─→ Ask Questions (automated comprehensive search)
 │    ├─→ Can save results as Notes
 │    └─→ Notes include citations
 │
 └─→ Generate Podcast (transform notebook into audio)
     └─→ Uses all sources + notes for content
```

---

## 关键设计决策

### 1. 每个来源只属于一个笔记本

每个来源恰好属于一个笔记本，边界清晰：
- 来源属于哪项研究无歧义
- 易于隔离或导出完整项目
- 权限模型简洁（访问笔记本即访问其全部来源）

### 2. 来源不可变，笔记可变

来源添加后不变。笔记可编辑或删除。原因：
- 来源是证据 → 证据不应被篡改
- 笔记是你的思考 → 思考随学习而演进

### 3. 显式上下文控制

来源不会自动发送给 AI。你为每次交互决定哪些来源「在上下文中」：
- Chat：手动选择包含哪些来源
- Ask：系统自动判断搜索哪些来源
- 转换：你选择要转换哪些来源

这与始终将全部内容发送给 AI 的系统不同。

---

## 心智模型说明

### 笔记本即边界
将笔记本想象为 Git 仓库：
- 其中一切围绕同一主题
- 可克隆/分叉（复制到新项目）
- 有明确的纳入与排除边界
- 你确切知道包含什么

### 来源即证据
将来源想象为法律案件中的证物：
- 提交后不再改变
- 可被引用与参照
- 是论断所依据的 ground truth
- 多个来源可交叉引用

### 笔记即综合
将笔记想象为你的案情摘要：
- 基于证据撰写
- 是你的解读
- 可引用支持各主张的证据
- 是你实际分享或行动的内容

---

## 常见问题

### 能否将来源移到其他笔记本？
不能直接移动。每个来源绑定一个笔记本。若需在多个笔记本中使用，再次添加（若已处理过，上传很快）。

### 笔记能否引用其他笔记本的来源？
不能。笔记留在其笔记本内，并引用该笔记本内的来源，以保持边界清晰。

### 如何在笔记本内对来源分组？
使用标签。可为来源打标签（「主要研究」「背景」「方法论」）并按标签筛选。

### 能否合并两个笔记本？
无内置功能，但可通过重新上传将来源从一本复制到另一本。

---

## 摘要

| 概念 | 用途 | 生命周期 | 范围 |
|---------|---------|-----------|-------|
| **Notebook** | 容器 + 上下文 | 创建一次，配置 | 其全部来源与笔记 |
| **Source** | 原始材料 | 添加 → 处理 → 存储 | 一个笔记本 |
| **Note** | 处理后的输出 | 创建/捕获 → 编辑 → 分享 | 一个笔记本 |

这一三层模型带来：
- **清晰组织**（一切按项目划分范围）
- **隐私控制**（笔记本隔离）
- **审计轨迹**（笔记引用来源）
- **灵活性**（笔记可手动或 AI 生成）

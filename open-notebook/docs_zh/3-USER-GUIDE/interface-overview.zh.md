# 界面概览 - 熟悉操作界面

Open Notebook 采用简洁的三栏布局。本指南说明各功能所在位置。

---

## 主布局

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Notebooks  Search  Podcasts  Models  Settings      │
├──────────────┬──────────────┬───────────────────────────────┤
│              │              │                               │
│   SOURCES    │    NOTES     │           CHAT                │
│              │              │                               │
│  Your docs   │  Your        │   Talk to AI about            │
│  PDFs, URLs  │  insights    │   your sources                │
│  Videos      │  summaries   │                               │
│              │              │                               │
│  [+Add]      │  [+Write]    │   [Type here...]              │
│              │              │                               │
└──────────────┴──────────────┴───────────────────────────────┘
```

---

## 导航栏

顶部导航可进入主要区域：

| 图标 | 页面 | 功能 |
|------|------|--------------|
| **Notebooks** | 主工作区 | 研究项目 |
| **Search** | Ask 与搜索 | 跨所有笔记本查询 |
| **Podcasts** | 音频生成 | 管理播客配置 |
| **Models** | AI 配置 | 设置提供商与模型 |
| **Settings** | 偏好设置 | 应用配置 |

---

## 左栏：来源

研究材料位于此处。

### 您将看到

```
┌─────────────────────────┐
│  Sources (5)            │
│  [+ Add Source]         │
├─────────────────────────┤
│  ┌─────────────────┐    │
│  │ 📄 Paper.pdf    │    │
│  │ 🟢 Full Content │    │
│  │ [⋮ Menu]        │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ 🔗 Article URL  │    │
│  │ 🟡 Summary Only │    │
│  │ [⋮ Menu]        │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

### 来源卡片元素

- **图标** - 文件类型（PDF、URL、视频等）
- **标题** - 文档名称
- **上下文指示** - AI 可见范围：
  - 🟢 Full Content（完整内容）
  - 🟡 Summary Only（仅摘要）
  - ⛔ Not in Context（不在上下文中）
- **菜单 (⋮)** - 编辑、转换、删除

### 添加来源按钮

点击可添加：
- 文件上传（PDF、DOCX 等）
- 网页 URL
- YouTube 视频
- 纯文本

---

## 中栏：笔记

您的洞察与 AI 生成内容。

### 您将看到

```
┌─────────────────────────┐
│  Notes (3)              │
│  [+ Write Note]         │
├─────────────────────────┤
│  ┌─────────────────┐    │
│  │ 📝 My Analysis  │    │
│  │ Manual note     │    │
│  │ Jan 3, 2026     │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ 🤖 Summary      │    │
│  │ From transform  │    │
│  │ Jan 2, 2026     │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

### 笔记卡片元素

- **图标** - 笔记类型（手动 📝 或 AI 🤖）
- **标题** - 笔记名称
- **来源** - 创建方式
- **日期** - 创建时间

### 撰写笔记按钮

点击可：
- 创建手动笔记
- 添加自己的洞察
- 支持 Markdown

---

## 右栏：对话

AI 对话空间。

### 您将看到

```
┌───────────────────────────────┐
│  Chat                         │
│  Session: Research Discussion │
│  [+ New Session] [Sessions ▼] │
├───────────────────────────────┤
│                               │
│  You: What's the main         │
│       finding?                │
│                               │
│  AI: Based on the paper [1],  │
│      the main finding is...   │
│      [Save as Note]           │
│                               │
│  You: Tell me more about      │
│       the methodology.        │
│                               │
├───────────────────────────────┤
│  Context: 3 sources (12K tok) │
├───────────────────────────────┤
│  [Type your message...]  [↑]  │
└───────────────────────────────┘
```

### 对话元素

- **会话选择器** - 切换不同对话
- **消息历史** - 对话记录
- **保存为笔记** - 保留优质回复
- **上下文指示** - AI 可见内容
- **输入框** - 输入问题

---

## 上下文指示

显示 AI 可访问的内容：

### Token 计数

```
Context: 3 sources (12,450 tokens)
         ↑          ↑
         包含的     大致成本指示
         来源
```

### 按来源指示

| 指示 | 含义 | AI 访问 |
|-----------|---------|-----------|
| 🟢 Full Content | 完整文本 | 全部内容 |
| 🟡 Summary Only | AI 摘要 | 仅要点 |
| ⛔ Not in Context | 已排除 | 无 |

点击任意来源可更改其上下文级别。

---

## 播客标签页

在笔记本内切换到 Podcasts：

```
┌───────────────────────────────┐
│  [Chat]  [Podcasts]           │
├───────────────────────────────┤
│  Episode Profile: [Select ▼]  │
│                               │
│  Speakers:                    │
│  ├─ Host: Alex (voice model)  │
│  └─ Guest: Sam (voice model)  │
│                               │
│  Include:                     │
│  ☑ Paper.pdf                  │
│  ☑ My Analysis (note)         │
│  ☐ Background article         │
│                               │
│  [Generate Podcast]           │
└───────────────────────────────┘
```

---

## 设置页面

通过导航栏 → Settings 访问：

### 主要分区

| 分区 | 控制内容 |
|---------|------------------|
| **Processing** | 文档与 URL 提取引擎 |
| **Embedding** | 自动嵌入设置 |
| **Files** | 处理后自动删除上传文件 |
| **YouTube** | 首选转录语言 |

---

## 模型页面

配置 AI 提供商：

```
┌───────────────────────────────────────┐
│  Models                               │
├───────────────────────────────────────┤
│  Language Models                      │
│  ┌─────────────────────────────────┐  │
│  │ GPT-4o (OpenAI)         [Edit]  │  │
│  │ Claude Sonnet (Anthropic)       │  │
│  │ Llama 3.3 (Ollama)      [⭐]    │  │
│  └─────────────────────────────────┘  │
│  [+ Add Model]                        │
│                                       │
│  Embedding Models                     │
│  ┌─────────────────────────────────┐  │
│  │ text-embedding-3-small  [⭐]    │  │
│  └─────────────────────────────────┘  │
│                                       │
│  Text-to-Speech                       │
│  ┌─────────────────────────────────┐  │
│  │ OpenAI TTS             [⭐]     │  │
│  │ Google TTS                      │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

- **⭐** = 该类别默认模型
- **[Edit]** = 修改配置
- **[+ Add]** = 添加新模型

---

## 搜索页面

跨所有笔记本查询：

```
┌───────────────────────────────────────┐
│  Search                               │
├───────────────────────────────────────┤
│  [What are you looking for?    ] [🔍] │
│                                       │
│  Search type: [Text ▼] [Vector ▼]     │
│  Search in:   [Sources] [Notes]       │
├───────────────────────────────────────┤
│  Results (15)                         │
│                                       │
│  📄 Paper.pdf - Notebook: Research    │
│     "...the transformer model..."     │
│                                       │
│  📝 My Analysis - Notebook: Research  │
│     "...key findings include..."      │
└───────────────────────────────────────┘
```

---

## 常用操作

### 创建笔记本

```
Notebooks page → [+ New Notebook] → Enter name → Create
```

### 添加来源

```
Inside notebook → [+ Add Source] → Choose type → Upload/paste → Wait for processing
```

### 提问

```
Inside notebook → Chat panel → Type question → Enter → Read response
```

### 保存 AI 回复

```
Get good response → Click [Save as Note] → Edit title → Save
```

### 更改上下文级别

```
Click source → Context dropdown → Select level → Changes apply immediately
```

### 生成播客

```
Podcasts tab → Select profile → Choose sources → [Generate] → Wait → Download
```

---

## 键盘快捷键

| 按键 | 操作 |
|-----|--------|
| `Enter` | 发送对话消息 |
| `Shift + Enter` | 对话中换行 |
| `Escape` | 关闭对话框 |
| `Ctrl/Cmd + F` | 浏览器查找 |

---

## 移动端视图

较小屏幕上，三栏布局垂直堆叠：

```
┌─────────────────┐
│    SOURCES      │
│    (tap to expand)
├─────────────────┤
│    NOTES        │
│    (tap to expand)
├─────────────────┤
│    CHAT         │
│    (always visible)
└─────────────────┘
```

- 面板折叠以节省空间
- 点击标题展开/折叠
- 对话始终可访问
- 功能完整保留

---

## 高效导航提示

1. **使用键盘** - Enter 发送消息，Escape 关闭对话框
2. **先设上下文** - 对话前设置来源上下文
3. **会话** - 为不同主题创建新会话
4. **全局搜索** - 使用搜索页面跨笔记本查找
5. **模型页面** - 收藏常用模型

---

现在您已了解各功能位置。从 [添加来源](adding-sources.zh.md) 开始您的研究之旅！

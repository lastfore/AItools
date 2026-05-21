# 高效搜索 - 找到所需内容

搜索是进入研究的入口。本指南介绍两种搜索模式及各自适用场景。

---

## 快速入门：查找内容

### 简单搜索

```
1. 进入笔记本
2. 在搜索框中输入
3. 查看结果（来源与笔记）
4. 点击结果查看来源/笔记
5. 完成！

适用于基础搜索。
但您还可以做得更好……
```

---

## 两种搜索模式说明

Open Notebook 提供两种根本不同的搜索方式。

### 搜索类型 1：文本搜索（关键词匹配）

**工作原理：**
- 您搜索词语：「transformer」
- 系统查找包含「transformer」的块
- 按相关性排序：频次、位置、语境

**速度：** 极快（即时）

**适用场景：**
- 记得确切词语或短语
- 查找特定术语
- 需要精确关键词匹配
- 需要精确引文

**示例：**
```
搜索：「attention mechanism」
结果：
  1. 「The attention mechanism allows...」（完全匹配）
  2. 「Attention and other mechanisms...」（部分匹配）
  3. 「How mechanisms work in attention...」（词语分开出现）

均包含「attention」与「mechanism」
按词语接近程度排序
```

**能找到：**
- 精确短语：「transformer model」
- 单个词：transformer 或 model（过宽）
- 人名：「Vaswani et al.」
- 数字：「1994」、「GPT-4」
- 技术术语：「LSTM」、「convolution」

**找不到：**
- 近义词：搜「attention」不会找到「focus」
- 同义表达：搜「large」不会找到「big」
- 概念：搜「similarity」不会找到「likeness」

---

### 搜索类型 2：向量搜索（语义/概念匹配）

**工作原理：**
- 将搜索转换为嵌入（向量）
- 所有块均转换为嵌入
- 系统查找最相似的嵌入
- 按语义相似度排序

**速度：** 略慢（1–2 秒）

**适用场景：**
- 探索某一概念
- 不知道确切用词
- 需要语义相近内容
- 处于发现而非检索模式

**示例：**
```
搜索：「What's the mechanism for understanding in models?」
（注意：可能没有块完全这样表述）

结果：
  1. 「Mechanistic interpretability allows understanding...」（语义匹配）
  2. 「Feature attribution reveals how models work...」（概念相近）
  3. 「Attention visualization shows model decisions...」（同一主题）

均不包含您的原话
但语义相关
```

**能找到：**
- 相近概念：「understanding」+「interpretation」+「explainability」（均相关）
- 转述：「big」与「large」（同义）
- 相关思想：「safety」与「alignment」（关联概念）
- 类比：搜「learning」时找到关于生物学习的内容

**找不到：**
- 精确关键词：若搜索罕见词，向量搜索可能遗漏
- 特定数字：「1994」与「1993」语义不同
- 技术行话：「LSTM」与「RNN」相关但不同

---

## 决策：文本搜索 vs 向量搜索？

```
问题：「我是否记得确切用词？」

→ 是：使用文本搜索
   示例：「我记得论文写了 'attention is all you need'」

→ 否：使用向量搜索
   示例：「我想找关于模型如何处理信息的内容」

→ 不确定：先试文本搜索（更快）
         若无结果，再试向量搜索

文本搜索：「我知道要找什么」
向量搜索：「我在探索一个想法」
```

---

## 分步操作：使用各搜索方式

### 文本搜索

```
1. 进入搜索框
2. 输入关键词：「transformer」、「attention」、「2017」
3. 按 Enter
4. 结果出现（通常即时）
5. 点击结果查看语境

结果显示：
  - 哪个来源包含
  - 出现次数
  - 相关性分数
  - 周围文本预览
```

### 向量搜索

```
1. 进入搜索框
2. 输入概念：「How do models understand language?」
3. 在下拉中选择「Vector Search」
4. 按 Enter
5. 结果出现（1–2 秒）
6. 点击结果查看语境

结果显示：
  - 语义相关块
  - 相似度分数（越高越相关）
  - 周围文本预览
  - 不同来源混合排列
```

---

## Ask 功能（自动搜索）

Ask 与简单搜索不同。它会自动搜索、综合并回答。

### Ask 如何工作

```
阶段 1：问题理解
  「Compare the approaches in my papers」
  → 系统：「这是在要求比较」

阶段 2：搜索策略
  → 系统：「应分别搜索各方法」

阶段 3：并行搜索
  → 搜索 1：「Approach in paper A」
  → 搜索 2：「Approach in paper B」
  （多个搜索同时进行）

阶段 4：分析与综合
  → 单结果分析：「Based on paper A, the approach is...」
  → 单结果分析：「Based on paper B, the approach is...」
  → 最终综合：「Comparing A and B: A differs from B in...」

结果：全面答案，而非仅搜索结果列表
```

### 何时用 Ask vs 简单搜索

| 任务 | 使用 | 原因 |
|------|-----|------|
| 「Find the quote about X」 | **文本搜索** | 需要确切用词 |
| 「What does source A say about X?」 | **文本搜索** | 直接、快速 |
| 「Find content about X」 | **向量搜索** | 语义发现 |
| 「Compare A and B」 | **Ask** | 需要全面综合 |
| 「What's the big picture?」 | **Ask** | 需要完整分析 |
| 「How do these sources relate?」 | **Ask** | 跨来源综合 |
| 「I remember something about X」 | **文本搜索** | 回忆记忆 |
| 「I'm exploring the topic of X」 | **向量搜索** | 探索模式 |

---

## 高级搜索策略

### 策略 1：简单搜索 + 追问

```
1. 文本搜索：「attention mechanism」
   结果：50 条匹配

2. 过多。再用向量搜索追问：
   「Why is attention useful?」（概念搜索）
   结果：最相关论文/笔记

3. 更少噪声、更好结果
```

### 策略 2：Ask 获取概览，再搜索细节

```
1. Ask：「What are the main approaches to X?」
   结果：关于 A、B、C 的全面答案

2. 据此识别具体来源

3. 在这些来源中文本搜索：
   「Why did they choose method X?」
   结果：详细信息
```

### 策略 3：向量发现，文本核实

```
1. 向量搜索：「How do transformers generalize?」
   结果：概念相关论文

2. 浏览以了解全貌

3. 在有望的来源中文本搜索：
   「generalization」、「extrapolation」、「transfer」
   结果：需细读的特定段落
```

### 策略 4：搜索 + 对话结合

```
1. 向量搜索：「What's new in AI 2026?」
   结果：最新论文

2. 进入对话（参见 [高效对话](chat-effectively.zh.md)）
3. 将论文加入上下文
4. 提出详细追问
5. 对结果做深入分析
```

---

## 搜索质量问题与修复

### 无结果

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 文本搜索无结果 | 词未出现 | 改用向量搜索 |
| 向量搜索无结果 | 概念不在内容中 | 使用更宽泛搜索词 |
| 两者皆空 | 内容不在笔记本 | 向笔记本添加来源 |
| | 来源未处理完成 | 等待处理完成 |

### 结果过多

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 1000+ 条结果 | 搜索过宽 | 更具体 |
| | 所有来源 | 按来源筛选 |
| | 关键词匹配罕见词 | 改用向量搜索 |

### 结果错误

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 结果不相关 | 搜索词多义 | 提供更多语境 |
| | 用文本搜概念 | 改用向量搜索 |
| 含义不同 | 同形异义 | 添加上下文（如「attention mechanism」） |

### 结果质量低

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 结果不符合意图 | 搜索词模糊 | 更具体（「Who invented X?」而非「X」） |
| | 概念在内容中体现不足 | 添加更多该主题来源 |
| | 向量嵌入未覆盖该领域 | 以文本搜索为后备 |

---

## 更好搜索的技巧

### 文本搜索
1. **要具体** — 「attention mechanism」而非仅「attention」
2. **使用精确短语** — 加引号：「attention is all you need」
3. **包含语境** — 「LSTM vs attention」而非仅「attention」
4. **使用技术术语** — 通常更精确
5. **尝试同义词** — 首次失败则试相关词

### 向量搜索
1. **以问题形式提问** — 「What's the best way to X?」优于「best way」
2. **使用自然语言** — 说明您在找什么
3. **明确意图** — 「Compare X and Y」而非「X and Y」
4. **包含语境** — 「In machine learning, how...」而非仅「how...」
5. **从概念思考** — 您在探索什么想法？

### 通用技巧
1. **先宽后窄** — 「AI papers」→「transformers」→「attention mechanism」
2. **两种搜索都试** — 各自发现不同内容
3. **复杂问题用 Ask** — 不要只搜索
4. **将好结果保存为笔记** — 建立知识库（参见 [使用笔记](working-with-notes.zh.md)）
5. **按需按来源筛选** — 「仅在 Paper A 中搜索」

---

## 搜索示例

### 示例 1：查找特定事实

**目标：**「查找 transformer 引入的日期」

```
步骤 1：文本搜索
  「transformer 2017」（或您记得的年份）

若成功：完成！

若无结果：试
  「attention is all you need」（著名论文标题）

在结果中核对确切日期
```

### 示例 2：探索概念

**目标：**「查找关于 alignment interpretability 的内容」

```
步骤 1：向量搜索
  「How do we make AI interpretable?」

结果：关于可解释性、透明度、对齐的论文

步骤 2：审阅结果
  看哪些论文最相关

步骤 3：深入
  进入对话，加入前 2–3 篇论文
  就 alignment 提出详细问题
```

### 示例 3：全面答案

**目标：**「不同 AI 安全方法如何比较？」

```
步骤 1：Ask
  「Compare the main approaches to AI safety in my sources」

结果：比较各方法的全面分析

步骤 2：识别来源
  从答案看哪些论文最相关

步骤 3：深入
  在这些论文中文本搜索：
  「limitations」、「critiques」、「open problems」

步骤 4：保存为笔记
  将 Ask 结果整理为比较笔记
```

### 示例 4：查找模式

**目标：**「找出所有提到 transformer 的论文」

```
步骤 1：文本搜索
  「transformer」

结果：所有提到「transformer」的论文

步骤 2：向量搜索
  「neural network architecture for sequence processing」

结果：未写「transformer」但讨论类似概念的论文

步骤 3：合并
  文本 + 向量结果并集呈现全貌

步骤 4：分析
  在对话中加入全部结果
  问：「What's common across all these?」
```

---

## 搜索在工作流中的位置

搜索如何与其他功能配合：

```
来源
  ↓
搜索（找到重要内容）
  ├─ 文本搜索（精确）
  ├─ 向量搜索（探索）
  └─ Ask（全面）
  ↓
对话（追问探索）（参见 [高效对话](chat-effectively.zh.md)）
  ↓
转换（批量提取）（参见 [转换](transformations.zh.md)）
  ↓
笔记（保存洞察）（参见 [使用笔记](working-with-notes.zh.md)）
```

### 工作流示例

```
1. 向笔记本添加 10 篇论文

2. 搜索：「What's the state of the art?」
   （向量搜索探索全貌）

3. Ask：「Compare these 3 approaches」
   （全面综合）

4. 对话：就胜出方案深入提问
   （追问探索）

5. 将最佳洞察保存为笔记
   （知识沉淀）

6. 对其余论文应用转换
   （批量提取供日后使用）

7. 用笔记 + 来源创建播客
   （分享发现）（参见 [创建播客](creating-podcasts.zh.md)）
```

---

## 摘要：选对搜索方式

**文本搜索** — 「我知道要找什么」
- 快速、精确、基于关键词
- 记得确切词语/短语时使用
- 最适合：特定事实、引文、技术术语
- 速度：即时

**向量搜索** — 「我在探索一个想法」
- 略慢、基于概念、语义
- 发现关联时使用
- 最适合：概念探索、相关思想、同义表达
- 速度：1–2 秒

**Ask** — 「我要全面答案」
- 自动搜索、分析、综合
- 需要多来源的复杂问题时使用
- 最适合：比较、宏观问题、综合
- 速度：10–30 秒

根据搜索目标选对工具，更快找到所需内容。

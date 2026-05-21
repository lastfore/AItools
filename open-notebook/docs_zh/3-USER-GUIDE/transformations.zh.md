# 转换 - 批量处理来源

转换对多个来源一次性应用相同分析。无需反复提问，定义模板后在内容上批量运行。

---

## 何时使用转换

| 使用转换当 | 改用对话当 |
|-----------|-----------|
| 对多份来源做相同分析 | 一次性问题 |
| 需要一致输出格式 | 探索性交流 |
| 批量处理 | 需要追问 |
| 创建结构化笔记 | 问题间上下文变化 |

**示例**：您有 10 篇论文，每篇都要摘要。一次转换操作即可完成。

---

## 快速入门：第一次转换

```
1. 进入笔记本
2. 在导航中点击「Transformations」
3. 选择内置模板（如「Summary」）
4. 选择要转换的来源
5. 点击「Apply」
6. 等待处理
7. 新笔记自动出现
```

---

## 内置转换

Open Notebook 提供即用模板：

### Summary（摘要）

```
作用：生成 200–300 字概览
输出：要点、主要论点、结论
最适合：快速参考、把握大意
```

### Key Concepts（关键概念）

```
作用：提取主要思想与术语
输出：概念列表及说明
最适合：学习新主题、建立词汇
```

### Methodology（方法论）

```
作用：提取研究方法
输出：研究如何进行
最适合：学术论文、研究综述
```

### Takeaways（要点）

```
作用：提取可执行洞察
输出：应如何利用该信息
最适合：商业文档、实用指南
```

### Questions（问题）

```
作用：生成来源引发的问题
输出：开放问题、空白、后续研究
最适合：文献综述、研究规划
```

---

## 创建自定义转换

### 分步操作

```
1. 进入「Transformations」页面
2. 点击「Create New」
3. 输入名称：「Academic Paper Analysis」
4. 编写提示模板：

   「Analyze this academic paper and extract:

   1. **Research Question**: What problem does this address?
   2. **Hypothesis**: What did they predict?
   3. **Methodology**: How did they test it?
   4. **Key Findings**: What did they discover? (numbered list)
   5. **Limitations**: What caveats do the authors mention?
   6. **Future Work**: What do they suggest next?

   Be specific and cite page numbers where possible.」

5. 点击「Save」
6. 转换出现在列表中
```

### 提示模板技巧

**明确格式：**
```
好：「List 5 key points as bullet points」
差：「What are the key points?」
```

**要求结构：**
```
好：「Create sections for: Summary, Methods, Results」
差：「Tell me about this paper」
```

**要求引用：**
```
好：「Cite page numbers for each claim」
差：（未要求引用）
```

**设定期望长度：**
```
好：「In 200-300 words, summarize...」
差：「Summarize this」
```

---

## 应用转换

### 对单个来源

```
1. 在来源面板中，点击来源菜单（⋮）
2. 选择「Transform」
3. 选择转换模板
4. 点击「Apply」
5. 完成后出现笔记
```

### 对多个来源（批量）

```
1. 进入 Transformations 页面
2. 选择模板
3. 勾选多个来源
4. 点击「Apply to Selected」
5. 并行处理
6. 每个来源生成一条笔记
```

### 处理时间

| 来源数 | 典型时间 |
|--------|----------|
| 1 份 | 30 秒 – 1 分钟 |
| 5 份 | 2–3 分钟 |
| 10 份 | 4–5 分钟 |
| 20+ 份 | 8–10 分钟 |

处理在后台运行，可继续其他工作。

---

## 转换示例

### 文献综述模板

```
名称：Literature Review Entry

提示：
「For this research paper, create a literature review entry:

**Citation**: [Author(s), Year, Title, Journal]
**Research Question**: What problem is addressed?
**Methodology**: What approach was used?
**Sample**: What population/data was studied?
**Key Findings**:
1. [Finding with page citation]
2. [Finding with page citation]
3. [Finding with page citation]
**Strengths**: What did this study do well?
**Limitations**: What are the gaps?
**Relevance**: How does this connect to my research?

Keep each section to 2-3 sentences.」
```

### 会议笔记模板

```
名称：Meeting Summary

提示：
「From this meeting transcript, extract:

**Attendees**: Who was present
**Date/Time**: When it occurred
**Key Decisions**: What was decided (numbered)
**Action Items**:
- [ ] Task (Owner, Due Date)
**Open Questions**: Unresolved issues
**Next Steps**: What happens next

Format as clear, scannable notes.」
```

### 竞品分析模板

```
名称：Competitor Analysis

提示：
「Analyze this company/product document:

**Company**: Name and overview
**Products/Services**: What they offer
**Target Market**: Who they serve
**Pricing**: If available
**Strengths**: Competitive advantages
**Weaknesses**: Gaps or limitations
**Opportunities**: How we compare
**Threats**: What they do better

Be objective and cite specific details.」
```

### 技术文档模板

```
名称：API Documentation Summary

提示：
「Extract from this technical document:

**Overview**: What does this do? (1-2 sentences)
**Authentication**: How to authenticate
**Key Endpoints**:
- Endpoint 1: [method] [path] - [purpose]
- Endpoint 2: ...
**Common Parameters**: Frequently used params
**Rate Limits**: If mentioned
**Error Codes**: Key error responses
**Example Usage**: Simple code example if possible

Keep technical but concise.」
```

---

## 管理转换

### 编辑转换

```
1. 进入 Transformations 页面
2. 找到模板
3. 点击「Edit」
4. 修改提示
5. 点击「Save」
```

### 删除转换

```
1. 进入 Transformations 页面
2. 找到模板
3. 点击「Delete」
4. 确认
```

### 排序/整理

内置转换在前，自定义转换按字母顺序排列。

---

## 转换输出

### 结果存放位置

- 每个来源产生一条笔记
- 笔记出现在笔记本的笔记面板
- 笔记带有转换名称标签
- 链接到原始来源

### 笔记命名

```
默认：「[Transformation Name] - [Source Title]」
示例：「Summary - Research Paper 2025.pdf」
```

### 编辑输出

```
1. 点击生成的笔记
2. 点击「Edit」
3. 润色内容
4. 保存
```

---

## 最佳实践

### 模板设计

1. **从具体开始** — 模糊提示产生模糊结果
2. **使用格式** — 标题、列表、编号
3. **要求引用** — 使结果可核实（参见 [引用](citations.zh.md)）
4. **设定长度** — 避免过长或过短
5. **先测试** — 批量前先在一份来源上运行

### 来源选择

1. **内容相似** — 对相似来源使用同一转换
2. **体量合理** — 过长来源可能需要拆分
3. **处理状态** — 确保来源已完全处理

### 质量控制

1. **抽查样本** — 批量前检查前几条输出
2. **按需编辑** — 转换是起点，非终点
3. **迭代提示** — 根据结果优化

---

## 常见问题

### 输出过于笼统

**问题**：结果过于模糊  
**解决**：使提示更具体，添加格式要求

### 信息缺失

**问题**：未提取关键细节  
**解决**：在提示中明确要求所需内容

### 格式不一致

**问题**：各条笔记外观不同  
**解决**：在提示中加入清晰格式说明

### 过长/过短

**问题**：输出不符合预期  
**解决**：指定字数或各节长度

### 处理失败

**问题**：转换未完成  
**解决**：
- 检查来源是否已处理
- 尝试更短/更简单的提示
- 逐个处理来源

---

## 转换 vs 对话 vs Ask

| 功能 | 转换 | 对话 | Ask |
|------|------|------|-----|
| **输入** | 预定义模板 | 您的问题 | 您的问题 |
| **范围** | 每次一份来源 | 所选来源 | 自动搜索 |
| **输出** | 结构化笔记 | 对话 | 全面答案 |
| **最适合** | 批量处理 | 探索 | 一次性答案 |
| **追问** | 再次运行 | 继续提问 | 新查询 |

---

## 摘要

```
转换 = 批量 AI 处理

使用方法：
1. 定义模板（或使用内置）
2. 选择来源
3. 应用转换
4. 获得结构化笔记

适用场景：
- 对多份来源做相同分析
- 需要一致输出
- 构建结构化知识库
- 节省重复劳动

技巧：
- 提示要具体
- 要求格式
- 批量前先测试
- 按需编辑输出
```

转换将重复分析变为一键操作。定义一次，多次应用。

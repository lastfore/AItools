# 使用笔记 - 捕获与整理洞察

笔记是您处理后的知识。本指南介绍如何有效创建、整理与使用笔记。

---

## 什么是笔记？

笔记是您的**研究产出** — 分析来源时捕获的洞察。可以是：

- **手动** — 您亲自撰写
- **AI 生成** — 来自对话回复、Ask 结果或转换
- **混合** — AI 洞察 + 您的编辑与补充

与来源（不变）不同，笔记可修改 — 您可编辑、完善与整理。

---

## 快速入门：创建第一条笔记

### 方式 1：手动笔记（自行撰写）

```
1. 在笔记本中进入「Notes」区域
2. 点击「Create New Note」
3. 填写标题：「Key insights from source X」
4. 撰写内容（支持 Markdown）
5. 点击「Save」
6. 完成！笔记出现在笔记本中
```

### 方式 2：从对话保存

```
1. 进行对话
2. 获得满意的 AI 回复
3. 在回复下点击「Save as Note」
4. 填写笔记标题
5. 补充任何额外语境
6. 点击「Save」
7. 完成！笔记出现在笔记本中
```

### 方式 3：应用转换

```
1. 进入「Transformations」
2. 选择模板（或创建自定义）
3. 点击「Apply to sources」
4. 选择要转换的来源
5. 等待处理
6. 新笔记自动出现
7. 完成！每份来源产生一条笔记
```

（转换详情参见 [转换](transformations.zh.md)。）

---

## 创建手动笔记

### 基本结构

```
标题：「您要记录的内容」
       （描述要清晰）

内容：
  - 要点
  - 您的分析
  - 提出的问题
  - 后续步骤

元数据：
  - 标签：如何分类
  - 相关来源：哪些文档影响本条
  - 日期：创建时自动添加
```

### Markdown 支持

可使用 Markdown 格式化笔记：

```markdown
# Heading
## Subheading
### Sub-subheading

**Bold text** for emphasis
*Italic text* for secondary emphasis

- Bullet lists
- Like this

1. Numbered lists
2. Like this

> Quotes and important callouts

[Links work](https://example.com)
```

### 笔记结构示例

```markdown
# Key Findings from "AI Safety Paper 2025"

## Main Argument
The paper argues that X approach is better than Y because...

## Methodology
The authors use [methodology] to test this hypothesis.

## Key Results
- Result 1: [specific finding with citation]
- Result 2: [specific finding with citation]
- Result 3: [specific finding with citation]

## Gaps & Limitations
1. The paper assumes X, which might not hold in Y scenario
2. Limited to Z population/domain
3. Future work needed on A, B, C

## My Thoughts
- This connects to previous research on...
- Potential application in...

## Next Steps
- [ ] Read the referenced paper on X
- [ ] Find similar studies on Y
- [ ] Discuss implications with team
```

---

## AI 生成笔记：三种来源

### 1. 从对话保存

```
工作流：
  对话 → 优质回复 → 「Save as Note」
         → 按需编辑 → 保存

适用：
  - AI 回复很好地回答了问题
  - 希望保留答案供参考
  - 从对话构建知识库

质量：
  - 质量 = 对话问题质量
  - 更好上下文 = 更好回复 = 更好笔记
  - 具体问题产生有用笔记
```

（对话技巧参见 [高效对话](chat-effectively.zh.md)。）

### 2. 从 Ask 保存

```
工作流：
  Ask → 全面答案 → 「Save as Note」
      → 按需编辑 → 保存

适用：
  - 需要一次性全面答案
  - 希望保存综合结果
  - 构建全面答案知识库

质量：
  - 系统自动找到相关来源
  - 结果通常已含引用
  - 往往比对话更详尽
```

（搜索与 Ask 参见 [高效搜索](search.zh.md)。）

### 3. 转换（批量处理）

```
工作流：
  定义转换 → 应用于来源 → 笔记自动创建
                      → 审阅与编辑 → 整理

转换示例：
  模板：「Extract: main argument, methodology, key findings」
  应用于：5 份来源
  结果：5 条结构一致的笔记

适用：
  - 多份来源做相同提取
  - 构建结构化知识库
  - 创建一致摘要
```

---

## 用转换批量获取洞察

### 内置转换

Open Notebook 提供预设：

**Summary（摘要）**
```
提取：要点、主要论点、结论
输出：来源的 200–300 字摘要
最适合：快速参考摘要
```

**Key Concepts（关键概念）**
```
提取：主要思想、概念、术语
输出：概念列表及说明
最适合：学习与术语
```

**Methodology（方法论）**
```
提取：研究方法、方法、数据
输出：研究如何进行
最适合：学术来源、方法综述
```

**Takeaways（要点）**
```
提取：可执行洞察、建议
输出：应如何利用该信息
最适合：实务/商业来源
```

### 如何应用转换

```
1. 进入「Transformations」
2. 选择模板
3. 点击「Apply」
4. 选择来源（一份或多份）
5. 等待处理（通常 30 秒 – 2 分钟）
6. 新笔记出现在笔记本中
7. 按需编辑
```

### 创建自定义转换

```
1. 点击「Create Custom Transformation」
2. 编写提取模板：

   示例：
   「For this academic paper, extract:
    - Central research question
    - Hypothesis tested
    - Methodology used
    - Key findings (numbered)
    - Limitations acknowledged
    - Recommendations for future work」

3. 点击「Save Template」
4. 应用于一份或多份来源
5. 系统生成结构一致的笔记
```

---

## 整理笔记

### 命名规范

**方式 1：按日期**
```
2026-01-03 - Key points from X source
2026-01-04 - Comparison between A and B
优点：便于按时间回顾
```

**方式 2：按主题**
```
AI Safety - Alignment approaches
AI Safety - Interpretability research
优点：按主题分组
```

**方式 3：按类型**
```
SUMMARY: Paper on X
QUESTION: What about Y?
INSIGHT: Connection between Z and W
优点：便于按类型筛选
```

**方式 4：按来源**
```
From: Paper A - Main insights
From: Video B - Interesting implications
优点：便于追溯来源
```

**最佳实践：** 组合使用
```
[Date] [Source] - [Topic] - [Type]
2026-01-03 - Paper A - AI Safety - Takeaways
```

### 使用标签

标签用于分类。创建笔记时添加：

```
示例标签：
  - 「primary-research」（直接来源分析）
  - 「background」（支撑材料）
  - 「methodology」（研究方法）
  - 「insights」（原创思考）
  - 「questions」（开放问题）
  - 「follow-up」（待进一步工作）
  - 「published」（可分享/使用）
```

**标签好处：**
- 按标签筛选笔记
- 查找某类全部笔记
- 组织工作流（如查找全部「follow-up」）

### 笔记链接与引用

可在笔记中引用来源：

```markdown
# Analysis of Paper A

As shown in Paper A (see "main argument" section),
the authors argue that...

## Related Sources
- Paper B discusses similar approach
- Video C shows practical application
- My note on "Comparative analysis" has more
```

---

## 编辑与完善笔记

### 改进 AI 生成笔记

```
AI 笔记：
  「The paper discusses machine learning」

您可能改为：
  「The paper proposes a supervised learning approach
   to classification problems, using neural networks
   with attention mechanisms (see pp. 15-18).」

编辑步骤：
  1. 点击笔记
  2. 点击「Edit」
  3. 完善内容
  4. 点击「Save」
```

### 添加引用

```
从对话/Ask 保存时：
  - 引用自动添加
  - 显示哪些来源支撑答案
  - 可点击核实

手动笔记时：
  - 手动添加：「From Paper A, page 15: ...」
  - 或引用：「As discussed in [source]」
```

（引用核实参见 [引用](citations.zh.md)。）

---

## 搜索笔记

笔记完全可搜索：

### 文本搜索
```
查找精确短语：「attention mechanism」
结果：包含该短语的全部笔记
适用：查找特定术语或引文
```

### 向量/语义搜索
```
查找概念：「How do models understand?」
结果：关于可解释性、机制理解等的笔记
适用：概念探索（词语不必完全一致）
```

### 组合搜索
```
文本搜索笔记 → 关键词匹配
向量搜索笔记 → 概念匹配
二者均可跨来源 + 笔记搜索
```

（搜索详情参见 [高效搜索](search.zh.md)。）

---

## 导出与分享笔记

### 选项

**复制到剪贴板**
```
点击「Share」→「Copy」→ 粘贴到任意位置
适合：通过邮件/聊天分享单条笔记
```

**导出为 Markdown**
```
点击「Share」→「Export as MD」→ 保存为 .md 文件
适合：与他人分享、版本控制
```

**创建笔记集合**
```
选择多条笔记 →「Export collection」
→ 生成有组织的 Markdown 文档
适合：分享主题概览
```

**发布到 Web**
```
点击「Publish」→ 获取可分享链接
适合：公开发布（如需要）
```

---

## 整理笔记本中的笔记

### 按研究阶段

**阶段 1：发现**
- 初步摘要
- 提出的问题
- 有趣发现

**阶段 2：深入**
- 详细分析
- 比较洞察
- 方法综述

**阶段 3：综合**
- 跨来源联系
- 原创思考
- 结论

### 按内容类型

**摘要**
- 高层概览
- 由转换生成
- 快速参考

**问题**
- 开放问题
- 待进一步研究
- 待填补空白

**洞察**
- 您的原创分析
- 建立的关联
- 得出的结论

**任务**
- 后续研究
- 待添加来源
- 待联系人员

---

## 在其他功能中使用笔记

### 在对话中

```
可引用笔记：
「Based on my note 'Key findings from A',
how does this compare to B?」

笔记成为上下文的一部分。
类似来源但更小、更聚焦。
```

### 在转换中

```
笔记可作为转换输入：
1. 选择笔记作为输入
2. 应用转换
3. 获得新的衍生笔记

示例：将 5 条分析笔记转换 → 生成综合
```

### 在播客中

```
笔记用于播客内容：
1. 为笔记本生成播客
2. 系统在内容选择中包含笔记
3. 笔记成为节目大纲的一部分
```

（播客参见 [创建播客](creating-podcasts.zh.md)。）

---

## 最佳实践

### 手动笔记
1. **写清楚** — 未来的您会感谢
2. **添加上下文** — 说明为何重要，而非仅复述
3. **链接来源** — 便于日后核实
4. **标注日期** — 跟踪思考演变
5. **立即打标签** — 不要拖延整理

### AI 生成笔记
1. **保存前审阅** — 核实质量
2. **为清晰而编辑** — AI 可能遗漏细微差别
3. **加入您的思考** — 使其成为您的知识
4. **包含引用** — 理解来源
5. **立即整理** — 趁语境新鲜

### 整理
1. **命名一致** — 未来的您会感谢
2. **全部打标签** — 日后筛选更容易
3. **链接相关笔记** — 构建知识网络
4. **定期回顾** — 随理解深化重构
5. **归档旧笔记** — 保持工作区整洁

---

## 常见错误

| 错误 | 问题 | 解决 |
|------|------|------|
| 保存每条对话回复 | 笔记本充斥低质量笔记 | 仅保存真正回答问题的优质回复 |
| 不打标签 | 日后找不到 | 创建时立即打标签 |
| 标题差 | 不记得内容 | 使用描述性标题，含关键概念 |
| 从不链接笔记 | 错过想法间联系 | 引用相关笔记 |
| 忘记来源 | 日后无法核实主张 | 始终链回来源 |
| 从不编辑 AI 笔记 | 保留笼统 AI 回复 | 为清晰与语境而完善 |
| 创建一条巨型笔记 | 过长难以使用 | 按子主题拆分为聚焦笔记 |

---

## 摘要：笔记生命周期

```
1. 创建
   ├─ 手动：从零撰写
   ├─ 从对话：保存优质回复
   ├─ 从 Ask：保存综合结果
   └─ 从转换：批量处理

2. 编辑与完善
   ├─ 提高清晰度
   ├─ 添加上下文
   ├─ 修正 AI 错误
   └─ 添加引用

3. 整理
   ├─ 清晰命名
   ├─ 添加标签
   ├─ 链接相关项
   └─ 分类

4. 使用
   ├─ 在对话中引用
   ├─ 转换以综合
   ├─ 导出分享
   └─ 基于新问题继续构建

5. 维护
   ├─ 定期回顾
   ├─ 随理解更新
   ├─ 完成后归档
   └─ 从有序知识中学习
```

笔记成为您真正的知识库。在整理上投入越多，价值越大。

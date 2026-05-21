# 维护者指南

本指南面向项目维护者，帮助在保持项目质量与愿景的同时有效管理贡献。

## 目录

- [Issue 管理](#issue-管理)
- [Pull Request 审查](#pull-request-审查)
- [常见场景](#常见场景)
- [沟通模板](#沟通模板)

## Issue 管理

### 新 Issue 创建时

**1. 初步分类**（24–48 小时内）

- 添加适当标签：
  - `bug`、`enhancement`、`documentation` 等
  - 适合新手的 `good first issue`
  - 审核前使用 `needs-triage`
  - 欢迎社区贡献时使用 `help wanted`

- 快速评估：
  - 描述是否清晰完整？
  - 是否符合项目愿景？（见 [design-principles.zh.md](design-principles.zh.md)）
  - 是否与已有 issue 重复？

**2. 初步回复**

```markdown
Thanks for opening this issue! We'll review it and get back to you soon.

[If it's a bug] In the meantime, have you checked our troubleshooting guide?

[If it's a feature] You might find our [design principles](design-principles.zh.md) helpful for understanding what we're building toward.
```

**3. 决策**

自问：
- 是否符合 [设计原则](design-principles.zh.md)？
- 应纳入核心项目，还是更适合插件/扩展？
- 我们是否有能力长期支持该功能？
- 是否惠及大多数用户，还是仅特定用例？

**4. Issue 分配**

若贡献者勾选「I am a developer and would like to work on this」：

**已接受的 Issue：**
```markdown
Great idea! This aligns well with our goals, particularly [specific design principle].

I see you'd like to work on this. Before you start:

1. Please share your proposed approach/solution
2. Review our [Contributing Guide](contributing.zh.md) and [Design Principles](design-principles.zh.md)
3. Once we agree on the approach, I'll assign this to you

Looking forward to your thoughts!
```

**需澄清的 Issue：**
```markdown
Thanks for offering to work on this! Before we proceed, we need to clarify a few things:

1. [Question 1]
2. [Question 2]

Once we have these details, we can discuss the best approach.
```

**与愿景不符的 Issue：**
```markdown
Thank you for the suggestion and for offering to work on this!

After reviewing against our [design principles](design-principles.zh.md), we've decided not to pursue this in the core project because [specific reason].

However, you might be able to achieve this through [alternative approach, if applicable].

We appreciate your interest in contributing! Feel free to check out our [open issues](link) for other ways to contribute.
```

### 常用标签

**优先级：**
- `priority: critical` — 安全问题、数据丢失缺陷
- `priority: high` — 主要功能损坏
- `priority: medium` — 恼人缺陷、有用功能
- `priority: low` — 锦上添花、边缘情况

**状态：**
- `needs-triage` — 维护者尚未审核
- `needs-info` — 等待报告者补充信息
- `needs-discussion` — 需社区/团队讨论
- `ready` — 已批准，可开始开发
- `in-progress` — 有人正在处理
- `blocked` — 因外部依赖无法推进

**类型：**
- `bug` — 功能异常
- `enhancement` — 新功能或改进
- `documentation` — 文档改进
- `question` — 一般问题
- `refactor` — 代码清理/重构

**难度：**
- `good first issue` — 适合新人
- `help wanted` — 欢迎社区贡献
- `advanced` — 需深入代码库知识

## Pull Request 审查

### PR 初步审查清单

**深入代码前：**

- [ ] 是否有关联的已批准 issue？
- [ ] PR 是否引用 issue 编号？
- [ ] PR 描述是否清楚说明变更及原因？
- [ ] 贡献者是否勾选 PR 模板相关项？
- [ ] 是否有测试？UI 变更是否有截图？

**危险信号**（可能需关闭 PR）：
- 无关联 issue
- issue 未分配给贡献者
- PR 试图解决多个无关问题
- 未经讨论的破坏性变更
- 与项目愿景冲突

### 代码审查流程

**1. 高层审查**

- 方案是否符合架构？
- 范围是否适当？
- 是否有更简替代？
- 是否遵循设计原则？

**2. 代码质量审查**

Python：
- [ ] 符合 PEP 8
- [ ] 有类型注解
- [ ] 有 docstring
- [ ] 错误处理适当
- [ ] 无安全漏洞

TypeScript/前端：
- [ ] 符合 TypeScript 最佳实践
- [ ] 组件结构合理
- [ ] 生产代码无 console.log
- [ ] UI 组件可访问

**3. 测试审查**

- [ ] 测试覆盖适当
- [ ] 测试有意义（非仅为覆盖率）
- [ ] 本地与 CI 测试通过
- [ ] 覆盖边界情况

**4. 文档审查**

- [ ] 代码注释充分
- [ ] 复杂逻辑有说明
- [ ] 用户面向文档已更新（如适用）
- [ ] API 文档已更新（如 API 变更）
- [ ] 破坏性变更提供迁移指南

### 提供反馈

**正面反馈**（重要！）：
```markdown
Thanks for this PR! I really like [specific thing they did well].

[Feedback on what needs to change]
```

**请求修改：**
```markdown
This is a great start! A few things to address:

1. **[High-level concern]**: [Explanation and suggested approach]
2. **[Code quality issue]**: [Specific example and fix]
3. **[Testing gap]**: [What scenarios need coverage]

Let me know if you have questions about any of this!
```

**建议替代方案：**
```markdown
I appreciate the effort you put into this! However, I'm concerned about [specific issue].

Have you considered [alternative approach]? It might be better because [reasons].

What do you think?
```

## 常见场景

### 场景 1：代码好，方向不对

**情况**：贡献者代码质量高，但解决方式不符合架构。

**回复：**
```markdown
Thank you for this PR! The code quality is great, and I can see you put thought into this.

However, I'm concerned that this approach [specific architectural concern]. In our architecture, we [explain the pattern we follow].

Would you be open to refactoring this to [suggested approach]? I'm happy to provide guidance on the specifics.

Alternatively, if you don't have time for a refactor, I can take over and finish this up (with credit to you, of course).

Let me know what you prefer!
```

### 场景 2：无已分配 Issue 的 PR

**情况**：贡献者未走 issue 批准流程即提交 PR。

**回复：**
```markdown
Thanks for the PR! I appreciate you taking the time to contribute.

However, to maintain project coherence, we require all PRs to be linked to an approved issue that was assigned to the contributor. This is explained in our [Contributing Guide](contributing.zh.md).

This helps us:
- Ensure work aligns with project vision
- Prevent duplicate efforts
- Discuss approach before implementation

Could you please:
1. Create an issue describing this change
2. Wait for it to be reviewed and assigned to you
3. We can then reopen this PR or you can create a new one

Sorry for the inconvenience - this process helps us manage the project effectively.
```

### 场景 3：与愿景不符的功能请求

**情况**：本意良好但不符合项目目标的功能。

**回复：**
```markdown
Thank you for this suggestion! I can see how this would be useful for [specific use case].

After reviewing against our [design principles](design-principles.zh.md), we've decided not to include this in the core project because [specific reason - e.g., "it conflicts with our 'Simplicity Over Features' principle" or "it would require dependencies that conflict with our privacy-first approach"].

Some alternatives:
- [If applicable] This could be built as a plugin/extension
- [If applicable] This functionality might be achievable through [existing feature]
- [If applicable] You might be interested in [other tool] which is designed for this use case

We appreciate your contribution and hope you understand. Feel free to check our roadmap or open issues for other ways to contribute!
```

### 场景 4：贡献者反馈后失联

**情况**：您请求修改后，贡献者超过 2 周未回复。

**2 周后：**
```markdown
Hey there! Just checking in on this PR. Do you have time to address the feedback, or would you like someone else to take over?

No pressure either way - just want to make sure this doesn't fall through the cracks.
```

**1 个月无回复：**
```markdown
Thanks again for starting this work! Since we haven't heard back, I'm going to close this PR for now.

If you want to pick this up again in the future, feel free to reopen it or create a new PR. Alternatively, I'll mark the issue as available for someone else to work on.

We appreciate your contribution!
```

然后：
- 关闭 PR
- 取消 issue 分配
- 为 issue 添加 `help wanted` 标签

### 场景 5：未经讨论的破坏性变更

**情况**：PR 引入未在原始 issue 中讨论的破坏性变更。

**回复：**
```markdown
Thanks for this PR! However, I notice this introduces breaking changes that weren't discussed in the original issue.

Breaking changes require:
1. Prior discussion and approval
2. Migration guide for users
3. Deprecation period (when possible)
4. Clear documentation of the change

Could we discuss the breaking changes first? Specifically:
- [What breaks and why]
- [Who will be affected]
- [Migration path]

We may need to adjust the approach to minimize impact on existing users.
```

## 沟通模板

### 关闭 PR（与愿景不符）

```markdown
Thank you for taking the time to contribute! We really appreciate it.

After careful review, we've decided not to merge this PR because [specific reason related to design principles].

This isn't a reflection on your code quality - it's about maintaining focus on our core goals as outlined in [design-principles.zh.md](design-principles.zh.md).

We'd love to have you contribute in other ways! Check out:
- Good first issues
- Help wanted issues
- Our roadmap

Thanks again for your interest in Open Notebook!
```

### 关闭陈旧 Issue

```markdown
We're closing this issue due to inactivity. If this is still relevant, feel free to reopen it with updated information.

Thanks!
```

### 请求更多信息

```markdown
Thanks for reporting this! To help us investigate, could you provide:

1. [Specific information needed]
2. [Logs, screenshots, etc.]
3. [Steps to reproduce]

This will help us understand the issue better and find a solution.
```

### 感谢贡献者

```markdown
Merged!

Thank you so much for this contribution, @username! [Specific thing they did well].

This will be included in the next release.
```

## 最佳实践

### 友善与尊重

- 感谢贡献者的时间与努力
- 假定善意
- 对新人耐心
- 解释 *原因*，而非仅 *做什么*

### 清晰直接

- 下一步不留歧义
- 具体说明需改之处
- 解释架构决策
- 设定明确预期

### 保持一致

- 对所有贡献者适用相同标准
- 遵循已定义流程
- 记录决策供日后参考

### 保护项目愿景

- 可以说「不」
- 优先长期可维护性
- 勿接受无法支持的功能
- 保持项目聚焦

### 及时响应

- 48 小时内回复 issue（至少确认收到）
- 尽可能一周内审查 PR
- 向贡献者更新状态
- 关闭陈旧 issue/PR 保持整洁

## 不确定时

自问：
1. 是否符合 [设计原则](design-principles.zh.md)？
2. 能否长期维护该功能？
3. 是否惠及大多数用户，还是仅边缘用例？
4. 是否有更简替代？
5. 两年后是否仍愿支持？

若不确定，可以：
- 征求其他维护者意见
- 发起讨论 issue
- 决策前暂缓

---

**请记住**：优秀维护是在开放贡献与保护项目愿景之间的平衡。对不符合项说「不」并非刻薄，而是负责任地守护项目。

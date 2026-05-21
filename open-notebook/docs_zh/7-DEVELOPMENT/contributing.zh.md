# 为 Open Notebook 做贡献

感谢您对 Open Notebook 的关注！我们欢迎各技能水平的开发者参与贡献。本指南说明贡献流程以及何为优质贡献。

## 🚨 先提 Issue 的工作流

**为保持项目一致性并避免无效劳动，请遵循以下流程：**

1. **先创建 issue** — 编写任何代码前，先创建 issue 描述缺陷或功能
2. **提出解决方案** — 说明您计划如何实现修复或功能
3. **等待分配** — 维护者审核并在批准后分配给您
4. **再开始编码** — 确保工作与项目愿景和架构一致

**为何采用此流程？**
- 避免重复劳动
- 确保方案符合架构与设计原则
- 编码前获得反馈，节省您的时间
- 帮助维护者把控项目方向

> ⚠️ **未关联已批准 issue 的 Pull Request 可能被关闭**，即使代码质量良好。我们希望在开工前确认方向一致，以尊重您的时间。

## 行为准则

参与本项目即表示您遵守我们的行为准则。请保持尊重、建设性与协作。

## 我可以如何贡献？

### 报告缺陷

1. **搜索已有 issue** — 确认该缺陷是否已报告
2. **创建缺陷报告** — 使用[缺陷报告模板](https://github.com/lfnovo/open-notebook/issues/new?template=bug_report.yml)
3. **提供详情**，包括：
   - 复现步骤
   - 预期与实际行为
   - 日志、截图或错误信息
   - 您的环境（操作系统、Docker 版本、Open Notebook 版本）
4. **表明是否愿意修复** — 若有意处理，请勾选「I would like to work on this」

### 建议功能

1. **搜索已有 issue** — 确认该功能是否已建议
2. **创建功能请求** — 使用[功能请求模板](https://github.com/lfnovo/open-notebook/issues/new?template=feature_request.yml)
3. **说明价值** — 描述该功能为何有用
4. **提出实现思路** — 若有实现想法，请一并说明
5. **表明是否愿意开发** — 若有意实现，请勾选「I would like to work on this」

### 贡献代码（Pull Request）

**重要：开始任何 PR 前须遵循上述先提 issue 流程**

issue 分配给您后：

1. **Fork 仓库**并从 `main` 创建分支
2. **理解愿景与原则** — 阅读 [design-principles.zh.md](design-principles.zh.md)
3. **遵循架构** — 参阅架构文档了解项目结构
4. **编写高质量代码** — 遵循 [code-standards.zh.md](code-standards.zh.md)
5. **测试变更** — 见 [testing.zh.md](testing.zh.md)
6. **更新文档** — 若变更功能，请更新相关文档
7. **创建 PR**：
   - 引用 issue 编号（如「Fixes #123」）
   - 说明变更内容及原因
   - UI 变更请附截图
   - 保持 PR 聚焦 — 一个 issue 一个 PR

### 何为优质贡献？

✅ **我们欢迎的 PR：**
- 解决 issue 中描述的真实问题
- 符合架构与代码规范
- 包含测试与文档
- 范围明确（聚焦单一事项）
- 提交信息清晰

❌ **我们可能关闭的 PR：**
- 无关联已批准 issue
- 未经讨论引入破坏性变更
- 与架构愿景冲突
- 缺少测试或文档
- 试图解决多个无关问题

## Git 提交信息

- 使用现在时（「Add feature」而非「Added feature」）
- 使用祈使语气（「Move cursor to...」而非「Moves cursor to...」）
- 首行不超过 72 个字符
- 首行之后可大量引用 issue 与 pull request

## 开发工作流

### 分支策略

我们采用 **功能分支工作流**：

1. **主分支**：`main` — 可随时发布的代码
2. **功能分支**：`feature/description` — 新功能
3. **缺陷修复**：`fix/description` — 缺陷修复
4. **文档**：`docs/description` — 文档更新

### 进行变更

1. **创建功能分支**：
```bash
git checkout -b feature/amazing-new-feature
```

2. **按代码规范进行变更**

3. **测试变更**：
```bash
# Run tests
uv run pytest

# Run linting
uv run ruff check .

# Run formatting
uv run ruff format .
```

4. **提交变更**：
```bash
git add .
git commit -m "feat: add amazing new feature"
```

5. **推送并创建 PR**：
```bash
git push origin feature/amazing-new-feature
# Then create a Pull Request on GitHub
```

### 保持 Fork 同步

```bash
# Fetch upstream changes
git fetch upstream

# Switch to main and merge
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

## Pull Request 流程

创建 pull request 时：

1. **关联 issue** — 在 PR 描述中引用 issue 编号
2. **描述变更** — 说明变更内容及原因
3. **提供测试证据** — 截图、测试结果或日志
4. **检查 PR 模板** — 完成所有必填项
5. **等待审核** — 维护者通常在一周内审核

### PR 审核预期

- 代码审查反馈针对代码，而非个人
- 对建议与替代方案持开放态度
- 清晰、尊重地回应审查意见
- 若反馈不清，请提问

## 当前优先领域

我们积极寻求以下方面的贡献：

1. **前端增强** — 改进 Next.js/React UI，支持实时更新与更好体验
2. **测试** — 扩大各组件测试覆盖率
3. **性能** — 异步处理改进与缓存
4. **文档** — API 示例与用户指南
5. **集成** — 新内容来源与 AI 提供商

## 获取帮助

### 社区支持

- **Discord**：[加入 Discord 服务器](https://discord.gg/37XJPXfz2w)获取实时帮助
- **GitHub Discussions**：长篇问题与想法
- **GitHub Issues**：缺陷报告与功能请求

### 文档参考

- [设计原则](design-principles.zh.md) — 了解项目愿景
- [代码规范](code-standards.zh.md) — 各语言编码指南
- [测试指南](testing.zh.md) — 如何编写测试
- [开发环境搭建](development-setup.zh.md) — 本地入门

## 认可

我们通过以下方式认可贡献：

- 发布说明中的 **GitHub 致谢**
- Discord 中的 **社区认可**
- 项目分析中的 **贡献统计**
- 活跃贡献者可考虑成为 **维护者**

---

感谢为 Open Notebook 做贡献！您的贡献有助于让研究对所有人更易获得且更私密。

有关本指南或贡献的一般问题，请在 [Discord](https://discord.gg/37XJPXfz2w) 联系或发起 GitHub Discussion。

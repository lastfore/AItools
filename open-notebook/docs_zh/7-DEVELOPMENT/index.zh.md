# 开发

欢迎阅读 Open Notebook 开发文档！无论您是贡献代码、了解架构还是维护项目，均可在此找到指引。

## 🎯 选择您的路径

### 👨‍💻 我想贡献代码

从 **[贡献指南](contributing.zh.md)** 了解工作流程，然后参阅：
- **[快速开始](quick-start.zh.md)** - 5 分钟内克隆、安装并验证
- **[开发环境搭建](development-setup.zh.md)** - 完整本地环境指南
- **[代码规范](code-standards.zh.md)** - 如何编写符合项目风格的代码
- **[测试](testing.zh.md)** - 如何编写与运行测试

**首次贡献？** 请阅读 [贡献指南](contributing.zh.md) 了解「先提 issue」流程。

### 🔒 我想了解安全实践

**[安全指南](security.zh.md)** 涵盖：
- 数据库查询安全（防止 SurrealQL 注入）
- 模板渲染安全（防止 SSTI）
- 文件处理安全（防止路径遍历与 LFI）
- 密钥管理与 CORS 配置
- 代码审查安全清单

---

### 🏗️ 我想了解架构

**[架构概览](architecture.zh.md)** 涵盖：
- 三层系统设计
- 技术栈及选型理由
- 关键组件与工作流
- 采用的设计模式

深入阅读请查看 `/open_notebook/` 下的 CLAUDE.md 获取组件级指引。

---

### 👨‍🔧 我是维护者

**[维护者指南](maintainer-guide.zh.md)** 涵盖：
- Issue 分类与管理
- Pull Request 审查流程
- 沟通模板
- 最佳实践

---

## 📚 快速链接

| 文档 | 面向 | 用途 |
|---|---|---|
| [快速开始](quick-start.zh.md) | 新开发者 | 5 分钟克隆、安装并验证环境 |
| [开发环境搭建](development-setup.zh.md) | 本地开发 | 完整环境配置指南 |
| [贡献指南](contributing.zh.md) | 代码贡献者 | 工作流程：issue → 代码 → PR |
| [代码规范](code-standards.zh.md) | 编写代码 | Python、FastAPI、数据库风格指南 |
| [测试](testing.zh.md) | 测试代码 | 如何编写与运行测试 |
| [架构](architecture.zh.md) | 理解系统 | 系统设计、技术栈、工作流 |
| [设计原则](design-principles.zh.md) | 全体开发者 | 指导我们决策的原则 |
| [API 参考](api-reference.zh.md) | 构建集成 | 完整 REST API 文档 |
| [安全](security.zh.md) | 全体开发者 | 安全实践与漏洞防护 |
| [维护者指南](maintainer-guide.zh.md) | 维护者 | 管理 issue、PR、发布 |

---

## 🚀 当前开发重点

我们欢迎协助以下方向：

1. **前端增强** - 改进 Next.js/React UI，支持实时更新
2. **性能** - 异步处理与缓存优化
3. **测试** - 扩大各组件测试覆盖率
4. **文档** - API 示例与开发者指南
5. **集成** - 新内容来源与 AI 提供商

请查看 GitHub 上标记为 `good first issue` 或 `help wanted` 的 issue。

---

## 💬 获取帮助

- **Discord**：[加入服务器](https://discord.gg/37XJPXfz2w) 实时讨论
- **GitHub Discussions**：架构相关问题
- **GitHub Issues**：缺陷与功能

欢迎提问，我们乐于帮助新贡献者成功上手。

---

## 📖 其他资源

### 外部文档
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [SurrealDB 文档](https://surrealdb.com/docs)
- [LangChain 文档](https://python.langchain.com/)
- [Next.js 文档](https://nextjs.org/docs)

### 我们的库
- [Esperanto](https://github.com/lfnovo/esperanto) - 多提供商 AI 抽象
- [Content Core](https://github.com/lfnovo/content-core) - 内容处理
- [Podcast Creator](https://github.com/lfnovo/podcast-creator) - 播客生成

---

准备开始？请前往 **[快速开始](quick-start.zh.md)**！🎉

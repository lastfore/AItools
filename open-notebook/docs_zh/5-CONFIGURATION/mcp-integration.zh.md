# 模型上下文协议（MCP）集成

Open Notebook 可通过**模型上下文协议（Model Context Protocol，MCP）**无缝接入您的 AI 工作流，使 Claude Desktop、VS Code 扩展等 AI 助手可直接访问您的笔记本、资料源与聊天功能。

## 什么是 MCP？

[模型上下文协议](https://modelcontextprotocol.io) 是一项开放标准，使 AI 应用能够安全连接外部数据源与工具。通过 Open Notebook MCP 服务器，您可以：

- 📚 **从 Claude Desktop 或 VS Code 直接访问笔记本**
- 🔍 **在 AI 助手内搜索研究内容**，无需切换应用
- 💬 **创建并管理聊天会话**，以研究内容为上下文
- 📝 **即时生成笔记**与洞见
- 🤖 **通过完整 Open Notebook API 自动化工作流**

## 快速设置

### Claude Desktop

1. **安装 MCP 服务器**（从 PyPI 自动安装）：

   ```bash
   # 无需手动安装！Claude Desktop 会通过 uvx 自动运行
   ```

2. **配置 Claude Desktop**：

   **macOS/Linux**：编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "open-notebook": {
         "command": "uvx",
         "args": ["open-notebook-mcp"],
         "env": {
           "OPEN_NOTEBOOK_URL": "http://localhost:5055",
           "OPEN_NOTEBOOK_PASSWORD": "your_password_here"
         }
       }
     }
   }
   ```

   **Windows**：编辑 `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "open-notebook": {
         "command": "uvx",
         "args": ["open-notebook-mcp"],
         "env": {
           "OPEN_NOTEBOOK_URL": "http://localhost:5055",
           "OPEN_NOTEBOOK_PASSWORD": "your_password_here"
         }
       }
     }
   }
   ```

3. **重启 Claude Desktop**，即可在对话中使用笔记本！

### VS Code（Cline 及其他兼容 MCP 的扩展）

添加到 VS Code 设置或 `.vscode/mcp.json`：

```json
{
  "servers": {
    "open-notebook": {
      "command": "uvx",
      "args": ["open-notebook-mcp"],
      "env": {
        "OPEN_NOTEBOOK_URL": "http://localhost:5055",
        "OPEN_NOTEBOOK_PASSWORD": "your_password_here"
      }
    }
  }
}
```

## 配置

- **OPEN_NOTEBOOK_URL**：Open Notebook API 地址（默认：`http://localhost:5055`）
- **OPEN_NOTEBOOK_PASSWORD**：可选 — 仅在启用密码保护时需要

### 远程服务器

若 Open Notebook 运行在远程服务器上，请相应修改 URL：

```json
"OPEN_NOTEBOOK_URL": "http://192.168.1.100:5055"
```

或使用域名：

```json
"OPEN_NOTEBOOK_URL": "https://notebook.yourdomain.com/api"
```

## 可以做什么

连接成功后，您可以请 Claude 或其他 AI 助手：

- _「在我的研究笔记本中搜索关于 [主题] 的内容」_
- _「根据我们的对话创建一条新笔记，总结要点」_
- _「列出我所有的笔记本」_
- _「就 [某资料源或主题] 开启一个聊天会话」_
- _「我的 [笔记本名称] 笔记本里有哪些资料源？」_
- _「把这份 PDF 添加到我的研究笔记本」_
- _「显示 [笔记本名称] 中的所有笔记」_

MCP 服务器提供 Open Notebook 的完整能力，使您能在 AI 助手内无缝管理研究。

## 可用工具

Open Notebook MCP 服务器暴露以下能力：

### 笔记本

- 列出笔记本
- 获取笔记本详情
- 创建新笔记本
- 更新笔记本信息
- 删除笔记本

### 资料源

- 列出笔记本中的资料源
- 获取资料源详情
- 添加新资料源（链接、文件、文本）
- 更新资料源元数据
- 删除资料源

### 笔记

- 列出笔记本中的笔记
- 获取笔记详情
- 创建新笔记
- 更新笔记
- 删除笔记

### 聊天

- 创建聊天会话
- 向聊天会话发送消息
- 获取聊天历史
- 列出聊天会话

### 搜索

- 跨内容向量搜索
- 跨内容全文搜索
- 按笔记本筛选

### 模型

- 列出已配置的 AI 模型
- 获取模型详情
- 创建模型配置
- 更新模型设置

### 设置

- 获取应用设置
- 更新设置

## MCP 服务器仓库

Open Notebook MCP 服务器由 Epochal 团队开发与维护：

**🔗 GitHub**：[Epochal-dev/open-notebook-mcp](https://github.com/Epochal-dev/open-notebook-mcp)

欢迎贡献、提交 issue 与功能请求！

## 查找服务器

Open Notebook MCP 服务器已发布至官方 MCP Registry：

- **Registry**：在 [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io) 搜索「open-notebook」
- **PyPI**：[pypi.org/project/open-notebook-mcp](https://pypi.org/project/open-notebook-mcp)
- **GitHub**：[Epochal-dev/open-notebook-mcp](https://github.com/Epochal-dev/open-notebook-mcp)

## 故障排除

### 连接错误

1. 确认 `OPEN_NOTEBOOK_URL` 正确且可访问
2. 若启用密码保护，确认 `OPEN_NOTEBOOK_PASSWORD` 设置正确
3. 远程服务器需确保本机可访问端口 5055
4. 连接远程服务器时检查防火墙设置

## 与其他 MCP 客户端配合使用

Open Notebook MCP 服务器遵循标准 MCP 协议，可与任何兼容 MCP 的客户端配合使用。请参阅各客户端文档了解配置方式。

## 延伸阅读

- [模型上下文协议文档](https://modelcontextprotocol.io)

# 配置 — 必要设置

配置用于按您的环境定制 Open Notebook。本节介绍需要了解的内容。

---

## 需要配置什么？

三项：

1. **AI 提供商** — 使用的 LLM/嵌入服务（OpenAI、Anthropic、Ollama 等）
2. **数据库** — 如何连接 SurrealDB（通常已预配置）
3. **服务器** — API URL、端口、超时（通常自动检测）

---

## 快速决策：选哪家提供商？

### 方案 1：云端提供商（最快）
- **OpenRouter（推荐）**（一个密钥访问多种模型）
- **OpenAI**（GPT）
- **Anthropic**（Claude）
- **Google Gemini**（多模态、长上下文）
- **Groq**（超快推理）

设置：获取 API 密钥 → 在设置界面添加凭据 → 完成

→ 前往 **[AI 提供商指南](ai-providers.zh.md)**

### 方案 2：本地（免费且私密）
- **Ollama**（开源模型，运行在本机）

→ 前往 **[Ollama 设置](ollama.zh.md)**

### 方案 3：OpenAI 兼容
- **LM Studio**（本地）
- **自定义端点**

→ 前往 **[OpenAI 兼容指南](openai-compatible.zh.md)**

---

## 配置文件

根据部署方式选择对应文件。

### `.env`（本地开发）

仅在本地运行 Open Notebook 时使用 `.env`。

```
位置：项目根目录
用途：本机开发
格式：KEY=value，每行一项
```

### `docker.env`（Docker 部署）

若使用 docker-compose 且希望将环境变量放在 compose 文件之外，可使用此文件。
```
位置：项目根目录（或 ./docker）
用途：Docker 部署
格式：与 .env 相同
加载方：docker-compose.yml
```

---

## 最重要的设置

以下设置均写入环境文件（`.env` 或 `docker.env`，视部署方式而定）。


### Surreal 数据库

应用使用的数据库。

```
SURREAL_URL=ws://surrealdb:8000/rpc
SURREAL_USER=root
SURREAL_PASSWORD=root  # 生产环境请修改！
SURREAL_NAMESPACE=open_notebook
SURREAL_DATABASE=open_notebook
```

> 务必正确配置 `SURREAL_URL` 中的主机名。根据部署方式选择 URL，见[此处](database.zh.md)。


### AI 提供商（凭据）

应用需要访问 LLM 才能工作。AI 提供商凭据通过**设置界面**配置：

1. 在环境中设置 `OPEN_NOTEBOOK_ENCRYPTION_KEY`（存储凭据所必需）
2. 启动服务
3. 进入 **设置 → API 密钥 → 添加凭据**
4. 选择提供商，粘贴 API 密钥
5. **测试连接** → **发现模型** → **注册模型**

```
# 在 .env 或 docker-compose.yml 中必需：
OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-key
```

> **Ollama 用户**：在「设置 → API 密钥」中添加 Ollama 凭据并填写正确 base URL。网络配置见 [Ollama 设置](ollama.zh.md)。

> **LM Studio / OpenAI 兼容**：在「设置 → API 密钥」中添加 OpenAI-Compatible 凭据。见 [OpenAI 兼容指南](openai-compatible.zh.md)。


### API URL（反向代理后）

仅在通过代理部署或修改端口信息时需要关注，否则可跳过。

```
API_URL=https://your-domain.com
# 通常自动检测。仅在需要时设置。
```

大多数环境自动检测即可。

---

## 按场景配置

### 场景 1：Docker 在 localhost（默认）
```env
# 在 docker.env 中：
OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-key
# 其余使用默认值
# 然后在「设置 → API 密钥」中配置 AI 提供商
```

### 场景 2：Docker 在远程服务器
```env
# 在 docker.env 中：
OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-key
API_URL=http://your-server-ip:5055
```

### 场景 3：反向代理后（Nginx/Cloudflare）
```env
# 在 docker.env 中：
OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-key
API_URL=https://your-domain.com
# 反向代理处理 HTTPS
```

### 场景 4：本地使用 Ollama
```env
# 在 .env 中：
OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-key
# 然后在「设置 → API 密钥」中添加 Ollama 凭据
```

### 场景 5：使用 Azure OpenAI
```env
# 在 docker.env 中：
OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-key
# 然后在「设置 → API 密钥」中添加 Azure OpenAI 凭据
```

---

## 配置章节

### [AI 提供商](ai-providers.zh.md)
- OpenAI 配置
- Anthropic 配置
- Google Gemini 配置
- Groq 配置
- Ollama 配置
- Azure OpenAI 配置
- OpenAI 兼容配置

### [数据库](database.zh.md)
- SurrealDB 设置
- 连接字符串
- 数据库与命名空间
- 自建 SurrealDB

### [高级](advanced.zh.md)
- 端口与网络
- 超时与并发
- SSL/安全
- 重试配置
- Worker 并发
- 语言模型与嵌入
- 语音转文字与文字转语音
- 调试与日志

### [反向代理](reverse-proxy.zh.md)
- Nginx、Caddy、Traefik 配置
- 自定义域名
- SSL/HTTPS 配置
- Coolify 等平台

### [安全](security.zh.md)
- 密码保护
- API 认证
- 生产环境加固
- 防火墙配置

### [本地 TTS](local-tts.zh.md)
- 使用 Speaches 的本地文字转语音
- GPU 加速
- 音色选项
- Docker 网络

### [本地 STT](local-stt.zh.md)
- 使用 Speaches 的本地语音转文字
- Whisper 模型选项
- GPU 加速
- Docker 网络

### [Ollama](ollama.zh.md)
- 配置并指向 Ollama 服务器
- 下载模型
- 使用嵌入

### [OpenAI 兼容提供商](openai-compatible.zh.md)
- LM Studio、vLLM、Text Generation WebUI
- 连接配置
- Docker 网络
- 故障排除

### [完整参考](environment-reference.zh.md)
- 全部环境变量
- 按类别分组
- 各变量作用
- 默认值

---

## 如何添加配置

### 方法 1：设置界面（AI 提供商凭据）

配置 AI 提供商的推荐方式：

```
1. 在浏览器中打开 Open Notebook
2. 进入「设置 → API 密钥」
3. 点击「添加凭据」
4. 选择提供商，输入 API 密钥
5. 保存，然后「测试连接」
6. 点击「发现模型」→「注册模型」
```

无需编辑文件、无需重启。凭据以加密形式安全存储在数据库中。

→ **[完整指南：API 配置](../3-USER-GUIDE/api-configuration.zh.md)**

### 方法 2：编辑 `.env` 文件（基础设施设置）

用于数据库、网络与加密密钥：

```bash
1. 在编辑器中打开 .env
2. 设置 OPEN_NOTEBOOK_ENCRYPTION_KEY 及数据库变量
3. 保存
4. 重启服务
```

### 方法 3：Docker 环境变量（部署）

```bash
# 在 docker-compose.yml 中：
services:
  api:
    environment:
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-key
      - API_URL=https://your-domain.com
```

---

## 验证

配置完成后，请验证是否生效：

```
1. 打开笔记本
2. 进入「设置 → 模型」
3. 应能看到已配置的提供商
4. 尝试简单聊天问题
5. 若有回复，说明配置正确！
```

---

## 常见错误

| 错误 | 问题 | 修复 |
|---------|---------|-----|
| 未配置凭据 | 模型不可用 | 在「设置 → API 密钥」中添加凭据 |
| 缺少加密密钥 | 无法保存凭据 | 设置 OPEN_NOTEBOOK_ENCRYPTION_KEY |
| 数据库 URL 错误 | API 无法启动 | 检查 SURREAL_URL 格式 |
| 未暴露端口 5055 | 「无法连接服务器」 | 在 docker-compose 中暴露 5055 |
| 环境变量拼写错误 | 设置未生效 | 检查拼写（区分大小写！） |
| 未重启 | 仍使用旧配置 | 修改环境变量后重启服务 |

---

## 配置之后

配置完成后：

1. **[快速开始](../0-START-HERE/index.zh.md)** — 运行第一个笔记本
2. **[安装](../1-INSTALLATION/index.zh.md)** — 多种部署指南
3. **[用户指南](../3-USER-GUIDE/index.zh.md)** — 各功能用法

---

## 获取帮助

- **配置错误？** → 查看[故障排除](../6-TROUBLESHOOTING/quick-fixes.zh.md)
- **提供商相关问题？** → 查看 [AI 提供商](ai-providers.zh.md)
- **需要完整参考？** → 见 [环境变量参考](environment-reference.zh.md)

---

## 摘要

**运行所需的最小配置：**
1. 在环境中设置 `OPEN_NOTEBOOK_ENCRYPTION_KEY`
2. 启动服务
3. 在「设置 → API 密钥」中添加 AI 提供商凭据
4. 完成！

其余均为可选优化。

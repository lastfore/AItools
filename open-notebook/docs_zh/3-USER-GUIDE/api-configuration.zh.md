# API 配置

通过设置界面配置 AI 提供商凭据。无需编辑文件。

> **凭据系统**：Open Notebook 使用存储在数据库中的加密凭据。每个凭据连接一个提供商，可用于发现、注册和测试模型。

---

## 概述

Open Notebook 通过**基于凭据的系统**管理 AI 提供商访问：

1. 为每个提供商创建一个**凭据**（API 密钥 + 设置）
2. 凭据**加密**后存储在数据库中
3. **测试连接**以验证凭据有效
4. 从每个凭据**发现并注册模型**
5. 模型与凭据关联，用于直接配置

---

## 加密设置

存储凭据前，必须配置加密密钥。

### 设置加密密钥

在 `docker-compose.yml` 中添加 `OPEN_NOTEBOOK_ENCRYPTION_KEY`：

```yaml
environment:
  - OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-passphrase
```

任意字符串均可作为密钥——系统内部会通过 SHA-256 安全派生。

> **警告**：若更改或丢失加密密钥，**所有已存储凭据将无法读取**。请安全备份加密密钥，并与数据库备份分开存放。

### Docker Secrets 支持

密码与加密密钥均支持 Docker secrets：

```yaml
# docker-compose.yml
services:
  open_notebook:
    environment:
      - OPEN_NOTEBOOK_PASSWORD_FILE=/run/secrets/app_password
      - OPEN_NOTEBOOK_ENCRYPTION_KEY_FILE=/run/secrets/encryption_key
    secrets:
      - app_password
      - encryption_key

secrets:
  app_password:
    file: ./secrets/password.txt
  encryption_key:
    file: ./secrets/encryption_key.txt
```

### 加密详情

存储在数据库中的 API 密钥使用 Fernet（AES-128-CBC + HMAC-SHA256）加密。

| 配置 | 行为 |
|---------------|----------|
| 已设置加密密钥 | 使用您的密钥加密 |
| 未设置加密密钥 | 禁用凭据存储 |

---

## 访问凭据配置

1. 点击导航栏中的 **Settings**
2. 选择 **API Keys** 标签页
3. 您将看到现有凭据及 **Add Credential** 按钮

```
Navigation: Settings → API Keys
```

---

## 支持的提供商

### 云提供商

| Provider | Required Fields | Optional Fields |
|----------|-----------------|-----------------|
| OpenAI | API Key | — |
| Anthropic | API Key | — |
| Google Gemini | API Key | — |
| Groq | API Key | — |
| Mistral | API Key | — |
| DeepSeek | API Key | — |
| xAI | API Key | — |
| OpenRouter | API Key | — |
| Voyage AI | API Key | — |
| ElevenLabs | API Key | — |

### 本地/自托管

| Provider | Required Fields | Notes |
|----------|-----------------|-------|
| Ollama | Base URL | 通常为 `http://localhost:11434` 或 `http://ollama:11434` |

### 企业版

| Provider | Required Fields | Optional Fields |
|----------|-----------------|-----------------|
| Azure OpenAI | API Key, URL Base (Azure endpoint) | Service-specific endpoints (LLM, Embedding, STT, TTS) |
| OpenAI-Compatible | Base URL | API Key, Service-specific configs |
| Vertex AI | Project ID, Location, Credentials Path | — |

---

## 创建凭据

### 步骤 1：添加凭据

1. 进入 **Settings** → **API Keys**
2. 点击 **Add Credential**
3. 选择提供商
4. 填写描述性名称（如「My OpenAI Key」「Work Anthropic」）
5. 填写必填字段（API 密钥、base URL 等）
6. 点击 **Save**

### 步骤 2：测试连接

1. 在新凭据卡片上点击 **Test Connection**
2. 等待结果：

| Result | Meaning |
|--------|---------|
| Success | 密钥有效，提供商可访问 |
| Invalid API key | 检查密钥格式与值 |
| Connection failed | 检查 URL、网络、防火墙 |

### 步骤 3：发现模型

1. 在凭据卡片上点击 **Discover Models**
2. 系统向提供商查询可用模型
3. 查看发现的模型

### 步骤 4：注册模型

1. 选择要使用的模型
2. 点击 **Register Models**
3. 模型现可在整个 Open Notebook 中使用

---

## 多凭据支持

每个提供商可有**多个凭据**。适用于：
- 不同项目使用不同 API 密钥
- 使用不同端点进行测试
- 多名团队成员需要独立凭据

### 创建多个凭据

1. 再次点击 **Add Credential**
2. 选择同一提供商
3. 填写不同凭据
4. 每个凭据可发现并注册各自的模型

### 模型如何关联凭据

从凭据注册模型后，这些模型与该凭据关联。这意味着：
- 每个模型知道使用哪个 API 密钥
- 同一提供商可有来自不同凭据的模型
- 删除凭据会移除其关联模型

---

## 测试连接

点击 **Test Connection** 验证凭据：

| Result | Meaning |
|--------|---------|
| Success | 密钥有效，提供商可访问 |
| Invalid API key | 检查密钥格式与值 |
| Connection failed | 检查 URL、网络、防火墙 |
| Model not available | 密钥有效但模型访问受限 |

测试使用低成本模型（如 `gpt-3.5-turbo`、`claude-3-haiku`）以降低成本。

---

## 配置特定提供商

### 简单提供商（仅需 API 密钥）

对于 OpenAI、Anthropic、Google、Groq、Mistral、DeepSeek、xAI、OpenRouter：

1. 使用 API 密钥添加凭据
2. 测试连接
3. 发现并注册模型

### Ollama（基于 URL）

1. 添加提供商为 **Ollama** 的凭据
2. 输入 base URL（如 `http://ollama:11434`）
3. 测试连接
4. 发现并注册模型

Ollama 允许 localhost 与私有 IP，因其在本地运行。

### Azure OpenAI

1. 添加提供商为 **Azure OpenAI** 的凭据
2. 输入 API 密钥
3. 在 **URL Base** 字段输入 Azure 端点（如 `https://myresource.openai.azure.com`）
4. 测试连接
5. 发现并注册模型

URL Base 字段会自动映射到 Azure 端点。若未通过环境变量设置，API 版本默认为 `2024-10-21`。

### OpenAI-Compatible

适用于自定义 OpenAI 兼容服务器（LM Studio、vLLM 等）：

1. 添加提供商为 **OpenAI-Compatible** 的凭据
2. 输入 base URL
3. 输入 API 密钥（如需要）
4. 可选配置各服务 URL

支持以下独立配置：
- LLM（语言模型）
- Embedding（嵌入）
- STT（语音转文字）
- TTS（文字转语音）

### Vertex AI

Google Cloud 企业 AI 平台：

| Field | Example |
|-------|---------|
| Project ID | `my-gcp-project` |
| Location | `us-central1` |
| Credentials Path | `/path/to/service-account.json` |

---

## 从环境变量迁移

若您在环境变量中已有 API 密钥（来自旧版本）：

1. 打开 **Settings → API Keys**
2. 出现横幅：「Environment variables detected」
3. 点击 **Migrate to Database**
4. 密钥复制到数据库（加密）
5. 原始环境变量保持不变

### 迁移行为

| Scenario | Action |
|----------|--------|
| 仅存在于 env 的密钥 | 迁移到数据库 |
| 仅存在于数据库的密钥 | 无变化 |
| 两者皆有 | 保留数据库版本（跳过） |

### 迁移后

- 所有操作使用数据库凭据
- 可从 `docker-compose.yml` 移除 API 密钥环境变量
- 保留 `OPEN_NOTEBOOK_ENCRYPTION_KEY` — 仍必需

### 迁移横幅显示条件

迁移横幅仅在以下情况出现：
- 已配置环境变量
- 这些提供商**尚未**存在于数据库
- 若所有 env 提供商已迁移，横幅不会显示

---

## 从 ProviderConfig 迁移（v1.1 → v1.2）

若您从使用 ProviderConfig 系统的旧版本升级：

- 首次启动时自动迁移
- 现有配置转换为凭据
- 检查 **Settings → API Keys** 确认迁移成功
- 如有问题，查看 API 日志中的迁移消息

---

## 密钥存储安全

### 加密

存储在数据库中的 API 密钥使用 Fernet（AES-128-CBC + HMAC-SHA256）加密。

| Configuration | Behavior |
|---------------|----------|
| 已设置加密密钥 | 使用您的密钥加密 |
| 未设置加密密钥 | 禁用数据库 API 密钥存储 |

### 默认凭据

| Setting | Default Value | Production Recommendation |
|---------|---------------|---------------------------|
| Password | `open-notebook-change-me` | 设置 `OPEN_NOTEBOOK_PASSWORD` |
| Encryption Key | None (must be set) | 将 `OPEN_NOTEBOOK_ENCRYPTION_KEY` 设为任意密钥字符串 |

**生产部署请务必设置自定义凭据。**

---

## 删除凭据

1. 点击凭据卡片上的 **Delete**
2. 确认删除
3. 凭据及其所有关联模型将从数据库移除

---

## 故障排除

### 凭据无法保存

| Symptom | Cause | Solution |
|---------|-------|----------|
| Save button disabled | 输入为空或无效 | 输入有效密钥 |
| Error on save | 未设置加密密钥 | 在 docker-compose.yml 中设置 `OPEN_NOTEBOOK_ENCRYPTION_KEY` |
| Error on save | 数据库连接问题 | 检查数据库状态 |

### 测试连接失败

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid API key | 密钥错误或格式不对 | 从提供商控制台核实密钥 |
| Connection refused | URL 错误 | 检查 base URL 格式 |
| Timeout | 网络问题 | 检查防火墙、代理设置 |
| 403 Forbidden | IP 限制 | 将服务器 IP 加入白名单 |

### 迁移问题

| Problem | Solution |
|---------|----------|
| No migration banner | 未检测到 env 变量，或已迁移 |
| Partial migration | 查看错误列表，修复后重试 |
| Keys not working after migration | 清除浏览器缓存，重启服务 |

### 提供商显示「Not Configured」

1. 检查该提供商是否存在凭据（Settings → API Keys）
2. 测试凭据连接
3. 核实密钥格式符合提供商要求
4. 必要时重新发现并注册模型

---

## 提供商特定说明

### OpenAI
- 密钥以 `sk-proj-`（项目密钥）或 `sk-`（旧版）开头
- 账户需启用计费

### Anthropic
- 密钥以 `sk-ant-` 开头
- 确认账户已启用 API 访问

### Google Gemini
- 密钥以 `AIzaSy` 开头
- 免费套餐有速率限制

### Ollama
- 无需 API 密钥
- 默认 URL：`http://localhost:11434`（本地）或 `http://ollama:11434`（Docker）
- 确保 Ollama 服务正在运行

### Azure OpenAI
- 在 **URL Base** 字段输入 Azure 端点（格式：`https://{resource-name}.openai.azure.com`）
- API 版本默认为 `2024-10-21`；需要时可通过 `AZURE_OPENAI_API_VERSION` 环境变量覆盖
- 通过凭据的 Discover Models 对话框注册模型时单独配置部署名称

---

## 相关文档

- **[AI Providers](../5-CONFIGURATION/ai-providers.zh.md)** — 提供商设置说明与建议
- **[Security](../5-CONFIGURATION/security.zh.md)** — 密码与加密配置
- **[Environment Reference](../5-CONFIGURATION/environment-reference.zh.md)** — 全部配置选项

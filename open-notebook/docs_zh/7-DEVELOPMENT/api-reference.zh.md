# API 参考

Open Notebook 的完整 REST API。所有端点均由 API 后端提供（默认：`http://localhost:5055`）。

**基础 URL**：`http://localhost:5055`（开发环境）或环境对应的生产 URL

**交互式文档**：使用 FastAPI 内置 Swagger UI（`http://localhost:5055/docs`）进行实时测试与探索。这是所有端点、请求/响应模式及实时测试的主要参考。

---

## 快速开始

### 1. 身份验证

简单密码方式（仅用于开发）：

```bash
curl http://localhost:5055/api/notebooks \
  -H "Authorization: Bearer your_password"
```

**⚠️ 生产环境**：请替换为 OAuth/JWT。详见[安全配置](../5-CONFIGURATION/security.zh.md)。

### 2. 基本 API 流程

多数操作遵循以下模式：
1. 创建 **Notebook**（研究容器）
2. 添加 **Sources**（PDF、URL、文本）
3. 通过 **Chat** 或 **Search** 查询
4. 查看结果与 **Notes**

### 3. 测试端点

无需死记端点，请使用交互式 API 文档：
- 访问 `http://localhost:5055/docs`
- 在浏览器中直接尝试请求
- 实时查看请求/响应模式
- 使用自有数据进行测试

---

## API 端点概览

### 主要资源类型

**Notebooks** — 包含来源与笔记的研究项目
- `GET/POST /notebooks` — 列表与创建
- `GET/PUT/DELETE /notebooks/{id}` — 读取、更新、删除

**Sources** — 内容项（PDF、URL、文本）
- `GET/POST /sources` — 列表与添加内容
- `GET /sources/{id}` — 获取来源详情
- `POST /sources/{id}/retry` — 重试失败的处理
- `GET /sources/{id}/download` — 下载原始文件

**Notes** — 用户创建或 AI 生成的研究笔记
- `GET/POST /notes` — 列表与创建
- `GET/PUT/DELETE /notes/{id}` — 读取、更新、删除

**Chat** — 对话式 AI 界面
- `GET/POST /chat/sessions` — 管理聊天会话
- `POST /chat/execute` — 发送消息并获取回复
- `POST /chat/context/build` — 为聊天准备上下文

**Search** — 按文本或语义相似度查找内容
- `POST /search` — 全文或向量搜索
- `POST /ask` — 提问（搜索 + 综合）

**Transformations** — 用于提取洞察的自定义提示
- `GET/POST /transformations` — 创建自定义提取规则
- `POST /sources/{id}/insights` — 对来源应用转换

**Models** — 配置 AI 提供商
- `GET /models` — 可用模型
- `GET /models/defaults` — 当前默认项
- `POST /models/config` — 设置默认项

**Credentials** — 管理 AI 提供商凭据
- `GET/POST /credentials` — 列表与创建凭据
- `GET/PUT/DELETE /credentials/{id}` — CRUD 操作
- `POST /credentials/{id}/test` — 测试连接
- `POST /credentials/{id}/discover` — 从提供商发现模型
- `POST /credentials/{id}/register-models` — 注册已发现模型
- `GET /credentials/status` — 提供商状态概览
- `GET /credentials/env-status` — 环境变量状态
- `POST /credentials/migrate-from-env` — 将环境变量迁移为凭据

**Health & Status**
- `GET /health` — 健康检查
- `GET /commands/{id}` — 跟踪异步操作

---

## 身份验证

### 当前方式（开发）

所有请求需携带密码头：

```bash
curl -H "Authorization: Bearer your_password" http://localhost:5055/api/notebooks
```

密码通过 `OPEN_NOTEBOOK_PASSWORD` 环境变量配置。

> **📖 完整身份验证设置、API 示例及生产加固请参阅[安全配置](../5-CONFIGURATION/security.zh.md)。**

### 生产环境

**⚠️ 不安全。** 请替换为：
- OAuth 2.0（推荐）
- JWT 令牌
- API 密钥

生产环境设置见[安全配置](../5-CONFIGURATION/security.zh.md)。

---

## 常见模式

### 分页

```bash
# List sources with limit/offset
curl 'http://localhost:5055/sources?limit=20&offset=10'
```

### 筛选与排序

```bash
# Filter by notebook, sort by date
curl 'http://localhost:5055/sources?notebook_id=notebook:abc&sort_by=created&sort_order=asc'
```

### 异步操作

部分操作（来源处理、播客生成）会立即返回 command ID：

```bash
# Submit async operation
curl -X POST http://localhost:5055/sources -F async_processing=true
# Response: {"id": "source:src001", "command_id": "command:cmd123"}

# Poll status
curl http://localhost:5055/commands/command:cmd123
```

### 流式响应

`/ask` 端点以 Server-Sent Events 流式返回：

```bash
curl -N 'http://localhost:5055/ask' \
  -H "Content-Type: application/json" \
  -d '{"question": "What is AI?"}'

# Outputs: data: {"type":"strategy",...}
#          data: {"type":"answer",...}
#          data: {"type":"final_answer",...}
```

### Multipart 文件上传

```bash
curl -X POST http://localhost:5055/sources \
  -F "type=upload" \
  -F "notebook_id=notebook:abc" \
  -F "file=@document.pdf"
```

---

## 错误处理

所有错误均返回带状态码的 JSON：

```json
{"detail": "Notebook not found"}
```

### 常见状态码

| 代码 | 含义 | 示例 |
|------|------|------|
| 200 | 成功 | 操作完成 |
| 400 | 错误请求 | 输入无效 |
| 404 | 未找到 | 资源不存在 |
| 409 | 冲突 | 资源已存在 |
| 500 | 服务器错误 | 数据库/处理错误 |

---

## 开发者提示

1. **从交互式文档入手**（`http://localhost:5055/docs`）— 这是权威参考
2. **启用日志**以便调试（查看 API 日志：`docker logs`）
3. **流式端点**需特殊处理（Server-Sent Events，非标准 JSON）
4. **异步操作**立即返回；完成前务必轮询状态
5. **向量搜索**需配置嵌入模型（检查 `/models`）
6. **模型覆盖**按请求设置；在请求体中指定，而非配置
7. **开发环境已启用 CORS**；生产环境需单独配置

---

## 学习路径

1. **身份验证**：为所有请求添加 `X-Password` 头
2. **创建笔记本**：`POST /notebooks`，提供名称与描述
3. **添加来源**：`POST /sources`，上传文件、URL 或文本
4. **查询内容**：`POST /chat/execute` 提问
5. **探索高级功能**：搜索、转换、流式

---

## 生产环境注意事项

- 将密码认证替换为 OAuth/JWT（见[安全](../5-CONFIGURATION/security.zh.md)）
- 通过反向代理添加速率限制（Nginx、CloudFlare、Kong）
- 限制 CORS 来源（当前允许所有来源）
- 通过反向代理使用 HTTPS（见[反向代理](../5-CONFIGURATION/reverse-proxy.md)）
- 制定 API 版本策略（当前为隐式）

完整生产设置见[安全配置](../5-CONFIGURATION/security.zh.md)与[反向代理设置](../5-CONFIGURATION/reverse-proxy.md)。

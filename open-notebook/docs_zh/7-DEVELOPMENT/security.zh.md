# 安全指南

本文档说明 Open Notebook 开发的安全实践。内容基于与 [CERT-EU](https://cert.europa.eu) 协调披露中发现的真实漏洞，所有贡献者应必读。

## 报告漏洞

若发现安全漏洞，**请勿公开创建 GitHub issue**。请：

1. 使用 [GitHub Security Advisories](https://github.com/lfnovo/open-notebook/security/advisories/new) 私下报告
2. 或直接邮件联系维护者

我们遵循协调漏洞披露流程，会在公开公告前与您协作修复。

---

## 数据库查询（SurrealQL 注入）

**规则：切勿通过 f-string 将用户输入拼接到 SurrealQL 查询中。**

SurrealQL 注入等同于 SQL 注入。用户可控值必须通过 `$variable` 语法的参数化绑定变量传入。

### 参数化查询（安全）

```python
# Good: parameterized query
result = await repo_query(
    "SELECT * FROM source WHERE id = $id",
    {"id": ensure_record_id(source_id)}
)
```

### F-string 插值（存在漏洞）

```python
# Bad: user input in f-string
result = await repo_query(f"SELECT * FROM source WHERE id = {source_id}")
```

### ORDER BY 等无法参数化的子句

在 SurrealDB 中，`ORDER BY`、`LIMIT` 等子句通常无法接受绑定变量。应使用 **白名单校验**：

```python
# Good: validate against allowlist, then interpolate
allowed_fields = {"name", "created", "updated"}
allowed_directions = {"asc", "desc"}

parts = order_by.strip().lower().split()
if parts[0] not in allowed_fields:
    raise HTTPException(status_code=400, detail="Invalid sort field")
if len(parts) > 1 and parts[1] not in allowed_directions:
    raise HTTPException(status_code=400, detail="Invalid sort direction")

query = f"SELECT * FROM notebook ORDER BY {validated_order_by}"
```

排序参数校验的参考实现见 `api/routers/sources.py`。

### 清单

- [ ] 所有用户提供值使用 `$variable` 绑定
- [ ] 查询中的 f-string 仅包含已校验/硬编码值
- [ ] `ORDER BY`、`LIMIT` 等使用白名单校验
- [ ] 后续查询中使用的数据库值也进行参数化（防止二阶注入）

---

## 模板渲染（服务端模板注入）

**规则：渲染包含用户提供内容的 Jinja2 模板时，始终使用 `SandboxedEnvironment`。**

[ai-prompter](https://github.com/lfnovo/ai-prompter) 库（>= 0.4.0）默认使用 `SandboxedEnvironment`，可阻止访问 `__globals__`、`__subclasses__`、`__init__` 等危险 Python 属性。

### SandboxedEnvironment 阻止的内容

```jinja2
{# These are blocked and raise SecurityError #}
{{ cycler.__init__.__globals__.os.popen('id').read() }}
{{ ''.__class__.__mro__[1].__subclasses__() }}
```

### 指南

- 切勿将 ai-prompter 降级到 0.4.0 以下
- 若直接使用 Jinja2（在 ai-prompter 之外），始终使用 `jinja2.sandbox.SandboxedEnvironment`
- 切勿将用户提供的字符串直接传给 `jinja2.Environment` 或 `jinja2.Template`

---

## 文件处理（路径遍历与本地文件包含）

### 文件上传

**规则：始终清理文件名并校验解析后的路径。**

```python
import os
from pathlib import Path

# 1. Strip directory components
safe_filename = os.path.basename(original_filename)

# 2. Validate resolved path stays within target directory
resolved = (Path(upload_folder) / safe_filename).resolve()
if not str(resolved).startswith(str(Path(upload_folder).resolve()) + os.sep):
    raise ValueError("Path traversal detected")
```

要点：

- 对用户提供的文件名使用 `os.path.basename()` 去除目录成分
- 使用 `Path.resolve()` 解析符号链接与 `..` 成分
- 使用带 **尾随 `os.sep`** 的 `startswith()`，防止兄弟目录绕过（例如 `/uploads_evil/` 匹配 `/uploads`）

### 文件路径输入

**规则：校验用户提供的任意文件路径位于预期目录内。**

```python
uploads_resolved = Path(UPLOADS_FOLDER).resolve()
file_resolved = Path(user_provided_path).resolve()
if not str(file_resolved).startswith(str(uploads_resolved) + os.sep):
    raise HTTPException(status_code=400, detail="Invalid file path")
```

未经校验，切勿将用户提供的文件路径直接传给文件读取或内容提取函数。

### 清单

- [ ] 上传文件名使用 `os.path.basename()` 清理
- [ ] 使用 `startswith(directory + os.sep)` 校验解析后路径
- [ ] 使用前校验用户提供的 `file_path`
- [ ] 不根据用户输入创建目录（避免 `mkdir` 与遍历路径）

---

## 认证与 CORS

### 认证

Open Notebook 当前使用简单密码中间件（`PasswordAuthMiddleware`）。适用于单用户自托管，生产环境应加固：

- 更改默认密码（`OPEN_NOTEBOOK_PASSWORD`）
- 更改默认加密密钥（`OPEN_NOTEBOOK_ENCRYPTION_KEY`）
- 考虑在具备适当认证（OAuth、OIDC）的反向代理后部署

### CORS

默认 CORS 配置允许所有来源（`allow_origins=["*"]`）。改进跟踪见 [#730](https://github.com/lfnovo/open-notebook/issues/730)。生产部署应将来源限制为前端 URL。

---

## 密钥管理

### 加密密钥

`OPEN_NOTEBOOK_ENCRYPTION_KEY` 用于加密存储在 SurrealDB 中的 API 密钥。生产环境：

- 设置强且唯一的密钥（勿使用默认值）
- 尽可能通过 `OPEN_NOTEBOOK_ENCRYPTION_KEY_FILE` 使用 Docker secrets
- 切勿在日志中记录或暴露该值

### 环境变量

- 敏感值（API 密钥、密码、加密密钥）不得出现在日志中
- 谨慎使用 `loguru` — 避免记录完整请求体或环境变量 dump
- Docker 容器默认以 root 运行；可考虑以非 root 用户运行

---

## 代码审查安全清单

审查 PR 时检查：

1. **查询注入**：SurrealQL 查询的 f-string 是否包含用户输入
2. **模板注入**：用户字符串是否在未沙箱化情况下传入 Jinja2
3. **路径遍历**：用户提供的文件名或路径是否未经清理使用
4. **信息泄露**：错误消息是否暴露内部路径、堆栈或配置
5. **SSRF**：用户提供的 URL 是否在未校验情况下用于服务端 HTTP 请求
6. **日志中的密钥**：任何级别是否记录了敏感值

---

## 历史漏洞

以下漏洞由 CERT-EU 报告，在此作为学习示例：

| 版本 | 漏洞 | 严重程度 | 公告 |
|---------|--------------|----------|----------|
| <= 1.8.2 | 通过 `order_by` 参数的 SurrealDB 注入 | High (8.7) | [GHSA-5wj9-f8q5-8f9c](https://github.com/lfnovo/open-notebook/security/advisories/GHSA-5wj9-f8q5-8f9c) |
| <= 1.8.3 | 通过 transformations 中 Jinja2 SSTI 的 RCE | Critical (9.2) | [GHSA-f35w-wx37-26q7](https://github.com/lfnovo/open-notebook/security/advisories/GHSA-f35w-wx37-26q7) |
| <= 1.8.3 | 通过路径遍历的任意文件写入 | High (7.0) | [GHSA-x4q2-89g5-594v](https://github.com/lfnovo/open-notebook/security/advisories/GHSA-x4q2-89g5-594v) |
| <= 1.8.3 | 通过 LFI 的任意文件读取 | High (8.2) | [GHSA-842v-h4cj-r646](https://github.com/lfnovo/open-notebook/security/advisories/GHSA-842v-h4cj-r646) |

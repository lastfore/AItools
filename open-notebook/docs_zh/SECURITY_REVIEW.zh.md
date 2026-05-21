# 安全审查 - API 配置 UI

## 日期：2026-01-27（更新：2026-01-28）
## 审查人：安全审计

---

## 摘要

对 Open Notebook API 密钥管理实现的安全审查。该实现采用数据库优先策略，并支持环境变量回退。

---

## 加密

| 项目 | 状态 | 说明 |
|------|--------|-------|
| 已实现 Fernet 加密 | 通过 | `open_notebook/utils/encryption.py` 使用 AES-128-CBC + HMAC-SHA256 |
| 密钥在写入数据库前加密 | 通过 | 保存时应用 `encrypt_value()` |
| 仅在需要时解密密钥 | 通过 | 读取时调用 `decrypt_value()` |
| 必须配置加密密钥 | 通过 | 无默认密钥；未配置时抛出 ValueError |
| 支持 Docker secrets | 通过 | 支持 `_FILE` 后缀模式 |
| 已在 .env.example 中文档化 | 通过 | 已文档化加密密钥 |

---

## API 安全

| 项目 | 状态 | 说明 |
|------|--------|-------|
| 已实现测试端点 | 通过 | `connection_tester.py` 验证密钥 |
| 测试不暴露密钥 | 通过 | 仅返回成功/失败 |
| 错误消息不泄露信息 | 通过 | 通用错误消息 |
| URL 验证防 SSRF | 通过 | 阻止私有 IP（Ollama 除外） |
| 速率限制 | 未实现 | 后续增强 |

---

## 前端安全

| 项目 | 状态 | 说明 |
|------|--------|-------|
| 不在 localStorage 中存储密钥 | 通过 | 密钥仅在输入时存在于 React state |
| UI 中掩码显示密钥 | 通过 | 显示 `************` 占位符 |
| 不在 console.log 中输出密钥 | 通过 | 不记录敏感数据 |
| autocomplete 属性 | 部分 | 部分表单缺少 autocomplete="off" |

---

## 认证

| 项目 | 状态 | 说明 |
|------|--------|-------|
| 密码保护 | 通过 | Bearer token 认证 |
| 默认密码 | 通过 | 未设置时为 "open-notebook-change-me" |
| 支持 Docker secrets | 通过 | 密码支持 `_FILE` 后缀 |
| 安全警告 | 通过 | 使用默认值时记录日志 |

---

## 已审查文件

| 组件 | 路径 | 状态 |
|-----------|------|--------|
| 加密 | `open_notebook/utils/encryption.py` | 通过 |
| Credential 模型 | `open_notebook/domain/credential.py` | 通过 |
| Credentials 路由 | `api/routers/credentials.py` | 通过 |
| Key provider | `open_notebook/ai/key_provider.py` | 通过 |
| Connection tester | `open_notebook/ai/connection_tester.py` | 通过 |
| Auth 中间件 | `api/auth.py` | 通过 |
| 前端表单 | `frontend/src/components/settings/*.tsx` | 通过 |
| 环境变量示例 | `.env.example` | 通过 |

---

## 剩余建议

### 后续改进

1. **速率限制** - 为 `/credentials/*` 端点添加速率限制
2. **Autocomplete 属性** - 为所有密码输入添加 `autocomplete="new-password"`
3. **显示末 4 位** - 以 `********xxxx` 格式显示以便识别密钥
4. **审计日志** - 记录 API 密钥变更及时间戳

---

## 结论

API 配置 UI 实现满足安全要求：

- API 密钥使用 Fernet 静态加密（必须显式配置密钥）
- 密钥从不返回前端
- URL 验证可防止 SSRF 攻击
- 支持 Docker secrets 用于生产部署

**审查状态：通过**

# 安全配置

通过密码认证与生产环境加固保护您的 Open Notebook 部署。

---

## API 密钥加密

Open Notebook 使用 Fernet 对称加密（AES-128-CBC 与 HMAC-SHA256）对存储在数据库中的 API 密钥进行加密。

### 配置方式

| 方式 | 文档 |
|------|------|
| **设置界面** | [API 配置指南](../3-USER-GUIDE/api-configuration.zh.md) |
| **环境变量** | 本页（下文） |

### 设置

将加密密钥设置为任意密钥字符串：

```bash
# .env or docker.env
OPEN_NOTEBOOK_ENCRYPTION_KEY=my-secret-passphrase
```

任意字符串均可使用——系统会在内部通过 SHA-256 安全派生。生产部署请使用强口令。

### 默认凭据

| 设置项 | 默认值 | 安全级别 |
|--------|--------|----------|
| 密码 | `open-notebook-change-me` | 仅用于开发 |
| 加密密钥 | **无**（必须配置） | API 密钥存储所必需 |

**加密密钥没有默认值。** 使用 API 密钥配置功能前，必须设置 `OPEN_NOTEBOOK_ENCRYPTION_KEY`。未配置时，API 密钥的加密/解密将失败。

### Docker Secrets 支持

两项设置均支持通过 `_FILE` 后缀使用 Docker secrets：

```yaml
environment:
  - OPEN_NOTEBOOK_PASSWORD_FILE=/run/secrets/app_password
  - OPEN_NOTEBOOK_ENCRYPTION_KEY_FILE=/run/secrets/encryption_key
```

### 安全说明

| 场景 | 行为 |
|------|------|
| 已配置密钥 | 使用您的密钥加密 API 密钥 |
| 未配置密钥 | 加密/解密将失败（密钥为必需项） |
| 密钥已更改 | 此前加密的密钥将无法读取 |
| 遗留数据 | 未加密的密钥仍可使用（优雅降级） |

### 密钥管理

- **保密**：切勿将加密密钥提交到版本控制
- **安全备份**：将密钥与数据库备份分开存放
- **暂不支持轮换**：更改密钥后需重新保存所有 API 密钥
- **按部署隔离**：每个实例应使用各自的加密密钥

---

## 何时使用密码保护

### 建议使用：
- 公有云部署（PikaPods、Railway、DigitalOcean）
- 共享网络环境
- 任何超出 localhost 可访问的部署

### 可省略：
- 本机本地开发
- 私有、隔离网络
- 单用户本地环境

---

## 快速设置

### Docker 部署

```yaml
# Add to your docker-compose.yml (requires surrealdb service, see installation guide)
services:
  open_notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    environment:
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=your-secret-encryption-key
      - OPEN_NOTEBOOK_PASSWORD=your_secure_password
    # ... rest of config
```

或使用环境文件：

```bash
# docker.env
OPEN_NOTEBOOK_ENCRYPTION_KEY=your-secret-encryption-key
OPEN_NOTEBOOK_PASSWORD=your_secure_password
```

> **重要**：加密密钥为凭据存储的**必需项**。未配置时，无法通过设置界面保存 AI 提供商凭据。若更改或丢失加密密钥，所有已存储凭据将无法读取。

### 开发环境设置

```bash
# .env
OPEN_NOTEBOOK_PASSWORD=your_secure_password
```

---

## 密码要求

### 强密码示例

```bash
# Strong: 20+ characters, mixed case, numbers, symbols
OPEN_NOTEBOOK_PASSWORD=MySecure2024!Research#Tool
OPEN_NOTEBOOK_PASSWORD=Notebook$Dev$2024$Strong!

# Generated (recommended)
OPEN_NOTEBOOK_PASSWORD=$(openssl rand -base64 24)
```

### 弱密码示例（勿用）

```bash
# DON'T use these
OPEN_NOTEBOOK_PASSWORD=password123
OPEN_NOTEBOOK_PASSWORD=opennotebook
OPEN_NOTEBOOK_PASSWORD=admin
```

---

## 工作原理

### 前端保护

1. 首次访问时显示登录表单
2. 密码保存在浏览器会话中
3. 会话持续至浏览器关闭
4. 清除浏览器数据即可退出登录

### API 保护

所有 API 端点均需认证：

```bash
# Authenticated request
curl -H "Authorization: Bearer your_password" \
  http://localhost:5055/api/notebooks

# Unauthenticated (will fail)
curl http://localhost:5055/api/notebooks
# Returns: {"detail": "Missing authorization header"}
```

### 无需认证的端点

以下端点无需认证即可访问：

- `/health` - 系统健康检查
- `/docs` - API 文档
- `/openapi.json` - OpenAPI 规范

---

## API 认证示例

### curl

```bash
# List notebooks
curl -H "Authorization: Bearer your_password" \
  http://localhost:5055/api/notebooks

# Create notebook
curl -X POST \
  -H "Authorization: Bearer your_password" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Notebook", "description": "Research notes"}' \
  http://localhost:5055/api/notebooks

# Upload file
curl -X POST \
  -H "Authorization: Bearer your_password" \
  -F "file=@document.pdf" \
  http://localhost:5055/api/sources/upload
```

### Python

```python
import requests

class OpenNotebookClient:
    def __init__(self, base_url: str, password: str):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {password}"}

    def get_notebooks(self):
        response = requests.get(
            f"{self.base_url}/api/notebooks",
            headers=self.headers
        )
        return response.json()

    def create_notebook(self, name: str, description: str = None):
        response = requests.post(
            f"{self.base_url}/api/notebooks",
            headers=self.headers,
            json={"name": name, "description": description}
        )
        return response.json()

# Usage
client = OpenNotebookClient("http://localhost:5055", "your_password")
notebooks = client.get_notebooks()
```

### JavaScript/TypeScript

```javascript
const API_URL = 'http://localhost:5055';
const PASSWORD = 'your_password';

async function getNotebooks() {
  const response = await fetch(`${API_URL}/api/notebooks`, {
    headers: {
      'Authorization': `Bearer ${PASSWORD}`
    }
  });
  return response.json();
}
```

---

## 生产环境加固

### Docker 安全

```yaml
# Add to your docker-compose.yml (requires surrealdb service, see installation guide)
services:
  open_notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    ports:
      - "127.0.0.1:8502:8502"  # Bind to localhost only
    environment:
      - OPEN_NOTEBOOK_PASSWORD=your_secure_password
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "1.0"
    restart: always
```

### 防火墙配置

```bash
# UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 8502/tcp   # Block direct access
sudo ufw deny 5055/tcp   # Block direct API access
sudo ufw enable

# iptables
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8502 -j DROP
iptables -A INPUT -p tcp --dport 5055 -j DROP
```

### 带 SSL 的反向代理

完整 nginx/Caddy/Traefik HTTPS 配置见[反向代理配置](reverse-proxy.zh.md)。

### CORS 源

API 默认接受来自任意源（`*`）的跨域请求。这对开发与多样化的自托管部署很方便，但不建议用于面向公网的生产部署，因为用户访问的任意网站都可能向您的 API 发起已认证的跨域请求。

未设置 `CORS_ORIGINS` 时，API 启动时会记录警告日志，提示您进行配置。

**生产环境请将 `CORS_ORIGINS` 设置为前端实际源：**

```bash
# Single origin
CORS_ORIGINS=https://notebook.example.com

# Multiple origins (comma-separated)
CORS_ORIGINS=https://notebook.example.com,https://admin.example.com
```

**指南：**

- 生产环境源地址始终使用 HTTPS。
- 仅列出应被允许调用 API 的确切源。
- 包含协议与端口（非默认时）：`https://example.com`、`http://192.168.1.10:3000`。
- 修改后需重启 API 方可生效。

**错误响应**（401、404、500 等）同样遵循已配置的源——仅在允许的源上包含 `Access-Control-Allow-Origin`，因此在配置了 `CORS_ORIGINS` 时，错误正文不会跨源泄露。

---

## 安全限制

Open Notebook 的密码保护提供的是**基础访问控制**，而非企业级安全：

| 功能 | 状态 |
|------|------|
| 密码传输 | 明文（请使用 HTTPS！） |
| 密码存储 | 内存中 |
| 用户管理 | 全局单一密码 |
| 会话超时 | 无（直至浏览器关闭） |
| 速率限制 | 无 |
| 审计日志 | 无 |

### 风险缓解

1. **始终使用 HTTPS** - 使用 TLS 加密流量
2. **强密码** - 20 位以上、复杂组合
3. **网络安全** - 敏感部署使用防火墙、VPN
4. **定期更新** - 保持容器与依赖项为最新版本
5. **监控** - 检查日志中的可疑活动
6. **备份** - 定期备份数据

---

## 企业级考量

对高级安全有需求的部署：

| 需求 | 方案 |
|------|------|
| SSO/OAuth | 实现 OAuth2/SAML 代理 |
| 基于角色的访问 | 自定义中间件 |
| 审计日志 | 日志聚合服务 |
| 速率限制 | API 网关或 nginx |
| 数据加密 | 静态卷加密 |
| 网络分段 | Docker 网络、VPC |

---

## 故障排除

### 密码无效

```bash
# Check env var is set
docker exec open-notebook env | grep OPEN_NOTEBOOK_PASSWORD

# Check logs
docker logs open-notebook | grep -i auth

# Test API directly
curl -H "Authorization: Bearer your_password" \
  http://localhost:5055/health
```

### 401 未授权错误

```bash
# Check header format
curl -v -H "Authorization: Bearer your_password" \
  http://localhost:5055/api/notebooks

# Verify password matches
echo "Password length: $(echo -n $OPEN_NOTEBOOK_PASSWORD | wc -c)"
```

### 设置密码后无法访问

1. 清除浏览器缓存与 Cookie
2. 尝试无痕/隐私模式
3. 检查浏览器控制台错误
4. 确认环境中的密码正确

### 安全测试

```bash
# Without password (should fail)
curl http://localhost:5055/api/notebooks
# Expected: {"detail": "Missing authorization header"}

# With correct password (should succeed)
curl -H "Authorization: Bearer your_password" \
  http://localhost:5055/api/notebooks

# Health check (should work without password)
curl http://localhost:5055/health
```

---

## 报告安全问题

若发现安全漏洞：

1. **请勿公开提交 issue**
2. 直接联系维护者
3. 提供详细信息
4. 在公开披露前留出修复时间

---

## 相关文档

- **[反向代理](reverse-proxy.zh.md)** - HTTPS 与 SSL 设置
- **[高级配置](advanced.zh.md)** - 端口、超时与 SSL 设置
- **[环境变量参考](environment-reference.zh.md)** - 全部配置项

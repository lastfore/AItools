# 反向代理配置

在 nginx、Caddy、Traefik 或其他反向代理之后部署 Open Notebook，使用自定义域名与 HTTPS。

---

## 简化部署（v1.1+）

自 v1.1 起，Open Notebook 使用 Next.js 重写（rewrites）简化配置。**您只需将流量代理到单一端口**——Next.js 会自动处理内部 API 路由。

### 工作原理

```
Browser → Reverse Proxy → Port 8502 (Next.js)
                             ↓ (internal proxy)
                          Port 5055 (FastAPI)
```

Next.js 会自动将 `/api/*` 请求转发至 FastAPI 后端，因此反向代理只需配置一个端口。

---

## 快速配置示例

### Nginx（推荐）

```nginx
server {
    listen 443 ssl http2;
    server_name notebook.example.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Allow file uploads up to 100MB
    client_max_body_size 100M;

    # Single location block - that's it!
    location / {
        proxy_pass http://open-notebook:8502;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name notebook.example.com;
    return 301 https://$server_name$request_uri;
}
```

### Caddy

```caddy
notebook.example.com {
    reverse_proxy open-notebook:8502 {
        transport http {
            read_timeout 600s
            write_timeout 600s
        }
    }
}
```

Caddy 会自动处理 HTTPS。上述超时设置可确保长时间运行的操作（转换、播客生成）不会因超时而失败。

### Traefik

```yaml
# Add this to your docker-compose.yml alongside the surrealdb service
# See full base setup: https://github.com/lfnovo/open-notebook/blob/main/docker-compose.yml
services:
  open-notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    environment:
      - API_URL=https://notebook.example.com
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.notebook.rule=Host(`notebook.example.com`)"
      - "traefik.http.routers.notebook.entrypoints=websecure"
      - "traefik.http.routers.notebook.tls.certresolver=myresolver"
      - "traefik.http.services.notebook.loadbalancer.server.port=8502"
      # Timeout for long-running operations (transformations, podcasts)
      - "traefik.http.services.notebook.loadbalancer.responseforwarding.flushinterval=100ms"
    networks:
      - traefik-network
```

**说明**：对于 Traefik v2+，可能还需在静态配置中设置 `serversTransport` 超时：

```yaml
# traefik.yml (static configuration)
serversTransport:
  forwardingTimeouts:
    dialTimeout: 30s
    responseHeaderTimeout: 600s
    idleConnTimeout: 90s
```

### Coolify

1. 使用 [Docker Compose](../1-INSTALLATION/docker-compose.zh.md) 创建新服务
2. 将端口设置为 **8502**
3. 添加环境变量：`API_URL=https://your-domain.com`
4. 在 Coolify 中启用 HTTPS
5. 完成。

---

## 环境变量

```bash
# Required for reverse proxy setups
API_URL=https://your-domain.com

# Optional: For multi-container deployments
# INTERNAL_API_URL=http://api-service:5055
```

**重要**：将 `API_URL` 设置为您的公网 URL（含 `https://`）。

**关于 HOSTNAME 的说明**：Docker 镜像默认设置 `HOSTNAME=0.0.0.0`，确保 Next.js 绑定到所有网络接口，从而可被反向代理访问。通常无需手动设置此项。

---

## 理解 API_URL

前端通过三级优先级确定 API URL：

1. **运行时配置**（最高优先级）：容器运行时设置的 `API_URL` 环境变量
2. **构建时配置**：写入 Docker 镜像的 `NEXT_PUBLIC_API_URL`
3. **自动检测**（回退）：根据传入的 HTTP 请求头推断

### 自动检测详情

未设置 `API_URL` 时，Next.js 前端将：
- 分析传入的 HTTP 请求
- 从 `host` 请求头提取主机名
- 尊重 `X-Forwarded-Proto` 请求头（用于 HTTPS 终止型反向代理）
- 将 API URL 构造为 `{protocol}://{hostname}:5055`
- 示例：请求 `http://10.20.30.20:8502` → API URL 变为 `http://10.20.30.20:5055`

**为何应显式设置 API_URL？**
- **可靠性**：复杂代理环境下自动检测可能失败
- **HTTPS**：确保在 SSL 终止型代理后前端使用 `https://`
- **自定义域名**：使用域名而非 IP 地址时也能正常工作
- **端口映射**：使用反向代理时避免在 URL 中暴露 5055 端口

**重要**：URL 末尾不要包含 `/api`——系统会自动添加。

---

## 完整 Docker Compose 示例

> **说明：** 本示例仅展示 open-notebook 与 nginx 服务。您还需要 `surrealdb` 服务。完整配置请参阅[基础 docker-compose.yml](https://github.com/lfnovo/open-notebook/blob/main/docker-compose.yml)。

```yaml
services:
  open-notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    container_name: open-notebook
    environment:
      - API_URL=https://notebook.example.com
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=${OPEN_NOTEBOOK_ENCRYPTION_KEY}
      - OPEN_NOTEBOOK_PASSWORD=${OPEN_NOTEBOOK_PASSWORD}
    volumes:
      - ./notebook_data:/app/data
    # Only expose to localhost (nginx handles public access)
    ports:
      - "127.0.0.1:8502:8502"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - open-notebook
    restart: unless-stopped
```

---

## 完整 Nginx 配置

```nginx
events {
    worker_connections 1024;
}

http {
    upstream notebook {
        server open-notebook:8502;
    }

    # HTTP redirect
    server {
        listen 80;
        server_name notebook.example.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name notebook.example.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Allow file uploads up to 100MB
        client_max_body_size 100M;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Proxy settings
        location / {
            proxy_pass http://notebook;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_cache_bypass $http_upgrade;

            # Timeouts for long-running operations (transformations, podcasts, etc.)
            # 600s matches the frontend timeout for slow LLM operations
            proxy_read_timeout 600s;
            proxy_connect_timeout 60s;
            proxy_send_timeout 600s;
        }
    }
}
```

---

## 直接 API 访问（可选）

若外部脚本或集成需要直接访问 API，可将 `/api/*` 直接路由：

```nginx
# Direct API access (for external integrations)
location /api/ {
    proxy_pass http://open-notebook:5055/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Frontend (handles all other traffic)
location / {
    proxy_pass http://open-notebook:8502;
    # ... same headers as above
}
```

**说明**：仅在外部 API 集成场景下需要此配置。浏览器流量使用单端口部署即可正常工作。

---

## 高级场景

### 远程服务器访问（局域网/VPS）

从网络中另一台机器访问 Open Notebook：

**步骤 1：获取服务器 IP**
```bash
# On the server running Open Notebook:
hostname -I
# or
ifconfig | grep "inet "
# Note the IP (e.g., 192.168.1.100)
```

**步骤 2：配置 API_URL**
```bash
# In docker-compose.yml or .env:
API_URL=http://192.168.1.100:5055
```

**步骤 3：暴露端口**
```yaml
# Add to your docker-compose.yml (requires surrealdb service, see installation guide)
services:
  open-notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    environment:
      - API_URL=http://192.168.1.100:5055
    ports:
      - "8502:8502"
      - "5055:5055"
```

**步骤 4：从客户端机器访问**
```bash
# In browser on other machine:
http://192.168.1.100:8502
```

**故障排查**：
- 检查防火墙：`sudo ufw allow 8502 && sudo ufw allow 5055`
- 验证连通性：在客户端执行 `ping 192.168.1.100`
- 测试端口：在客户端执行 `telnet 192.168.1.100 8502`

---

### API 使用独立子域名

将 API 与前端分别部署在不同子域名：

**docker-compose.yml：**
```yaml
# Add to your docker-compose.yml (requires surrealdb service, see installation guide)
services:
  open-notebook:
    image: lfnovo/open_notebook:v1-latest
    pull_policy: always
    environment:
      - API_URL=https://api.notebook.example.com
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=${OPEN_NOTEBOOK_ENCRYPTION_KEY}
    # Don't expose ports (nginx handles routing)
```

**nginx.conf：**
```nginx
# Frontend server
server {
    listen 443 ssl http2;
    server_name notebook.example.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
        proxy_pass http://open-notebook:8502;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}

# API server (separate subdomain)
server {
    listen 443 ssl http2;
    server_name api.notebook.example.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
        proxy_pass http://open-notebook:5055;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**适用场景**：独立 DNS 记录、差异化速率限制，或隔离的 API 访问控制。

---

### 多容器部署（高级）

前端与 API 分属不同容器的复杂部署：

**docker-compose.yml：**
```yaml
services:
  frontend:
    image: lfnovo/open_notebook_frontend:v1-latest
    pull_policy: always
    environment:
      - API_URL=https://notebook.example.com
    ports:
      - "8502:8502"

  api:
    image: lfnovo/open_notebook_api:v1-latest
    pull_policy: always
    environment:
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=${OPEN_NOTEBOOK_ENCRYPTION_KEY}
    ports:
      - "5055:5055"
    depends_on:
      - surrealdb

  surrealdb:
    image: surrealdb/surrealdb:latest
    command: start --log trace --user root --pass root file:/mydata/database.db
    ports:
      - "8000:8000"
    volumes:
      - ./surreal_data:/mydata
```

**nginx.conf：**
```nginx
http {
    upstream frontend {
        server frontend:8502;
    }

    upstream api {
        server api:5055;
    }

    server {
        listen 443 ssl http2;
        server_name notebook.example.com;

        # API routes
        location /api/ {
            proxy_pass http://api/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend (catch-all)
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

**说明**：大多数用户应使用 [Docker Compose](../1-INSTALLATION/docker-compose.zh.md) 方式（`v1-latest`）。仅在需要自定义扩缩容或隔离时，才需采用多容器加独立 nginx 的方案。

---

## SSL 证书

### 使用 Certbot 的 Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d notebook.example.com

# Auto-renewal (usually configured automatically)
sudo certbot renew --dry-run
```

### 使用 Caddy 的 Let's Encrypt

Caddy 会自动处理 SSL，无需额外配置。

### 自签名证书（仅用于开发）

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem \
  -out ssl/fullchain.pem \
  -subj "/CN=localhost"
```

---

## 故障排查

### “Unable to connect to server”（无法连接到服务器）

1. **检查是否已设置 API_URL**：
   ```bash
   docker exec open-notebook env | grep API_URL
   ```

2. **验证反向代理能否访问容器**：
   ```bash
   curl -I http://localhost:8502
   ```

3. **检查浏览器控制台**（F12）：
   - 查看连接错误
   - 确认尝试访问的 URL

### 混合内容（Mixed Content）错误

前端使用 HTTPS 但尝试访问 HTTP API：

```bash
# Ensure API_URL uses https://
API_URL=https://notebook.example.com  # Not http://
```

### WebSocket 问题

确保代理支持 WebSocket 升级：

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
```

### 502 Bad Gateway

1. 检查容器是否运行：`docker ps`
2. 查看容器日志：`docker logs open-notebook`
3. 确认 nginx 能访问容器（同一网络）

### 超时错误

**症状：**
- `socket hang up` 或 `ECONNRESET` 错误
- `Timeout after 30000ms` 错误
- 操作在恰好 30 秒后失败

**原因：** 反向代理默认超时（常为 30 秒）短于 Open Notebook 部分操作的耗时。

**各代理的解决方案：**

**Nginx：**
```nginx
proxy_read_timeout 600s;
proxy_send_timeout 600s;
```

**Caddy：**
```caddy
reverse_proxy open-notebook:8502 {
    transport http {
        read_timeout 600s
        write_timeout 600s
    }
}
```

**Traefik（静态配置）：**
```yaml
serversTransport:
  forwardingTimeouts:
    responseHeaderTimeout: 600s
```

**应用层超时：**

配置代理后仍出现超时，可调整应用层超时：

```bash
# In .env file:
API_CLIENT_TIMEOUT=600      # API client timeout (default: 300s)
ESPERANTO_LLM_TIMEOUT=180   # LLM inference timeout (default: 60s)
```

更多超时选项请参阅[高级配置](advanced.zh.md)。

---

### 如何调试配置问题

**步骤 1：检查浏览器控制台**（F12 → Console 标签页）
```
Look for messages starting with 🔧 [Config]
These show the configuration detection process
You'll see which API URL is being used
```

**正常输出示例：**
```
✅ [Config] Runtime API URL from server: https://your-domain.com
```

**异常输出示例：**
```
❌ [Config] Failed to fetch runtime config
⚠️  [Config] Using auto-detected URL: http://localhost:5055
```

**步骤 2：直接测试 API**
```bash
# Should return JSON config
curl https://your-domain.com/api/config

# Expected output:
{"status":"ok","credentials_configured":true,...}
```

**步骤 3：检查 Docker 日志**
```bash
docker logs open-notebook

# Look for:
# - Frontend startup: "▲ Next.js ready on http://0.0.0.0:8502"
# - API startup: "INFO:     Uvicorn running on http://0.0.0.0:5055"
# - Connection errors or CORS issues
```

**步骤 4：验证环境变量**
```bash
docker exec open-notebook env | grep API_URL

# Should show:
# API_URL=https://your-domain.com
```

---

### 前端在 URL 中追加 `:5055`（版本 ≤ 1.0.10）

**症状**（仅旧版本）：
- 已设置 `API_URL=https://your-domain.com`
- 浏览器控制台显示："Attempted URL: https://your-domain.com:5055/api/config"
- CORS 错误，状态码为 "(null)"

**根本原因：**
在 ≤ 1.0.10 版本中，前端配置端点位于 `/api/runtime-config`，会被将所有 `/api/*` 路由到后端的反向代理拦截，导致前端无法读取 `API_URL` 环境变量。

**解决方案：**
升级至 1.0.11 或更高版本。配置端点已移至 `/config`，避免与 `/api/*` 路由冲突。

**验证：**
检查浏览器控制台（F12）——应看到：`✅ [Config] Runtime API URL from server: https://your-domain.com`

**若无法升级**，请显式配置 `/config` 路由：
```nginx
# Only needed for versions ≤ 1.0.10
location = /config {
    proxy_pass http://open-notebook:8502;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

### 文件上传错误（413 Payload Too Large）

**症状：**
```
CORS header 'Access-Control-Allow-Origin' missing. Status code: 413.
Error creating source. Please try again.
```

**根本原因：**
上传文件时，反向代理可能因请求体大小限制在请求到达应用之前即拒绝请求。由于错误发生在代理层，响应中不会包含 CORS 头。

**版本要求：**
- 上传大于 10MB 的文件需要 **Open Notebook v1.3.2+**
- 使用 Next.js 16+，支持 `proxyClientMaxBodySize` 配置项
- 查看版本：设置 → 关于（设置页底部）

**解决方案：**

1. **Nginx - 增大请求体大小限制**：
   ```nginx
   server {
       # Allow larger file uploads (default is 1MB)
       client_max_body_size 100M;

       # Add CORS headers to error responses
       error_page 413 = @cors_error_413;

       location @cors_error_413 {
           add_header 'Access-Control-Allow-Origin' '*' always;
           add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
           add_header 'Access-Control-Allow-Headers' '*' always;
           return 413 '{"detail": "File too large. Maximum size is 100MB."}';
       }

       location / {
           # ... your existing proxy configuration
       }
   }
   ```

2. **Traefik - 增大缓冲区**：
   ```yaml
   # In your traefik configuration
   http:
     middlewares:
       large-body:
         buffering:
           maxRequestBodyBytes: 104857600  # 100MB
   ```

   将中间件应用到路由：
   ```yaml
   labels:
     - "traefik.http.routers.notebook.middlewares=large-body"
   ```

3. **Kubernetes Ingress (nginx-ingress)**：
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: open-notebook
     annotations:
       nginx.ingress.kubernetes.io/proxy-body-size: "100m"
       # Add CORS headers for error responses
       nginx.ingress.kubernetes.io/configuration-snippet: |
         more_set_headers "Access-Control-Allow-Origin: *";
   ```

4. **Caddy**：
   ```caddy
   notebook.example.com {
       request_body {
           max_size 100MB
       }
       reverse_proxy open-notebook:8502 {
           transport http {
               read_timeout 600s
               write_timeout 600s
           }
       }
   }
   ```

**说明：** Open Notebook API 会在错误响应中包含 CORS 头，但这仅对到达应用层的错误生效。代理层错误（如 nginx 返回的 413）需在代理层配置。

---

### CORS 错误

**症状：**
```
Access-Control-Allow-Origin header is missing
Cross-Origin Request Blocked
Response to preflight request doesn't pass access control check
```

**可能原因：**

1. **缺少代理请求头**：
   ```nginx
   # Make sure these are set:
   proxy_set_header X-Forwarded-Proto $scheme;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header Host $host;
   ```

2. **API_URL 协议不匹配**：
   ```bash
   # Frontend is HTTPS, but API_URL is HTTP:
   API_URL=http://notebook.example.com  # ❌ Wrong
   API_URL=https://notebook.example.com # ✅ Correct
   ```

3. **反向代理未正确转发 `/api/*`**：
   ```nginx
   # Make sure this works:
   location /api/ {
       proxy_pass http://open-notebook:5055/api/;  # Note the trailing slash!
   }
   ```

---

### 缺少 Authorization 头

**症状：**
```json
{"detail": "Missing authorization header"}
```

出现此情况时：
- 已设置 `OPEN_NOTEBOOK_PASSWORD` 启用身份验证
- 在未先登录的情况下直接访问 `/api/config`

**解决方案：**
此为**预期行为**。前端会自动处理身份验证。请：
1. 访问前端 URL（不要直接访问 `/api/`）
2. 通过 UI 登录
3. 前端会为所有 API 调用自动附加 Authorization 头

**API 集成：** 在 Authorization 头中包含密码：
```bash
curl -H "Authorization: Bearer your-password-here" \
  https://your-domain.com/api/config
```

---

### SSL/TLS 证书错误

**症状：**
- 浏览器显示“您的连接不是私密连接”
- 证书警告
- 混合内容错误

**解决方案：**

1. **使用 Let's Encrypt**（推荐）：
   ```bash
   sudo certbot --nginx -d notebook.example.com
   ```

2. **检查 nginx 中的证书路径**：
   ```nginx
   ssl_certificate /etc/nginx/ssl/fullchain.pem;      # Full chain
   ssl_certificate_key /etc/nginx/ssl/privkey.pem;    # Private key
   ```

3. **验证证书有效性**：
   ```bash
   openssl x509 -in /etc/nginx/ssl/fullchain.pem -text -noout
   ```

4. **开发环境**可使用自签名证书（不可用于生产）：
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ssl/privkey.pem -out ssl/fullchain.pem \
     -subj "/CN=localhost"
   ```

---

## 最佳实践

1. **生产环境始终使用 HTTPS**
2. **使用反向代理时显式设置 API_URL**，避免自动检测问题
3. **绑定到 localhost**（`127.0.0.1:8502`），由代理处理公网访问，提升安全性
4. **启用安全响应头**（HSTS、X-Frame-Options、X-Content-Type-Options、X-XSS-Protection）
5. **配置 Let's Encrypt 证书续期**（使用 certbot 时通常自动完成）
6. **确保反向代理容器可访问 5055 与 8502 端口**（使用 Docker 网络）
7. **使用环境文件**（`.env` 或 `docker.env`）安全管理配置
8. **上线前测试配置**：
   - 检查浏览器控制台中的配置消息
   - 测试 API：`curl https://your-domain.com/api/config`
   - 验证身份验证是否正常
   - 测试长时间运行的操作（播客生成）
9. **定期查看日志**：`docker logs open-notebook`
10. **不要在 API_URL 中包含 `/api`**——系统会自动添加

---

## 旧版配置（v1.1 之前）

若运行 Open Notebook **1.0.x 或更早版本**，可能需要使用旧版双端口配置，在反向代理中显式将 `/api/*` 路由至 5055 端口。

**检查版本：**
```bash
docker exec open-notebook cat /app/package.json | grep version
```

**若版本 < 1.1.0**，可能需要：
- 在反向代理中显式将 `/api/*` 路由至 5055 端口
- 对于 ≤ 1.0.10 版本，显式路由 `/config` 端点
- 参阅上文“前端在 URL 中追加 `:5055`”故障排查章节

**建议：** 升级至 v1.1+ 以获得简化配置与更好性能。

---

## 相关文档

- **[安全配置](security.zh.md)** - 密码保护与加固
- **[高级配置](advanced.zh.md)** - 端口、超时与 SSL 设置
- **[故障排查](../6-TROUBLESHOOTING/connection-issues.zh.md)** - 连接问题
- **[Docker 部署](../1-INSTALLATION/docker-compose.zh.md)** - 完整部署指南

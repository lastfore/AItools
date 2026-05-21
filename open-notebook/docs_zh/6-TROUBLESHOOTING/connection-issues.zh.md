# 连接问题 - 网络与 API

前端无法访问 API 或服务间无法通信。

---

## 「无法连接服务器」（最常见） [原文: Cannot connect to server]

**表现：**
- 浏览器显示错误页
- 「无法访问 API」[原文: Unable to reach API]
- 「无法连接服务器」[原文: Cannot connect to server]
- UI 可加载但无法创建笔记本

**诊断：**

```bash
# Check if API is running
docker ps | grep api
# Should see "api" service running

# Check if API is responding
curl http://localhost:5055/health
# Should show: {"status":"ok"}

# Check if frontend is running
docker ps | grep frontend
# Should see "frontend" or React service running
```

**解决方案：**

### 方案 1：API 未运行
```bash
# Start API
docker compose up api -d

# Wait 5 seconds
sleep 5

# Verify it's running
docker compose logs api | tail -20
```

### 方案 2：端口未暴露
```bash
# Check docker-compose.yml has port mapping:
# api:
#   ports:
#     - "5055:5055"

# If missing, add it and restart:
docker compose down
docker compose up -d
```

### 方案 3：API_URL 不匹配
```bash
# In .env, check API_URL:
cat .env | grep API_URL

# Should match your frontend URL:
# Frontend: http://localhost:8502
# API_URL: http://localhost:5055

# If wrong, fix it:
# API_URL=http://localhost:5055
# Then restart:
docker compose restart frontend
```

### 方案 4：防火墙拦截
```bash
# Verify port 5055 is accessible
netstat -tlnp | grep 5055
# Should show port listening

# If on different machine, try:
# Instead of localhost, use your IP:
API_URL=http://192.168.1.100:5055
```

### 方案 5：服务未启动
```bash
# Restart everything
docker compose restart

# Wait 10 seconds
sleep 10

# Check all services
docker compose ps
# All should show "Up"
```

---

## 连接被拒绝 [原文: Connection refused]

**表现：**
```
Connection refused
ECONNREFUSED
Error: socket hang up
```

**诊断：**
- API 端口（5055）未开放
- API 已崩溃
- IP/主机名错误

**解决方案：**

```bash
# Step 1: Check if API is running
docker ps | grep api

# Step 2: Check if port is listening
lsof -i :5055
# or
netstat -tlnp | grep 5055

# Step 3: Check API logs
docker compose logs api | tail -30
# Look for errors

# Step 4: Restart API
docker compose restart api
docker compose logs api | grep -i "error"
```

---

## 超时 / 连接慢

**表现：**
- 页面加载慢
- 请求超时
- 「网关超时」[原文: Gateway timeout] 错误

**原因：**
- API 过载
- 网络慢
- 反向代理问题

**解决方案：**

### 检查 API 性能
```bash
# See CPU/memory usage
docker stats

# Check logs for slow operations
docker compose logs api | grep "slow\|timeout"
```

### 降低负载
```bash
# In .env:
SURREAL_COMMANDS_MAX_TASKS=2
API_CLIENT_TIMEOUT=600

# Restart
docker compose restart
```

### 检查网络
```bash
# Test latency
ping localhost

# Test API directly
time curl http://localhost:5055/health

# Should be < 100ms
```

---

## 502 错误网关（反向代理） [原文: 502 Bad Gateway]

**表现：**
```
502 Bad Gateway
The server is temporarily unable to service the request
```

**原因：** 反向代理无法访问 API

**解决方案：**

### 确认后端在运行
```bash
# From the reverse proxy server
curl http://localhost:5055/health

# Should work
```

### 检查反向代理配置
```nginx
# Nginx example (correct):
location /api {
    proxy_pass http://localhost:5055/api;
    proxy_http_version 1.1;
}

# Common mistake (wrong):
location /api {
    proxy_pass http://localhost:5055;  # Missing /api
}
```

### 为 HTTPS 设置 API_URL
```bash
# In .env:
API_URL=https://yourdomain.com

# Restart
docker compose restart
```

---

## 间歇性断开

**表现：**
- 时好时坏
- 偶发「无法连接」错误
- 先正常后失败

**原因：** 瞬时网络问题或数据库冲突

**解决方案：**

### 启用重试逻辑
```bash
# In .env:
SURREAL_COMMANDS_RETRY_ENABLED=true
SURREAL_COMMANDS_RETRY_MAX_ATTEMPTS=5
SURREAL_COMMANDS_RETRY_WAIT_STRATEGY=exponential_jitter

# Restart
docker compose restart
```

### 降低并发
```bash
# In .env:
SURREAL_COMMANDS_MAX_TASKS=2

# Restart
docker compose restart
```

### 检查网络稳定性
```bash
# Monitor connection
ping google.com

# Long-running test
ping -c 100 google.com | grep "packet loss"
# Should be 0% loss
```

---

## 其他机器 / 远程访问

**需要从另一台电脑访问 Open Notebook**

**解决方案：**

### 步骤 1：获取本机 IP
```bash
# On the server running Open Notebook:
ifconfig | grep "inet "
# or
hostname -I
# Note the IP (e.g., 192.168.1.100)
```

### 步骤 2：更新 API_URL
```bash
# In .env:
API_URL=http://192.168.1.100:5055

# Restart
docker compose restart
```

### 步骤 3：从其他机器访问
```bash
# In browser on other machine:
http://192.168.1.100:8502
# (or your server IP)
```

### 步骤 4：确认端口已暴露
```bash
# On server:
docker compose ps

# Should show port mapping:
# 0.0.0.0:8502->8502/tcp
# 0.0.0.0:5055->5055/tcp
```

### 若仍无法访问
```bash
# Check firewall on server
sudo ufw status
# May need to open ports:
sudo ufw allow 8502
sudo ufw allow 5055

# Check on different machine:
telnet 192.168.1.100 5055
# Should connect
```

---

## CORS 错误（浏览器控制台）

**表现：**
```
Cross-Origin Request Blocked
Access-Control-Allow-Origin
```

**在浏览器控制台（F12）：**
```
CORS policy: Response to preflight request doesn't pass access control check
```

**原因：** 前端与 API URL 不一致

**解决方案：**

```bash
# Check browser console error for what URLs are being used
# The error shows:
# - Requesting from: http://localhost:8502
# - Trying to reach: http://localhost:5055

# Make sure API_URL matches:
API_URL=http://localhost:5055

# And protocol matches (http/https)
# Restart
docker compose restart frontend
```

---

## 连接测试

**完整诊断：**

```bash
# 1. Services running?
docker compose ps
# All should show "Up"

# 2. Ports listening?
netstat -tlnp | grep -E "8502|5055|8000"

# 3. API responding?
curl http://localhost:5055/health

# 4. Frontend accessible?
curl http://localhost:8502 | head

# 5. Network OK?
ping google.com

# 6. No firewall?
sudo ufw status | grep -E "5055|8502|8000"
```

---

## 远程访问清单

- [ ] 已记录服务器 IP（如 192.168.1.100）
- [ ] docker-compose 中已暴露端口 8502、5055、8000
- [ ] API_URL 已设为服务器 IP
- [ ] 防火墙允许端口 8502、5055、8000
- [ ] 客户端可 ping 通服务器 IP
- [ ] 所有服务在运行（docker compose ps）
- [ ] 客户端可 curl API（curl http://IP:5055/health）

---

## SSL 证书错误

**表现：**
```
400>[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed
Connection error when using HTTPS endpoints
Works with HTTP but fails with HTTPS
```

**原因：** 自签名证书未被 Python SSL 验证信任

**解决方案：**

### 方案 1：使用自定义 CA 包（推荐）
```bash
# In .env:
ESPERANTO_SSL_CA_BUNDLE=/path/to/your/ca-bundle.pem

# For Docker, mount the certificate:
# In docker-compose.yml:
volumes:
  - /path/to/your/ca-bundle.pem:/certs/ca-bundle.pem:ro
environment:
  - ESPERANTO_SSL_CA_BUNDLE=/certs/ca-bundle.pem
```

### 方案 2：禁用 SSL 验证（仅开发环境）
```bash
# WARNING: Only use in trusted development environments
# In .env:
ESPERANTO_SSL_VERIFY=false
```

### 方案 3：改用 HTTP
若服务在可信本地网络，可使用 HTTP：
```
Change the base URL in your credential (Settings → API Keys) from https:// to http://
Example: http://localhost:1234/v1
```

> **安全说明：** 禁用 SSL 验证会使您面临中间人攻击风险。请优先使用自定义 CA 包，或在可信网络上使用 HTTP。

---

## 仍有问题？

- 查看 [快速修复](quick-fixes.zh.md)
- 查看 [常见问题](faq.zh.md)
- 查看日志：`docker compose logs`
- 尝试重启：`docker compose restart`
- 检查防火墙：`sudo ufw status`
- 在 [Discord](https://discord.gg/37XJPXfz2w) 寻求帮助

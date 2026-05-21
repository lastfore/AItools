# 数据库 - SurrealDB 配置

Open Notebook 使用 SurrealDB 作为数据库。

---

## 默认配置

只要环境变量配置正确，Open Notebook 应能与 SurrealDB 开箱即用。


### 数据库与 Open Notebook 运行在同一 docker compose 中（推荐）

上述示例适用于将 SurrealDB 作为独立 Docker 容器运行的情况，即[此处](../1-INSTALLATION/docker-compose.zh.md)描述的方法（也是我们推荐的方式）。

```env
SURREAL_URL="ws://surrealdb:8000/rpc"
SURREAL_USER="root"
SURREAL_PASSWORD="root"
SURREAL_NAMESPACE="open_notebook"
SURREAL_DATABASE="open_notebook"
```

### 数据库在宿主机运行，Open Notebook 在 Docker 中运行

若 ON 在 Docker 中运行而 SurrealDB 在宿主机上，需要指向宿主机。

```env
SURREAL_URL="ws://your-machine-ip:8000/rpc" #or host.docker.internal
SURREAL_USER="root"
SURREAL_PASSWORD="root"
SURREAL_NAMESPACE="open_notebook"
SURREAL_DATABASE="open_notebook"
```

### Open Notebook 与 Surreal 运行在同一台机器

若两个服务均在本地运行，或你使用已弃用的[单容器设置](../1-INSTALLATION/single-container.zh.md)

```env
SURREAL_URL="ws://localhost:8000/rpc"
SURREAL_USER="root"
SURREAL_PASSWORD="root"
SURREAL_NAMESPACE="open_notebook"
SURREAL_DATABASE="open_notebook"
```

## 多个数据库

一个 SurrealDB 实例可有多个命名空间，一个实例也可有多个数据库。因此，若要为不同用户部署多个 Open Notebook，无需部署多个数据库实例。

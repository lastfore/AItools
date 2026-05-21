# 代码规范

本文档说明 Open Notebook 贡献的编码标准与最佳实践。所有代码应遵循这些指南，以确保一致性、可读性与可维护性。

## Python 规范

### 代码格式

我们遵循 **PEP 8**，并采用以下具体约定：

- 使用 **Ruff** 进行 lint 与格式化
- 最大行宽：**88 个字符**
- 字符串使用 **双引号**
- 多行结构使用 **尾随逗号**

### 类型提示

函数参数与返回值始终使用类型提示：

```python
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

async def process_content(
    content: str,
    options: Optional[Dict[str, Any]] = None
) -> ProcessedContent:
    """Process content with optional configuration."""
    # Implementation
```

### Async/Await 模式

在整个代码库中一致使用 async/await：

```python
# Good
async def fetch_data(url: str) -> Dict[str, Any]:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

# Bad - mixing sync and async
def fetch_data(url: str) -> Dict[str, Any]:
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(async_fetch(url))
```

### 错误处理

使用结构化错误处理与自定义异常：

```python
from open_notebook.exceptions import DatabaseOperationError, InvalidInputError

async def create_notebook(name: str, description: str) -> Notebook:
    """Create a new notebook with validation."""
    if not name.strip():
        raise InvalidInputError("Notebook name cannot be empty")

    try:
        notebook = Notebook(name=name, description=description)
        await notebook.save()
        return notebook
    except Exception as e:
        raise DatabaseOperationError(f"Failed to create notebook: {str(e)}")
```

### 文档（Google 风格 Docstring）

所有函数、类与模块使用 Google 风格 docstring：

```python
async def vector_search(
    query: str,
    limit: int = 10,
    minimum_score: float = 0.2
) -> List[SearchResult]:
    """Perform vector search across embedded content.

    Args:
        query: Search query string
        limit: Maximum number of results to return
        minimum_score: Minimum similarity score for results

    Returns:
        List of search results sorted by relevance score

    Raises:
        InvalidInputError: If query is empty or limit is invalid
        DatabaseOperationError: If search operation fails
    """
    # Implementation
```

#### 模块 Docstring
```python
"""
Notebook domain model and operations.

This module contains the core Notebook class and related operations for
managing research notebooks within the Open Notebook system.
"""
```

#### 类 Docstring
```python
class Notebook(BaseModel):
    """A research notebook containing sources, notes, and chat sessions.

    Notebooks are the primary organizational unit in Open Notebook, allowing
    users to group related research materials and maintain separate contexts
    for different projects.

    Attributes:
        name: The notebook's display name
        description: Optional description of the notebook's purpose
        archived: Whether the notebook is archived (default: False)
        created: Timestamp of creation
        updated: Timestamp of last update
    """
```

#### 函数 Docstring
```python
async def create_notebook(
    name: str,
    description: str = "",
    user_id: Optional[str] = None
) -> Notebook:
    """Create a new notebook with validation.

    Args:
        name: The notebook name (required, non-empty)
        description: Optional notebook description
        user_id: Optional user ID for multi-user deployments

    Returns:
        The created notebook instance

    Raises:
        InvalidInputError: If name is empty or invalid
        DatabaseOperationError: If creation fails

    Example:
        ```python
        notebook = await create_notebook(
            name="AI Research",
            description="Research on AI applications"
        )
        ```
    """
```

## FastAPI 规范

### 路由组织

按领域组织端点：

```python
# api/routers/notebooks.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

router = APIRouter()

@router.get("/notebooks", response_model=List[NotebookResponse])
async def get_notebooks(
    archived: Optional[bool] = Query(None, description="Filter by archived status"),
    order_by: str = Query("updated desc", description="Order by field and direction"),
):
    """Get all notebooks with optional filtering and ordering."""
    # Implementation
```

### 请求/响应模型

使用 Pydantic 模型进行校验：

```python
from pydantic import BaseModel, Field
from typing import Optional

class NotebookCreate(BaseModel):
    name: str = Field(..., description="Name of the notebook", min_length=1)
    description: str = Field(default="", description="Description of the notebook")

class NotebookResponse(BaseModel):
    id: str
    name: str
    description: str
    archived: bool
    created: str
    updated: str
```

### 错误处理

使用一致的错误响应：

```python
from fastapi import HTTPException
from loguru import logger

try:
    result = await some_operation()
    return result
except InvalidInputError as e:
    raise HTTPException(status_code=400, detail=str(e))
except DatabaseOperationError as e:
    logger.error(f"Database error: {str(e)}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

### API 文档

使用 FastAPI 自动文档功能：

```python
@router.post(
    "/notebooks",
    response_model=NotebookResponse,
    summary="Create a new notebook",
    description="Create a new notebook with the specified name and description.",
    responses={
        201: {"description": "Notebook created successfully"},
        400: {"description": "Invalid input data"},
        500: {"description": "Internal server error"}
    }
)
async def create_notebook(notebook: NotebookCreate):
    """Create a new notebook."""
    # Implementation
```

## 数据库规范

### SurrealDB 模式

一致使用仓储（repository）模式：

```python
from open_notebook.database.repository import repo_create, repo_query, repo_update

# Create records
async def create_notebook(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new notebook record."""
    return await repo_create("notebook", data)

# Query with parameters
async def find_notebooks_by_user(user_id: str) -> List[Dict[str, Any]]:
    """Find notebooks for a specific user."""
    return await repo_query(
        "SELECT * FROM notebook WHERE user_id = $user_id",
        {"user_id": user_id}
    )

# Update records
async def update_notebook(notebook_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Update a notebook record."""
    return await repo_update("notebook", notebook_id, data)
```

### Schema 管理

通过迁移管理 schema 变更：

```surrealql
-- migrations/8.surrealql
DEFINE TABLE IF NOT EXISTS new_feature SCHEMAFULL;
DEFINE FIELD IF NOT EXISTS name ON TABLE new_feature TYPE string;
DEFINE FIELD IF NOT EXISTS description ON TABLE new_feature TYPE option<string>;
DEFINE FIELD IF NOT EXISTS created ON TABLE new_feature TYPE datetime DEFAULT time::now();
DEFINE FIELD IF NOT EXISTS updated ON TABLE new_feature TYPE datetime DEFAULT time::now();
```

## TypeScript 规范

### 基本指南

遵循 TypeScript 最佳实践：

- 在 `tsconfig.json` 中启用严格模式
- 为所有变量与函数使用恰当的类型注解
- 除非绝对必要，避免使用 `any`
- 对象形状使用 `interface`，联合类型等使用 `type`

### 组件结构

- 使用带 hooks 的函数组件
- 保持组件聚焦、单一职责
- 将可复用逻辑提取到自定义 hooks
- 为 props 使用恰当的 TypeScript 类型

### 错误处理

- 显式处理错误
- 提供有意义的错误消息
- 适当记录错误
- 不要静默吞掉错误

## 代码质量工具

我们使用以下工具维护代码质量：

- **Ruff**：Lint 与代码格式化
  - 运行：`uv run ruff check . --fix`
  - 格式化：`uv run ruff format .`

- **MyPy**：静态类型检查
  - 运行：`uv run python -m mypy .`

- **Pytest**：测试框架
  - 运行：`uv run pytest`

## 常见模式

### 异步数据库操作

```python
async def get_notebook_with_sources(notebook_id: str) -> Notebook:
    """Retrieve notebook with all related sources."""
    notebook_data = await repo_query(
        "SELECT * FROM notebook WHERE id = $id",
        {"id": notebook_id}
    )
    if not notebook_data:
        raise InvalidInputError(f"Notebook {notebook_id} not found")

    sources_data = await repo_query(
        "SELECT * FROM source WHERE notebook_id = $notebook_id",
        {"notebook_id": notebook_id}
    )

    return Notebook(
        **notebook_data[0],
        sources=[Source(**s) for s in sources_data]
    )
```

### 模型校验

```python
from pydantic import BaseModel, validator

class NotebookInput(BaseModel):
    name: str
    description: str = ""

    @validator('name')
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
```

## 代码审查清单

提交代码审查前，请确认：

- [ ] 代码符合 PEP 8 / TypeScript 最佳实践
- [ ] 所有函数均有类型提示
- [ ] Docstring 完整且准确
- [ ] 错误处理恰当
- [ ] 已包含测试且通过
- [ ] 未遗留调试代码（console.log、print 等）
- [ ] 提交信息清晰且符合约定
- [ ] 必要时已更新文档

---

**另请参阅：**
- [测试指南](testing.zh.md) — 如何编写测试
- [贡献指南](contributing.zh.md) — 整体贡献工作流程

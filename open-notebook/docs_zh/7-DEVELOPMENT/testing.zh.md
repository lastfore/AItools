# 测试指南

本文档说明 Open Notebook 的测试编写指南。测试对保持代码质量与防止回归至关重要。

## 测试理念

### 应测试什么

聚焦最重要部分：

- **业务逻辑** — 核心领域模型及其操作
- **API 契约** — HTTP 端点行为与错误处理
- **关键工作流** — 用户依赖的端到端流程
- **数据持久化** — 数据库操作与数据完整性
- **错误条件** — 系统如何优雅处理失败

### 不应测试什么

勿在框架代码上浪费时间：

- 框架功能（FastAPI、React 等）
- 第三方库实现
- 无逻辑的简单 getter/setter
- 视图/展示层渲染（除非含业务逻辑）

## 测试结构

Python 测试统一使用带异步支持的 **pytest**：

```python
import pytest
from httpx import AsyncClient
from open_notebook.domain.notebook import Notebook

@pytest.mark.asyncio
async def test_create_notebook():
    """Test notebook creation."""
    notebook = Notebook(name="Test Notebook", description="Test description")
    await notebook.save()

    assert notebook.id is not None
    assert notebook.name == "Test Notebook"
    assert notebook.created is not None

@pytest.mark.asyncio
async def test_api_create_notebook():
    """Test notebook creation via API."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/notebooks",
            json={"name": "Test Notebook", "description": "Test description"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Notebook"
```

## 测试分类

### 1. 单元测试

隔离测试单个函数与方法：

```python
@pytest.mark.asyncio
async def test_notebook_validation():
    """Test that notebook name validation works."""
    with pytest.raises(InvalidInputError):
        Notebook(name="", description="test")

@pytest.mark.asyncio
async def test_notebook_archive():
    """Test notebook archiving."""
    notebook = Notebook(name="Test", description="")
    notebook.archive()
    assert notebook.archived is True
```

**位置**：`tests/unit/`

### 2. 集成测试

测试组件交互与数据库操作：

```python
@pytest.mark.asyncio
async def test_create_notebook_with_sources():
    """Test creating a notebook and adding sources."""
    notebook = await create_notebook(name="Research", description="")
    source = await add_source(notebook_id=notebook.id, url="https://example.com")

    retrieved = await get_notebook_with_sources(notebook.id)
    assert len(retrieved.sources) == 1
    assert retrieved.sources[0].id == source.id
```

**位置**：`tests/integration/`

### 3. API 测试

测试 HTTP 端点与错误响应：

```python
@pytest.mark.asyncio
async def test_get_notebooks_endpoint():
    """Test GET /notebooks endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/notebooks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

@pytest.mark.asyncio
async def test_create_notebook_validation():
    """Test that invalid input is rejected."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/notebooks",
            json={"name": "", "description": ""}
        )
        assert response.status_code == 400
```

**位置**：`tests/api/`

### 4. 数据库测试

测试数据持久化与查询正确性：

```python
@pytest.mark.asyncio
async def test_save_and_retrieve_notebook():
    """Test saving and retrieving a notebook from database."""
    notebook = Notebook(name="Test", description="desc")
    await notebook.save()

    retrieved = await Notebook.get(notebook.id)
    assert retrieved.name == "Test"
    assert retrieved.description == "desc"

@pytest.mark.asyncio
async def test_query_by_criteria():
    """Test querying notebooks by criteria."""
    await create_notebook("Active", "")
    await create_notebook("Archived", "")

    active = await repo_query(
        "SELECT * FROM notebook WHERE archived = false"
    )
    assert len(active) >= 1
```

**位置**：`tests/database/`

## 运行测试

### 运行全部测试

```bash
uv run pytest
```

### 运行指定测试文件

```bash
uv run pytest tests/test_notebooks.py
```

### 运行指定测试函数

```bash
uv run pytest tests/test_notebooks.py::test_create_notebook
```

### 带覆盖率报告运行

```bash
uv run pytest --cov=open_notebook
```

### 仅运行单元测试

```bash
uv run pytest tests/unit/
```

### 仅运行集成测试

```bash
uv run pytest tests/integration/
```

### 详细模式运行

```bash
uv run pytest -v
```

### 显示输出运行

```bash
uv run pytest -s
```

## 测试 Fixtures

使用 pytest fixtures 进行通用设置与清理：

```python
import pytest

@pytest.fixture
async def test_notebook():
    """Create a test notebook."""
    notebook = Notebook(name="Test Notebook", description="Test description")
    await notebook.save()
    yield notebook
    await notebook.delete()

@pytest.fixture
async def api_client():
    """Create an API test client."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
async def test_notebook_with_sources(test_notebook):
    """Create a test notebook with sample sources."""
    source1 = Source(notebook_id=test_notebook.id, url="https://example.com")
    source2 = Source(notebook_id=test_notebook.id, url="https://example.org")
    await source1.save()
    await source2.save()

    test_notebook.sources = [source1, source2]
    yield test_notebook

    # Cleanup
    await source1.delete()
    await source2.delete()
```

## 最佳实践

### 1. 编写描述性测试名称

```python
# Good - clearly describes what is being tested
async def test_create_notebook_with_valid_name_succeeds():
    ...

# Bad - vague about what's being tested
async def test_notebook():
    ...
```

### 2. 使用 Docstring

```python
@pytest.mark.asyncio
async def test_vector_search_returns_sorted_results():
    """Test that vector search results are sorted by relevance score."""
    # Implementation
```

### 3. 测试边界情况

```python
@pytest.mark.asyncio
async def test_search_with_empty_query():
    """Test that empty query raises error."""
    with pytest.raises(InvalidInputError):
        await vector_search("")

@pytest.mark.asyncio
async def test_search_with_very_long_query():
    """Test that very long query is handled."""
    long_query = "x" * 10000
    results = await vector_search(long_query)
    assert isinstance(results, list)

@pytest.mark.asyncio
async def test_search_with_special_characters():
    """Test that special characters are handled."""
    results = await vector_search("@#$%^&*()")
    assert isinstance(results, list)
```

### 4. 有效使用断言

```python
# Good - specific assertions
assert notebook.name == "Test"
assert len(notebook.sources) == 3
assert notebook.created is not None

# Less good - too broad
assert notebook is not None
assert notebook  # ambiguous what's being tested
```

### 5. 同时测试成功与失败场景

```python
@pytest.mark.asyncio
async def test_create_notebook_success():
    """Test successful notebook creation."""
    notebook = await create_notebook(name="Research", description="AI")
    assert notebook.id is not None
    assert notebook.name == "Research"

@pytest.mark.asyncio
async def test_create_notebook_empty_name_fails():
    """Test that empty name raises error."""
    with pytest.raises(InvalidInputError):
        await create_notebook(name="", description="")

@pytest.mark.asyncio
async def test_create_notebook_duplicate_fails():
    """Test that duplicate names are handled."""
    await create_notebook(name="Research", description="")
    with pytest.raises(DuplicateError):
        await create_notebook(name="Research", description="")
```

### 6. 保持测试独立

```python
# Good - test is self-contained
@pytest.mark.asyncio
async def test_archive_notebook():
    notebook = Notebook(name="Test", description="")
    await notebook.save()
    await notebook.archive()
    assert notebook.archived is True

# Bad - depends on another test's state
@pytest.mark.asyncio
async def test_archive_existing_notebook():
    # Assumes test_create_notebook ran first
    await notebook.archive()  # notebook undefined
```

### 7. 使用 Fixtures 复用设置

```python
# Instead of repeating setup:
@pytest.fixture
async def client_with_auth(api_client, mock_auth):
    """Client with authentication set up."""
    api_client.headers.update({"Authorization": f"Bearer {mock_auth.token}"})
    yield api_client

@pytest.mark.asyncio
async def test_protected_endpoint(client_with_auth):
    """Test protected endpoint."""
    response = await client_with_auth.get("/api/protected")
    assert response.status_code == 200
```

## 覆盖率目标

- 整体覆盖率目标 70% 以上
- 关键业务逻辑 90% 以上
- 不必追求 100% — 聚焦有意义的测试
- 使用 `--cov` 检查：`uv run pytest --cov=open_notebook`

## 异步测试模式

### 测试异步函数

```python
@pytest.mark.asyncio
async def test_async_operation():
    """Test async function."""
    result = await some_async_function()
    assert result is not None
```

### 测试并发操作

```python
@pytest.mark.asyncio
async def test_concurrent_notebook_creation():
    """Test creating multiple notebooks concurrently."""
    tasks = [
        create_notebook(f"Notebook {i}", "")
        for i in range(10)
    ]
    notebooks = await asyncio.gather(*tasks)
    assert len(notebooks) == 10
    assert all(n.id for n in notebooks)
```

## 常见测试错误

### 错误：「event loop is closed」[原文: event loop is closed]

解决方案：正确使用异步 fixture：
```python
@pytest.fixture
async def notebook():  # Use async fixture
    notebook = Notebook(name="Test", description="")
    await notebook.save()
    yield notebook
    await notebook.delete()
```

### 错误：「object is not awaitable」[原文: object is not awaitable]

解决方案：确保使用 await：
```python
# Wrong
result = create_notebook("Test", "")

# Right
result = await create_notebook("Test", "")
```

---

**另请参阅：**
- [代码规范](code-standards.zh.md) — 代码格式与风格
- [贡献指南](contributing.zh.md) — 整体贡献工作流

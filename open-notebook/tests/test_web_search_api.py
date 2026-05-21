"""API tests for POST /api/web-search."""

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from open_notebook.exceptions import ConfigurationError, InvalidInputError
from open_notebook.web_search.service import WebSearchServiceResult


@pytest.fixture
def client():
    from api.main import app

    return TestClient(app)


@patch("api.routers.web_search.run_web_search", new_callable=AsyncMock)
def test_web_search_configuration_error_422(mock_run, client):
    mock_run.side_effect = ConfigurationError("Internet web search is disabled.")
    r = client.post("/api/web-search", json={"query": "notebook lm"})
    assert r.status_code == 422
    assert "disabled" in r.json()["detail"].lower()


@patch("api.routers.web_search.run_web_search", new_callable=AsyncMock)
def test_web_search_invalid_input_400(mock_run, client):
    mock_run.side_effect = InvalidInputError("Search query must not be empty.")
    r = client.post("/api/web-search", json={"query": "   "})
    assert r.status_code == 400


@patch("api.routers.web_search.run_web_search", new_callable=AsyncMock)
def test_web_search_success(mock_run, client):
    mock_run.return_value = WebSearchServiceResult(
        query="notebook lm",
        results=[
            {
                "url": "https://example.com/a",
                "title": "A",
                "snippet": "body",
                "engine": "duckduckgo",
                "filtered_by": ["keyword_match"],
            }
        ],
        total_raw=2,
        total_after_rules=1,
        total_returned=1,
        llm_ranking_applied=False,
    )
    r = client.post(
        "/api/web-search",
        json={"query": "notebook lm", "max_results": 10, "safesearch": 1},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["query"] == "notebook lm"
    assert data["total_raw"] == 2
    assert data["total_returned"] == 1
    assert data["results"][0]["url"] == "https://example.com/a"

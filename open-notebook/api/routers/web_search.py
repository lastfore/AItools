"""HTTP routes for internet keyword search (SearXNG)."""

from fastapi import APIRouter

from api.models import WebSearchRequest, WebSearchResponse, WebSearchResultItem
from open_notebook.exceptions import (
    ConfigurationError,
    ExternalServiceError,
    InvalidInputError,
    NetworkError,
    OpenNotebookError,
)
from open_notebook.web_search.service import run_web_search

router = APIRouter()


@router.post("/web-search", response_model=WebSearchResponse)
async def web_search(request: WebSearchRequest) -> WebSearchResponse:
    """Search the public web via SearXNG; returns URLs to add as link sources."""
    try:
        raw = await run_web_search(
            query=request.query,
            language=request.language,
            categories=request.categories,
            time_range=request.time_range,
            max_results=request.max_results,
            safesearch=request.safesearch,
            use_llm_ranking=request.use_llm_ranking,
        )
        results = [
            WebSearchResultItem(
                url=r["url"],
                title=r.get("title") or "",
                snippet=r.get("snippet") or "",
                engine=r.get("engine") or "",
                score=r.get("score"),
                filtered_by=list(r.get("filtered_by") or []),
            )
            for r in raw.results
        ]
        return WebSearchResponse(
            query=raw.query,
            results=results,
            total_raw=raw.total_raw,
            total_after_rules=raw.total_after_rules,
            total_returned=raw.total_returned,
            llm_ranking_applied=raw.llm_ranking_applied,
        )
    except (ConfigurationError, InvalidInputError, NetworkError, ExternalServiceError):
        raise
    except Exception as e:
        raise OpenNotebookError(f"Web search failed: {e}") from e

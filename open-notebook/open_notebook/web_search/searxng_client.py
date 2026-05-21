"""HTTP client for SearXNG search API."""

from __future__ import annotations

from typing import Any, Dict, List
from urllib.parse import urlencode, urljoin

import httpx
from loguru import logger

from open_notebook.exceptions import ExternalServiceError, NetworkError


def _normalize_base(base: str) -> str:
    return base.rstrip("/")


async def searxng_search_json(
    *,
    base_url: str,
    query: str,
    timeout_seconds: float,
    language: str | None,
    categories: str | None,
    time_range: str | None,
    safesearch: int,
) -> Dict[str, Any]:
    """
    Call SearXNG GET /search?format=json&...

    Docs: https://docs.searxng.org/dev/search_api.html
    """
    root = _normalize_base(base_url)
    endpoint = urljoin(root + "/", "search")
    params: Dict[str, Any] = {
        "q": query,
        "format": "json",
        "safesearch": str(safesearch),
    }
    if language:
        params["language"] = language
    if categories:
        params["categories"] = categories
    if time_range:
        params["time_range"] = time_range

    url = f"{endpoint}?{urlencode(params)}"
    headers = {"User-Agent": "OpenNotebook/1.0"}

    try:
        async with httpx.AsyncClient(
            timeout=timeout_seconds, follow_redirects=True
        ) as client:
            response = await client.get(url, headers=headers)
    except httpx.TimeoutException as e:
        logger.warning("SearXNG timeout: {}", e)
        raise NetworkError(
            "SearXNG request timed out. Check SEARXNG_BASE_URL and SEARXNG_TIMEOUT_SECONDS."
        ) from e
    except httpx.ConnectError as e:
        logger.warning("SearXNG connection error: {}", e)
        raise NetworkError(
            "Cannot connect to SearXNG. Verify SEARXNG_BASE_URL and that the service is running."
        ) from e

    if response.status_code == 403:
        raise ExternalServiceError(
            "SearXNG returned 403. Enable JSON format in SearXNG settings.yml "
            "(search.formats must include json). See project searxng/settings.yml."
        )
    if response.status_code >= 400:
        raise ExternalServiceError(
            f"SearXNG error HTTP {response.status_code}: {response.text[:500]}"
        )

    try:
        return response.json()
    except ValueError as e:
        raise ExternalServiceError("SearXNG returned invalid JSON") from e


def parse_searxng_results(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract raw result dicts from SearXNG JSON."""
    results = payload.get("results")
    if not isinstance(results, list):
        return []
    out: List[Dict[str, Any]] = []
    for item in results:
        if isinstance(item, dict):
            out.append(item)
    return out

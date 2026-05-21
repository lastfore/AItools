"""Orchestrate SearXNG fetch, rule filters, and optional LLM ranking."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List

from loguru import logger

from open_notebook.exceptions import ConfigurationError, InvalidInputError
from open_notebook.web_search.config import load_web_search_config
from open_notebook.web_search.filters import apply_rule_filters, raw_hits_from_searx
from open_notebook.web_search.llm_ranker import rank_hits_with_llm
from open_notebook.web_search.searxng_client import parse_searxng_results, searxng_search_json


@dataclass
class WebSearchServiceResult:
    query: str
    results: List[Dict[str, Any]]
    total_raw: int
    total_after_rules: int
    total_returned: int
    llm_ranking_applied: bool


async def run_web_search(
    *,
    query: str,
    language: str | None,
    categories: str | None,
    time_range: str | None,
    max_results: int,
    safesearch: int,
    use_llm_ranking: bool,
) -> WebSearchServiceResult:
    cfg = load_web_search_config()
    if not cfg.enabled:
        raise ConfigurationError(
            "Internet web search is disabled. Set SEARXNG_ENABLED=true and SEARXNG_BASE_URL "
            "to your SearXNG instance. See examples/docker-compose-searxng.yml."
        )
    if not cfg.base_url:
        raise ConfigurationError(
            "SEARXNG_BASE_URL is not set. Point it to your SearXNG base URL, e.g. http://searxng:8080"
        )

    q = query.strip()
    if not q:
        raise InvalidInputError("Search query must not be empty.")

    cap = min(50, max(1, max_results))

    payload = await searxng_search_json(
        base_url=cfg.base_url,
        query=q,
        timeout_seconds=cfg.timeout_seconds,
        language=language,
        categories=categories or "general",
        time_range=time_range,
        safesearch=safesearch,
    )
    raw_list = parse_searxng_results(payload)
    hits = raw_hits_from_searx(raw_list)
    total_raw = len(hits)

    rule_items, _ = apply_rule_filters(
        hits,
        query=q,
        max_results=cap,
        config=cfg,
    )
    total_after_rules = len(rule_items)

    effective_llm = use_llm_ranking or cfg.default_llm_ranking
    llm_applied = False
    final_items: List[dict] = list(rule_items)

    if effective_llm and final_items:
        try:
            final_items = await rank_hits_with_llm(
                query=q, items=final_items, config=cfg
            )
            llm_applied = True
        except Exception as e:
            logger.warning("LLM ranking skipped or failed: {}", e)
            final_items = list(rule_items)
            llm_applied = False

    return WebSearchServiceResult(
        query=q,
        results=final_items,
        total_raw=total_raw,
        total_after_rules=total_after_rules,
        total_returned=len(final_items),
        llm_ranking_applied=llm_applied,
    )

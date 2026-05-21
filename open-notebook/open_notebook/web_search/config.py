"""Environment-driven configuration for SearXNG web search."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import FrozenSet


def _parse_bool(raw: str | None, default: bool = False) -> bool:
    if raw is None or raw.strip() == "":
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


def _parse_host_list(raw: str | None) -> FrozenSet[str]:
    if not raw:
        return frozenset()
    parts = [p.strip().lower() for p in raw.split(",") if p.strip()]
    return frozenset(parts)


@dataclass(frozen=True)
class WebSearchConfig:
    enabled: bool
    base_url: str
    timeout_seconds: float
    max_results_default: int
    blocked_domains: FrozenSet[str]
    allowed_domains: FrozenSet[str]
    default_llm_ranking: bool
    llm_relevance_threshold: float


def load_web_search_config() -> WebSearchConfig:
    timeout = float(os.getenv("SEARXNG_TIMEOUT_SECONDS", "20"))
    max_default = int(os.getenv("SEARXNG_MAX_RESULTS", "30"))
    max_default = max(1, min(50, max_default))
    threshold = float(os.getenv("SEARXNG_LLM_RELEVANCE_THRESHOLD", "0.45"))
    threshold = max(0.0, min(1.0, threshold))
    return WebSearchConfig(
        enabled=_parse_bool(os.getenv("SEARXNG_ENABLED"), False),
        base_url=(os.getenv("SEARXNG_BASE_URL") or "").strip().rstrip("/"),
        timeout_seconds=timeout,
        max_results_default=max_default,
        blocked_domains=_parse_host_list(os.getenv("SEARXNG_BLOCKED_DOMAINS")),
        allowed_domains=_parse_host_list(os.getenv("SEARXNG_ALLOWED_DOMAINS")),
        default_llm_ranking=_parse_bool(os.getenv("SEARXNG_DEFAULT_LLM_RANKING"), False),
        llm_relevance_threshold=threshold,
    )

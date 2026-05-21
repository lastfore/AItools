"""Rule-based filtering for SearXNG hit list."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Set, Tuple
from urllib.parse import urlparse, urlunparse

from open_notebook.web_search.config import WebSearchConfig


def _normalize_url_for_dedupe(url: str) -> str:
    try:
        parsed = urlparse(url.strip())
        if not parsed.scheme or not parsed.netloc:
            return url.strip()
        netloc = parsed.netloc.lower()
        path = parsed.path or ""
        if path != "/" and path.endswith("/"):
            path = path.rstrip("/")
        clean = urlunparse(
            (parsed.scheme.lower(), netloc, path, "", parsed.query, "")
        )
        return clean
    except Exception:
        return url.strip()


def _hostname(url: str) -> str:
    try:
        return urlparse(url).hostname or ""
    except Exception:
        return ""


def _host_matches_allowed(host: str, allowed: frozenset[str]) -> bool:
    host = host.lower()
    for pattern in allowed:
        if host == pattern or host.endswith("." + pattern):
            return True
    return False


def _host_matches_blocked(host: str, blocked: frozenset[str]) -> bool:
    host = host.lower()
    for pattern in blocked:
        if host == pattern or host.endswith("." + pattern):
            return True
    return False


def _query_tokens(query: str) -> List[str]:
    q = query.strip()
    if not q:
        return []
    parts = [p for p in q.split() if p]
    if parts:
        return [p.lower() for p in parts]
    return [q.lower()]


def _skip_keyword_filter(query: str) -> bool:
    """Single-term queries (typical CJK) are already ranked by SearXNG; do not require exact phrase match."""
    return " " not in query.strip()


def _keyword_matches(haystack: str, tokens: List[str], full_query: str) -> bool:
    if not haystack.strip():
        return False
    h = haystack.lower()
    fq = full_query.strip().lower()
    if len(tokens) <= 1 and fq and " " not in full_query.strip():
        return fq in h
    return any(t in h for t in tokens)


@dataclass
class RawHit:
    url: str
    title: str
    snippet: str
    engine: str


def raw_hits_from_searx(results: List[Dict[str, Any]]) -> List[RawHit]:
    hits: List[RawHit] = []
    for r in results:
        url = (r.get("url") or "").strip()
        title = (r.get("title") or "").strip()
        snippet = (r.get("content") or r.get("snippet") or "").strip()
        engine = (r.get("engine") or "").strip()
        if url:
            hits.append(RawHit(url=url, title=title, snippet=snippet, engine=engine))
    return hits


def apply_rule_filters(
    hits: List[RawHit],
    *,
    query: str,
    max_results: int,
    config: WebSearchConfig,
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Returns list of dicts suitable for WebSearchResultItem construction,
    each with keys url, title, snippet, engine, filtered_by (list).
    Second return value: count after dedupe+scheme+domain+nonempty before keyword/limit.
    """
    tokens = _query_tokens(query)
    deduped: List[RawHit] = []
    seen_set: Set[str] = set()

    for h in hits:
        key = _normalize_url_for_dedupe(h.url)
        if key in seen_set:
            continue
        seen_set.add(key)
        deduped.append(h)

    staged: List[Tuple[RawHit, List[str]]] = []
    for h in deduped:
        tags: List[str] = []
        u = h.url.strip()
        if not u.startswith(("http://", "https://")):
            continue
        tags.append("scheme")
        host = _hostname(u)
        if not host:
            continue
        tags.append("host")
        if config.blocked_domains and _host_matches_blocked(host, config.blocked_domains):
            tags.append("blocked_domain")
            continue
        if config.allowed_domains and not _host_matches_allowed(
            host, config.allowed_domains
        ):
            tags.append("allowed_domain")
            continue
        if not h.title.strip() and not h.snippet.strip():
            continue
        tags.append("nonempty")
        staged.append((h, tags))

    count_before_keyword = len(staged)

    keyword_passed: List[Tuple[RawHit, List[str]]] = []
    skip_keyword = _skip_keyword_filter(query)
    for h, tags in staged:
        ttags = list(tags)
        hay = f"{h.title} {h.snippet}"
        if tokens and not skip_keyword and not _keyword_matches(hay, tokens, query):
            continue
        ttags.append("keyword_match")
        keyword_passed.append((h, ttags))

    limited = keyword_passed[:max_results]

    out: List[Dict[str, Any]] = []
    for h, tags in limited:
        out.append(
            {
                "url": h.url,
                "title": h.title,
                "snippet": h.snippet,
                "engine": h.engine,
                "filtered_by": tags,
            }
        )
    return out, count_before_keyword

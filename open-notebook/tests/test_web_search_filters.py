"""Unit tests for open_notebook.web_search.filters."""

from open_notebook.web_search.config import WebSearchConfig
from open_notebook.web_search.filters import RawHit, apply_rule_filters, raw_hits_from_searx


def test_raw_hits_from_searx_maps_content():
    payload = [
        {"url": "https://a.com/x", "title": "T", "content": "snippet", "engine": "duckduckgo"}
    ]
    hits = raw_hits_from_searx(payload)
    assert len(hits) == 1
    assert hits[0].url == "https://a.com/x"
    assert hits[0].snippet == "snippet"


def test_dedupe_and_scheme():
    cfg = WebSearchConfig(
        enabled=True,
        base_url="http://x",
        timeout_seconds=10,
        max_results_default=30,
        blocked_domains=frozenset(),
        allowed_domains=frozenset(),
        default_llm_ranking=False,
        llm_relevance_threshold=0.45,
    )
    hits = [
        RawHit("https://ex.com/a", "Hello", "world here", "e1"),
        RawHit("https://ex.com/a#frag", "Hello", "world here", "e2"),
        RawHit("ftp://ex.com/b", "No", "scheme", "e3"),
    ]
    out, _ = apply_rule_filters(hits, query="hello world", max_results=10, config=cfg)
    assert len(out) == 1
    assert out[0]["url"].startswith("https://ex.com/a")


def test_blocked_domain():
    cfg = WebSearchConfig(
        enabled=True,
        base_url="http://x",
        timeout_seconds=10,
        max_results_default=30,
        blocked_domains=frozenset(["bad.com"]),
        allowed_domains=frozenset(),
        default_llm_ranking=False,
        llm_relevance_threshold=0.45,
    )
    hits = [RawHit("https://bad.com/x", "T", "bad snippet text", "e")]
    out, _ = apply_rule_filters(hits, query="snippet", max_results=10, config=cfg)
    assert out == []


def test_allowed_domains_only():
    cfg = WebSearchConfig(
        enabled=True,
        base_url="http://x",
        timeout_seconds=10,
        max_results_default=30,
        blocked_domains=frozenset(),
        allowed_domains=frozenset(["ok.org"]),
        default_llm_ranking=False,
        llm_relevance_threshold=0.45,
    )
    hits = [
        RawHit("https://ok.org/a", "T", "match query words", "e"),
        RawHit("https://other.com/b", "T", "match query words", "e"),
    ]
    out, _ = apply_rule_filters(hits, query="query words", max_results=10, config=cfg)
    assert len(out) == 1
    assert "ok.org" in out[0]["url"]


def test_cjk_query_skips_strict_keyword_match():
    cfg = WebSearchConfig(
        enabled=True,
        base_url="http://x",
        timeout_seconds=10,
        max_results_default=30,
        blocked_domains=frozenset(),
        allowed_domains=frozenset(),
        default_llm_ranking=False,
        llm_relevance_threshold=0.45,
    )
    hits = [
        RawHit(
            "https://example.com/a",
            "特朗普访华相关报道",
            "2026年外交活动",
            "bing",
        )
    ]
    out, _ = apply_rule_filters(
        hits, query="特朗普最近一次访华", max_results=10, config=cfg
    )
    assert len(out) == 1

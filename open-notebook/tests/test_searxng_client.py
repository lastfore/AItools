"""Tests for SearXNG JSON client parsing."""

from open_notebook.web_search.searxng_client import parse_searxng_results


def test_parse_searxng_results_empty():
    assert parse_searxng_results({}) == []
    assert parse_searxng_results({"results": None}) == []


def test_parse_searxng_results_list():
    payload = {
        "results": [
            {"url": "https://a.com", "title": "A", "content": "c", "engine": "g"},
            "skip",
            {"url": "", "title": "x"},
        ]
    }
    rows = parse_searxng_results(payload)
    assert len(rows) == 2
    assert rows[0]["url"] == "https://a.com"
    assert rows[1]["url"] == ""

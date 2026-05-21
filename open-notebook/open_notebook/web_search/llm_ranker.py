"""Optional LLM-based relevance ranking for web search hits."""

from __future__ import annotations

import json
import re
from typing import Any, Dict, List

from open_notebook.ai.provision import provision_langchain_model
from open_notebook.web_search.config import WebSearchConfig


def _extract_json_array(text: str) -> List[Dict[str, Any]]:
    text = text.strip()
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text, re.IGNORECASE)
    if m:
        text = m.group(1).strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        start = text.find("[")
        end = text.rfind("]")
        if start != -1 and end != -1 and end > start:
            data = json.loads(text[start : end + 1])
        else:
            raise
    if not isinstance(data, list):
        raise ValueError("Expected JSON array")
    out: List[Dict[str, Any]] = []
    for item in data:
        if isinstance(item, dict):
            out.append(item)
    return out


async def rank_hits_with_llm(
    *,
    query: str,
    items: List[Dict[str, Any]],
    config: WebSearchConfig,
) -> List[Dict[str, Any]]:
    """
    Assign relevance_score to each item; drop entries below threshold.
    items: dicts with url, title, snippet, engine, filtered_by
    """
    if not items:
        return []

    lines: List[str] = []
    for i, it in enumerate(items, start=1):
        lines.append(
            f"{i}. url={it['url']!r}\n   title={it.get('title','')!r}\n"
            f"   snippet={it.get('snippet','')[:400]!r}"
        )
    block = "\n".join(lines)

    prompt = (
        f"You are ranking web search results for the user query: {query!r}\n"
        "Return a JSON array only (no markdown), each element: "
        '{"url": string, "relevance_score": number between 0 and 1, "reason": string}.\n'
        "Include every URL from the list below exactly once.\n\n"
        f"Results:\n{block}"
    )

    llm = await provision_langchain_model(
        prompt,
        model_id=None,
        default_type="chat",
        temperature=0.1,
    )
    response = await llm.ainvoke(prompt)
    raw_text = getattr(response, "content", None) or str(response)
    if isinstance(raw_text, list):
        raw_text = " ".join(str(x) for x in raw_text)

    ranked = _extract_json_array(str(raw_text))
    scores_by_url: Dict[str, float] = {}
    for row in ranked:
        url = (row.get("url") or "").strip()
        if not url:
            continue
        try:
            score = float(row.get("relevance_score", 0))
        except (TypeError, ValueError):
            score = 0.0
        scores_by_url[url] = max(0.0, min(1.0, score))

    merged: List[Dict[str, Any]] = []
    for it in items:
        url = it["url"]
        score = scores_by_url.get(url)
        if score is None:
            score = 0.5
        if score < config.llm_relevance_threshold:
            continue
        new_it = dict(it)
        new_it["score"] = score
        tags = list(it.get("filtered_by") or [])
        tags.append("llm_rank")
        new_it["filtered_by"] = tags
        merged.append(new_it)

    merged.sort(key=lambda x: float(x.get("score") or 0), reverse=True)
    return merged

"""Core IEEPA claims scanner using the Claude API with web search."""

import json
import logging
from dataclasses import dataclass
from typing import Any, Dict, List

import anthropic

logger = logging.getLogger(__name__)

# Default search queries submitted to Claude + web search
DEFAULT_QUERIES = [
    "IEEPA lawsuit legal challenge filed 2025",
    "International Emergency Economic Powers Act court case ruling 2025",
    "IEEPA tariffs legal action challenge",
    "IEEPA invoked executive order challenged court",
    "IEEPA sanctions challenged lawsuit",
]

SYSTEM_PROMPT = """\
You are an expert legal researcher specialising in U.S. trade law and executive powers.
Your task is to find and summarise recent claims, lawsuits, and legal challenges involving
the International Emergency Economic Powers Act (IEEPA).

For each claim you find, extract the following fields:
- title: short descriptive title of the claim or case
- date: date of filing or announcement (YYYY-MM-DD if known, otherwise "unknown")
- source: publication or court name
- url: direct URL to the source article or court document (if available)
- claim_type: one of ["lawsuit", "legal_challenge", "executive_action", "ruling", "news_report", "other"]
- parties: who is suing / being sued (e.g. "Steel importers v. U.S. government")
- summary: 2-3 sentence factual summary of the claim
- status: current status (e.g. "filed", "pending", "dismissed", "decided", "ongoing")

Return ONLY a valid JSON object with a single key "claims" whose value is a list of claim objects.
Do not include any text outside the JSON.
"""


@dataclass
class IEEPAClaim:
    title: str
    date: str
    source: str
    url: str
    claim_type: str
    parties: str
    summary: str
    status: str

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "IEEPAClaim":
        return cls(
            title=d.get("title", ""),
            date=d.get("date", "unknown"),
            source=d.get("source", ""),
            url=d.get("url", ""),
            claim_type=d.get("claim_type", "other"),
            parties=d.get("parties", ""),
            summary=d.get("summary", ""),
            status=d.get("status", ""),
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "date": self.date,
            "source": self.source,
            "url": self.url,
            "claim_type": self.claim_type,
            "parties": self.parties,
            "summary": self.summary,
            "status": self.status,
        }


def _deduplicate(claims: List[IEEPAClaim]) -> List[IEEPAClaim]:
    """Remove duplicate claims by normalising titles."""
    seen: set = set()
    unique: List[IEEPAClaim] = []
    for c in claims:
        key = c.title.lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(c)
    return unique


def scan_for_claims(
    api_key: str,
    extra_queries: List[str] | None = None,
    max_claims: int = 20,
) -> List[IEEPAClaim]:
    """
    Use Claude (claude-opus-4-6) with the web_search tool to find IEEPA claims.

    Returns a deduplicated list of IEEPAClaim objects, capped at max_claims.
    """
    client = anthropic.Anthropic(api_key=api_key)

    queries = DEFAULT_QUERIES + (extra_queries or [])
    all_claims: List[IEEPAClaim] = []

    tools = [
        {"type": "web_search_20260209", "name": "web_search"},
    ]

    for query in queries:
        logger.info("Searching: %s", query)
        user_message = (
            f'Search the web for: "{query}"\n\n'
            "Find all relevant IEEPA claims, lawsuits, or legal challenges from the results. "
            "Return them as a JSON object with a 'claims' list."
        )

        try:
            with client.messages.stream(
                model="claude-opus-4-6",
                max_tokens=4096,
                thinking={"type": "adaptive"},
                system=SYSTEM_PROMPT,
                tools=tools,
                messages=[{"role": "user", "content": user_message}],
            ) as stream:
                response = stream.get_final_message()
        except anthropic.APIError as exc:
            logger.warning("API error for query %r: %s", query, exc)
            continue

        # Extract JSON from the final text block
        text_block = next(
            (b for b in response.content if b.type == "text"), None
        )
        if not text_block:
            logger.warning("No text block in response for query: %s", query)
            continue

        raw = text_block.text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        try:
            data = json.loads(raw)
            for item in data.get("claims", []):
                all_claims.append(IEEPAClaim.from_dict(item))
            logger.info(
                "Found %d claim(s) for query: %s",
                len(data.get("claims", [])),
                query,
            )
        except json.JSONDecodeError as exc:
            logger.warning("Could not parse JSON for query %r: %s", query, exc)
            logger.debug("Raw response: %s", raw[:500])

    unique = _deduplicate(all_claims)
    logger.info("Total unique claims after deduplication: %d", len(unique))
    return unique[:max_claims]

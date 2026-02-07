"""Fetch recent news headlines that may explain a stock drop."""

import logging
from dataclasses import dataclass

import requests

logger = logging.getLogger(__name__)

NEWSAPI_SEARCH_URL = "https://newsapi.org/v2/everything"


@dataclass
class Article:
    title: str
    source: str
    url: str
    description: str


def fetch_drop_reasons(
    ticker: str,
    company_name: str,
    api_key: str,
    max_articles: int = 5,
) -> list[Article]:
    """Search NewsAPI for recent articles about *company_name* / *ticker*.

    Args:
        ticker: Stock ticker symbol (e.g. "AAPL").
        company_name: Human-readable company name.
        api_key: NewsAPI API key.
        max_articles: Maximum number of articles to return.

    Returns:
        A list of Article objects with headlines and links.
    """
    query = f"{company_name} OR {ticker} stock"
    params = {
        "q": query,
        "sortBy": "relevancy",
        "pageSize": max_articles,
        "language": "en",
        "apiKey": api_key,
    }

    try:
        resp = requests.get(NEWSAPI_SEARCH_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException:
        logger.exception("Failed to fetch news for %s", ticker)
        return []

    articles: list[Article] = []
    for item in data.get("articles", []):
        articles.append(
            Article(
                title=item.get("title", ""),
                source=item.get("source", {}).get("name", "Unknown"),
                url=item.get("url", ""),
                description=item.get("description", "") or "",
            )
        )
    return articles

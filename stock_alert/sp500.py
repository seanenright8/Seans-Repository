"""Fetch the current S&P 500 constituent list and detect large daily drops."""

import logging
from dataclasses import dataclass

import yfinance as yf

logger = logging.getLogger(__name__)

# Wikipedia maintains a regularly-updated S&P 500 table that pandas can scrape.
SP500_URL = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"


def get_sp500_tickers() -> list[str]:
    """Return a list of current S&P 500 ticker symbols."""
    import pandas as pd

    table = pd.read_html(SP500_URL, attrs={"id": "constituents"})[0]
    tickers = table["Symbol"].tolist()
    # Yahoo Finance uses dots instead of hyphens for some tickers (e.g. BRK.B)
    tickers = [t.replace(".", "-") for t in tickers]
    return tickers


@dataclass
class StockDrop:
    ticker: str
    company_name: str
    previous_close: float
    current_price: float
    change_pct: float


def find_large_drops(threshold_pct: float = -10.0) -> list[StockDrop]:
    """Screen all S&P 500 stocks for single-day drops exceeding *threshold_pct*.

    Args:
        threshold_pct: The percentage drop threshold (negative number, e.g. -10.0).

    Returns:
        A list of StockDrop objects for every stock that dropped more than the
        threshold in the current trading session.
    """
    tickers = get_sp500_tickers()
    logger.info("Screening %d S&P 500 tickers for drops > %.1f%%", len(tickers), threshold_pct)

    drops: list[StockDrop] = []

    # Download in bulk for efficiency — yfinance supports space-separated tickers.
    data = yf.download(tickers, period="5d", group_by="ticker", threads=True)

    for ticker in tickers:
        try:
            if len(tickers) == 1:
                hist = data
            else:
                hist = data[ticker]

            # Need at least 2 days of data
            closes = hist["Close"].dropna()
            if len(closes) < 2:
                continue

            prev_close = float(closes.iloc[-2])
            curr_close = float(closes.iloc[-1])

            if prev_close == 0:
                continue

            change_pct = ((curr_close - prev_close) / prev_close) * 100.0

            if change_pct <= threshold_pct:
                info = yf.Ticker(ticker).info
                name = info.get("shortName", ticker)
                drop = StockDrop(
                    ticker=ticker,
                    company_name=name,
                    previous_close=round(prev_close, 2),
                    current_price=round(curr_close, 2),
                    change_pct=round(change_pct, 2),
                )
                drops.append(drop)
                logger.info("DROP detected: %s (%s) %.2f%%", ticker, name, change_pct)
        except Exception:
            logger.debug("Could not process %s", ticker, exc_info=True)

    logger.info("Screening complete — %d drop(s) found", len(drops))
    return drops

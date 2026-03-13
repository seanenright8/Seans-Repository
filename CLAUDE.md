# CLAUDE.md — AI Assistant Guide for Seans-Repository

## Project Overview

This is a **Python stock alert application** that monitors all S&P 500 stocks for significant single-day price drops and sends HTML email alerts enriched with relevant news articles.

**Pipeline**: Fetch S&P 500 tickers → Bulk download price data → Detect drops exceeding threshold → Fetch news for each dropped stock → Send one HTML email per drop.

---

## Repository Structure

```
Seans-Repository/
├── main.py                    # Entry point and scheduler
├── requirements.txt           # Python dependencies (4 packages)
├── .env.example               # Environment variable template (copy to .env)
├── README.md                  # User-facing setup documentation
└── stock_alert/               # Application package
    ├── __init__.py            # Empty package marker
    ├── config.py              # Config dataclass + load_config()
    ├── sp500.py               # S&P 500 ticker fetching + drop detection
    ├── news.py                # NewsAPI article fetching
    └── email_sender.py        # HTML email composition and SMTP sending
```

---

## Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment config
cp .env.example .env
# Edit .env with your SMTP credentials, email addresses, and API keys

# Run once immediately (useful for testing)
python main.py --once

# Run as a daily scheduler (default: 4:30 PM every day)
python main.py
```

---

## Environment Configuration

All configuration is via environment variables (loaded from `.env` by `python-dotenv`).

| Variable | Required | Default | Description |
|---|---|---|---|
| `SMTP_USER` | Yes | — | Gmail/SMTP login username |
| `SMTP_PASSWORD` | Yes | — | App-specific password (not account password) |
| `TO_EMAIL` | Yes | — | Alert recipient address |
| `NEWSAPI_KEY` | Yes | — | API key from newsapi.org |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP TLS port |
| `FROM_EMAIL` | No | Falls back to `SMTP_USER` | Sender address |
| `DROP_THRESHOLD` | No | `-10.0` | Percentage drop to trigger alert (negative) |
| `CHECK_TIME` | No | `16:30` | Daily check time in `HH:MM` 24-hour format |

`load_config()` raises `EnvironmentError` immediately if any required variables are missing, listing all missing keys at once.

---

## Module Descriptions

### `main.py`
- Parses `--once` CLI flag via `argparse`
- `run_check()`: orchestrates the full pipeline — calls `find_large_drops`, then for each drop calls `fetch_drop_reasons` and `send_alert_email`
- `main()`: sets up `schedule` daily job and runs the scheduler loop (polls every 30 seconds)
- Configures `logging` at `INFO` level with timestamp, level, and logger name

### `stock_alert/config.py`
- `Config` dataclass with 9 typed fields covering SMTP, NewsAPI, threshold, and schedule time
- `load_config()` validates all required env vars before returning, collecting missing ones into a list to give a helpful error message

### `stock_alert/sp500.py`
- `get_sp500_tickers()`: scrapes the Wikipedia S&P 500 table using `pandas.read_html`, normalizes tickers (`.` → `-` for Yahoo Finance compatibility, e.g. `BRK.B`)
- `StockDrop` dataclass: `ticker`, `company_name`, `previous_close`, `current_price`, `change_pct`
- `find_large_drops(threshold_pct)`: bulk downloads 5 days of price history for all ~500 tickers using `yf.download(..., threads=True)`, computes day-over-day change, fetches `yf.Ticker.info` for company name only when a drop is detected

### `stock_alert/news.py`
- `Article` dataclass: `title`, `source`, `url`, `description`
- `fetch_drop_reasons(ticker, company_name, api_key, max_articles=5)`: queries NewsAPI `/v2/everything` with query `"{company_name} OR {ticker} stock"`, sorted by relevancy, English only
- Returns empty list on any `requests.RequestException` — news failures never block email sending

### `stock_alert/email_sender.py`
- `_build_html(drop, articles)`: constructs inline-styled HTML email with a price summary table and a news articles table
- `send_alert_email(drop, articles, *, smtp_host, smtp_port, smtp_user, smtp_password, from_addr, to_addr)`: uses `smtplib.SMTP` with `starttls()`, sends one email per drop
- All SMTP parameters are keyword-only (enforced by `*` in signature)

---

## Code Conventions

### Style
- **Python 3** with modern type hints (`list[str]`, `list[StockDrop]`) — no `from __future__ import annotations` needed
- **`@dataclass`** for all data-carrying objects (`Config`, `StockDrop`, `Article`) — no manual `__init__`
- **Module-level loggers**: every module uses `logger = logging.getLogger(__name__)`
- **Docstrings**: all public functions have Google-style docstrings with `Args:` and `Returns:` sections
- **No type: ignore** — keep code fully type-clean

### Error Handling
- External API failures (NewsAPI, yfinance) are caught, logged, and do not propagate — the pipeline degrades gracefully
- Configuration errors fail fast and loud at startup via `EnvironmentError`
- Per-ticker processing failures are caught silently at `DEBUG` level (expected for delisted/problematic tickers)

### Imports
- Standard library imports first, then third-party, then local `stock_alert.*` — separated by blank lines
- `pandas` is imported lazily inside `get_sp500_tickers()` to keep startup time fast

### Naming
- Functions use `verb_noun` snake_case: `find_large_drops`, `fetch_drop_reasons`, `send_alert_email`
- Private helpers are prefixed with `_`: `_build_html`, `_req`
- Constants are `UPPER_SNAKE_CASE`: `SP500_URL`, `NEWSAPI_SEARCH_URL`

---

## Dependencies

```
yfinance>=0.2.31       # Yahoo Finance price data + ticker info
requests>=2.31.0       # HTTP client for NewsAPI
schedule>=1.2.0        # Cron-like daily job scheduling
python-dotenv>=1.0.0   # Load .env files into os.environ
```

`pandas` is used by `sp500.py` (via `pd.read_html`) but is not listed explicitly — it is installed as a transitive dependency of `yfinance`.

---

## Testing

There is currently **no test suite**. When adding tests:
- Use `pytest` as the test runner
- Place tests in a `tests/` directory mirroring the `stock_alert/` package structure
- Mock external calls (`yf.download`, `requests.get`, `smtplib.SMTP`) — do not make real network calls in tests
- `load_config()` can be tested by patching `os.environ` with `monkeypatch`

---

## No CI/CD

There is no `.github/workflows/` or other CI configuration. Changes are committed and pushed directly. When adding CI:
- Run `pip install -r requirements.txt` before linting/testing
- Suggested lint tools: `ruff` (linting + formatting) or `black` + `flake8`

---

## Common Tasks for AI Assistants

**Adding a new data source**: Create a new module in `stock_alert/`, define a dataclass for its output, and integrate it into `run_check()` in `main.py`.

**Changing alert criteria**: Modify `find_large_drops()` in `sp500.py`. The threshold is already configurable via `DROP_THRESHOLD` env var.

**Adding a new notification channel** (e.g. Slack, SMS): Add a new sender module alongside `email_sender.py`, accepting a `StockDrop` and list of `Article` objects, and call it from `run_check()`.

**Changing email format**: Edit `_build_html()` in `email_sender.py`. It returns a plain HTML string with inline CSS.

**Making it run more frequently**: Replace the `schedule.every().day.at(...)` call in `main()` with a shorter interval (e.g. `schedule.every().hour`). Adjust `CHECK_TIME` env var handling accordingly.

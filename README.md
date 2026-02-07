# S&P 500 Stock Drop Email Alerts

Get an email whenever an S&P 500 stock drops more than 10% in a single day, along with recent news articles explaining why.

## How It Works

1. Pulls the live S&P 500 constituent list from Wikipedia
2. Downloads the latest price data for all ~500 stocks via Yahoo Finance
3. Flags any stock whose daily close-to-close change exceeds the threshold (default: -10%)
4. Searches NewsAPI for recent articles about each flagged stock
5. Sends you a formatted HTML email with the price data and headlines

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

You need:
- **SMTP credentials** — for Gmail, enable 2FA and create an [App Password](https://support.google.com/accounts/answer/185833)
- **NewsAPI key** — free at [newsapi.org/register](https://newsapi.org/register)

### 3. Run

**One-time check** (good for testing):

```bash
python main.py --once
```

**Scheduled mode** (runs daily at `CHECK_TIME`, default 4:30 PM):

```bash
python main.py
```

## Configuration

All settings live in `.env` (see `.env.example` for reference):

| Variable | Default | Description |
|---|---|---|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | `587` | SMTP port (TLS) |
| `SMTP_USER` | *(required)* | SMTP login |
| `SMTP_PASSWORD` | *(required)* | SMTP password / app password |
| `FROM_EMAIL` | `SMTP_USER` | Sender address |
| `TO_EMAIL` | *(required)* | Recipient address |
| `NEWSAPI_KEY` | *(required)* | NewsAPI API key |
| `DROP_THRESHOLD` | `-10.0` | % drop to trigger alert |
| `CHECK_TIME` | `16:30` | Daily check time (24h format) |

## Project Structure

```
.
├── main.py                  # Entry point & scheduler
├── stock_alert/
│   ├── config.py            # Load settings from .env
│   ├── sp500.py             # S&P 500 ticker list & drop detection
│   ├── news.py              # NewsAPI headline fetcher
│   └── email_sender.py      # HTML email composition & sending
├── .env.example             # Template for environment variables
└── requirements.txt         # Python dependencies
```

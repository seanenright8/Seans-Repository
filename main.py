#!/usr/bin/env python3
"""Stock Alert App — emails you when an S&P 500 stock drops more than 10% in one day."""

import argparse
import logging
import time

import schedule

from stock_alert.config import load_config
from stock_alert.email_sender import send_alert_email
from stock_alert.news import fetch_drop_reasons
from stock_alert.sp500 import find_large_drops

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("stock_alert")


def run_check() -> None:
    """Run one full screening cycle: detect drops, fetch news, send emails."""
    cfg = load_config()
    logger.info("Starting stock drop scan (threshold: %.1f%%)", cfg.drop_threshold)

    drops = find_large_drops(threshold_pct=cfg.drop_threshold)

    if not drops:
        logger.info("No S&P 500 stocks dropped more than %.1f%% today.", cfg.drop_threshold)
        return

    for drop in drops:
        articles = fetch_drop_reasons(drop.ticker, drop.company_name, cfg.newsapi_key)
        send_alert_email(
            drop,
            articles,
            smtp_host=cfg.smtp_host,
            smtp_port=cfg.smtp_port,
            smtp_user=cfg.smtp_user,
            smtp_password=cfg.smtp_password,
            from_addr=cfg.from_addr,
            to_addr=cfg.to_addr,
        )

    logger.info("Done — sent %d alert(s).", len(drops))


def main() -> None:
    parser = argparse.ArgumentParser(description="S&P 500 Stock Drop Email Alerts")
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run the check once and exit (don't schedule).",
    )
    args = parser.parse_args()

    if args.once:
        run_check()
        return

    cfg = load_config()
    schedule.every().day.at(cfg.check_time).do(run_check)
    logger.info(
        "Scheduler started — will check for drops every day at %s", cfg.check_time
    )

    while True:
        schedule.run_pending()
        time.sleep(30)


if __name__ == "__main__":
    main()

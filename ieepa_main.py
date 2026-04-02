#!/usr/bin/env python3
"""IEEPA Claims Scanner — periodically scans the internet for IEEPA claims using Claude + web search."""

import argparse
import logging
import time

import schedule

from ieepa_scanner.config import load_config
from ieepa_scanner.reporter import print_summary, save_report
from ieepa_scanner.scanner import scan_for_claims

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ieepa_scanner")


def run_scan() -> None:
    """Run one full scan cycle: find IEEPA claims, save report, print summary."""
    cfg = load_config()
    logger.info("Starting IEEPA claims scan (max_claims=%d)", cfg.max_claims)

    claims = scan_for_claims(
        api_key=cfg.anthropic_api_key,
        extra_queries=cfg.extra_queries,
        max_claims=cfg.max_claims,
    )

    print_summary(claims)

    if claims:
        report_path = save_report(claims, output_dir=cfg.output_dir)
        logger.info("Report saved to: %s", report_path)
    else:
        logger.info("No claims found — no report written.")

    logger.info("Scan complete.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scan the internet for IEEPA (International Emergency Economic Powers Act) claims."
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run the scan once and exit (don't schedule).",
    )
    args = parser.parse_args()

    if args.once:
        run_scan()
        return

    cfg = load_config()
    schedule.every().day.at(cfg.check_time).do(run_scan)
    logger.info("Scheduler started — will scan every day at %s", cfg.check_time)

    while True:
        schedule.run_pending()
        time.sleep(30)


if __name__ == "__main__":
    main()

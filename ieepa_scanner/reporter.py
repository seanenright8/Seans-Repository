"""Format and persist IEEPA claims reports."""

import json
import logging
import os
from datetime import datetime, timezone
from typing import List

from .scanner import IEEPAClaim

logger = logging.getLogger(__name__)


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def save_report(claims: List[IEEPAClaim], output_dir: str) -> str:
    """
    Write a JSON data file and a human-readable Markdown report.

    Returns the path to the Markdown report.
    """
    _ensure_dir(output_dir)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    # ── JSON ──────────────────────────────────────────────────────────────
    json_path = os.path.join(output_dir, f"ieepa_claims_{timestamp}.json")
    payload = {
        "generated_at": timestamp,
        "total_claims": len(claims),
        "claims": [c.to_dict() for c in claims],
    }
    with open(json_path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)
    logger.info("JSON report saved: %s", json_path)

    # ── Markdown ──────────────────────────────────────────────────────────
    md_path = os.path.join(output_dir, f"ieepa_claims_{timestamp}.md")
    lines: List[str] = [
        "# IEEPA Claims Report",
        f"**Generated:** {timestamp}  ",
        f"**Total claims found:** {len(claims)}",
        "",
    ]

    if not claims:
        lines.append("_No IEEPA claims found in this scan._")
    else:
        # Group by claim_type for readability
        by_type: dict[str, List[IEEPAClaim]] = {}
        for c in claims:
            by_type.setdefault(c.claim_type, []).append(c)

        for ctype, group in sorted(by_type.items()):
            lines.append(f"## {ctype.replace('_', ' ').title()} ({len(group)})")
            lines.append("")
            for c in group:
                lines.append(f"### {c.title}")
                lines.append(f"- **Date:** {c.date}")
                lines.append(f"- **Parties:** {c.parties}")
                lines.append(f"- **Source:** {c.source}")
                if c.url:
                    lines.append(f"- **URL:** {c.url}")
                lines.append(f"- **Status:** {c.status}")
                lines.append("")
                lines.append(c.summary)
                lines.append("")
                lines.append("---")
                lines.append("")

    with open(md_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
    logger.info("Markdown report saved: %s", md_path)

    return md_path


def print_summary(claims: List[IEEPAClaim]) -> None:
    """Print a brief console summary of the claims found."""
    if not claims:
        print("No IEEPA claims found in this scan.")
        return

    print(f"\n{'='*60}")
    print(f"  IEEPA CLAIMS SCAN — {len(claims)} claim(s) found")
    print(f"{'='*60}\n")

    for i, c in enumerate(claims, 1):
        print(f"{i:>3}. [{c.claim_type}] {c.title}")
        print(f"       Date: {c.date}  |  Status: {c.status}")
        print(f"       {c.parties}")
        if c.url:
            print(f"       {c.url}")
        print()

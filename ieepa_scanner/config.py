"""Load IEEPA scanner configuration from environment variables / .env file."""

import os
from dataclasses import dataclass, field
from typing import List

from dotenv import load_dotenv

load_dotenv()


@dataclass
class IEEPAConfig:
    # Anthropic API key
    anthropic_api_key: str

    # Directory where JSON + Markdown reports are saved
    output_dir: str

    # Time to run the daily scan (24-hour HH:MM), e.g. "08:00"
    check_time: str

    # Maximum number of claims to surface per run
    max_claims: int

    # Optional: extra search queries to run in addition to defaults
    extra_queries: List[str] = field(default_factory=list)


def load_config() -> IEEPAConfig:
    """Build an IEEPAConfig from environment variables, raising on missing values."""
    missing: List[str] = []

    def _req(name: str) -> str:
        val = os.getenv(name)
        if not val:
            missing.append(name)
            return ""
        return val

    extra_raw = os.getenv("IEEPA_EXTRA_QUERIES", "")
    extra_queries = [q.strip() for q in extra_raw.split("|") if q.strip()]

    cfg = IEEPAConfig(
        anthropic_api_key=_req("ANTHROPIC_API_KEY"),
        output_dir=os.getenv("IEEPA_OUTPUT_DIR", "ieepa_reports"),
        check_time=os.getenv("IEEPA_CHECK_TIME", "08:00"),
        max_claims=int(os.getenv("IEEPA_MAX_CLAIMS", "20")),
        extra_queries=extra_queries,
    )

    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}. "
            "Copy .env.example to .env and fill in the values."
        )

    return cfg

"""Load configuration from environment variables / .env file."""

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    # Email / SMTP settings
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    from_addr: str
    to_addr: str

    # NewsAPI
    newsapi_key: str

    # Alert threshold (negative percentage, e.g. -10.0)
    drop_threshold: float

    # Schedule time in HH:MM format (24-hour), e.g. "16:30"
    check_time: str


def load_config() -> Config:
    """Build a Config from environment variables, raising on missing values."""
    missing = []

    def _req(name: str) -> str:
        val = os.getenv(name)
        if not val:
            missing.append(name)
            return ""
        return val

    cfg = Config(
        smtp_host=os.getenv("SMTP_HOST", "smtp.gmail.com"),
        smtp_port=int(os.getenv("SMTP_PORT", "587")),
        smtp_user=_req("SMTP_USER"),
        smtp_password=_req("SMTP_PASSWORD"),
        from_addr=os.getenv("FROM_EMAIL", "") or os.getenv("SMTP_USER", ""),
        to_addr=_req("TO_EMAIL"),
        newsapi_key=_req("NEWSAPI_KEY"),
        drop_threshold=float(os.getenv("DROP_THRESHOLD", "-10.0")),
        check_time=os.getenv("CHECK_TIME", "16:30"),
    )

    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}. "
            "Copy .env.example to .env and fill in the values."
        )

    if not cfg.from_addr:
        cfg.from_addr = cfg.smtp_user

    return cfg

"""Send HTML email alerts via SMTP (works with Gmail, Outlook, etc.)."""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from stock_alert.news import Article
from stock_alert.sp500 import StockDrop

logger = logging.getLogger(__name__)


def _build_html(drop: StockDrop, articles: list[Article]) -> str:
    """Build a clean HTML email body for a single stock drop."""
    news_rows = ""
    if articles:
        for a in articles:
            news_rows += f"""
            <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;">
                    <a href="{a.url}" style="color:#1a73e8; text-decoration:none; font-weight:600;">
                        {a.title}
                    </a>
                    <br>
                    <span style="color:#888; font-size:12px;">{a.source}</span>
                    <br>
                    <span style="font-size:13px;">{a.description}</span>
                </td>
            </tr>"""
    else:
        news_rows = """
            <tr>
                <td style="padding:8px; color:#888;">
                    No recent news articles found for this stock.
                </td>
            </tr>"""

    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; color:#222; max-width:600px; margin:auto;">
        <h2 style="color:#d32f2f;">Stock Alert: {drop.ticker} down {drop.change_pct}%</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
            <tr>
                <td style="padding:6px 12px; background:#f5f5f5;"><strong>Company</strong></td>
                <td style="padding:6px 12px;">{drop.company_name} ({drop.ticker})</td>
            </tr>
            <tr>
                <td style="padding:6px 12px; background:#f5f5f5;"><strong>Previous Close</strong></td>
                <td style="padding:6px 12px;">${drop.previous_close:.2f}</td>
            </tr>
            <tr>
                <td style="padding:6px 12px; background:#f5f5f5;"><strong>Current Price</strong></td>
                <td style="padding:6px 12px;">${drop.current_price:.2f}</td>
            </tr>
            <tr>
                <td style="padding:6px 12px; background:#f5f5f5;"><strong>Change</strong></td>
                <td style="padding:6px 12px; color:#d32f2f; font-weight:bold;">{drop.change_pct}%</td>
            </tr>
        </table>

        <h3>Why is it down?</h3>
        <table style="width:100%; border-collapse:collapse;">
            {news_rows}
        </table>

        <p style="margin-top:24px; font-size:12px; color:#aaa;">
            Sent by Stock Alert App &bull; Data from Yahoo Finance &bull; News from NewsAPI
        </p>
    </body>
    </html>
    """


def send_alert_email(
    drop: StockDrop,
    articles: list[Article],
    *,
    smtp_host: str,
    smtp_port: int,
    smtp_user: str,
    smtp_password: str,
    from_addr: str,
    to_addr: str,
) -> None:
    """Compose and send an HTML alert email for a single stock drop.

    Args:
        drop: The detected stock drop.
        articles: Related news articles explaining the drop.
        smtp_host: SMTP server hostname (e.g. "smtp.gmail.com").
        smtp_port: SMTP server port (e.g. 587 for TLS).
        smtp_user: SMTP login username.
        smtp_password: SMTP login password or app-specific password.
        from_addr: Sender email address.
        to_addr: Recipient email address.
    """
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Stock Alert: {drop.ticker} ({drop.company_name}) down {drop.change_pct}%"
    msg["From"] = from_addr
    msg["To"] = to_addr

    html = _build_html(drop, articles)
    msg.attach(MIMEText(html, "html"))

    logger.info("Sending alert email for %s to %s via %s:%d", drop.ticker, to_addr, smtp_host, smtp_port)
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(from_addr, to_addr, msg.as_string())
    logger.info("Email sent successfully for %s", drop.ticker)

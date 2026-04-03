import { Resend } from 'resend'
import type { ClaimSubmissionPayload } from '@shared/types'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = `${process.env.EMAIL_FROM_NAME ?? 'IEEPA Claims Fund'} <${process.env.EMAIL_FROM_ADDRESS ?? 'claims@example.com'}>`
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? process.env.ADMIN_EMAIL ?? ''
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yourdomain.com'

// ── Claim submission confirmation (to submitter) ──────────────

export async function sendClaimConfirmation(
  claim: ClaimSubmissionPayload & { id: string }
) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: claim.email,
    reply_to: REPLY_TO,
    subject: 'We received your IEEPA claim submission',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:ui-sans-serif,system-ui,sans-serif;background:#f9fafb;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#0A1628;padding:32px 40px;">
      <p style="color:#C9A84C;font-size:13px;font-weight:600;letter-spacing:0.1em;margin:0 0 8px;">IEEPA CLAIMS FUND</p>
      <h1 style="color:#fff;font-size:22px;font-weight:600;margin:0;">Submission Received</h1>
    </div>
    <div style="padding:40px;">
      <p style="color:#374151;font-size:16px;line-height:1.6;">Dear ${claim.contact_name},</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">
        Thank you for submitting your IEEPA tariff claim. We have received your information and a member of our team will be in touch within <strong>24 hours</strong> with a preliminary assessment.
      </p>
      <div style="background:#f3f4f6;border-radius:6px;padding:20px;margin:24px 0;">
        <p style="color:#6b7280;font-size:13px;font-weight:600;letter-spacing:0.05em;margin:0 0 12px;">SUBMISSION SUMMARY</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151;">
          <tr><td style="padding:4px 0;color:#6b7280;width:40%;">Company</td><td style="padding:4px 0;font-weight:500;">${claim.company_name}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">Reference ID</td><td style="padding:4px 0;font-family:monospace;font-size:12px;">${claim.id}</td></tr>
          ${claim.total_tariff_amount ? `<tr><td style="padding:4px 0;color:#6b7280;">Tariff Amount</td><td style="padding:4px 0;font-weight:500;">$${claim.total_tariff_amount.toLocaleString()}</td></tr>` : ''}
          ${claim.country_of_origin ? `<tr><td style="padding:4px 0;color:#6b7280;">Country of Origin</td><td style="padding:4px 0;">${claim.country_of_origin}</td></tr>` : ''}
        </table>
      </div>
      <p style="color:#374151;font-size:15px;line-height:1.6;">
        <strong>What happens next:</strong>
      </p>
      <ol style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
        <li>Our team reviews your submission and documentation</li>
        <li>We contact you within 24 hours with a preliminary assessment</li>
        <li>If there's a fit, we issue a term sheet within 2–3 business days</li>
        <li>Upon agreement, we close and wire funds within 5 business days</li>
      </ol>
      <p style="color:#374151;font-size:15px;line-height:1.6;">
        All information you have provided is held in strict confidence under our standard NDA. We do not share submission details with third parties.
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;">
        If you have any questions, please reply directly to this email.
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:0;">
        Best regards,<br>
        The IEEPA Claims Fund Team
      </p>
    </div>
    <div style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:0;">
        This communication is for informational purposes only and does not constitute legal advice. Claim purchases are subject to due diligence and documentation review. IEEPA Claims Fund is not a law firm.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  })

  if (error) {
    console.error('[email] Failed to send claim confirmation:', error)
    throw new Error(`Email send failed: ${error.message}`)
  }

  return data
}

// ── Internal notification (to deal team) ─────────────────────

export async function sendInternalClaimNotification(
  claim: ClaimSubmissionPayload & { id: string }
) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[NEW CLAIM] ${claim.company_name} — ${claim.total_tariff_amount ? '$' + claim.total_tariff_amount.toLocaleString() : 'Amount TBD'}`,
    html: `
<h2>New Claim Submission</h2>
<table border="1" cellpadding="8" style="border-collapse:collapse;font-family:monospace;font-size:14px;">
  <tr><td><strong>ID</strong></td><td>${claim.id}</td></tr>
  <tr><td><strong>Company</strong></td><td>${claim.company_name}</td></tr>
  <tr><td><strong>Contact</strong></td><td>${claim.contact_name}</td></tr>
  <tr><td><strong>Email</strong></td><td>${claim.email}</td></tr>
  <tr><td><strong>Phone</strong></td><td>${claim.phone ?? '—'}</td></tr>
  <tr><td><strong>Role</strong></td><td>${claim.role ?? '—'}</td></tr>
  <tr><td><strong>Tariff Amount</strong></td><td>${claim.total_tariff_amount ? '$' + claim.total_tariff_amount.toLocaleString() : '—'}</td></tr>
  <tr><td><strong>Country of Origin</strong></td><td>${claim.country_of_origin ?? '—'}</td></tr>
  <tr><td><strong>Date Range</strong></td><td>${claim.payment_date_start ?? '?'} → ${claim.payment_date_end ?? '?'}</td></tr>
  <tr><td><strong>Entries</strong></td><td>${claim.entries_count ?? '—'}</td></tr>
  <tr><td><strong>HTS Codes</strong></td><td>${claim.hts_codes?.join(', ') ?? '—'}</td></tr>
  <tr><td><strong>NDA Agreed</strong></td><td>${claim.nda_agreed ? 'YES' : 'NO'}</td></tr>
  <tr><td><strong>Referral Source</strong></td><td>${claim.referral_source ?? '—'}</td></tr>
  <tr><td><strong>UTM Source</strong></td><td>${claim.utm_source ?? '—'}</td></tr>
</table>
<br>
<a href="${BASE_URL}/admin/claims/${claim.id}" style="background:#0A1628;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">View in Dashboard →</a>
    `.trim(),
  })

  if (error) {
    console.error('[email] Failed to send internal notification:', error)
  }

  return data
}

// ── Slack notification ────────────────────────────────────────

export async function sendSlackNotification(
  claim: ClaimSubmissionPayload & { id: string }
) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const amount = claim.total_tariff_amount
    ? `$${claim.total_tariff_amount.toLocaleString()}`
    : 'Amount TBD'

  const payload = {
    text: `🎯 *New IEEPA Claim Submission*`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🎯 *New IEEPA Claim Submission*\n*Company:* ${claim.company_name}\n*Contact:* ${claim.contact_name} (${claim.role ?? 'Unknown role'})\n*Email:* ${claim.email}\n*Tariff Amount:* ${amount}\n*Country of Origin:* ${claim.country_of_origin ?? 'Unknown'}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Claim' },
            url: `${BASE_URL}/admin/claims/${claim.id}`,
            style: 'primary',
          },
        ],
      },
    ],
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[slack] Failed to send notification:', err)
  }
}

// ── Contact form acknowledgement ──────────────────────────────

export async function sendContactAck(name: string, email: string) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    reply_to: REPLY_TO,
    subject: 'We received your message',
    html: `
<p>Hi ${name},</p>
<p>Thank you for reaching out. A member of our team will be in touch shortly.</p>
<p>Best regards,<br>The IEEPA Claims Fund Team</p>
<p style="font-size:12px;color:#9ca3af;">This communication is for informational purposes only and does not constitute legal advice.</p>
    `.trim(),
  })

  if (error) {
    console.error('[email] Failed to send contact ack:', error)
  }
}

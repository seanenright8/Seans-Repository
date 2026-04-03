import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase'
import { Resend } from 'resend'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://localhost:3000'

const sendSchema = z.object({
  toEmail: z.string().email(),
  toName: z.string().optional().default(''),
  companyName: z.string().optional().default(''),
  templateId: z.string().uuid(),
  contactId: z.string().uuid().optional(),
  claimId: z.string().uuid().optional(),
})

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = sendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
    }

    const { toEmail, toName, companyName, templateId, contactId, claimId } = parsed.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServiceClient() as any

    // Fetch template
    const { data: template, error: tmplError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (tmplError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const firstName = toName.split(' ')[0] || toName
    const vars: Record<string, string> = {
      first_name: firstName,
      contact_name: toName,
      company_name: companyName,
      base_url: BASE_URL,
      sender_name: 'The IEEPA Claims Fund Team',
      sender_title: 'Acquisitions',
      sender_company: 'IEEPA Claims Fund',
    }

    const subject = interpolate(template.subject, vars)
    const bodyHtml = interpolate(template.body_html, vars)
    const bodyText = interpolate(template.body_text, vars)

    // Insert log entry (scheduled) to get ID for tracking pixel
    const { data: logEntry, error: logError } = await supabase
      .from('outreach_log')
      .insert({
        contact_id: contactId ?? null,
        claim_id: claimId ?? null,
        template_id: templateId,
        sequence_name: template.sequence_name,
        email_number: template.email_number,
        to_email: toEmail,
        subject,
        status: 'scheduled',
      })
      .select('id')
      .single()

    if (logError || !logEntry) {
      return NextResponse.json({ error: 'Failed to create log entry' }, { status: 500 })
    }

    // Append tracking pixel
    const trackingPixel = `<img src="${BASE_URL}/api/track/open/${logEntry.id}" width="1" height="1" style="display:none;" />`
    const htmlWithTracking = bodyHtml + '\n' + trackingPixel

    // Send via Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME ?? 'IEEPA Claims Fund'} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: toEmail,
      subject,
      html: htmlWithTracking,
      text: bodyText,
    })

    if (sendError) {
      await supabase
        .from('outreach_log')
        .update({ status: 'bounced', bounce_reason: sendError.message })
        .eq('id', logEntry.id)
      return NextResponse.json({ error: sendError.message }, { status: 500 })
    }

    // Update with provider ID and sent status
    await supabase
      .from('outreach_log')
      .update({ status: 'sent', sent_at: new Date().toISOString(), provider_id: sendData?.id ?? null })
      .eq('id', logEntry.id)

    return NextResponse.json({ id: logEntry.id, providerId: sendData?.id })
  } catch (err) {
    console.error('[outreach/send]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

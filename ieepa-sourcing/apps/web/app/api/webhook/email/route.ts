import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Resend webhook payload types
interface ResendWebhookEvent {
  type:
    | 'email.sent'
    | 'email.delivered'
    | 'email.opened'
    | 'email.clicked'
    | 'email.bounced'
    | 'email.complained'
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    created_at: string
    click?: { link: string }
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature (Resend sends svix-signature header)
    // For production, verify: https://resend.com/docs/dashboard/webhooks/introduction
    const body: ResendWebhookEvent = await req.json()
    const supabase = createServiceClient()

    const providerId = body.data.email_id
    const now = new Date().toISOString()

    let updateFields: Record<string, string | null> = {}
    let newStatus: string | null = null

    switch (body.type) {
      case 'email.sent':
        newStatus = 'sent'
        updateFields = { sent_at: now }
        break
      case 'email.delivered':
        newStatus = 'delivered'
        updateFields = { delivered_at: now }
        break
      case 'email.opened':
        newStatus = 'opened'
        updateFields = { opened_at: now }
        break
      case 'email.clicked':
        newStatus = 'clicked'
        updateFields = { clicked_at: now }
        break
      case 'email.bounced':
        newStatus = 'bounced'
        updateFields = { bounce_reason: `Bounced at ${now}` }
        break
      default:
        return NextResponse.json({ ok: true })
    }

    if (newStatus) {
      await supabase
        .from('outreach_log')
        .update({ status: newStatus as never, ...updateFields })
        .eq('provider_id', providerId)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhook/email] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase'
import { sendContactAck } from '@/lib/email'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(10, 'Please provide more detail (at least 10 characters)'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 422 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServiceClient() as any
    const { error } = await supabase.from('contact_messages').insert(parsed.data)

    if (error) {
      console.error('[contact] DB error:', error)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    // Non-blocking ack
    sendContactAck(parsed.data.name, parsed.data.email).catch((err) =>
      console.error('[contact] Ack email failed:', err)
    )

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[contact] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

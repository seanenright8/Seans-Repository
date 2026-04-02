import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase'
import { sendClaimConfirmation, sendInternalClaimNotification, sendSlackNotification } from '@/lib/email'

const claimPayloadSchema = z.object({
  company_name: z.string().min(2),
  contact_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.string().optional(),
  total_tariff_amount: z.coerce.number().positive().optional(),
  payment_date_start: z.string().optional(),
  payment_date_end: z.string().optional(),
  hts_codes_raw: z.string().optional(),
  ports_of_entry_raw: z.string().optional(),
  entries_count: z.coerce.number().int().positive().optional(),
  country_of_origin: z.string().optional(),
  nda_agreed: z.boolean(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  referral_source: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? ''
    let rawData: Record<string, unknown>
    const uploadedFilePaths: string[] = []

    const supabase = createServiceClient()

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const dataStr = formData.get('data')
      if (!dataStr || typeof dataStr !== 'string') {
        return NextResponse.json({ error: 'Missing form data' }, { status: 400 })
      }
      rawData = JSON.parse(dataStr)

      // Upload files to Supabase Storage
      const files = formData.getAll('files') as File[]
      for (const file of files) {
        if (!(file instanceof File)) continue
        const ext = file.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const buffer = Buffer.from(await file.arrayBuffer())
        const { error: uploadError } = await supabase.storage
          .from('claim-documents')
          .upload(path, buffer, { contentType: file.type, upsert: false })
        if (!uploadError) {
          uploadedFilePaths.push(path)
        } else {
          console.error('[claims/upload] Storage error:', uploadError)
        }
      }
    } else {
      rawData = await req.json()
    }

    // Validate
    const parsed = claimPayloadSchema.safeParse(rawData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 422 }
      )
    }

    const {
      hts_codes_raw,
      ports_of_entry_raw,
      ...rest
    } = parsed.data

    // Upsert contact record
    const { data: contactRows } = await supabase
      .from('contacts')
      .upsert(
        {
          company_name: rest.company_name,
          contact_name: rest.contact_name,
          email: rest.email,
          phone: rest.phone ?? null,
          title: rest.role ?? null,
          source: 'web_form',
          referral_source: rest.referral_source ?? null,
          utm_source: rest.utm_source ?? null,
          utm_medium: rest.utm_medium ?? null,
          utm_campaign: rest.utm_campaign ?? null,
        },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    // Insert claim
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        contact_id: contactRows?.id ?? null,
        status: 'new',
        company_name: rest.company_name,
        contact_name: rest.contact_name,
        email: rest.email,
        phone: rest.phone ?? null,
        role: rest.role ?? null,
        total_tariff_amount: rest.total_tariff_amount ?? null,
        payment_date_start: rest.payment_date_start ?? null,
        payment_date_end: rest.payment_date_end ?? null,
        hts_codes: hts_codes_raw
          ? hts_codes_raw.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        ports_of_entry: ports_of_entry_raw
          ? ports_of_entry_raw.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        entries_count: rest.entries_count ?? null,
        country_of_origin: rest.country_of_origin ?? null,
        nda_agreed: rest.nda_agreed,
        file_paths: uploadedFilePaths.length > 0 ? uploadedFilePaths : null,
        referral_source: rest.referral_source ?? null,
        utm_source: rest.utm_source ?? null,
        utm_medium: rest.utm_medium ?? null,
        utm_campaign: rest.utm_campaign ?? null,
        activity_log: [
          {
            timestamp: new Date().toISOString(),
            action: 'claim_submitted',
            actor: rest.email,
            detail: 'Submitted via web form',
          },
        ],
      })
      .select('id')
      .single()

    if (claimError || !claim) {
      console.error('[claims] DB insert error:', claimError)
      return NextResponse.json({ error: 'Failed to save claim' }, { status: 500 })
    }

    // Fire notifications (non-blocking)
    const notificationPayload = { ...rest, id: claim.id }
    Promise.allSettled([
      sendClaimConfirmation(notificationPayload),
      sendInternalClaimNotification(notificationPayload),
      sendSlackNotification(notificationPayload),
    ]).catch((err) => console.error('[claims] Notification error:', err))

    return NextResponse.json({ id: claim.id }, { status: 201 })
  } catch (err) {
    console.error('[claims] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Returns all claims for admin (requires service role — protected by middleware)
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('claims')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status as never)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('[claims/GET] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

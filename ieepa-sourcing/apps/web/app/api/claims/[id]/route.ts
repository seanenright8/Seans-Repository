import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase'

const patchSchema = z.object({
  status: z
    .enum(['new', 'reviewing', 'quoted', 'negotiating', 'closed_won', 'closed_lost'])
    .optional(),
  assigned_to: z.string().email().optional(),
  internal_notes: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 422 }
      )
    }

    const supabase = createServiceClient()

    // Fetch current claim to append activity log entry
    const { data: existing } = await supabase
      .from('claims')
      .select('activity_log, status')
      .eq('id', params.id)
      .single()

    const activityLog = Array.isArray(existing?.activity_log) ? existing.activity_log : []
    const updates: Record<string, unknown> = { ...parsed.data }

    if (parsed.data.status && parsed.data.status !== existing?.status) {
      activityLog.push({
        timestamp: new Date().toISOString(),
        action: 'status_changed',
        actor: 'admin',
        detail: `${existing?.status} → ${parsed.data.status}`,
      })
      updates.activity_log = activityLog
    }

    const { data, error } = await supabase
      .from('claims')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[claims/PATCH] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[claims/GET/:id] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

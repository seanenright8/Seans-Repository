import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServiceClient() as any
    const { data, error } = await supabase
      .from('outreach_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('[outreach/logs]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

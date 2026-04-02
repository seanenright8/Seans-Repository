import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServiceClient()
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

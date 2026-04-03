import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServiceClient() as any
    const { data, error } = await supabase
      .from('monitor_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('[monitor/alerts]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

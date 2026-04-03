import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServiceClient() as any
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('sequence_name')
      .order('email_number')

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('[outreach/templates]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

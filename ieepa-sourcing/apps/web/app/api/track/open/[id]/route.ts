import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    const now = new Date().toISOString()

    await supabase
      .from('outreach_log')
      .update({ status: 'opened', opened_at: now })
      .eq('id', params.id)
      .is('opened_at', null) // only update if not already opened
  } catch (err) {
    console.error('[track/open] Error:', err)
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      Pragma: 'no-cache',
    },
  })
}

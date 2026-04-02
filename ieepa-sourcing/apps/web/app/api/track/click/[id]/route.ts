import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url)
  const dest = searchParams.get('url')

  try {
    const supabase = createServiceClient()
    const now = new Date().toISOString()

    await supabase
      .from('outreach_log')
      .update({ status: 'clicked', clicked_at: now })
      .eq('id', params.id)
      .is('clicked_at', null)
  } catch (err) {
    console.error('[track/click] Error:', err)
  }

  if (!dest) {
    return NextResponse.redirect(
      new URL('/', process.env.NEXT_PUBLIC_BASE_URL ?? 'https://localhost:3000')
    )
  }

  // Only redirect to same-origin or trusted destinations
  try {
    const url = new URL(dest)
    const base = new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://localhost:3000')
    if (url.hostname === base.hostname) {
      return NextResponse.redirect(url)
    }
  } catch {
    // invalid URL — fall through to home
  }

  return NextResponse.redirect(
    new URL('/', process.env.NEXT_PUBLIC_BASE_URL ?? 'https://localhost:3000')
  )
}

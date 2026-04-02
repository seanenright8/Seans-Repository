'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, ExternalLink, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Claim, ClaimStatus } from '@shared/types'

const STATUSES: ClaimStatus[] = [
  'new', 'reviewing', 'quoted', 'negotiating', 'closed_won', 'closed_lost',
]

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border last:border-0">
      <dt className="text-xs text-muted-foreground font-medium col-span-1">{label}</dt>
      <dd className="text-sm col-span-2 break-words">{String(value)}</dd>
    </div>
  )
}

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [signedUrls, setSignedUrls] = useState<{ path: string; url: string }[]>([])

  useEffect(() => {
    fetch(`/api/claims/${id}`)
      .then((r) => r.json())
      .then((data: Claim) => {
        setClaim(data)
        setNotes(data.internal_notes ?? '')
        // Fetch signed URLs if there are files
        if (data.file_paths?.length) {
          fetchSignedUrls(data.file_paths)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const fetchSignedUrls = async (paths: string[]) => {
    try {
      const res = await fetch(`/api/claims/${id}/signed-urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths }),
      })
      if (res.ok) {
        const data = await res.json()
        setSignedUrls(data)
      }
    } catch (err) {
      console.error('Failed to fetch signed URLs:', err)
    }
  }

  const updateStatus = async (status: ClaimStatus) => {
    if (!claim) return
    const res = await fetch(`/api/claims/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setClaim(updated)
    }
  }

  const saveNotes = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internal_notes: notes }),
      })
      if (res.ok) {
        setSavedOk(true)
        setTimeout(() => setSavedOk(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm p-6">
        Loading claim…
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Claim not found.</p>
        <Link href="/admin" className="text-sm text-navy-500 underline mt-2 inline-block">
          Back to pipeline
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-navy-500">{claim.company_name}</h1>
            <Badge variant={claim.status as ClaimStatus}>
              {claim.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Submitted {formatDate(claim.created_at)} · ID:{' '}
            <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{claim.id}</code>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">
          {/* Claim Summary */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-navy-500 mb-4 uppercase tracking-wide">Claim Details</h2>
            <dl>
              <InfoRow label="Contact" value={claim.contact_name} />
              <InfoRow label="Email" value={claim.email} />
              <InfoRow label="Phone" value={claim.phone} />
              <InfoRow label="Role" value={claim.role} />
              <InfoRow
                label="Tariff Amount"
                value={claim.total_tariff_amount ? formatCurrency(claim.total_tariff_amount) : null}
              />
              <InfoRow label="Country of Origin" value={claim.country_of_origin} />
              <InfoRow label="Date Range" value={
                claim.payment_date_start
                  ? `${claim.payment_date_start} → ${claim.payment_date_end ?? '?'}`
                  : null
              } />
              <InfoRow label="Entries" value={claim.entries_count} />
              <InfoRow label="HTS Codes" value={claim.hts_codes?.join(', ')} />
              <InfoRow label="Ports of Entry" value={claim.ports_of_entry?.join(', ')} />
              <InfoRow label="NDA Agreed" value={claim.nda_agreed ? 'Yes' : 'No'} />
              <InfoRow label="Referral Source" value={claim.referral_source} />
              <InfoRow label="UTM Source" value={claim.utm_source} />
            </dl>
          </div>

          {/* Documents */}
          {(claim.file_paths?.length ?? 0) > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-navy-500 mb-4 uppercase tracking-wide">Documents</h2>
              <ul className="space-y-2">
                {claim.file_paths?.map((path) => {
                  const signed = signedUrls.find((s) => s.path === path)
                  const filename = path.split('/').pop() ?? path
                  return (
                    <li key={path} className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate flex-1">{filename}</span>
                      {signed && (
                        <a
                          href={signed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gold-500 hover:underline flex items-center gap-1"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Internal Notes */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-navy-500 uppercase tracking-wide">Internal Notes</h2>
              <Button size="sm" variant="outline" onClick={saveNotes} disabled={saving}>
                <Save className="h-3.5 w-3.5 mr-1" />
                {savedOk ? 'Saved!' : saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes, call summaries, next steps…"
              className="min-h-[120px] text-sm"
            />
          </div>

          {/* Activity Log */}
          {claim.activity_log?.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-navy-500 mb-4 uppercase tracking-wide">Activity Log</h2>
              <ul className="space-y-3">
                {[...claim.activity_log].reverse().map((entry, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="text-muted-foreground text-xs shrink-0 mt-0.5">
                      {formatDate(entry.timestamp)}
                    </span>
                    <span>
                      <strong>{entry.action.replace(/_/g, ' ')}</strong>
                      {entry.detail && <span className="text-muted-foreground"> — {entry.detail}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h2 className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-3">Update Status</h2>
            <div className="space-y-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    claim.status === s
                      ? 'bg-navy-500 text-white font-medium'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-xl border border-border p-4 space-y-3">
            <h2 className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Quick Info</h2>
            {claim.assigned_to && (
              <div>
                <p className="text-xs text-muted-foreground">Assigned to</p>
                <p className="text-sm font-medium">{claim.assigned_to}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="text-sm">{formatDate(claim.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last updated</p>
              <p className="text-sm">{formatDate(claim.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

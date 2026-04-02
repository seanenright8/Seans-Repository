'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { Claim, OutreachLog } from '@shared/types'

const STATUS_ORDER = ['new', 'reviewing', 'quoted', 'negotiating', 'closed_won']
const COLORS = ['#3b82f6', '#eab308', '#a855f7', '#f97316', '#22c55e']

export default function AnalyticsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [outreach, setOutreach] = useState<OutreachLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/claims').then((r) => r.json()),
      fetch('/api/outreach/logs').then((r) => r.json()),
    ])
      .then(([claimsData, outreachData]) => {
        setClaims(claimsData)
        setOutreach(outreachData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Submissions over time (last 30 days)
  const submissionsOverTime = (() => {
    const now = new Date()
    const days: { date: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days.push({
        date: key.slice(5), // MM-DD
        count: claims.filter((c) => c.created_at.slice(0, 10) === key).length,
      })
    }
    return days
  })()

  // Funnel
  const funnelData = STATUS_ORDER.map((s, i) => ({
    name: s.replace('_', ' '),
    value: claims.filter((c) => c.status === s || (s === 'new' && ['reviewing','quoted','negotiating','closed_won','closed_lost'].includes(c.status))).length,
    fill: COLORS[i],
  }))
  // Re-calculate as cumulative (funnel)
  const funnelCumulative = STATUS_ORDER.map((s) => ({
    name: s.replace('_', ' '),
    value: claims.filter((c) => {
      const idx = STATUS_ORDER.indexOf(c.status)
      const thisIdx = STATUS_ORDER.indexOf(s)
      return idx >= thisIdx || (s === 'new')
    }).length,
  }))
  // Simple approach: just count per status ≥ current
  const realFunnel = [
    { name: 'Submitted', value: claims.length, fill: '#3b82f6' },
    { name: 'Reviewing', value: claims.filter(c => ['reviewing','quoted','negotiating','closed_won'].includes(c.status)).length, fill: '#eab308' },
    { name: 'Quoted', value: claims.filter(c => ['quoted','negotiating','closed_won'].includes(c.status)).length, fill: '#a855f7' },
    { name: 'Negotiating', value: claims.filter(c => ['negotiating','closed_won'].includes(c.status)).length, fill: '#f97316' },
    { name: 'Closed Won', value: claims.filter(c => c.status === 'closed_won').length, fill: '#22c55e' },
  ]

  // Outreach performance
  const outreachBySeq = ['sequence_a', 'sequence_b', 'sequence_c'].map((seq) => {
    const seqLogs = outreach.filter((l) => l.sequence_name === seq)
    return {
      name: seq.replace('sequence_', 'Seq ').toUpperCase(),
      sent: seqLogs.filter((l) => l.status !== 'scheduled').length,
      opened: seqLogs.filter((l) => ['opened','clicked','replied'].includes(l.status)).length,
      replied: seqLogs.filter((l) => l.status === 'replied').length,
    }
  })

  // Pipeline value
  const pipelineByStatus = STATUS_ORDER.slice(0, 4).map((s) => ({
    name: s.replace('_', ' '),
    value: claims.filter((c) => c.status === s).reduce((sum, c) => sum + (c.total_tariff_amount ?? 0), 0),
  }))

  const totalPipeline = claims
    .filter(c => !['closed_lost'].includes(c.status))
    .reduce((sum, c) => sum + (c.total_tariff_amount ?? 0), 0)

  const closedWonValue = claims
    .filter(c => c.status === 'closed_won')
    .reduce((sum, c) => sum + (c.total_tariff_amount ?? 0), 0)

  if (loading) {
    return <div className="p-6 text-muted-foreground text-sm">Loading analytics…</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-500">Analytics</h1>
        <p className="text-sm text-muted-foreground">Pipeline performance and outreach metrics</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Submissions', value: claims.length },
          { label: 'Active Pipeline', value: formatCurrency(totalPipeline) },
          { label: 'Closed Won Value', value: formatCurrency(closedWonValue) },
          { label: 'Emails Sent', value: outreach.filter(l => l.status !== 'scheduled').length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-navy-500">{value}</p>
          </div>
        ))}
      </div>

      {/* Submissions over time */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-navy-500 mb-4">Submissions (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={submissionsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Bar dataKey="count" fill="#0A1628" radius={[3, 3, 0, 0]} name="Claims" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Conversion funnel */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-navy-500 mb-4">Conversion Funnel</h2>
          <div className="space-y-2">
            {realFunnel.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-24 text-xs text-muted-foreground capitalize shrink-0">{item.name}</div>
                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: claims.length > 0 ? `${(item.value / claims.length) * 100}%` : '0%',
                      backgroundColor: COLORS[i],
                    }}
                  />
                </div>
                <div className="w-8 text-xs font-semibold text-right">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline value by stage */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-navy-500 mb-4">Pipeline Value by Stage (USD)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pipelineByStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
              <Bar dataKey="value" fill="#C9A84C" radius={[0, 3, 3, 0]} name="Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Outreach performance */}
        <div className="bg-white rounded-xl border border-border p-5 md:col-span-2">
          <h2 className="text-sm font-semibold text-navy-500 mb-4">Outreach Performance by Sequence</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={outreachBySeq}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
              <Bar dataKey="sent" fill="#0A1628" name="Sent" radius={[3,3,0,0]} />
              <Bar dataKey="opened" fill="#C9A84C" name="Opened" radius={[3,3,0,0]} />
              <Bar dataKey="replied" fill="#22c55e" name="Replied" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

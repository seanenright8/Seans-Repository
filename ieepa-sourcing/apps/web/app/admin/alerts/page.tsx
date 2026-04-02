'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, RefreshCw, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { MonitorAlert, MonitorSource } from '@shared/types'

const SOURCE_LABELS: Record<MonitorSource, string> = {
  federal_register: 'Federal Register',
  cit_cases: 'CIT Cases',
  news: 'News',
  sec_edgar: 'SEC EDGAR',
}

const SOURCE_COLORS: Record<MonitorSource, string> = {
  federal_register: 'bg-blue-100 text-blue-800',
  cit_cases: 'bg-purple-100 text-purple-800',
  news: 'bg-yellow-100 text-yellow-800',
  sec_edgar: 'bg-green-100 text-green-800',
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<MonitorAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<MonitorSource | 'all'>('all')

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/monitor/alerts')
      if (res.ok) setAlerts(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAlerts() }, [])

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.source === filter)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">Market Intelligence Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Automated monitoring: Federal Register, CIT filings, News, SEC EDGAR
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'federal_register', 'cit_cases', 'news', 'sec_edgar'] as const).map((src) => (
          <button
            key={src}
            onClick={() => setFilter(src)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === src
                ? 'bg-navy-500 text-white'
                : 'bg-white border border-border text-muted-foreground hover:border-navy-500'
            }`}
          >
            {src === 'all' ? 'All' : SOURCE_LABELS[src]}
            {src !== 'all' && (
              <span className="ml-1 opacity-60">
                ({alerts.filter((a) => a.source === src).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Loading alerts…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <Bell className="h-8 w-8 mb-3 opacity-30" />
          <p className="text-sm">No alerts yet. Monitors will populate this page automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border border-border p-4 ${!alert.notified ? 'border-l-4 border-l-gold-400' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SOURCE_COLORS[alert.source]}`}>
                      {SOURCE_LABELS[alert.source]}
                    </span>
                    {!alert.notified && (
                      <span className="text-xs text-gold-600 font-medium">New</span>
                    )}
                  </div>
                  <p className="font-medium text-sm text-navy-500 mb-1">{alert.title}</p>
                  {alert.summary && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {alert.summary}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-xs text-muted-foreground">{formatDate(alert.created_at)}</p>
                  {alert.url && (
                    <a
                      href={alert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-gold-500 hover:underline"
                    >
                      Source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

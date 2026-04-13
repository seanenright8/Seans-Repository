'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, RefreshCw, Bell, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

// ── Sourcing databases ─────────────────────────────────────────

const DATABASES = [
  {
    category: 'Government / Regulatory',
    items: [
      {
        name: 'Federal Register',
        description: 'IEEPA executive orders, tariff notices, rulemaking',
        url: 'https://www.federalregister.gov/documents/search?conditions%5Bterm%5D=IEEPA',
      },
      {
        name: 'CBP Rulings (CROSS)',
        description: 'Customs classification & tariff rulings database',
        url: 'https://rulings.cbp.gov/search?term=IEEPA',
      },
      {
        name: 'USITC Tariff Database',
        description: 'HTS codes, duty rates, tariff schedules',
        url: 'https://hts.usitc.gov',
      },
      {
        name: 'USTR Tariff Actions',
        description: 'Official IEEPA / Section 301 tariff action list',
        url: 'https://ustr.gov/issue-areas/enforcement/section-301-investigations',
      },
    ],
  },
  {
    category: 'Court Filings (CIT)',
    items: [
      {
        name: 'CIT PACER',
        description: 'Court of International Trade — active IEEPA litigation',
        url: 'https://ecf.cit.uscourts.gov',
      },
      {
        name: 'CourtListener (Free CIT Search)',
        description: 'Free full-text search of CIT opinions & filings',
        url: 'https://www.courtlistener.com/?q=IEEPA&type=o&order_by=score+desc&court=cit',
      },
      {
        name: 'Justia CIT Opinions',
        description: 'Free searchable CIT case archive',
        url: 'https://law.justia.com/cases/federal/appellate-courts/cafc/?q=IEEPA',
      },
    ],
  },
  {
    category: 'SEC / Corporate Disclosures',
    items: [
      {
        name: 'SEC EDGAR Full-Text Search',
        description: 'Search 10-Ks, 10-Qs for tariff / IEEPA disclosures',
        url: 'https://efts.sec.gov/LATEST/search-index?q=%22IEEPA%22&dateRange=custom&startdt=2025-01-01&forms=10-K,10-Q',
      },
      {
        name: 'SEC EDGAR Company Search',
        description: 'Browse filings by company or CIK',
        url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=10-K&dateb=&owner=include&count=40',
      },
    ],
  },
  {
    category: 'Import Trade Data',
    items: [
      {
        name: 'USA Trade Online (Census)',
        description: 'Official US import/export statistics by HTS code & country',
        url: 'https://usatrade.census.gov',
      },
      {
        name: 'ImportGenius',
        description: 'Bill of lading data — find importers by product/country',
        url: 'https://www.importgenius.com',
      },
      {
        name: 'Panjiva (S&P Global)',
        description: 'Global trade intelligence & importer profiles',
        url: 'https://panjiva.com',
      },
      {
        name: 'CBP Trade Statistics',
        description: 'Official CBP trade & tariff revenue data',
        url: 'https://www.cbp.gov/trade/trade-enforcement/tftea/trade-statistics',
      },
    ],
  },
  {
    category: 'News & Intelligence',
    items: [
      {
        name: 'Reuters Trade News',
        description: 'Breaking tariff and trade policy coverage',
        url: 'https://www.reuters.com/business/trade/',
      },
      {
        name: 'Politico Trade',
        description: 'DC trade policy intelligence',
        url: 'https://www.politico.com/trade',
      },
      {
        name: 'Inside US Trade',
        description: 'Premium trade policy newsletter (subscription)',
        url: 'https://insidetrade.com',
      },
      {
        name: 'Trade Compliance Resource (Sandler Travis)',
        description: 'Tariff engineering & customs compliance news',
        url: 'https://www.strtrade.com/news-publications',
      },
    ],
  },
]

// ── Component ──────────────────────────────────────────────────

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<MonitorAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<MonitorSource | 'all'>('all')
  const [activeTab, setActiveTab] = useState<'alerts' | 'sources'>('alerts')

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
          <h1 className="text-2xl font-bold text-navy-500">Market Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Automated alerts + direct links to sourcing databases
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'alerts' && (
            <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'alerts'
              ? 'border-navy-500 text-navy-500'
              : 'border-transparent text-muted-foreground hover:text-navy-500'
          }`}
        >
          <Bell className="h-3.5 w-3.5 inline mr-1.5" />
          Alerts {alerts.length > 0 && `(${alerts.length})`}
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sources'
              ? 'border-navy-500 text-navy-500'
              : 'border-transparent text-muted-foreground hover:text-navy-500'
          }`}
        >
          <Database className="h-3.5 w-3.5 inline mr-1.5" />
          Source Databases
        </button>
      </div>

      {/* ── Alerts tab ── */}
      {activeTab === 'alerts' && (
        <>
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
              <button
                onClick={() => setActiveTab('sources')}
                className="mt-3 text-xs text-gold-500 hover:underline"
              >
                Browse source databases manually →
              </button>
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
        </>
      )}

      {/* ── Source Databases tab ── */}
      {activeTab === 'sources' && (
        <div className="space-y-8">
          {DATABASES.map((group) => (
            <div key={group.category}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {group.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.map((db) => (
                  <a
                    key={db.name}
                    href={db.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 bg-white border border-border rounded-xl p-4 hover:border-gold-400 hover:shadow-sm transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-500 group-hover:text-gold-600 transition-colors">
                        {db.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {db.description}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gold-500 shrink-0 mt-0.5 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Send, Clock, CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'
import type { OutreachLog, EmailTemplate } from '@shared/types'

const SEQUENCE_LABELS: Record<string, string> = {
  sequence_a: 'Sequence A — Cold Importer',
  sequence_b: 'Sequence B — Warm Intermediary',
  sequence_c: 'Sequence C — Re-engagement',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  scheduled: <Clock className="h-3.5 w-3.5 text-gray-400" />,
  sent: <Send className="h-3.5 w-3.5 text-blue-500" />,
  delivered: <CheckCircle className="h-3.5 w-3.5 text-blue-500" />,
  opened: <Mail className="h-3.5 w-3.5 text-green-500" />,
  clicked: <CheckCircle className="h-3.5 w-3.5 text-green-600" />,
  bounced: <XCircle className="h-3.5 w-3.5 text-red-500" />,
  replied: <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />,
}

export default function OutreachPage() {
  const [logs, setLogs] = useState<OutreachLog[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [composing, setComposing] = useState(false)

  // Compose form state
  const [toEmail, setToEmail] = useState('')
  const [toName, setToName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [logsRes, templatesRes] = await Promise.all([
        fetch('/api/outreach/logs'),
        fetch('/api/outreach/templates'),
      ])
      if (logsRes.ok) setLogs(await logsRes.json())
      if (templatesRes.ok) setTemplates(await templatesRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSend = async () => {
    if (!toEmail || !selectedTemplate) return
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail, toName, companyName, templateId: selectedTemplate }),
      })
      const json = await res.json()
      if (res.ok) {
        setSendResult('Email sent successfully!')
        setToEmail('')
        setToName('')
        setCompanyName('')
        setSelectedTemplate('')
        fetchData()
      } else {
        setSendResult(`Error: ${json.error}`)
      }
    } catch {
      setSendResult('Failed to send email.')
    } finally {
      setSending(false)
    }
  }

  const stats = {
    total: logs.length,
    sent: logs.filter((l) => l.status !== 'scheduled').length,
    opened: logs.filter((l) => ['opened', 'clicked', 'replied'].includes(l.status)).length,
    replied: logs.filter((l) => l.status === 'replied').length,
  }
  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : '—'
  const replyRate = stats.sent > 0 ? ((stats.replied / stats.sent) * 100).toFixed(1) : '—'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">Outreach</h1>
          <p className="text-sm text-muted-foreground">Manage email sequences and track engagement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setComposing(!composing)}>
            <Send className="h-4 w-4 mr-1" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Sent', value: stats.sent },
          { label: 'Open Rate', value: `${openRate}%` },
          { label: 'Reply Rate', value: `${replyRate}%` },
          { label: 'Scheduled', value: logs.filter((l) => l.status === 'scheduled').length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-navy-500">{value}</p>
          </div>
        ))}
      </div>

      {/* Compose panel */}
      {composing && (
        <div className="bg-white rounded-xl border border-border p-5 mb-6">
          <h2 className="text-sm font-semibold text-navy-500 mb-4">Send from Template</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label>To Email *</Label>
              <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="recipient@company.com" className="mt-1" />
            </div>
            <div>
              <Label>Recipient Name</Label>
              <Input value={toName} onChange={(e) => setToName(e.target.value)} placeholder="Jane Smith" className="mt-1" />
            </div>
            <div>
              <Label>Company Name</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Imports Inc." className="mt-1" />
            </div>
            <div>
              <Label>Template *</Label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          {sendResult && (
            <p className={`text-sm mb-3 ${sendResult.startsWith('Error') ? 'text-destructive' : 'text-green-600'}`}>
              {sendResult}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={sending || !toEmail || !selectedTemplate}>
              {sending ? 'Sending…' : 'Send Now'}
            </Button>
            <Button variant="outline" onClick={() => setComposing(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Log table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-navy-500">Send Log</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">To</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sequence</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sent</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No emails sent yet.</td></tr>
            ) : (
              logs.slice(0, 100).map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">{log.to_email}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">{log.subject}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {SEQUENCE_LABELS[log.sequence_name] ?? log.sequence_name} #{log.email_number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {STATUS_ICONS[log.status]}
                      <span className="capitalize text-xs">{log.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {log.sent_at ? formatDate(log.sent_at) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

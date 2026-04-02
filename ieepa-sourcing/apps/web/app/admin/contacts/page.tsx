'use client'

import { useState, useEffect } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Contact } from '@shared/types'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      setContacts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContacts() }, [])

  const filtered = contacts.filter(
    (c) =>
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contact_name?.toLowerCase().includes(search.toLowerCase())) ||
      (c.email?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">Contacts</h1>
          <p className="text-sm text-muted-foreground">{contacts.length} total contacts</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchContacts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, name, or email…"
          className="pl-9"
        />
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Company</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Referral</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Added</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  Loading contacts…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  {search ? 'No contacts match your search.' : 'No contacts yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((contact) => (
                <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{contact.company_name}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p>{contact.contact_name ?? '—'}</p>
                      {contact.title && (
                        <p className="text-xs text-muted-foreground">{contact.title}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{contact.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    {contact.source && (
                      <Badge variant="outline" className="text-xs">{contact.source}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {contact.referral_source ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(contact.created_at)}
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

'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Claim, ClaimStatus } from '@shared/types'
import Link from 'next/link'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COLUMNS: { id: ClaimStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'bg-blue-50 border-blue-200' },
  { id: 'reviewing', label: 'Reviewing', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'quoted', label: 'Quoted', color: 'bg-purple-50 border-purple-200' },
  { id: 'negotiating', label: 'Negotiating', color: 'bg-orange-50 border-orange-200' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-green-50 border-green-200' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'bg-red-50 border-red-200' },
]

function ClaimCard({ claim, isDragging = false }: { claim: Claim; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: claim.id })
  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg border border-border p-3 shadow-sm cursor-grab active:cursor-grabbing select-none transition-shadow ${isDragging ? 'shadow-lg opacity-80' : 'hover:shadow-md'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/admin/claims/${claim.id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-medium text-sm text-navy-500 hover:underline leading-tight"
        >
          {claim.company_name}
        </Link>
        <Badge variant={claim.status as ClaimStatus} className="text-xs shrink-0">
          {claim.status.replace('_', ' ')}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-2 truncate">{claim.contact_name}</p>
      {claim.total_tariff_amount && (
        <p className="text-xs font-semibold text-green-700">
          {formatCurrency(claim.total_tariff_amount)}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-1.5">{formatDate(claim.created_at)}</p>
    </div>
  )
}

function KanbanColumn({
  status,
  label,
  color,
  claims,
}: {
  status: ClaimStatus
  label: string
  color: string
  claims: Claim[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const total = claims
    .filter((c) => c.total_tariff_amount)
    .reduce((sum, c) => sum + (c.total_tariff_amount ?? 0), 0)

  return (
    <div className="flex flex-col min-w-[220px] max-w-[240px]">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </h3>
          <span className="text-xs bg-muted rounded-full px-1.5 py-0.5 font-medium">
            {claims.length}
          </span>
        </div>
        {total > 0 && (
          <span className="text-xs text-green-700 font-medium">{formatCurrency(total)}</span>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl border-2 p-2 space-y-2 min-h-[400px] transition-colors kanban-column overflow-y-auto ${color} ${isOver ? 'border-gold-400 bg-gold-400/5' : ''}`}
      >
        {claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
        {claims.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50">
            No claims
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPipelinePage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const fetchClaims = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/claims')
      const data = await res.json()
      setClaims(data)
    } catch (err) {
      console.error('Failed to fetch claims:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClaims() }, [])

  const activeClaim = claims.find((c) => c.id === activeId)

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string)
  }

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const newStatus = over.id as ClaimStatus
    const claimId = active.id as string

    // Optimistic update
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: newStatus } : c))
    )

    try {
      await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (err) {
      console.error('Failed to update status:', err)
      fetchClaims() // revert on error
    }
  }

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = claims.filter((c) => c.status === col.id)
    return acc
  }, {} as Record<ClaimStatus, Claim[]>)

  const totalPipeline = claims
    .filter((c) => !['closed_won', 'closed_lost'].includes(c.status))
    .reduce((sum, c) => sum + (c.total_tariff_amount ?? 0), 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">Claims Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {claims.length} total claims ·{' '}
            {totalPipeline > 0 && (
              <span className="text-green-700 font-medium">
                {formatCurrency(totalPipeline)} in active pipeline
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchClaims} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          Loading claims…
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6">
            {COLUMNS.map(({ id, label, color }) => (
              <KanbanColumn
                key={id}
                status={id}
                label={label}
                color={color}
                claims={grouped[id] ?? []}
              />
            ))}
          </div>
          <DragOverlay>
            {activeClaim && <ClaimCard claim={activeClaim} isDragging />}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}

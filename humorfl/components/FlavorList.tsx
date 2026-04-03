'use client'

import { useState } from 'react'
import { FlavorCard } from './FlavorCard'
import { FlavorForm } from './FlavorForm'
import type { HumorFlavor } from '@/lib/types'

interface FlavorWithCount extends HumorFlavor {
  step_count: number
}

interface FlavorListProps {
  flavors: FlavorWithCount[]
}

const PAGE_SIZE = 10

export function FlavorList({ flavors }: FlavorListProps) {
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const filtered = flavors.filter((f) => {
    const q = search.toLowerCase()
    return f.slug.toLowerCase().includes(q) || (f.description ?? '').toLowerCase().includes(q)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div>
          <h1
            className="label-cyber"
            style={{ fontSize: '18px', color: 'var(--neon-cyan)', letterSpacing: '0.12em', marginBottom: '4px' }}
          >
            FLAVOR CHAINS
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {flavors.length} {flavors.length === 1 ? 'flavor' : 'flavors'} configured
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-solid-cyan">
          + NEW FLAVOR
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="input-cyber"
          placeholder="Search flavors..."
        />
      </div>

      {/* Grid */}
      {flavors.length === 0 ? (
        <div
          className="cyber-card"
          style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}
        >
          <p className="label-cyber" style={{ marginBottom: '8px' }}>NO FLAVORS YET</p>
          <p style={{ fontSize: '13px' }}>Create your first humor flavor to get started.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="cyber-card"
          style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}
        >
          <p className="label-cyber" style={{ marginBottom: '8px' }}>NO RESULTS</p>
          <p style={{ fontSize: '13px' }}>No flavors match &quot;{search}&quot;.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '12px' }}>
            {paginated.map((flavor) => (
              <FlavorCard
                key={flavor.id}
                flavor={flavor}
                stepCount={flavor.step_count}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '20px',
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-solid-cyan"
                style={{ opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
              >
                ← PREV
              </button>
              <span
                className="label-cyber"
                style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}
              >
                PAGE {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="btn-solid-cyan"
                style={{ opacity: page === totalPages - 1 ? 0.4 : 1, cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer' }}
              >
                NEXT →
              </button>
            </div>
          )}
        </>
      )}

      {showNew && <FlavorForm onClose={() => setShowNew(false)} />}
    </div>
  )
}

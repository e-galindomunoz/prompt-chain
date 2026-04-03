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

export function FlavorList({ flavors }: FlavorListProps) {
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = flavors.filter((f) => {
    const q = search.toLowerCase()
    return f.slug.toLowerCase().includes(q) || (f.description ?? '').toLowerCase().includes(q)
  })

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
          onChange={(e) => setSearch(e.target.value)}
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
        <div style={{ display: 'grid', gap: '12px' }}>
          {filtered.map((flavor) => (
            <FlavorCard
              key={flavor.id}
              flavor={flavor}
              stepCount={flavor.step_count}
            />
          ))}
        </div>
      )}

      {showNew && <FlavorForm onClose={() => setShowNew(false)} />}
    </div>
  )
}

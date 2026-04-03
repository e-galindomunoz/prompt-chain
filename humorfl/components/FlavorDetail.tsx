'use client'

import { useState } from 'react'
import Link from 'next/link'
import { StepCard } from './StepCard'
import { StepForm } from './StepForm'
import { FlavorForm } from './FlavorForm'
import type { HumorFlavor, HumorFlavorStep, LlmModel } from '@/lib/types'

interface FlavorDetailProps {
  flavor: HumorFlavor
  steps: HumorFlavorStep[]
  models: LlmModel[]
}

export function FlavorDetail({ flavor, steps, models }: FlavorDetailProps) {
  const [showAddStep, setShowAddStep] = useState(false)
  const [showEditFlavor, setShowEditFlavor] = useState(false)

  const sortedSteps = [...steps].sort((a, b) => a.order_by - b.order_by)
  const nextOrderBy = sortedSteps.length > 0
    ? Math.max(...sortedSteps.map((s) => s.order_by)) + 1
    : 1

  return (
    <div>
      {/* Back */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/dashboard/flavors"
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontFamily: 'var(--font-geist-mono, monospace)',
            letterSpacing: '0.05em',
          }}
        >
          ← FLAVOR CHAINS
        </Link>
      </div>

      {/* Flavor header */}
      <div
        className="cyber-card"
        style={{ padding: '24px', marginBottom: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span
                className="cyber-tag"
                style={{
                  background: 'rgba(0,255,143,0.08)',
                  border: '1px solid rgba(0,255,143,0.3)',
                  color: 'var(--neon-cyan)',
                  fontSize: '13px',
                  padding: '3px 10px',
                }}
              >
                {flavor.slug}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                ID: {flavor.id}
              </span>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6, opacity: flavor.description ? 1 : 0.4 }}>
              {flavor.description || 'No description.'}
            </p>
          </div>
          <button
            onClick={() => setShowEditFlavor(true)}
            className="btn-cyber"
            style={{ fontSize: '11px', padding: '6px 14px', flexShrink: 0 }}
          >
            EDIT
          </button>
        </div>
      </div>

      {/* Steps section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2
          className="label-cyber"
          style={{ color: 'var(--neon-cyan)', fontSize: '13px', letterSpacing: '0.12em' }}
        >
          PROMPT STEPS ({sortedSteps.length})
        </h2>
        <button onClick={() => setShowAddStep(true)} className="btn-solid-cyan" style={{ fontSize: '11px', padding: '6px 16px' }}>
          + ADD STEP
        </button>
      </div>

      {sortedSteps.length === 0 ? (
        <div
          className="cyber-card"
          style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}
        >
          <p className="label-cyber" style={{ marginBottom: '8px', fontSize: '12px' }}>NO STEPS YET</p>
          <p style={{ fontSize: '13px' }}>Add your first prompt step to build the chain.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {sortedSteps.map((step) => (
            <StepCard key={step.id} step={step} steps={steps} flavorId={flavor.id} models={models} />
          ))}
        </div>
      )}

      {showAddStep && (
        <StepForm
          flavorId={flavor.id}
          nextOrderBy={nextOrderBy}
          models={models}
          onClose={() => setShowAddStep(false)}
        />
      )}
      {showEditFlavor && (
        <FlavorForm flavor={flavor} onClose={() => setShowEditFlavor(false)} />
      )}
    </div>
  )
}

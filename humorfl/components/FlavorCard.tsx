'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FlavorForm } from './FlavorForm'
import type { HumorFlavor } from '@/lib/types'

interface FlavorCardProps {
  flavor: HumorFlavor
  stepCount: number
}

export function FlavorCard({ flavor, stepCount }: FlavorCardProps) {
  const router = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    const supabase = createClient()
    // Delete steps first to satisfy FK constraint
    await supabase.from('humor_flavor_steps').delete().eq('humor_flavor_id', flavor.id)
    await supabase.from('humor_flavors').delete().eq('id', flavor.id)
    router.refresh()
  }

  return (
    <>
      <div className="cyber-card" style={{ padding: '20px 24px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              className="cyber-tag"
              style={{
                background: 'rgba(0,255,143,0.08)',
                border: '1px solid rgba(0,255,143,0.3)',
                color: 'var(--neon-cyan)',
              }}
            >
              {flavor.slug}
            </span>
            <span
              className="cyber-tag"
              style={{
                background: 'rgba(191,0,255,0.08)',
                border: '1px solid rgba(191,0,255,0.25)',
                color: 'var(--neon-purple)',
              }}
            >
              {stepCount} {stepCount === 1 ? 'STEP' : 'STEPS'}
            </span>
          </div>
          <span
            style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-geist-mono, monospace)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            #{flavor.id}
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            color: 'var(--text-primary)',
            fontSize: '14px',
            lineHeight: 1.6,
            marginBottom: '16px',
            opacity: flavor.description ? 1 : 0.4,
          }}
        >
          {flavor.description || 'No description.'}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href={`/dashboard/flavors/${flavor.id}`} className="btn-cyber" style={{ textDecoration: 'none', fontSize: '11px', padding: '6px 14px' }}>
            VIEW STEPS
          </Link>
          <button
            onClick={() => setShowEdit(true)}
            className="btn-cyber"
            style={{ fontSize: '11px', padding: '6px 14px' }}
          >
            EDIT
          </button>
          {confirmDelete ? (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-cyber btn-cyber-pink"
              style={{ fontSize: '11px', padding: '6px 14px' }}
            >
              {deleting ? 'DELETING...' : 'CONFIRM DELETE'}
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn-cyber btn-cyber-pink"
              style={{ fontSize: '11px', padding: '6px 14px' }}
            >
              DELETE
            </button>
          )}
          {confirmDelete && !deleting && (
            <button
              onClick={() => setConfirmDelete(false)}
              className="btn-cyber"
              style={{ fontSize: '11px', padding: '6px 14px', borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}
            >
              CANCEL
            </button>
          )}
        </div>
      </div>

      {showEdit && (
        <FlavorForm flavor={flavor} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}

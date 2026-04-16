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
  const [duplicating, setDuplicating] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateName, setDuplicateName] = useState('')
  const [duplicateError, setDuplicateError] = useState<string | null>(null)

  function openDuplicateModal() {
    setDuplicateName(`${flavor.slug}-copy`)
    setDuplicateError(null)
    setShowDuplicateModal(true)
  }

  async function handleDuplicate() {
    setDuplicateError(null)
    setDuplicating(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user!.id

    const newSlug = duplicateName

    // Check if slug is already taken
    const { data: existing } = await supabase
      .from('humor_flavors')
      .select('id')
      .eq('slug', newSlug)
      .maybeSingle()

    if (existing) {
      setDuplicateError(`The name "${newSlug}" is already taken. Choose a different name.`)
      setDuplicating(false)
      return
    }

    const { data: newFlavor, error: flavorError } = await supabase
      .from('humor_flavors')
      .insert({
        slug: newSlug,
        description: flavor.description,
        created_by_user_id: userId,
        modified_by_user_id: userId,
      })
      .select()
      .single()

    if (flavorError || !newFlavor) {
      setDuplicateError(flavorError?.message ?? 'Failed to duplicate flavor.')
      setDuplicating(false)
      return
    }

    // Copy all steps from the original flavor
    const { data: steps } = await supabase
      .from('humor_flavor_steps')
      .select('*')
      .eq('humor_flavor_id', flavor.id)
      .order('order_by', { ascending: true })

    if (steps && steps.length > 0) {
      await supabase.from('humor_flavor_steps').insert(
        steps.map(({ id, created_datetime_utc, ...step }) => ({
          ...step,
          humor_flavor_id: newFlavor.id,
          created_by_user_id: userId,
          modified_by_user_id: userId,
        }))
      )
    }

    setDuplicating(false)
    setShowDuplicateModal(false)
    router.refresh()
  }

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
          <button
            onClick={openDuplicateModal}
            className="btn-cyber"
            style={{ fontSize: '11px', padding: '6px 14px', borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)' }}
          >
            DUPLICATE
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

      {showDuplicateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5,10,20,0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !duplicating) setShowDuplicateModal(false)
          }}
        >
          <div className="cyber-card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="label-cyber" style={{ color: 'var(--neon-purple)', fontSize: '14px', letterSpacing: '0.12em' }}>
                DUPLICATE FLAVOR
              </h2>
              <button
                onClick={() => setShowDuplicateModal(false)}
                disabled={duplicating}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="label-cyber block mb-2">NEW FLAVOR NAME</label>
                <input
                  type="text"
                  value={duplicateName}
                  onChange={(e) => {
                    setDuplicateName(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                    setDuplicateError(null)
                  }}
                  className="input-cyber"
                  placeholder="my-new-flavor"
                  required
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                  disabled={duplicating}
                  autoFocus
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                  Unique identifier — lowercase, hyphens only
                </p>
              </div>

              {duplicateError && (
                <div
                  style={{
                    border: '1px solid var(--neon-pink)',
                    borderRadius: '4px',
                    padding: '10px 14px',
                    color: 'var(--neon-pink)',
                    fontSize: '12px',
                    fontFamily: 'var(--font-geist-mono, monospace)',
                    background: 'rgba(255,0,128,0.05)',
                  }}
                >
                  ⚠ {duplicateError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  onClick={handleDuplicate}
                  disabled={duplicating || !duplicateName}
                  className="btn-solid-cyan"
                  style={{ opacity: duplicating || !duplicateName ? 0.7 : 1, borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)' }}
                >
                  {duplicating ? 'DUPLICATING...' : 'CREATE DUPLICATE'}
                </button>
                <button
                  onClick={() => setShowDuplicateModal(false)}
                  disabled={duplicating}
                  className="btn-cyber"
                  style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

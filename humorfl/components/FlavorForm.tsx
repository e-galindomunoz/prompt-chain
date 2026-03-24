'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { HumorFlavor } from '@/lib/types'

interface FlavorFormProps {
  flavor?: HumorFlavor
  onClose: () => void
}

export function FlavorForm({ flavor, onClose }: FlavorFormProps) {
  const router = useRouter()
  const isEdit = !!flavor
  const [slug, setSlug] = useState(flavor?.slug ?? '')
  const [description, setDescription] = useState(flavor?.description ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user!.id

    if (isEdit) {
      const { error: updateError } = await supabase
        .from('humor_flavors')
        .update({ slug, description, modified_by_user_id: userId })
        .eq('id', flavor.id)
      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('humor_flavors')
        .insert({ slug, description, created_by_user_id: userId, modified_by_user_id: userId })
      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.refresh()
    onClose()
  }

  return (
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
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="cyber-card"
        style={{ width: '100%', maxWidth: '480px', padding: '32px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2
            className="label-cyber"
            style={{ color: 'var(--neon-cyan)', fontSize: '14px', letterSpacing: '0.12em' }}
          >
            {isEdit ? 'EDIT FLAVOR' : 'NEW FLAVOR'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-cyber block mb-2">SLUG</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="input-cyber"
              placeholder="my-humor-flavor"
              required
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-geist-mono, monospace)' }}>
              Unique identifier — lowercase, hyphens only
            </p>
          </div>

          <div>
            <label className="label-cyber block mb-2">DESCRIPTION</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea-cyber"
              placeholder="Describe this humor flavor..."
              rows={4}
            />
          </div>

          {error && (
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
              ⚠ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-solid-cyan"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'CREATE FLAVOR'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-cyber"
              style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

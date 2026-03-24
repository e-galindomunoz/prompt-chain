'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StepForm } from './StepForm'
import type { HumorFlavorStep } from '@/lib/types'

interface StepCardProps {
  step: HumorFlavorStep
  steps: HumorFlavorStep[]
  flavorId: number
}

export function StepCard({ step, steps, flavorId }: StepCardProps) {
  const router = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [moving, setMoving] = useState(false)

  const sortedSteps = [...steps].sort((a, b) => a.order_by - b.order_by)
  const idx = sortedSteps.findIndex((s) => s.id === step.id)
  const isFirst = idx === 0
  const isLast = idx === sortedSteps.length - 1

  async function moveStep(direction: 'up' | 'down') {
    setMoving(true)
    const supabase = createClient()
    const other = direction === 'up' ? sortedSteps[idx - 1] : sortedSteps[idx + 1]
    if (!other) { setMoving(false); return }

    const { data: { user } } = await supabase.auth.getUser()
    const userId = user!.id

    // Swap order_by values
    await Promise.all([
      supabase.from('humor_flavor_steps').update({ order_by: other.order_by, modified_by_user_id: userId }).eq('id', step.id),
      supabase.from('humor_flavor_steps').update({ order_by: step.order_by, modified_by_user_id: userId }).eq('id', other.id),
    ])
    router.refresh()
    setMoving(false)
  }

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('humor_flavor_steps').delete().eq('id', step.id)
    router.refresh()
  }

  return (
    <>
      <div
        className="cyber-card"
        style={{ padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
      >
        {/* Step badge */}
        <div style={{ paddingTop: '2px', flexShrink: 0 }}>
          <span className="step-badge">{step.order_by}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
            {step.description && (
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {step.description}
              </span>
            )}
            <span
              className="cyber-tag"
              style={{
                background: 'rgba(0,255,143,0.06)',
                border: '1px solid rgba(0,255,143,0.2)',
                color: 'var(--text-muted)',
              }}
            >
              model:{step.llm_model_id}
            </span>
            {step.llm_temperature !== null && (
              <span
                className="cyber-tag"
                style={{
                  background: 'rgba(0,255,143,0.06)',
                  border: '1px solid rgba(0,255,143,0.2)',
                  color: 'var(--neon-green)',
                }}
              >
                temp:{step.llm_temperature}
              </span>
            )}
            <span
              className="cyber-tag"
              style={{
                background: 'rgba(191,0,255,0.06)',
                border: '1px solid rgba(191,0,255,0.2)',
                color: 'var(--neon-purple)',
              }}
            >
              in:{step.llm_input_type_id} → out:{step.llm_output_type_id}
            </span>
          </div>

          {/* Prompt previews */}
          {step.llm_system_prompt && (
            <div style={{ marginBottom: '8px' }}>
              <span className="label-cyber" style={{ display: 'block', marginBottom: '4px', fontSize: '9px' }}>
                SYSTEM PROMPT
              </span>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  background: 'rgba(0,255,143,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '6px 10px',
                }}
              >
                {step.llm_system_prompt}
              </p>
            </div>
          )}

          {step.llm_user_prompt && (
            <div style={{ marginBottom: '14px' }}>
              <span className="label-cyber" style={{ display: 'block', marginBottom: '4px', fontSize: '9px' }}>
                USER PROMPT
              </span>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  background: 'rgba(0,255,143,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '6px 10px',
                }}
              >
                {step.llm_user_prompt}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => moveStep('up')}
              disabled={isFirst || moving}
              className="btn-cyber"
              style={{ fontSize: '11px', padding: '4px 10px', opacity: isFirst ? 0.3 : 1 }}
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={() => moveStep('down')}
              disabled={isLast || moving}
              className="btn-cyber"
              style={{ fontSize: '11px', padding: '4px 10px', opacity: isLast ? 0.3 : 1 }}
              title="Move down"
            >
              ↓
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="btn-cyber"
              style={{ fontSize: '11px', padding: '4px 12px' }}
            >
              EDIT
            </button>
            {confirmDelete ? (
              <>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-cyber btn-cyber-pink"
                  style={{ fontSize: '11px', padding: '4px 12px' }}
                >
                  {deleting ? 'DEL...' : 'CONFIRM'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="btn-cyber"
                  style={{ fontSize: '11px', padding: '4px 12px', borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}
                >
                  NO
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn-cyber btn-cyber-pink"
                style={{ fontSize: '11px', padding: '4px 12px' }}
              >
                DELETE
              </button>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <StepForm
          flavorId={flavorId}
          step={step}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  )
}

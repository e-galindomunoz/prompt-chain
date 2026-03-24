'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { HumorFlavorStep } from '@/lib/types'

interface StepFormProps {
  flavorId: number
  step?: HumorFlavorStep
  nextOrderBy?: number
  onClose: () => void
}

export function StepForm({ flavorId, step, nextOrderBy = 1, onClose }: StepFormProps) {
  const router = useRouter()
  const isEdit = !!step

  const [description, setDescription] = useState(step?.description ?? '')
  const [orderBy, setOrderBy] = useState(step?.order_by ?? nextOrderBy)
  const [systemPrompt, setSystemPrompt] = useState(step?.llm_system_prompt ?? '')
  const [userPrompt, setUserPrompt] = useState(step?.llm_user_prompt ?? '')
  const [temperature, setTemperature] = useState<number>(step?.llm_temperature ?? 0.7)
  const [modelId, setModelId] = useState(step?.llm_model_id ?? 1)
  const [inputTypeId, setInputTypeId] = useState(step?.llm_input_type_id ?? 1)
  const [outputTypeId, setOutputTypeId] = useState(step?.llm_output_type_id ?? 1)
  const [stepTypeId, setStepTypeId] = useState(step?.humor_flavor_step_type_id ?? 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user!.id

    const payload = {
      humor_flavor_id: flavorId,
      description: description || null,
      order_by: orderBy,
      llm_system_prompt: systemPrompt || null,
      llm_user_prompt: userPrompt || null,
      llm_temperature: temperature,
      llm_model_id: modelId,
      llm_input_type_id: inputTypeId,
      llm_output_type_id: outputTypeId,
      humor_flavor_step_type_id: stepTypeId,
    }

    if (isEdit) {
      const { error: updateError } = await supabase
        .from('humor_flavor_steps')
        .update({ ...payload, modified_by_user_id: userId })
        .eq('id', step.id)
      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('humor_flavor_steps')
        .insert({ ...payload, created_by_user_id: userId, modified_by_user_id: userId })
      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.refresh()
    onClose()
  }

  const inputStyle = {
    background: 'rgba(0,255,143,0.03)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    padding: '7px 10px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
    fontFamily: 'var(--font-geist-mono, monospace)',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,10,20,0.88)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="cyber-card"
        style={{ width: '100%', maxWidth: '680px', padding: '32px', margin: 'auto' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h2
            className="label-cyber"
            style={{ color: 'var(--neon-cyan)', fontSize: '14px', letterSpacing: '0.12em' }}
          >
            {isEdit ? `EDIT STEP #${step.order_by}` : 'ADD STEP'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row 1: description + order */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="label-cyber block mb-2">DESCRIPTION</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={inputStyle}
                placeholder="Step description..."
              />
            </div>
            <div>
              <label className="label-cyber block mb-2">ORDER</label>
              <input
                type="number"
                value={orderBy}
                onChange={(e) => setOrderBy(parseInt(e.target.value) || 1)}
                style={inputStyle}
                min={1}
                required
              />
            </div>
          </div>

          {/* Row 2: IDs grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="label-cyber block mb-2">MODEL ID</label>
              <input
                type="number"
                value={modelId}
                onChange={(e) => setModelId(parseInt(e.target.value) || 1)}
                style={inputStyle}
                min={1}
                required
              />
            </div>
            <div>
              <label className="label-cyber block mb-2">INPUT TYPE</label>
              <input
                type="number"
                value={inputTypeId}
                onChange={(e) => setInputTypeId(parseInt(e.target.value) || 1)}
                style={inputStyle}
                min={1}
                required
              />
            </div>
            <div>
              <label className="label-cyber block mb-2">OUTPUT TYPE</label>
              <input
                type="number"
                value={outputTypeId}
                onChange={(e) => setOutputTypeId(parseInt(e.target.value) || 1)}
                style={inputStyle}
                min={1}
                required
              />
            </div>
            <div>
              <label className="label-cyber block mb-2">STEP TYPE</label>
              <input
                type="number"
                value={stepTypeId}
                onChange={(e) => setStepTypeId(parseInt(e.target.value) || 1)}
                style={inputStyle}
                min={1}
                required
              />
            </div>
          </div>

          {/* Temperature */}
          <div style={{ marginBottom: '16px', maxWidth: '200px' }}>
            <label className="label-cyber block mb-2">
              TEMPERATURE: <span style={{ color: 'var(--neon-cyan)' }}>{temperature}</span>
            </label>
            <input
              type="range"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              min={0}
              max={2}
              step={0.1}
              style={{ width: '100%', accentColor: 'var(--neon-cyan)' }}
            />
          </div>

          {/* System Prompt */}
          <div style={{ marginBottom: '16px' }}>
            <label className="label-cyber block mb-2">SYSTEM PROMPT</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="textarea-cyber"
              placeholder="You are a helpful assistant..."
              rows={5}
            />
          </div>

          {/* User Prompt */}
          <div style={{ marginBottom: '24px' }}>
            <label className="label-cyber block mb-2">USER PROMPT</label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="textarea-cyber"
              placeholder="Generate a caption for: {{input}}"
              rows={5}
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
                marginBottom: '16px',
              }}
            >
              ⚠ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-solid-cyan"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'SAVING...' : isEdit ? 'SAVE STEP' : 'ADD STEP'}
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

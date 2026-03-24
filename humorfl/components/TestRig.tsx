'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Flavor {
  id: number
  slug: string
  description: string | null
}

interface ImageRow {
  id: string
  url: string | null
  image_description: string | null
  additional_context: string | null
  is_common_use: boolean | null
}

interface TestRigProps {
  flavors: Flavor[]
  images: ImageRow[]
}

interface GeneratedCaption {
  id?: string
  content?: string
  text?: string
  caption?: string
  [key: string]: unknown
}

export function TestRig({ flavors, images }: TestRigProps) {
  const [selectedFlavorId, setSelectedFlavorId] = useState<number | null>(null)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GeneratedCaption[] | null>(null)
  const [rawResponse, setRawResponse] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const selectedImage = images.find((img) => img.id === selectedImageId)

  async function handleGenerate() {
    if (!selectedFlavorId || !selectedImageId) return
    setLoading(true)
    setError(null)
    setResults(null)
    setRawResponse(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.almostcrackd.ai'
      const res = await fetch(`${apiBase}/pipeline/generate-captions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          imageId: selectedImageId,
          humorFlavorId: selectedFlavorId,
        }),
      })

      const text = await res.text()
      setRawResponse(text)

      if (!res.ok) {
        setError(`API returned ${res.status}: ${text}`)
        setLoading(false)
        return
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        // If not JSON, treat as plain text result
        setResults([{ content: text }])
        setLoading(false)
        return
      }

      if (Array.isArray(parsed)) {
        setResults(parsed as GeneratedCaption[])
      } else if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>
        if (obj.captions && Array.isArray(obj.captions)) {
          setResults(obj.captions as GeneratedCaption[])
        } else {
          setResults([obj as GeneratedCaption])
        }
      } else {
        setResults([{ content: String(parsed) }])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          className="label-cyber"
          style={{ fontSize: '18px', color: 'var(--neon-green)', letterSpacing: '0.12em', marginBottom: '4px' }}
        >
          TEST RIG
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Generate captions by selecting a humor flavor and an image.
        </p>
      </div>

      {/* Controls */}
      <div className="cyber-card" style={{ padding: '24px', marginBottom: '24px' }}>
        {/* Flavor selector */}
        <div style={{ marginBottom: '24px' }}>
          <label className="label-cyber block mb-2">HUMOR FLAVOR</label>
          <select
            value={selectedFlavorId ?? ''}
            onChange={(e) => setSelectedFlavorId(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="input-cyber"
            style={{ cursor: 'pointer', maxWidth: '360px' }}
          >
            <option value="">— Select flavor —</option>
            {flavors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.slug}
              </option>
            ))}
          </select>
        </div>

        {/* Image grid */}
        <div style={{ marginBottom: '20px' }}>
          <label className="label-cyber block mb-3">
            IMAGE TEST SET
            <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontWeight: 400 }}>
              ({images.length} images)
            </span>
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '10px',
              maxHeight: '420px',
              overflowY: 'auto',
              padding: '4px 2px',
            }}
          >
            {images.map((img) => {
              const isSelected = img.id === selectedImageId
              return (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageId(isSelected ? null : img.id)}
                  style={{
                    padding: 0,
                    background: 'none',
                    border: isSelected ? '2px solid var(--neon-green)' : '2px solid var(--border-subtle)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    aspectRatio: '1',
                    boxShadow: isSelected ? '0 0 14px rgba(0,255,143,0.35)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title={img.image_description ?? img.id}
                >
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.url}
                      alt={img.image_description ?? ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', background: 'var(--bg-card)',
                      color: 'var(--text-muted)', fontSize: '10px',
                      fontFamily: 'var(--font-geist-mono, monospace)',
                    }}>
                      NO IMG
                    </div>
                  )}
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '4px', right: '4px',
                      background: 'var(--neon-green)', color: '#050a14',
                      borderRadius: '50%', width: '18px', height: '18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700,
                    }}>
                      ✓
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected image detail */}
        {selectedImage && (
          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              marginBottom: '20px',
              background: 'rgba(0,255,143,0.03)',
              border: '1px solid rgba(0,255,143,0.4)',
              borderRadius: '6px',
              padding: '14px',
            }}
          >
            {selectedImage.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedImage.url}
                alt={selectedImage.image_description ?? 'Selected image'}
                style={{
                  width: '72px', height: '72px', objectFit: 'cover',
                  borderRadius: '4px', border: '1px solid var(--border-subtle)', flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="label-cyber" style={{ fontSize: '9px', color: 'var(--neon-green)', marginBottom: '4px' }}>
                SELECTED
              </p>
              {selectedImage.image_description && (
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.5 }}>
                  {selectedImage.image_description}
                </p>
              )}
              {selectedImage.additional_context && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono, monospace)', lineHeight: 1.4 }}>
                  {selectedImage.additional_context}
                </p>
              )}
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-geist-mono, monospace)', opacity: 0.5 }}>
                {selectedImage.id}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!selectedFlavorId || !selectedImageId || loading}
          className="btn-solid-cyan"
          style={{
            opacity: !selectedFlavorId || !selectedImageId || loading ? 0.5 : 1,
            cursor: !selectedFlavorId || !selectedImageId ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'GENERATING...' : '▶ GENERATE CAPTION'}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="cyber-card" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span
              className="text-neon-green"
              style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '12px', letterSpacing: '0.12em' }}
            >
              ◎ RUNNING PROMPT CHAIN...
            </span>
            <span
              style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '11px', color: 'var(--text-muted)', opacity: 0.6 }}
            >
              THIS MAY TAKE A MOMENT
            </span>
          </div>

          {/* Track */}
          <div style={{
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(0,255,143,0.08)',
            border: '1px solid rgba(0,255,143,0.12)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Indeterminate sliding bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              height: '100%',
              width: '40%',
              borderRadius: '3px',
              background: 'linear-gradient(90deg, transparent, var(--neon-green), transparent)',
              boxShadow: '0 0 12px rgba(0,255,143,0.7)',
              animation: 'cyber-progress 1.6s ease-in-out infinite',
            }} />
          </div>

          <style>{`
            @keyframes cyber-progress {
              0%   { left: -45%; }
              100% { left: 105%; }
            }
          `}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            border: '1px solid var(--neon-pink)',
            borderRadius: '6px',
            padding: '16px 20px',
            color: 'var(--neon-pink)',
            fontFamily: 'var(--font-geist-mono, monospace)',
            fontSize: '13px',
            background: 'rgba(255,0,128,0.05)',
            marginBottom: '16px',
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div>
          <p
            className="label-cyber"
            style={{ marginBottom: '12px', fontSize: '11px', color: 'var(--neon-green)' }}
          >
            ✓ {results.length} CAPTION{results.length !== 1 ? 'S' : ''} GENERATED
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            {results.map((result, i) => {
              const text = result.content ?? result.text ?? result.caption ?? JSON.stringify(result, null, 2)
              const copied = copiedIndex === i
              return (
                <button
                  key={i}
                  onClick={() => handleCopy(typeof text === 'string' ? text : JSON.stringify(text), i)}
                  className="cyber-card glow-green"
                  style={{
                    padding: '20px 24px',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'copy',
                    background: copied ? 'rgba(0,255,143,0.06)' : undefined,
                    borderColor: copied ? 'var(--neon-green)' : undefined,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span className="step-badge" style={{ borderColor: 'var(--neon-green)', color: 'var(--neon-green)' }}>
                      {i + 1}
                    </span>
                    <span className="label-cyber" style={{ color: 'var(--neon-green)', fontSize: '10px' }}>
                      CAPTION OUTPUT
                    </span>
                    <span
                      className="label-cyber"
                      style={{
                        marginLeft: 'auto',
                        fontSize: '10px',
                        color: copied ? 'var(--neon-green)' : 'var(--text-muted)',
                        opacity: copied ? 1 : 0.5,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {copied ? '✓ COPIED' : 'CLICK TO COPY'}
                    </span>
                  </div>
                  <p
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: '15px',
                      lineHeight: 1.7,
                      fontStyle: typeof text === 'string' && text.startsWith('{') ? 'normal' : 'italic',
                      fontFamily: typeof text === 'string' && text.startsWith('{')
                        ? 'var(--font-geist-mono, monospace)'
                        : 'var(--font-geist-sans, sans-serif)',
                    }}
                  >
                    {typeof text === 'string' ? text : JSON.stringify(text)}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Raw response debug */}
      {rawResponse && results && (
        <details style={{ marginTop: '24px' }}>
          <summary
            className="label-cyber"
            style={{ cursor: 'pointer', fontSize: '10px', opacity: 0.5, userSelect: 'none' }}
          >
            RAW RESPONSE
          </summary>
          <pre
            style={{
              marginTop: '8px',
              background: 'rgba(0,255,143,0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '12px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-geist-mono, monospace)',
              overflow: 'auto',
              maxHeight: '200px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {rawResponse}
          </pre>
        </details>
      )}
    </div>
  )
}

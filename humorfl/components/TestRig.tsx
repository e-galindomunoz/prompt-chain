'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [flavorSearch, setFlavorSearch] = useState('')
  const [flavorDropdownOpen, setFlavorDropdownOpen] = useState(false)
  const flavorDropdownRef = useRef<HTMLDivElement>(null)
  const [imageMode, setImageMode] = useState<'testset' | 'custom'>('testset')

  // Test-set mode state
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)

  // Custom upload mode state
  const [customFile, setCustomFile] = useState<File | null>(null)
  const [customPreviewUrl, setCustomPreviewUrl] = useState<string | null>(null)
  const [customDescription, setCustomDescription] = useState('')
  const [customContext, setCustomContext] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const selectedFlavor = flavors.find((f) => f.id === selectedFlavorId)
  const filteredFlavors = flavors.filter((f) =>
    f.slug.toLowerCase().includes(flavorSearch.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (flavorDropdownRef.current && !flavorDropdownRef.current.contains(e.target as Node)) {
        setFlavorDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) return
    setCustomFile(file)
    const url = URL.createObjectURL(file)
    setCustomPreviewUrl(url)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  function clearCustomImage() {
    setCustomFile(null)
    if (customPreviewUrl) URL.revokeObjectURL(customPreviewUrl)
    setCustomPreviewUrl(null)
    setCustomDescription('')
    setCustomContext('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadCustomImageAndGetId(): Promise<string> {
    if (!customFile) throw new Error('No file selected')
    const supabase = createClient()

    const ext = customFile.name.split('.').pop() ?? 'jpg'
    const storagePath = `test-uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(storagePath, customFile, { upsert: false })

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(storagePath)
    const publicUrl = urlData.publicUrl

    const { data: inserted, error: insertError } = await supabase
      .from('images')
      .insert({
        url: publicUrl,
        is_common_use: false,
        is_public: false,
        image_description: customDescription || null,
        additional_context: customContext || null,
      })
      .select('id')
      .single()

    if (insertError) throw new Error(`DB insert failed: ${insertError.message}`)
    return inserted.id as string
  }

  const canGenerate =
    !!selectedFlavorId &&
    (imageMode === 'testset' ? !!selectedImageId : !!customFile) &&
    !loading

  async function handleGenerate() {
    if (!selectedFlavorId) return
    setLoading(true)
    setError(null)
    setResults(null)
    setRawResponse(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      let imageId: string
      if (imageMode === 'custom') {
        imageId = await uploadCustomImageAndGetId()
      } else {
        if (!selectedImageId) return
        imageId = selectedImageId
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.almostcrackd.ai'
      const res = await fetch(`${apiBase}/pipeline/generate-captions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          imageId,
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
          <div ref={flavorDropdownRef} style={{ position: 'relative', maxWidth: '360px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: flavorDropdownOpen ? '1px solid var(--neon-green)' : '1px solid var(--border-subtle)',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                transition: 'border-color 0.15s ease',
                boxShadow: flavorDropdownOpen ? '0 0 0 1px rgba(0,255,143,0.2)' : 'none',
              }}
            >
              <input
                type="text"
                value={flavorDropdownOpen ? flavorSearch : (selectedFlavor?.slug ?? '')}
                onChange={(e) => setFlavorSearch(e.target.value)}
                onFocus={() => {
                  setFlavorSearch('')
                  setFlavorDropdownOpen(true)
                }}
                placeholder="— Search flavor —"
                className="input-cyber"
                style={{
                  border: 'none',
                  boxShadow: 'none',
                  flex: 1,
                  background: 'transparent',
                  outline: 'none',
                }}
              />
              {selectedFlavorId && !flavorDropdownOpen && (
                <button
                  onClick={() => { setSelectedFlavorId(null); setFlavorSearch('') }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '14px', padding: '0 10px',
                    lineHeight: 1, flexShrink: 0,
                  }}
                  title="Clear"
                >
                  ×
                </button>
              )}
              <span style={{ color: 'var(--text-muted)', fontSize: '10px', padding: '0 10px', flexShrink: 0, userSelect: 'none' }}>
                {flavorDropdownOpen ? '▲' : '▼'}
              </span>
            </div>

            {flavorDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--neon-green)',
                  borderRadius: '6px',
                  zIndex: 50,
                  maxHeight: '240px',
                  overflowY: 'auto',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {filteredFlavors.length === 0 ? (
                  <p style={{
                    padding: '12px 14px', fontSize: '12px',
                    color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono, monospace)',
                  }}>
                    No matches
                  </p>
                ) : (
                  filteredFlavors.map((f) => {
                    const isActive = f.id === selectedFlavorId
                    return (
                      <button
                        key={f.id}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setSelectedFlavorId(f.id)
                          setFlavorSearch('')
                          setFlavorDropdownOpen(false)
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 14px',
                          background: isActive ? 'rgba(0,255,143,0.08)' : 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          color: isActive ? 'var(--neon-green)' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontFamily: 'var(--font-geist-mono, monospace)',
                          transition: 'background 0.1s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                        }}
                      >
                        {f.slug}
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Image source tabs */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {(['testset', 'custom'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setImageMode(mode)}
                className="label-cyber"
                style={{
                  padding: '6px 14px',
                  fontSize: '10px',
                  border: imageMode === mode ? '1px solid var(--neon-green)' : '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  background: imageMode === mode ? 'rgba(0,255,143,0.08)' : 'transparent',
                  color: imageMode === mode ? 'var(--neon-green)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {mode === 'testset' ? `TEST SET (${images.length})` : 'CUSTOM UPLOAD'}
              </button>
            ))}
          </div>

          {/* Test set grid */}
          {imageMode === 'testset' && (
            <>
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

              {selectedImage && (
                <div
                  style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start',
                    marginTop: '14px',
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
            </>
          )}

          {/* Custom upload */}
          {imageMode === 'custom' && (
            <div>
              {!customFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--neon-green)' : 'var(--border-subtle)'}`,
                    borderRadius: '8px',
                    padding: '40px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? 'rgba(0,255,143,0.04)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <p className="label-cyber" style={{ fontSize: '11px', color: dragOver ? 'var(--neon-green)' : 'var(--text-muted)', marginBottom: '6px' }}>
                    DROP IMAGE HERE
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                    or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFileSelect(f)
                    }}
                  />
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customPreviewUrl!}
                      alt="Custom upload preview"
                      style={{
                        width: '100px', height: '100px', objectFit: 'cover',
                        borderRadius: '6px', border: '2px solid var(--neon-green)',
                        flexShrink: 0, boxShadow: '0 0 14px rgba(0,255,143,0.25)',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="label-cyber" style={{ fontSize: '9px', color: 'var(--neon-green)', marginBottom: '6px' }}>
                        READY TO TEST
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '10px', fontFamily: 'var(--font-geist-mono, monospace)', wordBreak: 'break-all' }}>
                        {customFile.name}
                      </p>
                      <button
                        onClick={clearCustomImage}
                        className="label-cyber"
                        style={{
                          fontSize: '10px', color: 'var(--neon-pink)',
                          border: '1px solid var(--neon-pink)', borderRadius: '4px',
                          padding: '4px 10px', background: 'transparent', cursor: 'pointer',
                        }}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <label className="label-cyber block mb-1" style={{ fontSize: '9px' }}>
                        DESCRIPTION <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="What's in the image?"
                        className="input-cyber"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label className="label-cyber block mb-1" style={{ fontSize: '9px' }}>
                        ADDITIONAL CONTEXT <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={customContext}
                        onChange={(e) => setCustomContext(e.target.value)}
                        placeholder="Any extra context for the AI?"
                        className="input-cyber"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="btn-solid-cyan"
          style={{
            opacity: canGenerate ? 1 : 0.5,
            cursor: canGenerate ? 'pointer' : 'not-allowed',
            marginTop: '4px',
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

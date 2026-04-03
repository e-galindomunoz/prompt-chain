'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Flavor {
  id: number
  slug: string
  description: string | null
}

interface CaptionRow {
  id: string
  content: string | null
  humor_flavor_id: number | null
  image_id: string
  is_public: boolean
  is_featured: boolean
  like_count: number
  created_datetime_utc: string
  images: { url: string | null; image_description: string | null } | null
}

interface CaptionsViewProps {
  flavors: Flavor[]
  selectedFlavorId: number | null
  captions: CaptionRow[]
  currentPage: number
  totalCaptions: number
  pageSize: number
}

export function CaptionsView({ flavors, selectedFlavorId, captions, currentPage, totalCaptions, pageSize }: CaptionsViewProps) {
  const router = useRouter()
  const [flavorSearch, setFlavorSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(totalCaptions / pageSize)
  const selectedFlavor = flavors.find((f) => f.id === selectedFlavorId)
  const filteredFlavors = flavors.filter((f) =>
    f.slug.toLowerCase().includes(flavorSearch.toLowerCase()) ||
    (f.description ?? '').toLowerCase().includes(flavorSearch.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectFlavor(id: number | null) {
    setDropdownOpen(false)
    setFlavorSearch('')
    if (id) {
      router.push(`/dashboard/captions?flavor=${id}`)
    } else {
      router.push('/dashboard/captions')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          className="label-cyber"
          style={{ fontSize: '18px', color: 'var(--neon-cyan)', letterSpacing: '0.12em', marginBottom: '4px' }}
        >
          CAPTIONS
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Browse generated captions by humor flavor.
        </p>
      </div>

      {/* Flavor selector */}
      <div style={{ marginBottom: '24px', maxWidth: '360px' }}>
        <label className="label-cyber block mb-2">SELECT FLAVOR</label>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: dropdownOpen ? '1px solid var(--neon-cyan)' : '1px solid var(--border-subtle)',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              transition: 'border-color 0.15s ease',
              boxShadow: dropdownOpen ? '0 0 0 1px rgba(0,255,255,0.15)' : 'none',
            }}
          >
            <input
              type="text"
              value={dropdownOpen ? flavorSearch : (selectedFlavor?.slug ?? '')}
              onChange={(e) => setFlavorSearch(e.target.value)}
              onFocus={() => { setFlavorSearch(''); setDropdownOpen(true) }}
              placeholder="— Search flavor —"
              className="input-cyber"
              style={{ border: 'none', boxShadow: 'none', flex: 1, background: 'transparent', outline: 'none' }}
            />
            {selectedFlavorId && !dropdownOpen && (
              <button
                onClick={() => selectFlavor(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: '14px', padding: '0 10px', lineHeight: 1, flexShrink: 0,
                }}
                title="Clear"
              >
                ×
              </button>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '10px', padding: '0 10px', flexShrink: 0, userSelect: 'none' }}>
              {dropdownOpen ? '▲' : '▼'}
            </span>
          </div>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--neon-cyan)',
                borderRadius: '6px',
                zIndex: 50,
                maxHeight: '240px',
                overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {filteredFlavors.length === 0 ? (
                <p style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                  No matches
                </p>
              ) : (
                filteredFlavors.map((f) => {
                  const isActive = f.id === selectedFlavorId
                  return (
                    <button
                      key={f.id}
                      onMouseDown={(e) => { e.preventDefault(); selectFlavor(f.id) }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        background: isActive ? 'rgba(0,255,255,0.08)' : 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        color: isActive ? 'var(--neon-cyan)' : 'var(--text-primary)',
                        fontSize: '13px',
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                    >
                      <span>{f.slug}</span>
                      {f.description && (
                        <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)', opacity: 0.7 }}>
                          — {f.description.slice(0, 40)}{f.description.length > 40 ? '…' : ''}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {!selectedFlavorId && (
        <div
          className="cyber-card"
          style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}
        >
          <p className="label-cyber" style={{ marginBottom: '8px', fontSize: '12px' }}>SELECT A FLAVOR</p>
          <p style={{ fontSize: '13px' }}>Choose a humor flavor above to view its captions.</p>
        </div>
      )}

      {selectedFlavorId && captions.length === 0 && (
        <div
          className="cyber-card"
          style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}
        >
          <p className="label-cyber" style={{ marginBottom: '8px', fontSize: '12px' }}>NO CAPTIONS</p>
          <p style={{ fontSize: '13px' }}>No captions found for this flavor. Use the Test Rig to generate some.</p>
        </div>
      )}

      {captions.length > 0 && (
        <div>
          <p className="label-cyber" style={{ marginBottom: '12px', fontSize: '11px', opacity: 0.6 }}>
            {totalCaptions} CAPTION{totalCaptions !== 1 ? 'S' : ''} — PAGE {currentPage} OF {totalPages}
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            {captions.map((caption) => (
              <div key={caption.id} className="cyber-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Image thumbnail */}
                  {caption.images?.url && (
                    <div style={{ flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={caption.images.url}
                        alt={caption.images.image_description ?? 'Caption image'}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                        }}
                      />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {caption.is_featured && (
                        <span
                          className="cyber-tag"
                          style={{
                            background: 'rgba(255,238,0,0.1)',
                            border: '1px solid rgba(255,238,0,0.3)',
                            color: '#ffee00',
                          }}
                        >
                          FEATURED
                        </span>
                      )}
                      {caption.is_public && (
                        <span
                          className="cyber-tag"
                          style={{
                            background: 'rgba(0,255,143,0.08)',
                            border: '1px solid rgba(0,255,143,0.25)',
                            color: 'var(--neon-green)',
                          }}
                        >
                          PUBLIC
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
                        ♥ {caption.like_count}
                      </span>
                    </div>

                    {/* Content */}
                    <p style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
                      {caption.content ?? <em style={{ color: 'var(--text-muted)' }}>No content</em>}
                    </p>

                    {/* Image description */}
                    {caption.images?.image_description && (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                        IMG: {caption.images.image_description.slice(0, 100)}
                        {caption.images.image_description.length > 100 ? '...' : ''}
                      </p>
                    )}

                    {/* Timestamp */}
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'var(--font-geist-mono, monospace)', opacity: 0.6 }}>
                      {new Date(caption.created_datetime_utc).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
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
                onClick={() => router.push(`/dashboard/captions?flavor=${selectedFlavorId}&page=${currentPage - 1}`)}
                disabled={currentPage <= 1}
                className="btn-solid-cyan"
                style={{ opacity: currentPage <= 1 ? 0.4 : 1, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
              >
                ← PREV
              </button>
              <span
                className="label-cyber"
                style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}
              >
                PAGE {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => router.push(`/dashboard/captions?flavor=${selectedFlavorId}&page=${currentPage + 1}`)}
                disabled={currentPage >= totalPages}
                className="btn-solid-cyan"
                style={{ opacity: currentPage >= totalPages ? 0.4 : 1, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
              >
                NEXT →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

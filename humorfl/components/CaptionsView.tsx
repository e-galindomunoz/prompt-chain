'use client'

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
}

export function CaptionsView({ flavors, selectedFlavorId, captions }: CaptionsViewProps) {
  const router = useRouter()

  function handleFlavorChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val) {
      router.push(`/dashboard/captions?flavor=${val}`)
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
        <select
          value={selectedFlavorId ?? ''}
          onChange={handleFlavorChange}
          className="input-cyber"
          style={{ cursor: 'pointer' }}
        >
          <option value="">— Choose a flavor —</option>
          {flavors.map((f) => (
            <option key={f.id} value={f.id}>
              {f.slug}{f.description ? ` — ${f.description.slice(0, 40)}` : ''}
            </option>
          ))}
        </select>
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
            {captions.length} CAPTION{captions.length !== 1 ? 'S' : ''} FOUND
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
        </div>
      )}
    </div>
  )
}

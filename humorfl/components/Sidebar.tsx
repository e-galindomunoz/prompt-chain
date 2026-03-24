'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'
import { useEffect, useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: string
}

const navItems: NavItem[] = [
  { label: 'FLAVOR CHAINS', href: '/dashboard/flavors', icon: '⬡' },
  { label: 'CAPTIONS', href: '/dashboard/captions', icon: '◈' },
  { label: 'TEST RIG', href: '/dashboard/test', icon: '◎' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
      className="cyber-grid"
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span
          className="text-neon-cyan"
          style={{
            fontFamily: 'var(--font-geist-mono, monospace)',
            fontSize: '20px',
            fontWeight: 900,
            letterSpacing: '0.2em',
            display: 'block',
          }}
        >
          HUMORFL
        </span>
        <span className="label-cyber" style={{ opacity: 0.5, fontSize: '9px' }}>
          PROMPT CHAIN MANAGER
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                fontSize: '12px',
                fontFamily: 'var(--font-geist-mono, monospace)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: isActive ? 'var(--neon-cyan)' : 'var(--text-muted)',
                background: isActive ? 'rgba(0,255,143,0.06)' : 'transparent',
                borderLeft: isActive
                  ? '2px solid var(--neon-cyan)'
                  : '2px solid transparent',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: '14px', opacity: 0.8 }}>{item.icon}</span>
              {item.label}
              {isActive && (
                <span
                  style={{
                    marginLeft: 'auto',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--neon-cyan)',
                    boxShadow: '0 0 6px var(--neon-cyan)',
                  }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="label-cyber" style={{ fontSize: '9px', opacity: 0.5 }}>
            THEME
          </span>
          <ThemeToggle />
        </div>
        {email && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-geist-mono, monospace)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={email}
          >
            {email}
          </div>
        )}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn-cyber-pink btn-cyber"
          style={{ width: '100%', fontSize: '11px', padding: '6px 12px' }}
        >
          {signingOut ? 'SIGNING OUT...' : 'SIGN OUT'}
        </button>
      </div>
    </aside>
  )
}

import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen cyber-grid flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div
          className="text-neon-pink"
          style={{
            fontSize: '80px',
            fontFamily: 'var(--font-geist-mono, monospace)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          403
        </div>
        <h1
          className="label-cyber mt-4 mb-2"
          style={{ fontSize: '18px', color: 'var(--neon-pink)', letterSpacing: '0.15em' }}
        >
          ACCESS DENIED
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
          You do not have the required permissions to access this system.
          Only superadmin and matrix admin accounts are authorized.
        </p>
        <Link href="/login" className="btn-cyber-pink btn-cyber">
          RETURN TO LOGIN
        </Link>
      </div>
    </div>
  )
}

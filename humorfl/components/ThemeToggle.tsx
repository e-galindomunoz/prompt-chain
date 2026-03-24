'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const themes = ['dark', 'light', 'system'] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const cycle = () => {
    const idx = themes.indexOf(theme as typeof themes[number])
    setTheme(themes[(idx + 1) % themes.length])
  }

  const icon =
    theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '⬡'

  return (
    <button
      onClick={cycle}
      className="btn-cyber"
      title={`Theme: ${theme} (click to cycle)`}
      style={{ padding: '6px 10px', fontSize: '16px' }}
    >
      {icon}
    </button>
  )
}

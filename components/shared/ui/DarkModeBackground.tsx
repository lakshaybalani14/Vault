'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import Plasma from '@/components/shared/ui/Plasma'

export default function DarkModeBackground() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (resolvedTheme !== 'dark') return null

  return (
    <div className="plasma-bg-layer" aria-hidden="true">
      <Plasma color="#3dd6ff" speed={0.85} direction="forward" scale={1.1} opacity={0.9} mouseInteractive />
    </div>
  )
}


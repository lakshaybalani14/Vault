'use client'

import React, { useRef, useState, useEffect, useCallback, UIEvent } from 'react'
import { motion, useInView } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'

export interface UserItem {
  id: string
  name: string
  email: string
  avatar_url: string | null
  trust_score: number
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ─── Animated Row ────────────────────────────────────────────────────────────
function AnimatedUserItem({
  user,
  index,
  selected,
  onMouseEnter,
  onClick,
}: {
  user: UserItem
  index: number
  selected: boolean
  onMouseEnter: () => void
  onClick: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4, once: false })

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0 }}
      transition={{ duration: 0.18, delay: 0.04 * Math.min(index, 6) }}
      style={{
        marginBottom: 8,
        cursor: 'pointer',
        borderRadius: 14,
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        background: selected
          ? 'color-mix(in srgb, var(--accent-light) 60%, var(--surface))'
          : 'var(--surface)',
        boxShadow: selected
          ? '0 0 0 1px color-mix(in srgb, var(--accent) 28%, transparent)'
          : 'none',
        transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
      }}
    >
      {/* Avatar or Initials */}
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '2px solid var(--border)',
          }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            flexShrink: 0,
            background: selected
              ? 'var(--accent)'
              : 'var(--accent-light)',
            color: selected ? '#fff' : 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: '-0.01em',
            transition: 'background 0.15s ease, color 0.15s ease',
            border: `2px solid ${selected ? 'var(--accent)' : 'transparent'}`,
          }}
        >
          {getInitials(user.name)}
        </div>
      )}

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontSize: '0.9375rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.3,
        }}>
          {user.name}
        </div>
        <div style={{
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginTop: 2,
        }}>
          {user.email}
        </div>
      </div>

      {/* Trust Score */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: 'var(--found)',
        fontWeight: 700,
        fontSize: '0.875rem',
        flexShrink: 0,
      }}>
        <Star size={13} fill="currentColor" />
        {Number(user.trust_score).toFixed(1)}
      </div>
    </motion.div>
  )
}

// ─── Main List ────────────────────────────────────────────────────────────────
export default function AnimatedUserList({
  users,
  enableArrowNavigation = true,
  showGradients = true,
}: {
  users: UserItem[]
  enableArrowNavigation?: boolean
  showGradients?: boolean
}) {
  const router = useRouter()
  const listRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [keyboardNav, setKeyboardNav] = useState(false)
  const [topOpacity, setTopOpacity] = useState(0)
  const [bottomOpacity, setBottomOpacity] = useState(1)

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement
    setTopOpacity(Math.min(scrollTop / 50, 1))
    const dist = scrollHeight - scrollTop - clientHeight
    setBottomOpacity(scrollHeight <= clientHeight ? 0 : Math.min(dist / 50, 1))
  }

  const navigate = useCallback((user: UserItem) => {
    router.push(`/profile/${user.id}`)
  }, [router])

  // Keyboard navigation
  useEffect(() => {
    if (!enableArrowNavigation) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((p) => Math.min(p + 1, users.length - 1))
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((p) => Math.max(p - 1, 0))
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < users.length) {
          e.preventDefault()
          navigate(users[selectedIndex])
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [users, selectedIndex, navigate, enableArrowNavigation])

  // Auto-scroll selected item into view on keyboard nav
  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return
    const container = listRef.current
    const el = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null
    if (el) {
      const margin = 50
      const top = el.offsetTop
      const bottom = top + el.offsetHeight
      if (top < container.scrollTop + margin)
        container.scrollTo({ top: top - margin, behavior: 'smooth' })
      else if (bottom > container.scrollTop + container.clientHeight - margin)
        container.scrollTo({ top: bottom - container.clientHeight + margin, behavior: 'smooth' })
    }
    setKeyboardNav(false)
  }, [selectedIndex, keyboardNav])

  if (users.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          padding: 48,
          textAlign: 'center',
          borderRadius: 14,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
        <p style={{ color: 'var(--text-secondary)' }}>No users found.</p>
      </motion.div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={listRef}
        onScroll={handleScroll}
        style={{
          maxHeight: 520,
          overflowY: 'auto',
          paddingRight: 4,
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border) transparent',
        }}
      >
        {users.map((user, index) => (
          <AnimatedUserItem
            key={user.id}
            user={user}
            index={index}
            selected={selectedIndex === index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => navigate(user)}
          />
        ))}
      </div>

      {/* Top gradient */}
      {showGradients && (
        <>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 50,
            background: 'linear-gradient(to bottom, var(--background), transparent)',
            pointerEvents: 'none',
            opacity: topOpacity,
            transition: 'opacity 0.2s ease',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(to top, var(--background), transparent)',
            pointerEvents: 'none',
            opacity: bottomOpacity,
            transition: 'opacity 0.2s ease',
          }} />
        </>
      )}
    </div>
  )
}

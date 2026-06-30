'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Bell, ClipboardList, LogOut, Moon, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { logoutUser } from '@/lib/actions/auth'
import StaggeredMenu from '@/components/shared/StaggeredMenu'

export type PillNavItem = {
  label: string
  href: string
  ariaLabel?: string
}

interface NavbarProps {
  userName?: string
  userEmail?: string
  userAvatar?: string | null
  unreadCount?: number
}

export default function Navbar({ userName = 'User', userEmail = '', userAvatar = null, unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const items: PillNavItem[] = [
    { label: 'Feed', href: '/feed' },
    { label: 'Post Item', href: '/post/new' },
    { label: 'Claims', href: '/claims' },
    { label: 'Users', href: '/users' },
  ]

  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLAnchorElement | null>(null)
  const logoInnerRef = useRef<HTMLSpanElement | null>(null)
  const navItemsRef = useRef<HTMLDivElement | null>(null)

  const circleRefs = useRef<Array<HTMLSpanElement | null>>([])
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([])
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([])
  const logoTweenRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const ease = 'power3.out'

    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return

        const pill = circle.parentElement as HTMLElement
        const rect = pill.getBoundingClientRect()
        const w = rect.width
        const h = rect.height

        const R = ((w * w) / 4 + h * h) / (2 * h)
        const D = Math.ceil(2 * R) + 2
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
        const originY = D - delta

        circle.style.width = `${D}px`
        circle.style.height = `${D}px`
        circle.style.bottom = `-${delta}px`

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        })

        const label = pill.querySelector<HTMLElement>('.pill-label')
        const hoverLabel = pill.querySelector<HTMLElement>('.pill-label-hover')

        if (label) gsap.set(label, { y: 0 })
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 })

        tlRefs.current[index]?.kill()
        const tl = gsap.timeline({ paused: true })

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0)

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0)
        }

        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 })
          tl.to(hoverLabel, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0)
        }

        tlRefs.current[index] = tl
      })
    }

    layout()
    window.addEventListener('resize', layout)

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {})
    }

    if (logoRef.current) {
      gsap.set(logoRef.current, { scale: 0 })
      gsap.to(logoRef.current, { scale: 1, duration: 0.6, ease })
    }

    if (navItemsRef.current) {
      gsap.set(navItemsRef.current, { width: 0, overflow: 'hidden' })
      gsap.to(navItemsRef.current, { width: 'auto', duration: 0.6, ease })
    }

    return () => window.removeEventListener('resize', layout)
  }, [items.length])

  const isActive = (href: string) => pathname.startsWith(href)

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  const handleLogoEnter = () => {
    if (!logoInnerRef.current) return
    logoTweenRef.current?.kill()
    gsap.set(logoInnerRef.current, { rotate: 0 })
    logoTweenRef.current = gsap.to(logoInnerRef.current, {
      rotate: 360,
      duration: 0.25,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  const handleLogout = async () => {
    await logoutUser()
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <nav className="desktop-nav" aria-label="Primary">
        <div className="container nav-shell nav-shell-balanced" style={{ height: 72 }}>
          <Link
            href="/feed"
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            ref={logoRef}
            className="rounded-full inline-flex items-center justify-center overflow-hidden"
            style={{
              width: '44px',
              height: '44px',
              background: 'var(--text-primary)',
            }}
          >
            <span
              ref={logoInnerRef}
              className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-[9px] font-bold"
              style={{
                background: 'linear-gradient(140deg, var(--accent), color-mix(in srgb, var(--found) 65%, var(--accent)))',
                color: '#fff',
              }}
            >
              V
            </span>
          </Link>

          <div className="hidden md:flex nav-center-wrap">
            <div
              ref={navItemsRef}
              className="relative items-center rounded-full flex nav-center-pills"
              style={{
                height: '50px',
                background: 'color-mix(in srgb, var(--surface-2) 58%, transparent)',
                border: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
              }}
            >
              <ul role="menubar" className="list-none flex items-stretch m-0 p-[4px] h-full gap-[6px]">
                {items.map((item, i) => {
                  const active = isActive(item.href)
                  const minWidth = item.label === 'Post Item' ? 132 : 104
                  return (
                    <li key={item.href} role="none" className="flex h-full">
                      <Link
                        href={item.href}
                        role="menuitem"
                        className="relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[12px] tracking-[0.1px] whitespace-nowrap px-[18px]"
                        aria-label={item.ariaLabel || item.label}
                        style={{
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          minWidth: `${minWidth}px`,
                        }}
                        onMouseEnter={() => handleEnter(i)}
                        onMouseLeave={() => handleLeave(i)}
                      >
                        <span
                          className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                          style={{ background: 'var(--accent)' }}
                          aria-hidden="true"
                          ref={(el) => {
                            circleRefs.current[i] = el
                          }}
                        />
                        <span className="label-stack relative inline-flex items-center justify-center leading-[1] z-[2]">
                          <span className="pill-label relative z-[2] inline-block leading-[1]">{item.label}</span>
                          <span className="pill-label-hover absolute left-0 top-0 z-[3] inline-block" style={{ color: 'var(--background)' }} aria-hidden="true">
                            {item.label}
                          </span>
                        </span>
                        {active && (
                          <span
                            className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rounded-full z-[4]"
                            style={{ background: 'var(--accent)' }}
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/notifications" className="icon-button" aria-label="Notifications" style={{ width: 40, height: 40 }}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="badge-notification">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </Link>

            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowDropdown((prev) => !prev)} className="profile-trigger" aria-haspopup="menu" aria-expanded={showDropdown}>
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="avatar" style={{ objectFit: 'cover' }} />
                ) : (
                  <span className="avatar">{initials}</span>
                )}
                <span className="avatar-name">{userName.split(' ')[0]}</span>
              </button>

              {showDropdown && (
                <div className="profile-menu animate-scale-in" role="menu">
                  <div className="profile-menu-head">
                    <div className="profile-menu-name">{userName}</div>
                    <div className="profile-menu-email">{userEmail}</div>
                  </div>
                  <div className="profile-menu-body">
                    <DropdownItem icon={<User size={16} />} label="Profile" onClick={() => { setShowDropdown(false); router.push('/profile/me') }} />
                    <DropdownItem icon={<ClipboardList size={16} />} label="My Claims" onClick={() => { setShowDropdown(false); router.push('/claims') }} />
                    <DropdownItem icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
                    <div className="menu-divider" />
                    <DropdownItem icon={<LogOut size={16} />} label="Sign Out" onClick={handleLogout} danger />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <StaggeredMenu
              isFixed
              showLogo={false}
              position="right"
              colors={['#1a2c45', '#3dd6ff']}
              accentColor="var(--accent)"
              menuButtonColor="var(--text-primary)"
              openMenuButtonColor="var(--accent)"
              displaySocials={false}
              circleButton
              themeToggle={<MobileMenuFooter />}
              items={[
                { label: 'Feed', ariaLabel: 'Feed', link: '/feed' },
                { label: 'Post Item', ariaLabel: 'Post Item', link: '/post/new' },
                { label: 'Claims', ariaLabel: 'Claims', link: '/claims' },
                { label: 'Users', ariaLabel: 'Users', link: '/users' },
                { label: 'Notifications', ariaLabel: 'Notifications', link: '/notifications' },
                { label: 'Profile', ariaLabel: 'Profile', link: '/profile/me' },
              ]}
            />
          </div>
        </div>
      </nav>
    </>
  )
}

function DropdownItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`dropdown-item ${danger ? 'danger' : ''}`}>
      {icon}
      {label}
    </button>
  )
}

function MobileMenuFooter() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'

  const handleLogout = async () => {
    setLoggingOut(true)
    await logoutUser()
  }

  return (
    <div style={{ marginTop: 'auto' }}>
      {/* Theme toggle */}
      <div style={{
        borderTop: '1px solid color-mix(in srgb, var(--text-primary) 12%, transparent)',
        paddingTop: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
          <button
            onClick={() => setTheme('light')}
            aria-label="Switch to light mode"
            disabled={!mounted}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 'clamp(1.4rem, 7vw, 1.9rem)',
              letterSpacing: '-1.5px',
              textTransform: 'uppercase',
              lineHeight: 1,
              color: !isDark ? 'var(--sm-accent, var(--accent))' : 'color-mix(in srgb, var(--text-primary) 28%, transparent)',
              transition: 'color 0.25s ease, opacity 0.25s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Light
          </button>

          <span style={{
            fontWeight: 300,
            fontSize: '1.1rem',
            color: 'color-mix(in srgb, var(--text-primary) 20%, transparent)',
            lineHeight: 1,
            userSelect: 'none',
          }}>
            /
          </span>

          <button
            onClick={() => setTheme('dark')}
            aria-label="Switch to dark mode"
            disabled={!mounted}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 'clamp(1.4rem, 7vw, 1.9rem)',
              letterSpacing: '-1.5px',
              textTransform: 'uppercase',
              lineHeight: 1,
              color: isDark ? 'var(--sm-accent, var(--accent))' : 'color-mix(in srgb, var(--text-primary) 28%, transparent)',
              transition: 'color 0.25s ease, opacity 0.25s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Dark
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div style={{
        borderTop: '1px solid color-mix(in srgb, var(--text-primary) 12%, transparent)',
        paddingTop: '1rem',
        marginTop: '1.25rem',
      }}>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Sign out"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: loggingOut ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700,
            fontSize: 'clamp(1.2rem, 5.5vw, 1.6rem)',
            letterSpacing: '-1px',
            textTransform: 'uppercase',
            lineHeight: 1,
            color: '#f43f5e',
            opacity: loggingOut ? 0.5 : 1,
            transition: 'opacity 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <LogOut size={20} strokeWidth={2.5} />
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}


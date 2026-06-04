'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/actions/notifications'
import { formatRelativeTime } from '@/lib/utils'
import type { Notification } from '@/types/database.types'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getNotifications()
      setNotifications(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleClick = async (notif: Notification) => {
    if (!notif.read) {
      await markAsRead(notif.id)
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))
    }
    if (notif.link) router.push(notif.link)
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getNotifDot = (type: string) => {
    switch (type) {
      case 'claim_approved': return 'G'
      case 'claim_rejected': return 'R'
      case 'new_claim': return 'N'
      case 'meetup_proposed':
      case 'meetup_confirmed': return 'M'
      case 'post_expiring': return 'T'
      default: return 'O'
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="container page-shell narrow" style={{ maxWidth: 700 }}>
      <div className="page-head">
        <h1 className="page-title">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-ghost btn-sm">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {loading && (
        <div className="notif-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="surface panel" style={{ display: 'flex', gap: 12 }}>
              <div className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">N</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>You are all caught up</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            We will let you know when something happens.
          </p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="notif-list">
          {notifications.map((notif, idx) => (
            <button
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`notif-item animate-slide-up ${notif.read ? '' : 'unread'}`}
              style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'both' }}
            >
              <span className="notif-dot">{getNotifDot(notif.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: notif.read ? 500 : 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {notif.title}
                </div>
                {notif.body && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {notif.body}
                  </div>
                )}
              </div>
              <span className="font-mono notif-time">{formatRelativeTime(notif.created_at)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import Link from 'next/link'
import PostCard from '@/components/posts/PostCard'
import PostFilters from '@/components/posts/PostFilters'
import CampusAnalytics from '@/components/analytics/CampusAnalytics'
import type { Post } from '@/types/database.types'
import { getFeedPosts } from '@/lib/actions/posts'

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<{
    type?: 'lost' | 'found'
    category?: string
    search?: string
  }>({})

  useEffect(() => {
    let cancelled = false

    getFeedPosts(filters).then((data) => {
      if (cancelled) return
      setPosts(data)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [filters])

  const handleFilterChange = (newFilters: {
    type?: 'lost' | 'found'
    category?: string
    search?: string
  }) => {
    setLoading(true)
    setFilters(newFilters)
  }

  return (
    <div>
      <PostFilters onFilterChange={handleFilterChange} />

      <div className="container feed-page">
        <div className="feed-layout">
          <div className="feed-shell">
          <div className="feed-header">
            <h1 className="feed-title">
              {filters.type === 'lost' ? 'Lost Items' : filters.type === 'found' ? 'Found Items' : 'All Items'}
            </h1>
          </div>

          {loading && (
            <div className="feed-stack">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="surface post-feed-card">
                  <div style={{ padding: '14px 14px 8px', display: 'flex', gap: 8 }}>
                    <div className="skeleton" style={{ height: 20, width: 78, borderRadius: 999 }} />
                    <div className="skeleton" style={{ height: 20, width: 92, borderRadius: 999 }} />
                  </div>
                  <div className="skeleton" style={{ height: 18, width: '54%', margin: '0 14px 10px' }} />
                  <div className="skeleton" style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 0 }} />
                  <div style={{ padding: '10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="skeleton" style={{ height: 14, width: '62%' }} />
                    <div className="skeleton" style={{ height: 16, width: '34%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="feed-empty animate-fade-in">
              <div className="feed-empty-icon">?</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>Nothing lost, nothing found</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Be the first to post an item
              </p>
              <Link href="/post/new" className="btn btn-primary">
                <Package size={18} />
                Post Something
              </Link>
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="feed-stack">
              {posts.map((post, idx) => (
                <div
                  key={post.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'both' }}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="feed-sidebar">
          <div className="feed-sidebar-sticky">
            <CampusAnalytics />
          </div>
        </aside>
      </div>
    </div>
  </div>
  )
}

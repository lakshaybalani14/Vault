'use client'

import Link from 'next/link'
import { MapPin, Tag, ArrowRight, Clock3 } from 'lucide-react'
import type { Post } from '@/types/database.types'
import { formatRelativeTime, getCategoryEmoji } from '@/lib/utils'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const isLost = post.type === 'lost'
  const imageUrl = post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : null
  const displayName = post.poster_name || 'Anonymous'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link href={`/post/${post.id}`} className="post-card-link">
      <article className="surface card-hover post-feed-card">
        <div className="post-feed-head">
          <div className="post-author">
            {post.poster_avatar ? (
              <img src={post.poster_avatar} alt={displayName} className="post-author-avatar" />
            ) : (
              <span className="post-author-avatar post-author-fallback">{initials}</span>
            )}
            <div className="post-author-meta">
              <span className="post-author-name">{displayName}</span>
              <span className="post-author-subtitle">posted this item</span>
            </div>
          </div>

          <div className="post-feed-head-left">
            <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
              {isLost ? 'LOST' : 'FOUND'}
            </span>
            <span className="badge badge-category">
              <Tag size={12} />
              {post.category}
            </span>
          </div>
          <span className="font-mono post-card-time">
            <Clock3 size={12} />
            {formatRelativeTime(post.created_at)}
          </span>
        </div>

        <h3 className="post-feed-title">{post.title}</h3>

        <div className="post-feed-media">
          {imageUrl ? (
            <img src={imageUrl} alt={post.title} className="post-card-img" />
          ) : (
            <span className="post-feed-emoji">{getCategoryEmoji(post.category)}</span>
          )}
        </div>

        <div className="post-feed-body">
          <p className="post-feed-description">
            {post.description}
          </p>
          <div className="post-card-meta">
            <span><MapPin size={13} />{post.found_at}</span>
          </div>
          <div className="card-cta">
            Open post
            <ArrowRight size={14} />
          </div>
        </div>
      </article>
    </Link>
  )
}

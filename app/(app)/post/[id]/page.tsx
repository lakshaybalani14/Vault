'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Tag, Clock, Flag, User } from 'lucide-react'
import { getPost } from '@/lib/actions/posts'
import { getCurrentUser } from '@/lib/actions/auth'
import { formatRelativeTime, getCategoryEmoji } from '@/lib/utils'
import ClaimModal from '@/components/claims/ClaimModal'
import MeetupCoordinator from '@/components/claims/MeetupCoordinator'

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [post, setPost] = useState<Record<string, unknown> | null>(null)
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    async function load() {
      const [postData, userData] = await Promise.all([getPost(id), getCurrentUser()])
      setPost(postData)
      setCurrentUser(userData)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)', marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 20, width: '60%' }} />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2>Post not found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This post may have been deleted or expired.</p>
        <button onClick={() => router.push('/feed')} className="btn btn-primary">Back to Feed</button>
      </div>
    )
  }

  const isLost = post.type === 'lost'
  const isOwner = currentUser && currentUser.id === post.user_id
  const images = (post.image_urls as string[]) || []
  const canClaim = !isOwner && post.status === 'open'

  return (
    <div className="container" style={{ paddingTop: 16, paddingBottom: 40, maxWidth: 720, margin: '0 auto' }}>
      {/* Back */}
      <button onClick={() => router.back()} className="btn btn-ghost" style={{ marginBottom: 16 }}>
        <ArrowLeft size={18} /> Back to Feed
      </button>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            width: '100%', height: 320, borderRadius: 'var(--radius-lg)',
            overflow: 'hidden', backgroundColor: 'var(--surface-2)', marginBottom: 8,
          }}>
            <img src={images[activeImage]} alt={post.title as string}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {images.map((url: string, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)} style={{
                  width: 64, height: 64, borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden', border: `2px solid ${i === activeImage ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', padding: 0,
                }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No image placeholder */}
      {images.length === 0 && (
        <div style={{
          width: '100%', height: 200, borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--surface-2)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: 24, fontSize: 64,
        }}>
          {getCategoryEmoji(post.category as string)}
        </div>
      )}

      {/* Meta badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
          {isLost ? 'LOST' : 'FOUND'}
        </span>
        <span className="badge badge-category">{getCategoryEmoji(post.category as string)} {post.category as string}</span>
        {post.status !== 'open' && (
          <span className={`badge ${post.status === 'claimed' ? 'badge-pending' : 'badge-resolved'}`}>
            {(post.status as string).toUpperCase()}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12 }}>{post.title as string}</h1>

      {/* Description */}
      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
        {post.description as string}
      </p>

      {/* Details */}
      <div className="surface" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DetailRow icon={<MapPin size={16} />} label="Location" value={post.found_at as string} />
          <DetailRow icon={<Tag size={16} />} label="Category" value={post.category as string} />
          <DetailRow icon={<Clock size={16} />} label="Posted" value={formatRelativeTime(post.created_at as string)} />
          <DetailRow icon={<User size={16} />} label="Posted by"
            value={post.is_anonymous ? 'Anonymous' : (post.poster_name as string || 'Unknown')} />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {canClaim && (
          <button onClick={() => setShowClaimModal(true)} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
            {isLost ? "I Found This" : "This is Mine"}
          </button>
        )}
        {isOwner && (
          <button onClick={() => router.push('/claims')} className="btn btn-secondary btn-lg" style={{ flex: 1 }}>
            View Claims
          </button>
        )}
        <button className="btn btn-ghost" style={{ color: 'var(--text-muted)' }}>
          <Flag size={16} /> Report
        </button>
      </div>

      {/* Meetup Coordinator */}
      {(post.status === 'claimed' || post.status === 'resolved') && (
        <MeetupCoordinator postId={post.id as string} />
      )}

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal
          postId={post.id as string}
          postType={post.type as 'lost' | 'found'}
          onClose={() => setShowClaimModal(false)}
        />
      )}
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', minWidth: 80 }}>{label}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Camera, Calendar, CheckCircle2, Grid3X3, ImagePlus, Mail, Pencil, Star, Trash2, UserPlus, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getProfilePageData, removeProfileAvatar, toggleFollowProfile, updateProfileAvatar, updateProfileName } from '@/lib/actions/profile'
import { getCategoryEmoji } from '@/lib/utils'
import type { Post, Profile } from '@/types/database.types'

type ProfileData = Awaited<ReturnType<typeof getProfilePageData>>
type ProfileTab = 'posts' | 'lost' | 'found' | 'resolved'
type PeopleModal = 'followers' | 'following' | null

export default function ProfilePage() {
  const params = useParams<{ id: string }>()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [followingBusy, setFollowingBusy] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts')
  const [peopleModal, setPeopleModal] = useState<PeopleModal>(null)
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)

  const profileId = params.id

  const applyProfileData = useCallback((nextData: ProfileData) => {
    setData(nextData)
    setDraftName(nextData.profile?.name || '')
  }, [])

  const refreshProfile = useCallback(async () => {
    const nextData = await getProfilePageData(profileId)
    applyProfileData(nextData)
  }, [applyProfileData, profileId])

  useEffect(() => {
    let cancelled = false

    getProfilePageData(profileId).then((nextData) => {
      if (cancelled) return
      applyProfileData(nextData)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [applyProfileData, profileId])

  const profile = data?.profile || null
  const posts = useMemo(() => data?.posts || [], [data?.posts])

  const filteredPosts = useMemo(() => {
    switch (activeTab) {
      case 'lost':
        return posts.filter((post) => post.type === 'lost')
      case 'found':
        return posts.filter((post) => post.type === 'found')
      case 'resolved':
        return posts.filter((post) => post.status === 'resolved')
      default:
        return posts
    }
  }, [activeTab, posts])

  const initials = (profile?.name || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleAvatarUpload = async (file: File) => {
    if (!profile || !data?.isOwnProfile) return

    setUploading(true)
    setAvatarMenuOpen(false)
    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${profile.id}/avatar-${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('profile-avatars').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

    if (error) {
      toast.error(error.message)
      setUploading(false)
      return
    }

    const { data: publicUrl } = supabase.storage.from('profile-avatars').getPublicUrl(path)
    const result = await updateProfileAvatar(publicUrl.publicUrl)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile photo updated')
      await refreshProfile()
    }
    setUploading(false)
  }

  const handleAvatarRemove = async () => {
    if (!profile || !data?.isOwnProfile) return
    setAvatarMenuOpen(false)
    setUploading(true)
    const result = await removeProfileAvatar()
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile photo removed')
      await refreshProfile()
    }
    setUploading(false)
  }

  const handleSaveName = async () => {
    setSavingName(true)
    const result = await updateProfileName(draftName)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile updated')
      setEditingName(false)
      await refreshProfile()
    }
    setSavingName(false)
  }

  const handleFollowToggle = async () => {
    if (!profile) return
    setFollowingBusy(true)
    const result = await toggleFollowProfile(profile.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      await refreshProfile()
    }
    setFollowingBusy(false)
  }

  if (loading) {
    return (
      <div className="container profile-shell">
        <div className="profile-topline">
          <div className="skeleton profile-avatar-large" />
          <div className="profile-header-main">
            <div className="skeleton" style={{ height: 28, width: 180 }} />
            <div className="skeleton" style={{ height: 16, width: 260, marginTop: 12 }} />
            <div className="profile-stats-row">
              {[1, 2, 3].map((item) => (
                <div key={item} className="skeleton" style={{ height: 54, flex: 1 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container profile-shell">
        <div className="empty-state">
          <div className="empty-icon">?</div>
          <h1 className="page-title">Profile not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container profile-shell">
      <section className="profile-topline">
        <div className="profile-avatar-wrap">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} className="profile-avatar-large" />
          ) : (
            <div className="profile-avatar-large profile-avatar-fallback">{initials}</div>
          )}

          {data?.isOwnProfile && (
            <>
              <button
                className="profile-avatar-action"
                onClick={() => setAvatarMenuOpen((prev) => !prev)}
                disabled={uploading}
                aria-label="Change profile picture"
                aria-expanded={avatarMenuOpen}
              >
                {uploading ? (
                  <span className="avatar-spinner" />
                ) : (
                  /* 2-bar menu icon — always dark on white circle */
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
                    <rect x="0" y="1" width="16" height="2.5" rx="1.25" fill="#1e293b" />
                    <rect x="2" y="8.5" width="12" height="2.5" rx="1.25" fill="#1e293b" />
                  </svg>
                )}
              </button>

              {avatarMenuOpen && (
                <>
                  <div className="avatar-menu-backdrop" onClick={() => setAvatarMenuOpen(false)} />
                  <div className="avatar-menu" role="menu">
                    <p className="avatar-menu-title">Profile photo</p>
                    <button
                      className="avatar-menu-item"
                      role="menuitem"
                      onClick={() => {
                        setAvatarMenuOpen(false)
                        cameraInputRef.current?.click()
                      }}
                    >
                      <Camera size={16} />
                      Take a photo
                    </button>
                    <button
                      className="avatar-menu-item"
                      role="menuitem"
                      onClick={() => {
                        setAvatarMenuOpen(false)
                        fileInputRef.current?.click()
                      }}
                    >
                      <ImagePlus size={16} />
                      Choose from gallery
                    </button>
                    {profile.avatar_url && (
                      <button
                        className="avatar-menu-item avatar-menu-item-danger"
                        role="menuitem"
                        onClick={handleAvatarRemove}
                      >
                        <Trash2 size={16} />
                        Remove current photo
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Gallery picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleAvatarUpload(file)
                  event.target.value = ''
                }}
              />
              {/* Camera capture (opens native camera on mobile) */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleAvatarUpload(file)
                  event.target.value = ''
                }}
              />
            </>
          )}
        </div>

        <div className="profile-header-main">
          <div className="profile-title-row">
            {editingName ? (
              <div className="profile-name-editor">
                <input className="input" value={draftName} onChange={(event) => setDraftName(event.target.value)} />
                <button className="btn btn-primary btn-sm" onClick={handleSaveName} disabled={savingName}>
                  Save
                </button>
              </div>
            ) : (
              <>
                <h1 className="profile-name">{profile.name}</h1>
                {data?.isOwnProfile && (
                  <button className="icon-button" onClick={() => setEditingName(true)} aria-label="Edit name">
                    <Pencil size={16} />
                  </button>
                )}
              </>
            )}
          </div>

          <div className="profile-meta-row">
            <span><Mail size={14} />{profile.email}</span>
            <span><Calendar size={14} />Joined {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            <span><Star size={14} />{profile.trust_score.toFixed(1)} trust</span>
          </div>

          <div className="profile-stats-row">
            <ProfileStat value={posts.length} label="posts" />
            <ProfileStat value={data?.followersCount || 0} label="followers" onClick={() => setPeopleModal('followers')} />
            <ProfileStat value={data?.followingCount || 0} label="following" onClick={() => setPeopleModal('following')} />
          </div>

          {!data?.isOwnProfile && (
            <button className={data?.isFollowing ? 'btn btn-secondary profile-follow-btn' : 'btn btn-primary profile-follow-btn'} onClick={handleFollowToggle} disabled={followingBusy}>
              {data?.isFollowing ? <CheckCircle2 size={16} /> : <UserPlus size={16} />}
              {data?.isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </section>

      <nav className="profile-tabs" aria-label="Profile posts">
        {[
          { key: 'posts', label: 'Posts', icon: Grid3X3 },
          { key: 'lost', label: 'Lost', icon: Users },
          { key: 'found', label: 'Found', icon: CheckCircle2 },
          { key: 'resolved', label: 'Resolved', icon: Star },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.key} className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key as ProfileTab)}>
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {filteredPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">0</div>
          <p style={{ color: 'var(--text-secondary)' }}>
            {data?.isOwnProfile ? 'Your profile grid is waiting for its first post.' : 'No posts to show here yet.'}
          </p>
        </div>
      ) : (
        <div className="profile-post-grid">
          {filteredPosts.map((post) => (
            <ProfilePostTile key={post.id} post={post} profile={profile} />
          ))}
        </div>
      )}

      {peopleModal && (
        <ProfilePeopleModal
          title={peopleModal === 'followers' ? 'Followers' : 'Following'}
          people={peopleModal === 'followers' ? data?.followers || [] : data?.following || []}
          emptyText={peopleModal === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
          onClose={() => setPeopleModal(null)}
        />
      )}
    </div>
  )
}

function ProfileStat({ value, label, onClick }: { value: number | string; label: string; onClick?: () => void }) {
  const content = (
    <>
      <strong>{value}</strong>
      <span>{label}</span>
    </>
  )

  if (onClick) {
    return (
      <button className="profile-stat profile-stat-button" onClick={onClick}>
        {content}
      </button>
    )
  }

  return (
    <div className="profile-stat">
      {content}
    </div>
  )
}

function ProfilePeopleModal({
  title,
  people,
  emptyText,
  onClose,
}: {
  title: string
  people: Profile[]
  emptyText: string
  onClose: () => void
}) {
  return (
    <div className="profile-people-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="profile-people-card surface" onClick={(event) => event.stopPropagation()}>
        <div className="profile-people-head">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {people.length === 0 ? (
          <p className="profile-people-empty">{emptyText}</p>
        ) : (
          <div className="profile-people-list">
            {people.map((person) => (
              <Link key={person.id} href={`/profile/${person.id}`} className="profile-person-row" onClick={onClose}>
                {person.avatar_url ? (
                  <img src={person.avatar_url} alt={person.name} className="profile-person-avatar" />
                ) : (
                  <span className="profile-person-avatar profile-person-fallback">{getInitials(person.name)}</span>
                )}
                <span>
                  <strong>{person.name}</strong>
                  <small>{person.email}</small>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function ProfilePostTile({ post, profile }: { post: Post; profile: Profile }) {
  const imageUrl = post.image_urls?.[0] || null

  return (
    <Link href={`/post/${post.id}`} className="profile-post-tile">
      <div className="profile-post-media">
        {imageUrl ? (
          <img src={imageUrl} alt={post.title} />
        ) : (
          <span>{getCategoryEmoji(post.category)}</span>
        )}
      </div>
      <div className="profile-post-overlay">
        <span className={`badge ${post.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>{post.type}</span>
        <strong>{post.title}</strong>
        <small>{profile.name}</small>
      </div>
    </Link>
  )
}

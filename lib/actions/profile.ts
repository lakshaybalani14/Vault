'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { Follow, Post, Profile } from '@/types/database.types'

type ProfilePageData = {
  profile: Profile | null
  currentUser: Profile | null
  posts: Post[]
  followers: Profile[]
  following: Profile[]
  followersCount: number
  followingCount: number
  isFollowing: boolean
  isOwnProfile: boolean
}

function withPosterFields(posts: Post[], profile: Profile | null) {
  return posts.map((post) => ({
    ...post,
    poster_name: post.is_anonymous ? null : profile?.name || null,
    poster_avatar: post.is_anonymous ? null : profile?.avatar_url || null,
    poster_trust_score: profile?.trust_score || 5,
  }))
}

async function getProfilesByIds(ids: string[]) {
  if (ids.length === 0) return []

  const supabase = await createServerClient()
  const { data } = await supabase.from('profiles').select('*').in('id', ids)
  const byId = new Map((data || []).map((profile) => [profile.id, profile as Profile]))

  return ids.map((id) => byId.get(id)).filter(Boolean) as Profile[]
}

export async function getProfilePageData(profileId: string): Promise<ProfilePageData> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const currentUserId = user?.id || null
  const targetId = profileId === 'me' ? currentUserId : profileId

  if (!targetId) {
    return {
      profile: null,
      currentUser: null,
      posts: [],
      followers: [],
      following: [],
      followersCount: 0,
      followingCount: 0,
      isFollowing: false,
      isOwnProfile: false,
    }
  }

  const [{ data: profile }, { data: currentUser }, { data: posts }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', targetId).single(),
    currentUserId ? supabase.from('profiles').select('*').eq('id', currentUserId).single() : Promise.resolve({ data: null }),
    supabase.from('posts').select('*').eq('user_id', targetId).order('created_at', { ascending: false }),
  ])

  const [{ data: followerRows }, { data: followingRows }] = await Promise.all([
    supabase.from('follows').select('follower_id').eq('following_id', targetId).order('created_at', { ascending: false }),
    supabase.from('follows').select('following_id').eq('follower_id', targetId).order('created_at', { ascending: false }),
  ])

  const followerIds = ((followerRows || []) as Pick<Follow, 'follower_id'>[]).map((row) => row.follower_id)
  const followingIds = ((followingRows || []) as Pick<Follow, 'following_id'>[]).map((row) => row.following_id)

  const [followers, following] = await Promise.all([getProfilesByIds(followerIds), getProfilesByIds(followingIds)])

  let isFollowing = false
  if (currentUserId && currentUserId !== targetId) {
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetId)
      .maybeSingle()
    isFollowing = Boolean(data)
  }

  return {
    profile: (profile as Profile | null) || null,
    currentUser: (currentUser as Profile | null) || null,
    posts: withPosterFields((posts || []) as Post[], (profile as Profile | null) || null),
    followers,
    following,
    followersCount: followers.length,
    followingCount: following.length,
    isFollowing,
    isOwnProfile: Boolean(currentUserId && currentUserId === targetId),
  }
}

export async function updateProfileAvatar(avatarUrl: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function removeProfileAvatar() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateProfileName(name: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  const trimmedName = name.trim()
  if (trimmedName.length < 2) return { error: 'Name must be at least 2 characters.' }

  const { error } = await supabase
    .from('profiles')
    .update({ name: trimmedName, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function toggleFollowProfile(targetProfileId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (user.id === targetProfileId) return { error: 'You cannot follow yourself.' }

  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', targetProfileId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetProfileId)

    if (error) return { error: error.message }
    return { success: true, following: false }
  }

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: targetProfileId })

  if (error) return { error: error.message }
  return { success: true, following: true }
}

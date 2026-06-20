'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UserProfileWithMetrics {
  id: string
  name: string
  email: string
  avatar_url: string | null
  trust_score: number
  followers_count: number
  following_count: number
}

// 1. Search Users
export async function searchUsers(query: string) {
  const supabase = await createServerClient()
  
  if (!query.trim()) {
    return []
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, avatar_url, trust_score')
    .ilike('name', `%${query}%`)
    .limit(20)

  if (error) {
    console.error('Error searching users:', error)
    return []
  }

  return data
}

// 2. Get User Profile with Follower Counts
export async function getUserProfile(userId: string): Promise<UserProfileWithMetrics | null> {
  const supabase = await createServerClient()

  // Parallel fetch: profile data, followers count, following count
  const [profileResult, followersResult, followingResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', userId)
  ])

  if (profileResult.error || !profileResult.data) {
    return null
  }

  return {
    ...profileResult.data,
    followers_count: followersResult.count || 0,
    following_count: followingResult.count || 0,
  }
}

// 3. Get Follow Status
export async function getFollowStatus(targetUserId: string): Promise<boolean> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false
  if (user.id === targetUserId) return false

  const { data, error } = await supabase
    .from('follows')
    .select('created_at')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single()

  if (error) return false
  return !!data
}

// 4. Toggle Follow
export async function toggleFollow(targetUserId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (user.id === targetUserId) return { error: 'Cannot follow yourself' }

  // Check if currently following
  const isFollowing = await getFollowStatus(targetUserId)

  if (isFollowing) {
    // Unfollow
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)

    if (error) return { error: error.message }
  } else {
    // Follow
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      })

    if (error) return { error: error.message }

    // Fetch follower name to include in notification
    const { data: followerProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    const followerName = followerProfile?.name || 'Someone'

    // Insert Notification
    await supabase.from('notifications').insert({
      user_id: targetUserId,
      type: 'new_follower',
      title: 'New Follower',
      body: `${followerName} started following you.`,
      link: `/profile/${user.id}`,
    })
  }

  revalidatePath('/users')
  revalidatePath(`/profile/${targetUserId}`)
  revalidatePath('/profile')

  return { success: true, isFollowing: !isFollowing }
}

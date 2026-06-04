'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function getWeeklyAnalytics() {
  const supabase = await createServerClient()
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // 1. Lost items reported this week
  const { count: lostCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'lost')
    .gte('created_at', oneWeekAgo)

  // 2. Found items posted this week
  const { count: foundCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'found')
    .gte('created_at', oneWeekAgo)

  // 3. Claims approved this week
  const { data: approvedClaims } = await supabase
    .from('claims')
    .select('updated_at, posts!inner(created_at)')
    .eq('status', 'approved')
    .gte('updated_at', oneWeekAgo)

  const reunitedCount = approvedClaims?.length || 0

  let avgResolutionHours = 0
  if (reunitedCount > 0 && approvedClaims) {
    type ApprovedClaimRow = {
      updated_at: string
      posts: { created_at: string } | Array<{ created_at: string }>
    }

    let totalMs = 0
    ;(approvedClaims as ApprovedClaimRow[]).forEach((claim) => {
      const post = Array.isArray(claim.posts) ? claim.posts[0] : claim.posts
      if (!post?.created_at) return

      const postCreatedAt = new Date(post.created_at).getTime()
      const claimApprovedAt = new Date(claim.updated_at).getTime()
      totalMs += claimApprovedAt - postCreatedAt
    })
    avgResolutionHours = Number((totalMs / reunitedCount / (1000 * 60 * 60)).toFixed(1))
  }

  return {
    lostCount: lostCount || 0,
    foundCount: foundCount || 0,
    reunitedCount,
    avgResolutionHours,
  }
}

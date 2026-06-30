'use server'

import { createServerClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { MAX_CLAIM_ATTEMPTS, LOCKOUT_HOURS } from '@/lib/constants'

export async function getSecretQuestion(postId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: questionData } = await supabase
    .from('secret_questions')
    .select('question')
    .eq('post_id', postId)
    .maybeSingle()

  const question = questionData?.question || null

  if (!user) {
    return { question, attemptsLeft: MAX_CLAIM_ATTEMPTS, isLocked: false, remainingHours: 0 }
  }

  const { data: claim } = await supabase
    .from('claims')
    .select('attempts, locked_until')
    .eq('post_id', postId)
    .eq('claimer_id', user.id)
    .maybeSingle()

  const attempts = claim?.attempts || 0
  const lockedUntilStr = claim?.locked_until

  let isLocked = false
  let remainingHours = 0

  if (lockedUntilStr && new Date(lockedUntilStr) > new Date()) {
    isLocked = true
    remainingHours = Math.ceil((new Date(lockedUntilStr).getTime() - Date.now()) / 3600000)
  }

  const attemptsLeft = isLocked ? 0 : Math.max(0, MAX_CLAIM_ATTEMPTS - attempts)

  return {
    question,
    attemptsLeft,
    isLocked,
    remainingHours,
  }
}

export async function verifyClaimAnswer(postId: string, typedAnswer: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if user already has a claim on this post
  const { data: existingClaim } = await supabase
    .from('claims')
    .select('id, attempts, locked_until, status')
    .eq('post_id', postId)
    .eq('claimer_id', user.id)
    .maybeSingle()

  // Block if already approved or rejected
  if (existingClaim?.status === 'approved') {
    return { error: 'Your claim on this post has already been approved.' }
  }
  if (existingClaim?.status === 'rejected') {
    return { error: 'Your claim on this post was rejected. You cannot re-submit.' }
  }

  // Block if locked out
  if (existingClaim?.locked_until && new Date(existingClaim.locked_until) > new Date()) {
    const remaining = Math.ceil(
      (new Date(existingClaim.locked_until).getTime() - Date.now()) / 3600000
    )
    return { error: `Too many failed attempts. You are locked out. Try again in ${remaining} hour${remaining === 1 ? '' : 's'}.` }
  }

  // Fetch the answer hash
  const { data: question } = await supabase
    .from('secret_questions')
    .select('answer_hash')
    .eq('post_id', postId)
    .maybeSingle()

  if (!question) return { error: 'Secret question not found.' }

  const isCorrect = await bcrypt.compare(
    typedAnswer.trim().toLowerCase().replace(/\s+/g, ''),
    question.answer_hash
  )

  if (!isCorrect) {
    const newAttempts = (existingClaim?.attempts ?? 0) + 1
    const shouldLock = newAttempts >= MAX_CLAIM_ATTEMPTS

    // Upsert claim with incremented attempts
    await supabase.from('claims').upsert({
      post_id: postId,
      claimer_id: user.id,
      attempts: newAttempts,
      locked_until: shouldLock
        ? new Date(Date.now() + LOCKOUT_HOURS * 60 * 60 * 1000).toISOString()
        : null,
      status: 'pending',
    }, { onConflict: 'post_id,claimer_id' })

    // Add strike on lockout
    if (shouldLock) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('strikes')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        const newStrikes = (profile.strikes || 0) + 1
        await supabase
          .from('profiles')
          .update({ strikes: newStrikes })
          .eq('id', user.id)
      }

      // Notify poster
      const { data: post } = await supabase
        .from('posts')
        .select('user_id, title')
        .eq('id', postId)
        .maybeSingle()

      if (post) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          type: 'new_claim',
          title: 'Suspicious claim attempts',
          body: `Someone made ${MAX_CLAIM_ATTEMPTS} failed claim attempts on your post "${post.title}".`,
          link: `/post/${postId}`,
        })
      }
    }

    const attemptsLeft = Math.max(0, MAX_CLAIM_ATTEMPTS - newAttempts)
    return {
      error: shouldLock
        ? 'Too many wrong attempts. You are locked out for 24 hours.'
        : `Answer incorrect. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`,
      attemptsLeft,
    }
  }

  return { success: true }
}

export async function submitClaim(postId: string, message: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Save the claim with message
  const { error } = await supabase.from('claims').upsert({
    post_id: postId,
    claimer_id: user.id,
    message,
    status: 'pending',
  }, { onConflict: 'post_id,claimer_id' })

  if (error) return { error: error.message }

  // Notify poster
  const { data: post } = await supabase
    .from('posts')
    .select('user_id, title')
    .eq('id', postId)
    .single()

  if (post) {
    await supabase.from('notifications').insert({
      user_id: post.user_id,
      type: 'new_claim',
      title: 'New claim on your post',
      body: `Someone has claimed your post "${post.title}". Review it now.`,
      link: '/claims',
    })
  }

  return { success: true }
}

export async function getClaimsForUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get posts owned by this user, then claims on those posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', user.id)

  if (!posts || posts.length === 0) return []

  const postIds = posts.map(p => p.id)

  const { data: claims, error } = await supabase
    .from('claims')
    .select(`
      *,
      profiles!claims_claimer_id_fkey (
        name,
        avatar_url,
        trust_score,
        created_at,
        strikes
      ),
      posts!claims_post_id_fkey (
        title,
        type
      )
    `)
    .in('post_id', postIds)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching claims:', error)
    return []
  }

  return (claims || []).map((claim: Record<string, unknown>) => {
    const profiles = claim.profiles as Record<string, unknown> | null
    const claimPosts = claim.posts as Record<string, unknown> | null
    return {
      ...claim,
      claimer_name: (profiles?.name as string) || 'Unknown',
      claimer_avatar: (profiles?.avatar_url as string) || null,
      claimer_trust_score: (profiles?.trust_score as number) || 5.0,
      claimer_created_at: (profiles?.created_at as string) || '',
      claimer_strikes: (profiles?.strikes as number) || 0,
      post_title: (claimPosts?.title as string) || '',
      post_type: (claimPosts?.type as string) || '',
      answer_correct: true, // If they got to the message step, their answer was correct
      profiles: undefined,
      posts: undefined,
    }
  })
}

export async function approveClaim(claimId: string, postId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify ownership
  const { data: post } = await supabase
    .from('posts')
    .select('user_id, title')
    .eq('id', postId)
    .single()

  if (!post || post.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Approve this claim
  await supabase
    .from('claims')
    .update({ status: 'approved' })
    .eq('id', claimId)

  // Auto-reject all other pending claims
  await supabase
    .from('claims')
    .update({ status: 'rejected' })
    .eq('post_id', postId)
    .neq('id', claimId)
    .eq('status', 'pending')

  // Update post status
  await supabase
    .from('posts')
    .update({ status: 'claimed' })
    .eq('id', postId)

  // Get the claim to notify claimer
  const { data: claim } = await supabase
    .from('claims')
    .select('claimer_id')
    .eq('id', claimId)
    .single()

  if (claim) {
    await supabase.from('notifications').insert({
      user_id: claim.claimer_id,
      type: 'claim_approved',
      title: 'Claim approved! 🎉',
      body: `Your claim on "${post.title}" has been approved. Coordinate a meetup now.`,
      link: `/post/${postId}`,
    })
  }

  return { success: true }
}

export async function rejectClaim(claimId: string, postId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify ownership
  const { data: post } = await supabase
    .from('posts')
    .select('user_id, title')
    .eq('id', postId)
    .single()

  if (!post || post.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  await supabase
    .from('claims')
    .update({ status: 'rejected' })
    .eq('id', claimId)

  // Notify claimer
  const { data: claim } = await supabase
    .from('claims')
    .select('claimer_id')
    .eq('id', claimId)
    .single()

  if (claim) {
    await supabase.from('notifications').insert({
      user_id: claim.claimer_id,
      type: 'claim_rejected',
      title: 'Claim not approved',
      body: `Your claim on "${post.title}" was reviewed and not approved.`,
      link: `/post/${postId}`,
    })
  }

  return { success: true }
}

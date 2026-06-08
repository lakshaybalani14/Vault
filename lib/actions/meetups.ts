'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { Meetup, Rating, Profile, Claim } from '@/types/database.types'

export async function getMeetupDetails(postId: string) {
  const supabase = await createServerClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return null

  // 1. Get the approved claim for the post
  const { data: claim, error: claimError } = await supabase
    .from('claims')
    .select(`
      *,
      claimer:profiles!claims_claimer_id_fkey (*)
    `)
    .eq('post_id', postId)
    .eq('status', 'approved')
    .maybeSingle()

  if (claimError || !claim) return null

  // 2. Get the post details to find the owner
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      *,
      owner:profiles!posts_user_id_fkey (*)
    `)
    .eq('id', postId)
    .single()

  if (postError || !post) return null

  // Ensure current user is either the claimer or the post owner
  const isClaimer = currentUser.id === claim.claimer_id
  const isOwner = currentUser.id === post.user_id
  if (!isClaimer && !isOwner) return null

  // 3. Get the meetup details for the claim
  const { data: meetup, error: meetupError } = await supabase
    .from('meetups')
    .select('*')
    .eq('claim_id', claim.id)
    .maybeSingle()

  // 4. Get ratings associated with this meetup if it exists
  let ratings: Rating[] = []
  if (meetup) {
    const { data: ratingData } = await supabase
      .from('ratings')
      .select('*')
      .eq('meetup_id', meetup.id)
    ratings = (ratingData || []) as unknown as Rating[]
  }

  return {
    claim: claim as unknown as Claim & { claimer: Profile },
    post: post as unknown as any,
    meetup: meetup as unknown as Meetup | null,
    ratings,
    currentUserRole: isClaimer ? ('claimer' as const) : ('owner' as const),
    otherUser: (isClaimer ? post.owner : claim.claimer) as unknown as Profile,
  }
}

export async function proposeMeetup(data: {
  claimId: string
  postId: string
  location: string
  time: string
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify claim exists and caller is authorized
  const { data: claim } = await supabase
    .from('claims')
    .select('claimer_id, posts(user_id, title)')
    .eq('id', data.claimId)
    .single()

  if (!claim) return { error: 'Claim not found' }

  const post = claim.posts as unknown as { user_id: string; title: string }
  const isClaimer = user.id === claim.claimer_id
  const isOwner = user.id === post.user_id

  if (!isClaimer && !isOwner) {
    return { error: 'Unauthorized' }
  }

  // Upsert the meetup
  const { data: meetup, error } = await supabase
    .from('meetups')
    .upsert({
      claim_id: data.claimId,
      proposed_by: user.id,
      proposed_location: data.location,
      proposed_time: data.time,
      status: 'pending',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'claim_id' })
    .select()
    .single()

  if (error) return { error: error.message }

  // Notify the other user
  const targetUserId = isClaimer ? post.user_id : claim.claimer_id
  await supabase.from('notifications').insert({
    user_id: targetUserId,
    type: 'meetup_proposed',
    title: 'Meetup Proposed! 📍',
    body: `A meetup has been proposed for "${post.title}". Check details.`,
    link: `/post/${data.postId}`,
  })

  return { success: true, meetup }
}

export async function acceptMeetup(meetupId: string, postId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get meetup details
  const { data: meetup } = await supabase
    .from('meetups')
    .select('*, claims(claimer_id, posts(user_id, title))')
    .eq('id', meetupId)
    .single()

  if (!meetup) return { error: 'Meetup not found' }

  const claim = meetup.claims as unknown as { claimer_id: string; posts: { user_id: string; title: string } }
  const post = claim.posts
  const isClaimer = user.id === claim.claimer_id
  const isOwner = user.id === post.user_id

  if (!isClaimer && !isOwner) {
    return { error: 'Unauthorized' }
  }

  // Prevent accepting your own proposal
  if (meetup.proposed_by === user.id) {
    return { error: 'You cannot accept your own proposed meetup.' }
  }

  // Update status to confirmed
  const { error } = await supabase
    .from('meetups')
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', meetupId)

  if (error) return { error: error.message }

  // Notify the proposer
  await supabase.from('notifications').insert({
    user_id: meetup.proposed_by,
    type: 'meetup_confirmed',
    title: 'Meetup Confirmed! ✅',
    body: `The proposed meetup for "${post.title}" has been accepted.`,
    link: `/post/${postId}`,
  })

  return { success: true }
}

export async function cancelMeetup(meetupId: string, postId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: meetup } = await supabase
    .from('meetups')
    .select('*, claims(claimer_id, posts(user_id, title))')
    .eq('id', meetupId)
    .single()

  if (!meetup) return { error: 'Meetup not found' }

  const claim = meetup.claims as unknown as { claimer_id: string; posts: { user_id: string; title: string } }
  const post = claim.posts
  const isClaimer = user.id === claim.claimer_id
  const isOwner = user.id === post.user_id

  if (!isClaimer && !isOwner) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('meetups')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', meetupId)

  if (error) return { error: error.message }

  // Notify the other user
  const otherUser = user.id === claim.claimer_id ? post.user_id : claim.claimer_id
  await supabase.from('notifications').insert({
    user_id: otherUser,
    type: 'system',
    title: 'Meetup Cancelled ❌',
    body: `The meetup for "${post.title}" was cancelled. Please reschedule.`,
    link: `/post/${postId}`,
  })

  return { success: true }
}

export async function submitRating(meetupId: string, ratedUserId: string, score: number, postId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (score < 1 || score > 5) return { error: 'Invalid score' }

  // Check if rating already exists for this rater and meetup
  const { data: existingRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('meetup_id', meetupId)
    .eq('rater_id', user.id)
    .maybeSingle()

  if (existingRating) {
    return { error: 'You have already rated the other user for this meetup.' }
  }

  // Insert the rating
  const { error: ratingError } = await supabase
    .from('ratings')
    .insert({
      meetup_id: meetupId,
      rater_id: user.id,
      rated_id: ratedUserId,
      score,
    })

  if (ratingError) return { error: ratingError.message }

  // 1. Recalculate average trust score for the rated user
  const { data: ratings } = await supabase
    .from('ratings')
    .select('score')
    .eq('rated_id', ratedUserId)

  const scores = ratings?.map((r) => r.score) || []
  const averageScore = scores.length > 0
    ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
    : 5.0

  // 2. Update the rated user's trust score in profiles
  await supabase
    .from('profiles')
    .update({ trust_score: averageScore })
    .eq('id', ratedUserId)

  // 3. Check if both sides have rated now
  // A meetup has 2 participants. If we have 2 ratings for this meetup, mark the meetup and post as resolved.
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('rater_id')
    .eq('meetup_id', meetupId)

  const hasTwoRatings = allRatings && allRatings.length >= 2

  if (hasTwoRatings) {
    // Update meetup to completed
    await supabase
      .from('meetups')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', meetupId)

    // Update post to resolved
    await supabase
      .from('posts')
      .update({ status: 'resolved' })
      .eq('id', postId)
  }

  // Notify the rated user
  await supabase.from('notifications').insert({
    user_id: ratedUserId,
    type: 'new_rating',
    title: 'New Rating Received! ⭐',
    body: `Someone rated you for your recent meetup.`,
    link: `/profile/${ratedUserId}`,
  })

  return { success: true, isFullyCompleted: hasTwoRatings }
}

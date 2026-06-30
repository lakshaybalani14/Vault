'use server'

import { createServerClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import type { Post } from '@/types/database.types'
import { normalizeAnswer } from '@/lib/utils'

export async function createPost(formData: FormData) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const type = formData.get('type') as 'lost' | 'found'
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const found_at = formData.get('found_at') as string
  const is_anonymous = formData.get('is_anonymous') === 'true'
  const question = formData.get('question') as string
  const answer = formData.get('answer') as string
  const images = formData.getAll('images') as File[]

  const image_urls: string[] = []
  for (const image of images) {
    if (image.size > 0) {
      const buffer = await image.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      image_urls.push(`data:${image.type || 'image/jpeg'};base64,${base64}`)
    }
  }

  // Create the post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      type,
      title,
      description,
      category,
      found_at,
      is_anonymous,
      image_urls,
    })
    .select()
    .single()

  if (postError) return { error: postError.message }

  // Hash and save the secret question
  const normalized = normalizeAnswer(answer)
  const answer_hash = await bcrypt.hash(normalized, 10)

  const { error: questionError } = await supabase
    .from('secret_questions')
    .insert({
      post_id: post.id,
      question,
      answer_hash,
    })

  if (questionError) {
    // Clean up the post if question insert fails
    await supabase.from('posts').delete().eq('id', post.id)
    return { error: questionError.message }
  }

  return { success: true, postId: post.id }
}

export async function getFeedPosts(filters?: {
  type?: 'lost' | 'found'
  category?: string
  search?: string
  status?: string
}): Promise<Post[]> {
  const supabase = await createServerClient()

  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey (
        name,
        avatar_url,
        trust_score
      )
    `)
    .eq('status', filters?.status || 'open')
    .order('created_at', { ascending: false })
    .limit(50)

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category)
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return (data || []).map((post: Record<string, unknown>) => {
    const profiles = post.profiles as Record<string, unknown> | null
    return {
      ...post,
      poster_name: post.is_anonymous ? null : (profiles?.name as string) || null,
      poster_avatar: post.is_anonymous ? null : (profiles?.avatar_url as string) || null,
      poster_trust_score: (profiles?.trust_score as number) || 5.0,
      profiles: undefined,
    }
  }) as unknown as Post[]
}

export async function getPost(postId: string) {
  const supabase = await createServerClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey (
        name,
        avatar_url,
        trust_score,
        created_at
      ),
      secret_questions (
        question
      )
    `)
    .eq('id', postId)
    .single()

  if (error || !post) return null

  const profiles = post.profiles as Record<string, unknown> | null
  const questions = post.secret_questions as Record<string, unknown>[] | null

  return {
    ...post,
    poster_name: post.is_anonymous ? null : (profiles?.name as string) || null,
    poster_avatar: post.is_anonymous ? null : (profiles?.avatar_url as string) || null,
    poster_trust_score: (profiles?.trust_score as number) || 5.0,
    secret_question: questions?.[0]?.question as string || null,
    profiles: undefined,
    secret_questions: undefined,
  }
}

export async function getUserPosts(userId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as unknown as Post[]
}

export async function deletePost(postId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Clean up storage images
  const { data: post } = await supabase
    .from('posts')
    .select('image_urls, user_id')
    .eq('id', postId)
    .single()

  if (!post || post.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Delete images from storage
  if (post.image_urls && post.image_urls.length > 0) {
    const { data: files } = await supabase.storage
      .from('post-images')
      .list(postId)

    if (files && files.length > 0) {
      const paths = files.map(f => `${postId}/${f.name}`)
      await supabase.storage.from('post-images').remove(paths)
    }
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function uploadImages(files: File[], postId: string): Promise<string[]> {
  const supabase = await createServerClient()
  const urls: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${postId}/${crypto.randomUUID()}.${ext}`

    const buffer = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from('post-images')
      .upload(path, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (error) throw new Error(`Upload failed: ${error.message}`)

    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(path)

    urls.push(data.publicUrl)
  }

  return urls
}

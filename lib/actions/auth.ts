'use server'

import { createServerClient } from '@/lib/supabase/server'
import { ALLOWED_DOMAINS } from '@/lib/constants'
import { redirect } from 'next/navigation'

export async function registerUser(formData: {
  name: string
  email: string
  password: string
}) {
  const { name, email, password } = formData
  const domain = email.split('@')[1]

  if (!ALLOWED_DOMAINS.includes(domain)) {
    return { error: 'Please use your VIT college email address.' }
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) return { error: error.message }

  // Server-side redirect so cookies/session state is consistent
  redirect('/verify')
}

export async function loginUser(formData: {
  email: string
  password: string
}) {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) return { error: error.message }

  // Server-side redirect so Set-Cookie headers are sent correctly
  redirect('/feed')
}

export async function logoutUser() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile || {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar_url: null,
    trust_score: 5.0,
    strikes: 0,
    is_banned: false,
    created_at: user.created_at,
    updated_at: user.created_at,
  }
}

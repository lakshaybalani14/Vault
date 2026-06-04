'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { Notification } from '@/types/database.types'

export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return []
  return (data || []) as unknown as Notification[]
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) return 0
  return count || 0
}

export async function markAsRead(notificationId: string) {
  const supabase = await createServerClient()
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
}

export async function markAllAsRead() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)
}

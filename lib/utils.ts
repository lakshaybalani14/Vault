import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function getTrustScoreColor(score: number): { color: string; icon: string } {
  if (score >= 4.0) return { color: 'text-foreground', icon: '⭐' }
  if (score >= 2.5) return { color: 'text-amber-500', icon: '⚠️' }
  return { color: 'text-red-500', icon: '🚨' }
}

export function getAccountAgeLabel(createdAt: string): { label: string; color: string } | null {
  const created = new Date(createdAt)
  const now = new Date()
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)

  if (diffHours < 24) return { label: 'Very new account', color: 'text-red-500' }
  if (diffHours < 168) return { label: 'New account', color: 'text-amber-500' }
  return null
}

export function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'Electronics': '🎧',
    'ID Card': '🪪',
    'Keys': '🔑',
    'Bag': '👜',
    'Books': '📚',
    'Clothing': '👕',
    'Wallet': '👛',
    'Water Bottle': '💧',
    'Other': '📦',
  }
  return emojiMap[category] || '📦'
}

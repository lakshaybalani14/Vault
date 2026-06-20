import { createServerClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import AnimatedUserList from '@/components/users/AnimatedUserList'

export const metadata = {
  title: 'Users — Vault',
  description: 'Search and discover students on the Vault lost & found platform.',
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q || '').trim()
  const supabase = await createServerClient()

  let users: { id: string; name: string; email: string; avatar_url: string | null; trust_score: number }[] = []

  if (query) {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url, trust_score')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(40)
    users = data || []
  } else {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url, trust_score')
      .order('created_at', { ascending: false })
      .limit(40)
    users = data || []
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)',
            }}>
              <Users size={20} />
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}>
              Explore Users
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', paddingLeft: 52 }}>
            {query
              ? `${users.length} result${users.length !== 1 ? 's' : ''} for "${query}"`
              : `${users.length} student${users.length !== 1 ? 's' : ''} on the platform`}
          </p>
        </div>

        {/* Search form — server-side GET */}
        <form method="GET" action="/users" style={{ marginBottom: 24, position: 'relative' }}>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name... (↑ ↓ to navigate, Enter to open)"
            className="input"
            autoComplete="off"
            style={{ paddingLeft: 44, height: 48 }}
          />
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          {query && (
            <Link
              href="/users"
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontSize: '0.8125rem',
                textDecoration: 'none',
              }}
            >
              Clear ×
            </Link>
          )}
        </form>

        {/* Animated list */}
        <AnimatedUserList users={users} />
      </div>
    </div>
  )
}

import { getCurrentUser } from '@/lib/actions/auth'
import { getUnreadCount } from '@/lib/actions/notifications'
import Navbar from '@/components/shared/Navbar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const unreadCount = await getUnreadCount()

  return (
    <div className="app-shell">
      <Navbar
        userName={user?.name || 'User'}
        userEmail={user?.email || ''}
        unreadCount={unreadCount}
      />
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}

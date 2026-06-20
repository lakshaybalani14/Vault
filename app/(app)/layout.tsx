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
    <div className="app-shell" style={{ position: 'relative', zIndex: 0 }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .app-shell::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("https://www.transparenttextures.com/patterns/pixel-weave.png");
          background-repeat: repeat;
          opacity: 1;
          z-index: -1;
          pointer-events: none;
        }
        .dark .app-shell::before {
          filter: invert(1);
          opacity: 0.6;
        }
      ` }} />
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

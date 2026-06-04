import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function VerifyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backgroundColor: 'var(--background)',
    }}>
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: 'var(--accent-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Mail size={32} style={{ color: 'var(--accent)' }} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 8 }}>
          Check your email
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          We&apos;ve sent a confirmation link to your VIT email address.
          Click the link to verify your account and start using Vault.
        </p>

        <div className="surface" style={{
          padding: 20,
          marginBottom: 24,
          textAlign: 'left',
        }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 12 }}>
            Didn&apos;t receive it?
          </h3>
          <ul style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            listStyle: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <li>• Check your spam / junk folder</li>
            <li>• The email is from <span className="font-mono" style={{ fontSize: '0.75rem' }}>noreply@mail.supabase.io</span></li>
            <li>• It might take a minute to arrive</li>
            <li>• Make sure you used your VIT email</li>
          </ul>
        </div>

        <Link href="/login" className="btn btn-secondary" style={{
          textDecoration: 'none',
          gap: 8,
        }}>
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  )
}

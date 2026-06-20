'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react'
import { loginUser } from '@/lib/actions/auth'

export default function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // loginUser redirects server-side on success; only returns on error
    const result = await loginUser({ email, password })
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // No else needed — successful login triggers a server-side redirect to /feed
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backgroundColor: 'var(--background)',
      position: 'relative',
    }}>
      {/* Back Button */}
      <Link 
        href="/" 
        className="btn btn-ghost btn-sm"
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          color: 'var(--text-secondary)',
          textDecoration: 'none'
        }}
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className="animate-slide-up" style={{
        width: '100%',
        maxWidth: 420,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}>
              Vault
            </h1>
          </Link>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginTop: 4,
          }}>
            Lost & Found — VIT Vellore
          </p>
        </div>

        {/* Login Card */}
        <div className="surface" style={{ padding: 32 }}>
          <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Sign in to your account</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={`input ${error ? 'input-error' : ''}`}
                placeholder="you@vitstudent.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input ${error ? 'input-error' : ''}`}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 4,
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'var(--lost-bg)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 16,
                fontSize: '0.8125rem',
                color: 'var(--lost)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 500,
            }}>
              Register
            </Link>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: 24,
        }}>
          Only VIT email addresses are accepted
        </p>
      </div>
    </div>
  )
}

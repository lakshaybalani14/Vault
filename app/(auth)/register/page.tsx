'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { registerUser } from '@/lib/actions/auth'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    const domain = email.split('@')[1]
    if (!['vitstudent.ac.in', 'vit.ac.in'].includes(domain)) {
      setError('Please use your VIT college email address.')
      setLoading(false)
      return
    }

    const result = await registerUser({ name, email, password })
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // On success, registerUser redirects server-side to /verify
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backgroundColor: 'var(--background)',
    }}>
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 420 }}>
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

        {/* Register Card */}
        <div className="surface" style={{ padding: 32 }}>
          <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Create your account</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Riya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                minLength={2}
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">College Email</label>
              <input
                id="email"
                type="email"
                className={`input ${error && error.includes('email') ? 'input-error' : ''}`}
                placeholder="you@vitstudent.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Must be @vitstudent.ac.in or @vit.ac.in
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
                <span>Creating account...</span>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
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
            Already have an account?{' '}
            <Link href="/login" style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 500,
            }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid credentials. Please try again.')
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 40%, #102324 0%, #071414 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: '1rem',
    }}>
      {/* Subtle grid overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(235,244,239,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(235,244,239,0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            border: '1px solid rgba(235,244,239,0.4)',
            borderRadius: '50%',
            marginBottom: '1rem',
            background: 'rgba(235,244,239,0.05)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a9d8cf" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={{
            color: '#a9d8cf',
            fontSize: '1.5rem',
            fontWeight: '400',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            margin: '0 0 0.25rem',
          }}>
            Admin Portal
          </h1>
          <p style={{
            color: 'rgba(235,244,239,0.4)',
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            Car Rental Management
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(235,244,239,0.15)',
          borderRadius: '2px',
          padding: '2.5rem',
          backdropFilter: 'blur(10px)',
        }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: 'rgba(235,244,239,0.6)',
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(235,244,239,0.2)',
                  borderRadius: '2px',
                  padding: '0.75rem 1rem',
                  color: '#f5f0e8',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(235,244,239,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(235,244,239,0.2)'}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: 'rgba(235,244,239,0.6)',
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(235,244,239,0.2)',
                  borderRadius: '2px',
                  padding: '0.75rem 1rem',
                  color: '#f5f0e8',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(235,244,239,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(235,244,239,0.2)'}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.3)',
                borderRadius: '2px',
                padding: '0.75rem 1rem',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading
                  ? 'rgba(235,244,239,0.2)'
                  : 'linear-gradient(135deg, #a9d8cf 0%, #7fb8ad 100%)',
                border: 'none',
                borderRadius: '2px',
                padding: '0.875rem',
                color: loading ? 'rgba(235,244,239,0.5)' : '#071414',
                fontSize: '0.8rem',
                fontWeight: '600',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center',
          color: 'rgba(235,244,239,0.2)',
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          marginTop: '2rem',
        }}>
          RESTRICTED ACCESS — AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  )
}
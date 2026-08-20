'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bk)',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--dg)',
        border: '1px solid var(--mg)',
        borderRadius: 14,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 400,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontFamily: 'var(--fd)',
            fontSize: '2rem',
            color: 'var(--wh)',
            marginBottom: 8,
          }}>
            Lashes Beauty <span style={{ color: 'var(--pk)' }}>Admin</span>
          </div>
          <p style={{ color: 'var(--mt)', fontSize: '.84rem' }}>Panel de gestión de alumnas</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: '.72rem',
              color: 'var(--mt)',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '.5px',
              fontWeight: 500,
            }}>
              Email
            </label>
            <input
              type="email"
              className="fc"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="micaela@lashesbeautyok.com"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: '.72rem',
              color: 'var(--mt)',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '.5px',
              fontWeight: 500,
            }}>
              Contraseña
            </label>
            <input
              type="password"
              className="fc"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(220,40,40,.1)',
              border: '1px solid rgba(220,40,40,.3)',
              borderRadius: 6,
              padding: '10px 14px',
              marginBottom: 20,
              color: '#ff6b6b',
              fontSize: '.82rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-p btn-full"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

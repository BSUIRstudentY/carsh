import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicPageShell } from '../../layouts/PublicPageShell'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(identifier, password)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicPageShell>
      <h1>Вход</h1>
      {error && <p style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '24rem' }}>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email или телефон</span>
          <input
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
            style={{ padding: '0.65rem 0.75rem', borderRadius: 8, border: '1px solid rgba(15,20,25,0.12)', background: 'rgba(255,255,255,0.8)' }}
          />
        </label>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: '0.65rem 0.75rem', borderRadius: 8, border: '1px solid rgba(15,20,25,0.12)', background: 'rgba(255,255,255,0.8)' }}
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={loading}
          style={{ minWidth: 'auto', justifySelf: 'start' }}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      <p style={{ marginTop: '1.25rem', fontSize: '0.9rem' }}>
        Нет аккаунта? <Link to="/register">Регистрация</Link>
      </p>
    </PublicPageShell>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicPageShell } from '../../layouts/PublicPageShell'
import { useAuth } from '../../contexts/AuthContext'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ email, password, phone: phone || undefined, firstName: firstName || undefined, lastName: lastName || undefined })
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicPageShell>
      <h1>Регистрация</h1>
      {error && <p style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '24rem' }}>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Имя</span>
          <input value={firstName} onChange={e => setFirstName(e.target.value)}
            style={{ padding: '0.65rem 0.75rem', borderRadius: 8, border: '1px solid rgba(15,20,25,0.12)', background: 'rgba(255,255,255,0.8)' }} />
        </label>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Фамилия</span>
          <input value={lastName} onChange={e => setLastName(e.target.value)}
            style={{ padding: '0.65rem 0.75rem', borderRadius: 8, border: '1px solid rgba(15,20,25,0.12)', background: 'rgba(255,255,255,0.8)' }} />
        </label>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email *</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ padding: '0.65rem 0.75rem', borderRadius: 8, border: '1px solid rgba(15,20,25,0.12)', background: 'rgba(255,255,255,0.8)' }} />
        </label>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Телефон</span>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+375..."
            style={{ padding: '0.65rem 0.75rem', borderRadius: 8, border: '1px solid rgba(15,20,25,0.12)', background: 'rgba(255,255,255,0.8)' }} />
        </label>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Пароль * (мин. 8 символов)</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
            style={{ padding: '0.65rem 0.75rem', borderRadius: 8, border: '1px solid rgba(15,20,25,0.12)', background: 'rgba(255,255,255,0.8)' }} />
        </label>
        <button type="submit" className="btn btn--primary" disabled={loading}
          style={{ minWidth: 'auto', justifySelf: 'start' }}>
          {loading ? 'Регистрация...' : 'Создать аккаунт'}
        </button>
      </form>
      <p style={{ marginTop: '1.25rem', fontSize: '0.9rem' }}>
        Уже зарегистрированы? <Link to="/login">Войти</Link>
      </p>
    </PublicPageShell>
  )
}

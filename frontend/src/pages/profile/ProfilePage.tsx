import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PublicPageShell } from '../../layouts/PublicPageShell'

interface Ticket {
  id: number; message: string; status: string; createdAt: string
  adminReply: string; repliedAt: string
}

export function ProfilePage() {
  const { isAuthenticated, accessToken, user, fetchProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'profile' | 'password' | 'tickets'>('profile')
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [msg, setMsg] = useState('')
  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => { if (!isAuthenticated) navigate('/login') }, [isAuthenticated, navigate])
  useEffect(() => {
    if (user?.firstName) setFirstName(user.firstName)
    if (user?.lastName) setLastName(user.lastName)
    if (user?.phone) setPhone(user.phone)
  }, [user])

  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setMsg('')
    const res = await fetch('/api/v1/auth/me', {
      method: 'PUT', headers,
      body: JSON.stringify({ firstName, lastName, phone }),
    })
    if (res.ok) { await fetchProfile(); setMsg('Сохранено') }
    else setMsg('Ошибка')
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault()
    setPassMsg('')
    const res = await fetch('/api/v1/auth/me/password', {
      method: 'POST', headers,
      body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
    })
    if (res.ok) { setPassMsg('Пароль изменён'); setCurPass(''); setNewPass('') }
    else { const d = await res.json().catch(() => ({})); setPassMsg(d.message || 'Ошибка') }
  }

  async function handleDelete() {
    if (!confirm('Удалить аккаунт? Это действие необратимо.')) return
    await fetch('/api/v1/auth/me', { method: 'DELETE', headers })
    logout()
    navigate('/')
  }

  async function loadTickets() {
    if (!user?.email) return
    const res = await fetch(`/api/v1/support/tickets?email=${encodeURIComponent(user.email)}`)
    if (res.ok) setTickets(await res.json())
  }

  useEffect(() => { if (tab === 'tickets') loadTickets() }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated) return null

  const inputStyle = { padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--premium-border, rgba(15,20,25,0.12))', background: 'var(--premium-card, rgba(255,255,255,0.8))', width: '100%', boxSizing: 'border-box' as const }

  return (
    <PublicPageShell>
      <h1>Профиль</h1>
      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['profile', 'password', 'tickets'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn ${tab === t ? 'btn--primary' : 'btn--ghost'}`}
            style={{ minWidth: 'auto', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            {t === 'profile' ? 'Данные' : t === 'password' ? 'Пароль' : 'Обращения'}
          </button>
        ))}
      </nav>

      {tab === 'profile' && (
        <form onSubmit={handleSave} style={{ display: 'grid', gap: '1rem', maxWidth: '24rem' }}>
          <label style={{ display: 'grid', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Имя</span>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Фамилия</span>
            <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Телефон</span>
            <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn--primary" style={{ minWidth: 'auto' }}>Сохранить</button>
            <button type="button" className="btn btn--ghost" onClick={handleDelete} style={{ minWidth: 'auto', color: '#dc2626' }}>Удалить аккаунт</button>
          </div>
          {msg && <p style={{ fontWeight: 600, color: msg === 'Сохранено' ? '#059669' : '#dc2626' }}>{msg}</p>}
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePassword} style={{ display: 'grid', gap: '1rem', maxWidth: '24rem' }}>
          <label style={{ display: 'grid', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Текущий пароль</span>
            <input type="password" value={curPass} onChange={e => setCurPass(e.target.value)} required style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Новый пароль (мин. 8 символов)</span>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={8} style={inputStyle} />
          </label>
          <button type="submit" className="btn btn--primary" style={{ minWidth: 'auto', justifySelf: 'start' }}>Сменить пароль</button>
          {passMsg && <p style={{ fontWeight: 600, color: passMsg === 'Пароль изменён' ? '#059669' : '#dc2626' }}>{passMsg}</p>}
        </form>
      )}

      {tab === 'tickets' && (
        <div>
          {tickets.length === 0 ? (
            <p style={{ color: '#64748b' }}>У вас нет обращений.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '40rem' }}>
              {tickets.map(t => (
                <div key={t.id} style={{ padding: '1rem', borderRadius: 12, background: 'var(--premium-card, #fff)', border: '1px solid var(--premium-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>#{t.id} · {new Date(t.createdAt).toLocaleDateString('ru')}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4,
                      background: t.status === 'REPLIED' ? '#d1fae5' : t.status === 'NEW' ? '#fef3c7' : '#e2e8f0',
                      color: t.status === 'REPLIED' ? '#065f46' : t.status === 'NEW' ? '#92400e' : '#475569' }}>
                      {t.status === 'NEW' ? 'Новое' : t.status === 'REPLIED' ? 'Отвечено' : t.status}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>{t.message}</p>
                  {t.adminReply && (
                    <div style={{ padding: '0.75rem', borderRadius: 8, background: '#ecfdf5', marginTop: '0.5rem' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#065f46' }}>Ответ:</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem' }}>{t.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PublicPageShell>
  )
}

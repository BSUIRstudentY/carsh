import { useState } from 'react'
import type { FormEvent } from 'react'
import { PublicPageShell } from '../../layouts/PublicPageShell'

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/v1/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          message: form.get('message'),
        }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.message || 'Ошибка при отправке')
      }
    } catch {
      setError('Ошибка сети')
    }
  }

  return (
    <PublicPageShell>
      <h1>Контакты</h1>
      <p className="lead">
        Напишите нам — мы ответим на email в течение рабочего дня.
      </p>
      {sent ? (
        <p style={{ color: '#059669', fontWeight: 600, padding: '2rem 0' }}>
          ✓ Сообщение отправлено! Мы свяжемся с вами.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}
        >
          {error && <p style={{ color: '#e53e3e' }}>{error}</p>}
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Имя</span>
            <input
              name="name"
              required
              style={{ padding: '0.65rem 0.75rem', borderRadius: 8, border: '1px solid rgba(15,20,25,0.12)', background: 'rgba(255,255,255,0.8)' }}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email</span>
            <input
              name="email"
              type="email"
              required
              style={{ padding: '0.65rem 0.75rem', borderRadius: 8, border: '1px solid rgba(15,20,25,0.12)', background: 'rgba(255,255,255,0.8)' }}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Сообщение</span>
            <textarea
              name="message"
              required
              rows={4}
              style={{ padding: '0.65rem 0.75rem', borderRadius: 8, border: '1px solid rgba(15,20,25,0.12)', background: 'rgba(255,255,255,0.8)', resize: 'vertical' }}
            />
          </label>
          <button type="submit" className="btn btn--primary" style={{ minWidth: 'auto', justifySelf: 'start' }}>
            Отправить
          </button>
        </form>
      )}
    </PublicPageShell>
  )
}

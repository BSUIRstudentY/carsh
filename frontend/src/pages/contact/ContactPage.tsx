import { useState } from 'react'
import type { FormEvent } from 'react'
import { PublicPageShell } from '../../layouts/PublicPageShell'

export function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PublicPageShell>
      <h1>Контакты</h1>
      <p className="lead">
        Форма обращения уйдёт на бэкенд:{' '}
        <code style={{ fontSize: '0.85em' }}>POST /api/v1/public/contact</code>{' '}
        (тело — см. контракт в docs).
      </p>
      {sent ? (
        <p className="page-placeholder">Сообщение отправлено (демо, без API).</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}
        >
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Имя</span>
            <input
              name="name"
              required
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(15,20,25,0.12)',
                background: 'rgba(255,255,255,0.8)',
              }}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email</span>
            <input
              name="email"
              type="email"
              required
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(15,20,25,0.12)',
                background: 'rgba(255,255,255,0.8)',
              }}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Сообщение</span>
            <textarea
              name="message"
              required
              rows={4}
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(15,20,25,0.12)',
                background: 'rgba(255,255,255,0.8)',
                resize: 'vertical',
              }}
            />
          </label>
          <button
            type="submit"
            className="btn btn--primary"
            style={{ minWidth: 'auto', justifySelf: 'start' }}
          >
            Отправить
          </button>
        </form>
      )}
    </PublicPageShell>
  )
}

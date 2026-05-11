import { Link } from 'react-router-dom'
import { PublicPageShell } from '../../layouts/PublicPageShell'

export function LoginPage() {
  return (
    <PublicPageShell>
      <h1>Вход</h1>
      <p className="lead">
        После реализации бэкенда:{' '}
        <code style={{ fontSize: '0.85em' }}>POST /api/v1/auth/login</code> —
        логин по телефону или email и паролю, ответ с токеном / cookie.
      </p>
      <div className="page-placeholder">
        Форма входа (поля + кнопка). Пока заглушка для гостевого UX.
      </div>
      <p style={{ marginTop: '1.25rem', fontSize: '0.9rem' }}>
        Нет аккаунта? <Link to="/register">Регистрация</Link>
      </p>
    </PublicPageShell>
  )
}

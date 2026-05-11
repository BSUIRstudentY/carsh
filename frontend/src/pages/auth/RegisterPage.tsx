import { Link } from 'react-router-dom'
import { PublicPageShell } from '../../layouts/PublicPageShell'

export function RegisterPage() {
  return (
    <PublicPageShell>
      <h1>Регистрация</h1>
      <p className="lead">
        Эндпоинт:{' '}
        <code style={{ fontSize: '0.85em' }}>POST /api/v1/auth/register</code> —
        данные пользователя, верификация телефона/email по вашей модели.
      </p>
      <div className="page-placeholder">
        Форма регистрации. Для гостя главная уже ведёт сюда с призыва создать
        аккаунт.
      </div>
      <p style={{ marginTop: '1.25rem', fontSize: '0.9rem' }}>
        Уже зарегистрированы? <Link to="/login">Войти</Link>
      </p>
    </PublicPageShell>
  )
}

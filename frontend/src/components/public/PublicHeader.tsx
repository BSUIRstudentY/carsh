import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import './public-layout.css'

type PublicHeaderProps = {
  variant?: 'default' | 'hero'
}

export function PublicHeader({ variant = 'default' }: PublicHeaderProps) {
  const { isAuthenticated, user } = useAuth()
  const { dark, toggle } = useTheme()

  const rootClass =
    variant === 'hero'
      ? 'public-header public-header--hero'
      : 'public-header'

  const navClass = ({ isActive }: { isActive: boolean }) => {
    const parts = ['public-header__link']
    if (variant === 'hero') {
      parts.push('public-header__link--on-dark')
      if (isActive) parts.push('public-header__link--active-on-dark')
    } else if (isActive) {
      parts.push('public-header__link--active')
    }
    return parts.join(' ')
  }

  const loginClass =
    variant === 'hero'
      ? 'public-header__login public-header__login--on-dark'
      : 'public-header__login'

  const registerClass =
    variant === 'hero'
      ? 'public-header__register public-header__register--hero'
      : 'public-header__register'

  return (
    <header className={rootClass}>
      <NavLink to="/" className="public-header__logo">
        Carsharing
      </NavLink>
      <nav className="public-header__nav" aria-label="Разделы сайта">
        <NavLink to="/" end className={navClass}>
          Главная
        </NavLink>
        <NavLink to="/fleet" className={navClass}>
          Автопарк
        </NavLink>
        <NavLink to="/map" className={navClass}>
          Карта
        </NavLink>
        <NavLink to="/tariffs" className={navClass}>
          Тарифы
        </NavLink>
        <NavLink to="/about" className={navClass}>
          О сервисе
        </NavLink>
        <NavLink to="/contact" className={navClass}>
          Контакты
        </NavLink>
      </nav>
      <div className="public-header__auth">
        <button
          onClick={toggle}
          className={variant === 'hero' ? 'public-header__theme-btn public-header__theme-btn--hero' : 'public-header__theme-btn'}
          title={dark ? 'Светлая тема' : 'Тёмная тема'}
        >
          {dark ? '☀️' : '🌙'}
        </button>
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" className={loginClass}>
              Кабинет
            </NavLink>
            <NavLink to="/profile" className={loginClass}>
              {user?.firstName || 'Профиль'}
            </NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={registerClass}>
                Админ
              </NavLink>
            )}
          </>
        ) : (
          <>
            <NavLink to="/login" className={loginClass}>
              Войти
            </NavLink>
            <NavLink to="/register" className={registerClass}>
              Регистрация
            </NavLink>
          </>
        )}
      </div>
    </header>
  )
}

import { NavLink } from 'react-router-dom'
import './public-layout.css'

type PublicHeaderProps = {
  /** Прозрачная шапка поверх диагонали героя (белые ссылки справа, логотип тёмный слева). */
  variant?: 'default' | 'hero'
}

export function PublicHeader({ variant = 'default' }: PublicHeaderProps) {
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
        <NavLink to="/login" className={loginClass}>
          Войти
        </NavLink>
        <NavLink to="/register" className={registerClass}>
          Регистрация
        </NavLink>
      </div>
    </header>
  )
}

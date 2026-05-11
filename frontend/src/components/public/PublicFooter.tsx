import { Link } from 'react-router-dom'
import './public-layout.css'

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__grid">
        <div>
          <p className="public-footer__title">Carsharing</p>
          <p style={{ margin: 0, lineHeight: 1.55, opacity: 0.9 }}>
            Аренда по минутам: откройте приложение, забронируйте авто рядом и
            завершайте поездку в удобной зоне.
          </p>
        </div>
        <div>
          <p className="public-footer__title">Разделы</p>
          <ul>
            <li>
              <Link to="/fleet">Автопарк</Link>
            </li>
            <li>
              <Link to="/tariffs">Тарифы</Link>
            </li>
            <li>
              <Link to="/about">О сервисе</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="public-footer__title">Аккаунт</p>
          <ul>
            <li>
              <Link to="/login">Вход</Link>
            </li>
            <li>
              <Link to="/register">Регистрация</Link>
            </li>
            <li>
              <Link to="/contact">Поддержка</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

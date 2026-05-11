import { Link } from 'react-router-dom'
import { PublicFooter } from '../../components/public/PublicFooter'
import { PublicHeader } from '../../components/public/PublicHeader'
import './home.css'

const HERO_CAR_SRC = '/hero-car.png'

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__slant" aria-hidden />

        <PublicHeader variant="hero" />

        <div className="hero__body">
          <div className="hero__copy">
            <h1 className="hero__title">МИНУТЫ</h1>
            <p className="hero__subtitle">НА КОЛЁСАХ</p>
            <p className="hero__desc">
              Бронируйте авто рядом с вами, платите за время и километры — без
              лишней бюрократии. Создайте аккаунт за минуту и начните с первой
              поездки.
            </p>
            <div className="hero__actions">
              <Link to="/fleet" className="hero__btn hero__btn--primary">
                Смотреть автопарк
              </Link>
              <Link to="/tariffs" className="hero__btn hero__btn--ghost">
                Тарифы
              </Link>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__price" aria-label="Тариф за час со скидкой">
              <div className="hero__price-top">
                <span className="hero__price-promo">−60%</span>
                <span className="hero__price-hint">за час · промокод</span>
              </div>
              <div className="hero__price-main">
                <del className="hero__price-old">30 BYN/h</del>
                <span className="hero__price-arrow" aria-hidden>
                  →
                </span>
                <span className="hero__price-new">
                  12 <span className="hero__price-unit">BYN/h</span>
                </span>
              </div>
            </div>
            <img
              className="hero__car"
              src={HERO_CAR_SRC}
              alt="Автомобиль в профиль"
              width={900}
              height={500}
              decoding="async"
            />
          </div>
        </div>
      </section>

      <div className="home-main">
        <div className="home-strip">
          <div className="home-strip__inner">
            <span>Проверенный автопарк</span>
            <span>Страховка в поездке</span>
            <span>Поддержка 24/7</span>
          </div>
        </div>

        <section className="home-features" aria-labelledby="features-heading">
          <h2 id="features-heading">Почему мы</h2>
          <div className="home-features__grid">
            <article className="home-feature-card">
              <h3>Минутная тарификация</h3>
              <p>
                Платите только за время и пробег. Завершили поездку — расчёт
                сразу в приложении.
              </p>
            </article>
            <article className="home-feature-card">
              <h3>Без офиса и очередей</h3>
              <p>
                Регистрация онлайн, разблокировка авто с телефона, понятные
                правила зон завершения.
              </p>
            </article>
            <article className="home-feature-card">
              <h3>Прозрачные условия</h3>
              <p>
                Тарифы и ограничения до старта поездки. История заказов и чеков
                в личном кабинете.
              </p>
            </article>
          </div>
        </section>

        <section className="home-cta" aria-labelledby="cta-heading">
          <h2 id="cta-heading">Готовы к первой поездке?</h2>
          <p>
            Зарегистрируйтесь, подтвердите данные и получите доступ к карте
            свободных автомобилей рядом с вами.
          </p>
          <div className="home-cta__actions">
            <Link to="/register" className="hero__btn hero__btn--primary">
              Создать аккаунт
            </Link>
            <Link to="/login" className="hero__btn hero__btn--ghost">
              Уже есть аккаунт
            </Link>
          </div>
        </section>

        <PublicFooter />
      </div>
    </>
  )
}

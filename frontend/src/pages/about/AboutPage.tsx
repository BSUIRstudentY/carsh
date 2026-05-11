import { PublicPageShell } from '../../layouts/PublicPageShell'

export function AboutPage() {
  return (
    <PublicPageShell>
      <h1>О сервисе</h1>
      <p className="lead">
        CARSHARING — сервис поминутной аренды автомобилей в Минске.
        Без залогов, без офисов — только вы и дорога.
      </p>

      <section style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h2>Как это работает</h2>
          <ol style={{ lineHeight: 1.8, paddingLeft: '1.25rem' }}>
            <li><strong>Зарегистрируйтесь</strong> — email, телефон и пароль. Занимает 30 секунд.</li>
            <li><strong>Найдите машину на карте</strong> — выберите ближайший автомобиль нужного класса.</li>
            <li><strong>Забронируйте</strong> — у вас 2 минуты чтобы дойти до авто.</li>
            <li><strong>Начните поездку</strong> — активируйте бронь и отправляйтесь в путь.</li>
            <li><strong>Завершите</strong> — нажмите «Завершить поездку», оплата рассчитается автоматически.</li>
          </ol>
        </div>

        <div>
          <h2>Классы автомобилей</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Эконом', desc: 'Компактные авто для города. От 0.24 BYN/мин.', color: '#dbeafe' },
              { title: 'Комфорт', desc: 'Седаны повышенной комфортабельности. От 0.36 BYN/мин.', color: '#e0e7ff' },
              { title: 'Бизнес', desc: 'Представительский класс. От 0.48 BYN/мин.', color: '#fef3c7' },
            ].map(c => (
              <div key={c.title} style={{ padding: '1.25rem', borderRadius: 12, background: c.color }}>
                <h3 style={{ margin: '0 0 0.5rem' }}>{c.title}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2>Зона обслуживания</h2>
          <p>Сервис работает в Минске и пригороде. Завершение поездки возможно в пределах МКАД и ближайших районов.</p>
        </div>

        <div>
          <h2>Безопасность</h2>
          <ul style={{ lineHeight: 1.8, paddingLeft: '1.25rem' }}>
            <li>Все автомобили застрахованы (КАСКО + ОСАГО)</li>
            <li>GPS-мониторинг каждой поездки</li>
            <li>Техосмотр и обслуживание по регламенту</li>
            <li>Поддержка 24/7 через форму обратной связи</li>
          </ul>
        </div>

        <div>
          <h2>Контакты</h2>
          <p>
            Email: <a href="mailto:info@carsharing.by">info@carsharing.by</a><br />
            Телефон: <a href="tel:+375291234567">+375 (29) 123-45-67</a><br />
            Адрес: г. Минск, пр-т Независимости, 1
          </p>
        </div>
      </section>
    </PublicPageShell>
  )
}

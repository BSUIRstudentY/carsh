import { PublicPageShell } from '../../layouts/PublicPageShell'

export function AboutPage() {
  return (
    <PublicPageShell>
      <h1>О сервисе</h1>
      <p className="lead">
        Расскажите здесь историю бренда, зону работы и безопасность. Статический
        контент или CMS позже; для справки по городам можно использовать{' '}
        <code style={{ fontSize: '0.85em' }}>GET /api/v1/public/cities</code>.
      </p>
      <div className="page-placeholder">
        Текст о компании, партнёрах, документах.
      </div>
    </PublicPageShell>
  )
}

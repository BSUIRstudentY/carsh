import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PublicPageShell } from '../../layouts/PublicPageShell'
import { RouteMap } from '../../components/RouteMap'
import './dashboard.css'

interface Booking {
  id: number; vehicleId: number; vehicleTitle: string; status: string
  startAt: string | null; endAt: string | null; totalAmount: number | null; currency: string
}
interface RoutePoint { ts: string; lat: number; lon: number; speedKph: number }
interface RouteData { startedAt: string | null; endedAt: string | null; distanceKm: number; avgSpeedKph: number; pointCount: number; points: RoutePoint[] }

export function DashboardPage() {
  const { isAuthenticated, accessToken, user, logout } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [route, setRoute] = useState<RouteData | null>(null)
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  const headers = { Authorization: `Bearer ${accessToken}` }

  const loadBookings = useCallback(async () => {
    const r = await fetch('/api/v1/bookings', { headers })
    if (r.ok) setBookings(await r.json())
  }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadBookings() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadRoute(bookingId: number) {
    setSelectedBookingId(bookingId)
    const r = await fetch(`/api/v1/bookings/${bookingId}/route`, { headers })
    if (r.ok) setRoute(await r.json())
    else setRoute(null)
  }

  if (!isAuthenticated) return null

  const routePoints = route?.points.map(p => ({ lat: p.lat, lon: p.lon })) ?? []
  const selectedBooking = bookings.find(b => b.id === selectedBookingId)
  const isRouteActive = selectedBooking?.status === 'ACTIVE' || selectedBooking?.status === 'RESERVED'

  return (
    <PublicPageShell>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Личный кабинет</h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>{user?.firstName || user?.email}</span>
            {user?.role === 'ADMIN' && (
              <button className="btn btn--ghost" onClick={() => navigate('/admin')} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>Админ</button>
            )}
            <button className="btn btn--ghost" onClick={() => { logout(); navigate('/') }} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>Выйти</button>
          </div>
        </div>

        <p className="lead" style={{ marginBottom: '1.5rem' }}>
          Для бронирования перейдите на <Link to="/map">карту</Link> и нажмите на маркер автомобиля.
        </p>

        {route && routePoints.length > 0 && (
          <section className="route-section">
            <h2>Маршрут поездки #{selectedBookingId}</h2>
            <div className="route-stats">
              <span>Дистанция: <strong>{route.distanceKm.toFixed(2)} км</strong></span>
              <span>Ср. скорость: <strong>{route.avgSpeedKph.toFixed(1)} км/ч</strong></span>
              <span>Точек: <strong>{route.pointCount}</strong></span>
              {route.startedAt && <span>Начало: {new Date(route.startedAt).toLocaleString('ru')}</span>}
              {route.endedAt && <span>Конец: {new Date(route.endedAt).toLocaleString('ru')}</span>}
            </div>
            <div className="route-map">
              <RouteMap points={routePoints} isActive={isRouteActive} />
            </div>
          </section>
        )}
        {route && routePoints.length === 0 && selectedBookingId && (
          <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', marginBottom: '1.5rem', color: '#92400e' }}>
            Нет GPS-данных для этой поездки. Телеметрия не была записана.
          </div>
        )}

        <section>
          <h2>История поездок</h2>
          {bookings.length === 0 ? (
            <p style={{ color: '#64748b' }}>У вас пока нет поездок. Перейдите на <Link to="/map">карту</Link>, чтобы забронировать автомобиль.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Авто</th><th>Статус</th><th>Начало</th><th>Конец</th><th>Сумма</th><th>Маршрут</th></tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.vehicleTitle}</td>
                    <td><span className={`badge badge--${b.status.toLowerCase()}`}>{b.status === 'ACTIVE' ? 'В поездке' : b.status === 'COMPLETED' ? 'Завершена' : b.status}</span></td>
                    <td>{b.startAt ? new Date(b.startAt).toLocaleString('ru') : '—'}</td>
                    <td>{b.endAt ? new Date(b.endAt).toLocaleString('ru') : '—'}</td>
                    <td>{b.totalAmount ? `${b.totalAmount} ${b.currency}` : '—'}</td>
                    <td>
                      <button
                        className="btn btn--ghost"
                        style={{ padding: '0.2rem 0.7rem', fontSize: '0.8rem' }}
                        onClick={() => loadRoute(b.id)}
                      >
                        {b.status === 'ACTIVE' ? 'Live трек' : 'Маршрут'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </PublicPageShell>
  )
}

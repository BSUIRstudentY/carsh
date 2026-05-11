import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import { useAuth } from '../../contexts/AuthContext'
import { PublicPageShell } from '../../layouts/PublicPageShell'
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
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)
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

  const loadActive = useCallback(async () => {
    const r = await fetch('/api/v1/bookings/active', { headers })
    if (r.ok) setActiveBooking(await r.json())
    else setActiveBooking(null)
  }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadBookings(); loadActive() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function startRide(vehicleId: number) {
    const r = await fetch('/api/v1/bookings/start', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId }),
    })
    if (r.ok) { loadBookings(); loadActive() }
  }

  async function endRide(bookingId: number) {
    const r = await fetch(`/api/v1/bookings/${bookingId}/end`, { method: 'POST', headers })
    if (r.ok) { loadBookings(); loadActive(); setRoute(null) }
  }

  async function loadRoute(bookingId: number) {
    setSelectedBookingId(bookingId)
    const r = await fetch(`/api/v1/bookings/${bookingId}/route`, { headers })
    if (r.ok) setRoute(await r.json())
    else setRoute(null)
  }

  if (!isAuthenticated) return null

  const routePositions = route?.points.map(p => [p.lat, p.lon] as [number, number]) || []

  return (
    <PublicPageShell>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Личный кабинет</h1>
          <div>
            <span style={{ marginRight: '1rem' }}>{user?.email}</span>
            {user?.role === 'ADMIN' && <button className="btn btn--ghost" onClick={() => navigate('/admin')} style={{ marginRight: '0.5rem' }}>Админ</button>}
            <button className="btn btn--ghost" onClick={() => { logout(); navigate('/') }}>Выйти</button>
          </div>
        </div>

        {activeBooking && (
          <section className="active-ride">
            <h2>Активная поездка</h2>
            <div className="ride-card">
              <p><strong>{activeBooking.vehicleTitle}</strong></p>
              <p>Начало: {activeBooking.startAt ? new Date(activeBooking.startAt).toLocaleString('ru') : '—'}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="btn btn--primary" onClick={() => endRide(activeBooking.id)}>Завершить поездку</button>
                <button className="btn btn--ghost" onClick={() => loadRoute(activeBooking.id)}>Показать маршрут (live)</button>
              </div>
            </div>
          </section>
        )}

        {!activeBooking && (
          <section>
            <h2>Начать поездку</h2>
            <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>Введите ID автомобиля:</p>
            <QuickBookForm onStart={startRide} />
          </section>
        )}

        {route && routePositions.length > 0 && (
          <section className="route-section">
            <h2>Маршрут (бронирование #{selectedBookingId})</h2>
            <div className="route-stats">
              <span>Дистанция: {route.distanceKm.toFixed(2)} км</span>
              <span>Ср. скорость: {route.avgSpeedKph.toFixed(1)} км/ч</span>
              <span>Точек: {route.pointCount}</span>
            </div>
            <div className="route-map">
              <MapContainer
                center={routePositions[0]}
                zoom={14}
                style={{ height: '400px', width: '100%', borderRadius: '12px' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={routePositions} color="#2563eb" weight={4} />
                <Marker position={routePositions[0]}><Popup>Старт</Popup></Marker>
                <Marker position={routePositions[routePositions.length - 1]}><Popup>Финиш</Popup></Marker>
              </MapContainer>
            </div>
          </section>
        )}

        <section>
          <h2>История поездок</h2>
          {bookings.length === 0 ? <p style={{ color: '#64748b' }}>Нет поездок</p> : (
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Авто</th><th>Статус</th><th>Начало</th><th>Сумма</th><th>Маршрут</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td><td>{b.vehicleTitle}</td>
                    <td><span className={`badge badge--${b.status.toLowerCase()}`}>{b.status}</span></td>
                    <td>{b.startAt ? new Date(b.startAt).toLocaleString('ru') : '—'}</td>
                    <td>{b.totalAmount ? `${b.totalAmount} ${b.currency}` : '—'}</td>
                    <td><button className="btn btn--ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => loadRoute(b.id)}>GPS</button></td>
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

function QuickBookForm({ onStart }: { onStart: (id: number) => void }) {
  const [vid, setVid] = useState('')
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <input value={vid} onChange={e => setVid(e.target.value)} placeholder="Vehicle ID" style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd', width: '6rem' }} />
      <button className="btn btn--primary" onClick={() => vid && onStart(Number(vid))} style={{ minWidth: 'auto' }}>Начать</button>
    </div>
  )
}

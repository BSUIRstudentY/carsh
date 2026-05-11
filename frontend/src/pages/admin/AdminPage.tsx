import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './admin.css'

interface UserItem {
  id: number; email: string; phone: string | null; firstName: string | null
  lastName: string | null; role: string; status: string; createdAt: string
}
interface VehicleItem {
  id: number; displayTitle: string; plateNumber: string; status: string
  vehicleClassCode: string; cityName: string | null; latitude: number | null; longitude: number | null
}
interface BookingItem {
  id: number; userId: number; vehicleId: number; vehicleTitle: string
  status: string; startAt: string | null; endAt: string | null
  totalAmount: number | null; currency: string
}
interface Stats { usersCount: number; vehiclesCount: number; contactsCount: number }

export function AdminPage() {
  const { isAdmin, accessToken, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'stats' | 'users' | 'vehicles' | 'bookings' | 'telemetry'>('stats')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<UserItem[]>([])
  const [vehicles, setVehicles] = useState<VehicleItem[]>([])
  const [bookings, setBookings] = useState<BookingItem[]>([])

  useEffect(() => {
    if (!isAdmin) { navigate('/login'); return }
  }, [isAdmin, navigate])

  const headers = { Authorization: `Bearer ${accessToken}` }

  const loadStats = useCallback(async () => {
    const r = await fetch('/api/v1/admin/stats', { headers })
    if (r.ok) setStats(await r.json())
  }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = useCallback(async () => {
    const r = await fetch('/api/v1/admin/users', { headers })
    if (r.ok) setUsers(await r.json())
  }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadVehicles = useCallback(async () => {
    const r = await fetch('/api/v1/admin/vehicles', { headers })
    if (r.ok) setVehicles(await r.json())
  }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadBookings = useCallback(async () => {
    const r = await fetch('/api/v1/admin/bookings', { headers })
    if (r.ok) setBookings(await r.json())
  }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab === 'stats') loadStats()
    if (tab === 'users') loadUsers()
    if (tab === 'vehicles') loadVehicles()
    if (tab === 'bookings') loadBookings()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAdmin) return null

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Админ-панель CARSHARING</h1>
        <button onClick={() => { logout(); navigate('/') }}>Выйти</button>
      </header>
      <nav className="admin-tabs">
        {(['stats', 'users', 'vehicles', 'bookings', 'telemetry'] as const).map(t => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t === 'stats' ? 'Статистика' : t === 'users' ? 'Пользователи' : t === 'vehicles' ? 'Автомобили' : t === 'bookings' ? 'Бронирования' : 'Телеметрия'}
          </button>
        ))}
      </nav>
      <main className="admin-content">
        {tab === 'stats' && stats && (
          <div className="admin-stats">
            <div className="stat-card"><span className="stat-num">{stats.usersCount}</span><span>Пользователей</span></div>
            <div className="stat-card"><span className="stat-num">{stats.vehiclesCount}</span><span>Автомобилей</span></div>
            <div className="stat-card"><span className="stat-num">{stats.contactsCount}</span><span>Обращений</span></div>
          </div>
        )}
        {tab === 'users' && (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Email</th><th>Телефон</th><th>Имя</th><th>Роль</th><th>Статус</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td><td>{u.email}</td><td>{u.phone || '—'}</td>
                  <td>{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</td>
                  <td><span className={`badge badge--${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td>{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'vehicles' && (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Название</th><th>Номер</th><th>Класс</th><th>Город</th><th>Статус</th></tr></thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td><td>{v.displayTitle}</td><td>{v.plateNumber}</td>
                  <td>{v.vehicleClassCode}</td><td>{v.cityName || '—'}</td>
                  <td><span className={`badge badge--${v.status.toLowerCase()}`}>{v.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'bookings' && (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Пользователь</th><th>Авто</th><th>Статус</th><th>Начало</th><th>Конец</th><th>Сумма</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td><td>#{b.userId}</td><td>{b.vehicleTitle}</td>
                  <td><span className={`badge badge--${b.status.toLowerCase()}`}>{b.status}</span></td>
                  <td>{b.startAt ? new Date(b.startAt).toLocaleString('ru') : '—'}</td>
                  <td>{b.endAt ? new Date(b.endAt).toLocaleString('ru') : '—'}</td>
                  <td>{b.totalAmount ? `${b.totalAmount} ${b.currency}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'telemetry' && <TelemetrySimulator />}
      </main>
    </div>
  )
}

function TelemetrySimulator() {
  const [vehicleId, setVehicleId] = useState('1')
  const [bookingId, setBookingId] = useState('')
  const [status, setStatus] = useState('')
  const [route, setRoute] = useState<{ lat: number; lon: number }[]>([])

  const MINSK_CENTER = { lat: 53.9006, lon: 27.559 }

  function generateRoute() {
    const points: { lat: number; lon: number }[] = []
    let lat = MINSK_CENTER.lat + (Math.random() - 0.5) * 0.02
    let lon = MINSK_CENTER.lon + (Math.random() - 0.5) * 0.02
    for (let i = 0; i < 20; i++) {
      lat += (Math.random() - 0.5) * 0.003
      lon += (Math.random() - 0.5) * 0.003
      points.push({ lat: Math.round(lat * 100000) / 100000, lon: Math.round(lon * 100000) / 100000 })
    }
    setRoute(points)
  }

  async function sendBatch() {
    setStatus('Отправка...')
    try {
      const res = await fetch('/api/v1/telemetry/simulate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: Number(vehicleId),
          bookingId: bookingId ? Number(bookingId) : null,
          points: route.map((p, i) => ({
            lat: p.lat, lon: p.lon,
            speed: 30 + Math.random() * 40,
            ignition: i < route.length - 1,
          })),
        }),
      })
      const data = await res.json()
      setStatus(`Отправлено ${data.count} точек`)
    } catch (err) {
      setStatus('Ошибка отправки')
    }
  }

  return (
    <div className="telemetry-sim">
      <h3>Симулятор телеметрии</h3>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>
        Генерирует GPS-точки маршрута и отправляет в Kafka → MongoDB
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem' }}>Vehicle ID</span>
          <input value={vehicleId} onChange={e => setVehicleId(e.target.value)} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd', width: '5rem' }} />
        </label>
        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem' }}>Booking ID (опц.)</span>
          <input value={bookingId} onChange={e => setBookingId(e.target.value)} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd', width: '5rem' }} />
        </label>
        <button className="btn btn--primary" onClick={generateRoute} style={{ minWidth: 'auto' }}>
          Сгенерировать маршрут
        </button>
        {route.length > 0 && (
          <button className="btn btn--primary" onClick={sendBatch} style={{ minWidth: 'auto', background: '#059669' }}>
            Отправить ({route.length} точек)
          </button>
        )}
      </div>
      {status && <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>{status}</p>}
      {route.length > 0 && (
        <div style={{ marginTop: '1rem', maxHeight: '200px', overflow: 'auto', fontSize: '0.8rem', background: '#f8f9fa', padding: '0.75rem', borderRadius: 8 }}>
          {route.map((p, i) => (
            <div key={i}>{i + 1}. lat={p.lat}, lon={p.lon}</div>
          ))}
        </div>
      )}
    </div>
  )
}

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
        {tab === 'telemetry' && <TelemetrySimulator bookings={bookings} onRefresh={loadBookings} />}
      </main>
    </div>
  )
}

const MINSK_ROUTES: { name: string; points: [number, number][] }[] = [
  {
    name: 'пр. Независимости (центр → восток)',
    points: [
      [53.8932, 27.5467], [53.8940, 27.5520], [53.8950, 27.5580],
      [53.8962, 27.5650], [53.8975, 27.5720], [53.8988, 27.5790],
      [53.9000, 27.5860], [53.9012, 27.5930], [53.9025, 27.6000],
      [53.9038, 27.6070], [53.9050, 27.6140],
    ],
  },
  {
    name: 'ул. Немига → вокзал',
    points: [
      [53.9050, 27.5530], [53.9040, 27.5510], [53.9030, 27.5490],
      [53.9020, 27.5465], [53.9010, 27.5440], [53.8995, 27.5430],
      [53.8980, 27.5415], [53.8965, 27.5400], [53.8950, 27.5385],
      [53.8935, 27.5370], [53.8920, 27.5355],
    ],
  },
  {
    name: 'МКАД (юг, дуга)',
    points: [
      [53.8600, 27.4800], [53.8580, 27.4950], [53.8565, 27.5100],
      [53.8555, 27.5250], [53.8550, 27.5400], [53.8548, 27.5550],
      [53.8550, 27.5700], [53.8558, 27.5850], [53.8570, 27.6000],
      [53.8585, 27.6150], [53.8605, 27.6300],
    ],
  },
  {
    name: 'ул. Сурганова → парк Челюскинцев',
    points: [
      [53.9120, 27.5830], [53.9110, 27.5820], [53.9098, 27.5808],
      [53.9085, 27.5795], [53.9072, 27.5782], [53.9060, 27.5770],
      [53.9048, 27.5760], [53.9035, 27.5750], [53.9022, 27.5740],
      [53.9010, 27.5732], [53.8998, 27.5725],
    ],
  },
  {
    name: 'Кольцевая (север)',
    points: [
      [53.9400, 27.5200], [53.9410, 27.5350], [53.9415, 27.5500],
      [53.9418, 27.5650], [53.9415, 27.5800], [53.9408, 27.5950],
      [53.9395, 27.6100], [53.9380, 27.6250], [53.9360, 27.6380],
    ],
  },
]

function interpolateRoute(waypoints: [number, number][], totalPoints: number): { lat: number; lon: number }[] {
  if (waypoints.length < 2) return waypoints.map(([lat, lon]) => ({ lat, lon }))

  const result: { lat: number; lon: number }[] = []
  const segCount = waypoints.length - 1
  const pointsPerSeg = Math.max(1, Math.floor(totalPoints / segCount))

  for (let s = 0; s < segCount; s++) {
    const [lat1, lon1] = waypoints[s]
    const [lat2, lon2] = waypoints[s + 1]
    const n = s === segCount - 1 ? totalPoints - result.length : pointsPerSeg
    for (let i = 0; i < n; i++) {
      const t = i / n
      const jitter = (Math.random() - 0.5) * 0.0002
      result.push({
        lat: Math.round((lat1 + (lat2 - lat1) * t + jitter) * 100000) / 100000,
        lon: Math.round((lon1 + (lon2 - lon1) * t + jitter) * 100000) / 100000,
      })
    }
  }
  result.push({ lat: waypoints[waypoints.length - 1][0], lon: waypoints[waypoints.length - 1][1] })
  return result
}

function TelemetrySimulator({ bookings, onRefresh }: { bookings: BookingItem[]; onRefresh: () => void }) {
  const [selectedRoute, setSelectedRoute] = useState(0)
  const [pointCount, setPointCount] = useState(30)
  const [vehicleId, setVehicleId] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [status, setStatus] = useState('')
  const [generatedPoints, setGeneratedPoints] = useState<{ lat: number; lon: number }[]>([])

  const activeBookings = bookings.filter(b => b.status === 'ACTIVE')

  useEffect(() => { onRefresh() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function selectActiveBooking(bid: string) {
    setBookingId(bid)
    const booking = bookings.find(b => b.id === Number(bid))
    if (booking) setVehicleId(String(booking.vehicleId))
  }

  function generateRoute() {
    const route = MINSK_ROUTES[selectedRoute]
    const pts = interpolateRoute(route.points, pointCount)
    setGeneratedPoints(pts)
    setStatus(`Сгенерировано ${pts.length} точек по маршруту «${route.name}»`)
  }

  async function sendPoints() {
    if (!vehicleId || generatedPoints.length === 0) return
    setStatus('Отправка...')
    try {
      const res = await fetch('/api/v1/telemetry/simulate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: Number(vehicleId),
          bookingId: bookingId ? Number(bookingId) : null,
          points: generatedPoints.map((p, i) => ({
            lat: p.lat,
            lon: p.lon,
            speed: 20 + Math.sin(i / 3) * 20 + Math.random() * 10,
            ignition: i < generatedPoints.length - 1,
          })),
        }),
      })
      const data = await res.json()
      setStatus(`✓ Отправлено ${data.count} точек в Kafka → MongoDB`)
    } catch {
      setStatus('✗ Ошибка отправки')
    }
  }

  return (
    <div className="telemetry-sim">
      <h3>Симулятор телеметрии</h3>
      <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>
        Выберите реалистичный маршрут по Минску, количество точек, и привяжите к активной брони для тестирования live-трека.
      </p>

      {activeBookings.length > 0 && (
        <div className="telem-section">
          <h4>Активные брони (для live-трека)</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {activeBookings.map(b => (
              <button
                key={b.id}
                className={`map-panel__bulk-chip${bookingId === String(b.id) ? ' map-panel__bulk-chip--active' : ''}`}
                onClick={() => selectActiveBooking(String(b.id))}
              >
                <span className="map-panel__bulk-label">#{b.id} {b.vehicleTitle}</span>
                <span className="map-panel__bulk-price">user #{b.userId}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="telem-section">
        <h4>Маршрут</h4>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <label style={{ display: 'grid', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Предустановленный маршрут</span>
            <select value={selectedRoute} onChange={e => setSelectedRoute(Number(e.target.value))}
              style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd', minWidth: '16rem' }}>
              {MINSK_ROUTES.map((r, i) => <option key={i} value={i}>{r.name} ({r.points.length} waypoints)</option>)}
            </select>
          </label>
          <label style={{ display: 'grid', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Кол-во GPS-точек</span>
            <input type="number" value={pointCount} onChange={e => setPointCount(Number(e.target.value))} min={5} max={200}
              style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd', width: '5rem' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Vehicle ID</span>
            <input value={vehicleId} onChange={e => setVehicleId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd', width: '4rem' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Booking ID</span>
            <input value={bookingId} onChange={e => setBookingId(e.target.value)} placeholder="опц."
              style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd', width: '4rem' }} />
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <button className="btn btn--primary" onClick={generateRoute} style={{ minWidth: 'auto' }}>
          Сгенерировать маршрут
        </button>
        {generatedPoints.length > 0 && (
          <button className="btn btn--primary" onClick={sendPoints}
            style={{ minWidth: 'auto', background: '#059669' }}>
            Отправить {generatedPoints.length} точек в Kafka
          </button>
        )}
      </div>

      {status && <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>{status}</p>}

      {generatedPoints.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <details>
            <summary style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              Предпросмотр точек ({generatedPoints.length})
            </summary>
            <div style={{ maxHeight: '180px', overflow: 'auto', fontSize: '0.75rem', background: '#f8f9fa', padding: '0.75rem', borderRadius: 8, marginTop: '0.5rem', fontFamily: 'monospace' }}>
              {generatedPoints.map((p, i) => (
                <div key={i}>{String(i + 1).padStart(3, ' ')}. [{p.lat}, {p.lon}]</div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

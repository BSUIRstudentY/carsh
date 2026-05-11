import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  bookings: { id: number; vehicleId: number; vehicleTitle: string; status: string }[]
  onRefresh: () => void
}

const MINSK_CENTER: [number, number] = [53.9045, 27.5615]

function ClickCollector({ onAdd }: { onAdd: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onAdd(
        Math.round(e.latlng.lat * 100000) / 100000,
        Math.round(e.latlng.lng * 100000) / 100000,
      )
    },
  })
  return null
}

export function AdminRouteCreator({ bookings, onRefresh: _onRefresh }: Props) {
  void _onRefresh
  const [selectedBookingId, setSelectedBookingId] = useState<string>('')
  const [waypoints, setWaypoints] = useState<{ lat: number; lon: number }[]>([])
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)

  const activeBookings = bookings.filter(b => b.status === 'ACTIVE' || b.status === 'RESERVED')
  const selectedBooking = bookings.find(b => b.id === Number(selectedBookingId))

  const addPoint = useCallback((lat: number, lon: number) => {
    setWaypoints(prev => [...prev, { lat, lon }])
  }, [])

  const removeLastPoint = () => {
    setWaypoints(prev => prev.slice(0, -1))
  }

  const clearPoints = () => {
    setWaypoints([])
    setStatus('')
  }

  const sendToKafka = async () => {
    if (!selectedBookingId || waypoints.length < 2) return
    setSending(true)
    setStatus('Отправка...')
    try {
      const booking = bookings.find(b => b.id === Number(selectedBookingId))
      const res = await fetch('/api/v1/telemetry/simulate/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telemetry-Key': 'dev-telemetry-key-change-in-prod',
        },
        body: JSON.stringify({
          vehicleId: booking?.vehicleId ?? 1,
          bookingId: Number(selectedBookingId),
          points: waypoints.map((p, i) => ({
            lat: p.lat,
            lon: p.lon,
            speed: 25 + Math.sin(i / 2) * 20 + Math.random() * 10,
            ignition: i < waypoints.length - 1,
          })),
        }),
      })
      const data = await res.json()
      setStatus(`✓ Отправлено ${data.count} точек для брони #${selectedBookingId}`)
    } catch {
      setStatus('✗ Ошибка отправки')
    } finally {
      setSending(false)
    }
  }

  const positions = waypoints.map(p => [p.lat, p.lon] as [number, number])

  return (
    <div className="telemetry-sim">
      <h3>Конструктор маршрута на карте</h3>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>
        Выберите активную бронь, затем кликайте по карте чтобы нарисовать маршрут. Точки отправятся в Kafka → MongoDB.
      </p>

      <div className="telem-section">
        <h4>Активная бронь</h4>
        {activeBookings.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Нет активных бронирований. Создайте бронь через карту.</p>
        ) : (
          <select
            value={selectedBookingId}
            onChange={e => { setSelectedBookingId(e.target.value); clearPoints() }}
            style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd', minWidth: '16rem' }}
          >
            <option value="">Выберите бронь...</option>
            {activeBookings.map(b => (
              <option key={b.id} value={String(b.id)}>
                #{b.id} — {b.vehicleTitle} ({b.status})
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedBookingId && (
        <>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <MapContainer center={MINSK_CENTER} zoom={13} style={{ height: '400px', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickCollector onAdd={addPoint} />

              {positions.length > 1 && (
                <Polyline positions={positions} color="#2563eb" weight={3} dashArray="8,6" />
              )}

              {waypoints.map((p, i) => {
                if (i === 0) {
                  return <Marker key={i} position={[p.lat, p.lon]} />
                }
                return (
                  <CircleMarker
                    key={i}
                    center={[p.lat, p.lon]}
                    radius={i === waypoints.length - 1 ? 8 : 5}
                    pathOptions={{
                      color: i === waypoints.length - 1 ? '#dc2626' : '#2563eb',
                      fillColor: i === waypoints.length - 1 ? '#f87171' : '#60a5fa',
                      fillOpacity: 0.9,
                      weight: 2,
                    }}
                  />
                )
              })}
            </MapContainer>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.88rem', color: '#475569', alignSelf: 'center' }}>
              {waypoints.length} точек
              {selectedBooking && <> · <strong>{selectedBooking.vehicleTitle}</strong> · бронь #{selectedBookingId}</>}
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button onClick={removeLastPoint} disabled={waypoints.length === 0}
                className="btn btn--ghost" style={{ minWidth: 'auto', padding: '0.3rem 0.8rem', fontSize: '0.82rem' }}>
                Удалить последнюю
              </button>
              <button onClick={clearPoints} disabled={waypoints.length === 0}
                className="btn btn--ghost" style={{ minWidth: 'auto', padding: '0.3rem 0.8rem', fontSize: '0.82rem' }}>
                Очистить
              </button>
              <button onClick={sendToKafka} disabled={waypoints.length < 2 || sending}
                className="btn btn--primary" style={{ minWidth: 'auto', padding: '0.3rem 1rem', fontSize: '0.82rem', background: '#059669' }}>
                {sending ? 'Отправка...' : `Отправить ${waypoints.length} точек`}
              </button>
            </div>
          </div>

          {status && <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{status}</p>}
        </>
      )}
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface ActiveBooking {
  id: number
  vehicleId: number
  vehicleTitle: string
  startAt: string | null
}

interface RouteData {
  distanceKm: number
  avgSpeedKph: number
  pointCount: number
  points: { lat: number; lon: number; ts: string; speedKph: number }[]
}

interface Props {
  booking: ActiveBooking
  route: RouteData | null
  pricePerMinute: number
  onEnd: () => void
}

export function ActiveRideOverlay({ booking, route, pricePerMinute, onEnd }: Props) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!booking.startAt) return
    const start = new Date(booking.startAt).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [booking.startAt])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const currentCost = minutes * pricePerMinute

  const routePositions = useMemo(
    () => route?.points.map(p => [p.lat, p.lon] as [number, number]) ?? [],
    [route],
  )

  return (
    <div className="ride-overlay">
      <div className="ride-overlay__header">
        <div className="ride-overlay__pulse" />
        <span className="ride-overlay__label">Поездка активна</span>
      </div>

      <div className="ride-overlay__info">
        <div className="ride-overlay__car">{booking.vehicleTitle}</div>
        <div className="ride-overlay__grid">
          <div className="ride-overlay__cell">
            <span className="ride-overlay__cell-label">Время</span>
            <span className="ride-overlay__cell-value">{minutes}:{String(seconds).padStart(2, '0')}</span>
          </div>
          <div className="ride-overlay__cell">
            <span className="ride-overlay__cell-label">Стоимость</span>
            <span className="ride-overlay__cell-value ride-overlay__cell-value--cost">
              {currentCost.toFixed(2)} BYN
            </span>
          </div>
          <div className="ride-overlay__cell">
            <span className="ride-overlay__cell-label">Тариф</span>
            <span className="ride-overlay__cell-value">{pricePerMinute.toFixed(2)} / мин</span>
          </div>
          <div className="ride-overlay__cell">
            <span className="ride-overlay__cell-label">Пройдено</span>
            <span className="ride-overlay__cell-value">
              {route ? `${route.distanceKm.toFixed(2)} км` : '—'}
            </span>
          </div>
        </div>
      </div>

      {routePositions.length > 1 && (
        <div className="ride-overlay__map">
          <MapContainer
            center={routePositions[routePositions.length - 1]}
            zoom={14}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={false}
            style={{ height: '180px', width: '100%', borderRadius: '10px' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Polyline positions={routePositions} color="#2563eb" weight={3} />
            <Marker position={routePositions[0]} />
            <Marker position={routePositions[routePositions.length - 1]} />
          </MapContainer>
        </div>
      )}

      <button className="ride-overlay__end-btn" onClick={onEnd}>
        Завершить поездку
      </button>
    </div>
  )
}

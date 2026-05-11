import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import './active-ride-widget.css'

interface ActiveBooking {
  id: number
  vehicleId: number
  vehicleTitle: string
  vehicleImageUrl: string | null
  startAt: string | null
}

export function ActiveRideWidget() {
  const { isAuthenticated, accessToken } = useAuth()
  const [booking, setBooking] = useState<ActiveBooking | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [minimized, setMinimized] = useState(false)

  const loadActive = useCallback(async () => {
    if (!isAuthenticated || !accessToken) { setBooking(null); return }
    try {
      const res = await fetch('/api/v1/bookings/active', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) setBooking(await res.json())
      else setBooking(null)
    } catch {
      setBooking(null)
    }
  }, [isAuthenticated, accessToken])

  useEffect(() => {
    loadActive()
    const id = setInterval(loadActive, 10000)
    return () => clearInterval(id)
  }, [loadActive])

  useEffect(() => {
    if (!booking?.startAt) { setElapsed(0); return }
    const start = new Date(booking.startAt).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [booking?.startAt])

  if (!booking) return null

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const cost = (minutes * 0.24).toFixed(2)

  if (minimized) {
    return (
      <button className="ride-widget ride-widget--mini" onClick={() => setMinimized(false)}>
        <span className="ride-widget__mini-dot" />
        <span>{minutes}:{String(seconds).padStart(2, '0')}</span>
        <span className="ride-widget__mini-cost">{cost} BYN</span>
      </button>
    )
  }

  return (
    <div className="ride-widget">
      <div className="ride-widget__header">
        <div className="ride-widget__header-left">
          <span className="ride-widget__dot" />
          <span className="ride-widget__title">В поездке</span>
        </div>
        <button className="ride-widget__minimize" onClick={() => setMinimized(true)} title="Свернуть">−</button>
      </div>
      <div className="ride-widget__body">
        {booking.vehicleImageUrl && (
          <img className="ride-widget__car-img" src={booking.vehicleImageUrl} alt={booking.vehicleTitle} />
        )}
        <div className="ride-widget__info">
          <div className="ride-widget__car">{booking.vehicleTitle}</div>
          <div className="ride-widget__row">
            <span className="ride-widget__time">{minutes}:{String(seconds).padStart(2, '0')}</span>
            <span className="ride-widget__cost">{cost} BYN</span>
          </div>
        </div>
      </div>
      <Link to="/map" className="ride-widget__link">Открыть карту →</Link>
    </div>
  )
}

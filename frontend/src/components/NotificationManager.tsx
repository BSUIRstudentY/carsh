import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function NotificationManager() {
  const { isAuthenticated, accessToken } = useAuth()
  const lastBookingStatus = useRef<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return
    if (!('Notification' in window)) return

    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const checkBooking = async () => {
      try {
        const res = await fetch('/api/v1/bookings/active', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (res.ok) {
          const booking = await res.json()
          const newStatus = booking.status
          if (lastBookingStatus.current !== null && lastBookingStatus.current !== newStatus) {
            if (newStatus === 'ACTIVE') {
              notify('Поездка началась', `${booking.vehicleTitle} — счётчик запущен`)
            }
          }
          lastBookingStatus.current = newStatus
        } else {
          if (lastBookingStatus.current === 'ACTIVE') {
            notify('Поездка завершена', 'Проверьте стоимость в личном кабинете')
          }
          lastBookingStatus.current = null
        }
      } catch { /* ignore */ }
    }

    const id = setInterval(checkBooking, 15000)
    return () => clearInterval(id)
  }, [isAuthenticated, accessToken])

  return null
}

function notify(title: string, body: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/911.png' })
  }
}

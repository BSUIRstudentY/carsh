import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { TariffPublic } from './mapTariffs'
import { formatMoney, num, tariffsForVehicleClass } from './mapTariffs'

export type MapVehicleFull = {
  id: number
  displayTitle: string
  description: string | null
  imageUrl: string | null
  vehicleClassCode: string
  vehicleClassTitle: string
  pricePerMinute: number | null
  seats: number | null
  latitude: number | null
  longitude: number | null
}

type BookingMode = 'PER_TIME' | 'PER_KM' | 'BULK_TIME'

type Props = {
  vehicle: MapVehicleFull
  tariffs: TariffPublic[]
  onClose: () => void
  onBooked?: () => void
}

function PanelVisual({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false)
  if (!url || failed) {
    return (
      <div className="map-panel__visual map-panel__visual--placeholder" aria-hidden>
        🚗
      </div>
    )
  }
  return (
    <img
      className="map-panel__img"
      src={url}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

export function VehicleBookingPanel({ vehicle, tariffs, onClose, onBooked }: Props) {
  const { isAuthenticated, accessToken } = useAuth()
  const navigate = useNavigate()
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  const scoped = useMemo(
    () => tariffsForVehicleClass(vehicle.vehicleClassCode, tariffs),
    [tariffs, vehicle.vehicleClassCode],
  )

  const perTime = scoped.find((t) => t.tariffMode === 'PER_TIME') ?? null
  const perKm = scoped.find((t) => t.tariffMode === 'PER_KM') ?? null
  const bulkAll = useMemo(
    () =>
      scoped
        .filter((t) => t.tariffMode === 'BULK_TIME')
        .sort((a, b) => (num(a.bulkTimeHours) ?? 0) - (num(b.bulkTimeHours) ?? 0)),
    [scoped],
  )

  const defaultMode: BookingMode =
    perTime ? 'PER_TIME' : perKm ? 'PER_KM' : bulkAll.length ? 'BULK_TIME' : 'PER_TIME'
  const [mode, setMode] = useState<BookingMode>(defaultMode)
  const [bulkId, setBulkId] = useState<number | null>(null)

  const bulkKey = bulkAll.map((t) => t.id).join(',')

  useEffect(() => {
    if (bulkAll.length === 0) {
      setBulkId(null)
      return
    }
    setBulkId((prev) => {
      if (prev != null && bulkAll.some((t) => t.id === prev)) return prev
      return bulkAll[0]?.id ?? null
    })
  }, [vehicle.id, bulkKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedBulk = bulkAll.find((t) => t.id === bulkId) ?? bulkAll[0] ?? null

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setBookingLoading(true)
    setBookingError('')
    try {
      const res = await fetch('/api/v1/bookings/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ vehicleId: vehicle.id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || data.error || 'Не удалось забронировать')
      }
      onBooked?.()
      onClose()
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : 'Ошибка бронирования')
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <div className="map-panel-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="map-panel"
        role="dialog"
        aria-labelledby="map-panel-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="map-panel__head">
          <button type="button" className="map-panel__close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
          <div className="map-panel__hero">
            <PanelVisual url={vehicle.imageUrl} />
            <div className="map-panel__intro">
              <h2 id="map-panel-title" className="map-panel__title">
                {vehicle.displayTitle}
              </h2>
              <p className="map-panel__subtitle">
                {vehicle.vehicleClassTitle}
                {vehicle.seats != null ? ` · ${vehicle.seats} мест` : ''}
              </p>
              {vehicle.latitude != null && vehicle.longitude != null && (
                <p className="map-panel__coords">
                  {vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}
                </p>
              )}
            </div>
          </div>
          {vehicle.description ? (
            <p className="map-panel__desc">{vehicle.description}</p>
          ) : null}
        </div>

        <div className="map-panel__body">
          <h3 className="map-panel__section-title">Тариф и опции</h3>

          <div className="map-panel__modes" role="tablist" aria-label="Режим оплаты">
            {perTime && (
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'PER_TIME'}
                className={`map-panel__mode${mode === 'PER_TIME' ? ' map-panel__mode--active' : ''}`}
                onClick={() => setMode('PER_TIME')}
              >
                Поминутно
              </button>
            )}
            {perKm && (
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'PER_KM'}
                className={`map-panel__mode${mode === 'PER_KM' ? ' map-panel__mode--active' : ''}`}
                onClick={() => setMode('PER_KM')}
              >
                За километр
              </button>
            )}
            {bulkAll.length > 0 && (
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'BULK_TIME'}
                className={`map-panel__mode${mode === 'BULK_TIME' ? ' map-panel__mode--active' : ''}`}
                onClick={() => setMode('BULK_TIME')}
              >
                Пакеты времени
              </button>
            )}
          </div>

          {mode === 'PER_TIME' && perTime && (
            <div className="map-panel__block">
              <p className="map-panel__price-line">
                <strong>{formatMoney(num(perTime.pricePerMinute))}</strong>
                <span className="map-panel__unit"> / минута</span>
              </p>
              {num(perTime.dailyCapAmount) != null && (
                <p className="map-panel__hint">Потолок за сутки: {formatMoney(num(perTime.dailyCapAmount))}</p>
              )}
              <p className="map-panel__fineprint">{perTime.title}</p>
            </div>
          )}

          {mode === 'PER_KM' && perKm && (
            <div className="map-panel__block">
              <p className="map-panel__price-line">
                <strong>{formatMoney(num(perKm.pricePerKm))}</strong>
                <span className="map-panel__unit"> / км</span>
              </p>
              <p className="map-panel__fineprint">{perKm.title}</p>
            </div>
          )}

          {mode === 'BULK_TIME' && bulkAll.length > 0 && (
            <div className="map-panel__block">
              <p className="map-panel__hint">Выберите длительность пакета (фиксированная сумма за блок времени)</p>
              <div className="map-panel__bulk-grid">
                {bulkAll.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`map-panel__bulk-chip${bulkId === t.id ? ' map-panel__bulk-chip--active' : ''}`}
                    onClick={() => {
                      setBulkId(t.id)
                      setMode('BULK_TIME')
                    }}
                  >
                    <span className="map-panel__bulk-label">
                      {num(t.bulkTimeHours) != null
                        ? num(t.bulkTimeHours)! >= 24 && num(t.bulkTimeHours)! % 24 === 0
                          ? `${num(t.bulkTimeHours)! / 24} сут.`
                          : `${num(t.bulkTimeHours)} ч`
                        : 'Пакет'}
                    </span>
                    <span className="map-panel__bulk-price">{formatMoney(num(t.bulkPackagePrice))}</span>
                  </button>
                ))}
              </div>
              {selectedBulk && (
                <p className="map-panel__fineprint">{selectedBulk.title}</p>
              )}
            </div>
          )}

          {!perTime && !perKm && bulkAll.length === 0 && (
            <p className="map-panel__empty-tariff">Нет тарифов для этого класса в каталоге.</p>
          )}

          {bookingError && (
            <p style={{ color: '#dc2626', marginTop: '0.75rem', fontSize: '0.88rem', fontWeight: 600 }}>
              {bookingError}
            </p>
          )}
        </div>

        <div className="map-panel__actions">
          {isAuthenticated ? (
            <button
              type="button"
              className="map-panel__btn map-panel__btn--primary"
              onClick={handleBook}
              disabled={bookingLoading}
            >
              {bookingLoading ? 'Бронирование...' : 'Забронировать'}
            </button>
          ) : (
            <button
              type="button"
              className="map-panel__btn map-panel__btn--primary"
              onClick={() => navigate('/login')}
            >
              Войти и забронировать
            </button>
          )}
          <button type="button" className="map-panel__btn map-panel__btn--ghost" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </aside>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { PublicPageShell } from '../../layouts/PublicPageShell'
import './fleet.css'

type CityItem = {
  id: number
  code: string
  name: string
  active: boolean
}

type FleetVehicleItem = {
  id: number
  displayTitle: string
  description: string | null
  imageUrl: string | null
  vehicleClassCode: string
  vehicleClassTitle: string
  pricePerMinute: number | null
  seats: number | null
  latitude?: number | null
  longitude?: number | null
}

type SegmentCode = 'ECONOMY' | 'COMFORT' | 'BUSINESS'

const SEGMENTS: { code: SegmentCode; label: string }[] = [
  { code: 'ECONOMY', label: 'Эконом' },
  { code: 'COMFORT', label: 'Комфорт' },
  { code: 'BUSINESS', label: 'Бизнес' },
]

type CitiesResponse = { items: CityItem[] }
type VehiclesResponse = { items: FleetVehicleItem[] }

function formatMinuteRate(value: number | null): string | null {
  if (value == null || Number.isNaN(value)) return null
  return `${value.toFixed(2)} BYN / мин`
}

function fleetCardMeta(v: FleetVehicleItem): string {
  const seats = v.seats != null ? `${v.seats} мест` : '— мест'
  const rate = formatMinuteRate(v.pricePerMinute)
  const segment = v.vehicleClassTitle
  const parts = [segment, seats]
  if (rate) parts.push(rate)
  return parts.join(' · ')
}

function FleetCardVisual({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false)
  if (!url || failed) {
    return (
      <span className="fleet-card__visual--placeholder" aria-hidden>
        🚗
      </span>
    )
  }
  return (
    <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} />
  )
}

export function FleetPage() {
  const [cities, setCities] = useState<CityItem[]>([])
  const [cityId, setCityId] = useState<string>('')
  const [segment, setSegment] = useState<SegmentCode>('ECONOMY')
  const [vehicles, setVehicles] = useState<FleetVehicleItem[]>([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const loadCities = async () => {
      setLoadingCities(true)
      try {
        const res = await fetch('/api/v1/public/cities')
        if (!res.ok) throw new Error('cities')
        const data = (await res.json()) as CitiesResponse
        if (!cancelled) setCities(data.items ?? [])
      } catch {
        if (!cancelled) setCities([])
      } finally {
        if (!cancelled) setLoadingCities(false)
      }
    }
    void loadCities()
    return () => {
      cancelled = true
    }
  }, [])

  const loadVehicles = useCallback(async () => {
    setLoadingVehicles(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('classCode', segment)
      if (cityId !== '') params.set('cityId', cityId)
      const res = await fetch(`/api/v1/public/vehicles?${params.toString()}`)
      if (!res.ok) throw new Error('vehicles')
      const data = (await res.json()) as VehiclesResponse
      setVehicles(data.items ?? [])
    } catch {
      setError('Не удалось загрузить автомобили.')
      setVehicles([])
    } finally {
      setLoadingVehicles(false)
    }
  }, [cityId, segment])

  useEffect(() => {
    void loadVehicles()
  }, [loadVehicles])

  const showLoading = loadingCities || loadingVehicles

  return (
    <PublicPageShell>
      <div className="page-main page-main--fleet">
        <h1>Автопарк</h1>
        <p className="lead">
          Выберите сегмент и город — покажем доступные машины с поминутной ставкой по тарифу класса.
        </p>

        <div className="fleet-toolbar fleet-toolbar--wrap">
          <div className="fleet-segments" role="tablist" aria-label="Сегмент автопарка">
            {SEGMENTS.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                role="tab"
                aria-selected={segment === code}
                className={`fleet-segment${segment === code ? ' fleet-segment--active' : ''}`}
                onClick={() => setSegment(code)}
              >
                {label}
              </button>
            ))}
          </div>

          <label htmlFor="fleet-city">
            Город
            <select
              id="fleet-city"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              disabled={loadingCities}
              aria-label="Фильтр по городу"
            >
              <option value="">Все города</option>
              {cities.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <div className="fleet-error">{error}</div>}

        {showLoading && <div className="fleet-loading">Загрузка…</div>}

        {!showLoading && !error && vehicles.length === 0 && (
          <div className="fleet-empty">
            Нет доступных автомобилей для выбранных условий. Попробуйте другой сегмент или город.
          </div>
        )}

        {!showLoading && vehicles.length > 0 && (
          <div className="fleet-grid">
            {vehicles.map((v) => (
              <article key={v.id} className="fleet-card">
                <div className="fleet-card__visual">
                  <FleetCardVisual url={v.imageUrl} />
                </div>
                <h2 className="fleet-card__title">{v.displayTitle}</h2>
                <p className="fleet-card__meta">{fleetCardMeta(v)}</p>
                {v.description ? (
                  <p className="fleet-card__desc">{v.description}</p>
                ) : (
                  <p className="fleet-card__desc">Описание скоро появится.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </PublicPageShell>
  )
}

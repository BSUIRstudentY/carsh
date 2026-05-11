import { useCallback, useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PublicPageShell } from '../../layouts/PublicPageShell'
import { useAuth } from '../../contexts/AuthContext'
import { VehicleBookingPanel } from './VehicleBookingPanel'
import type { MapVehicleFull } from './VehicleBookingPanel'
import type { TariffPublic } from './mapTariffs'
import './map.css'

const MINSK_CENTER: [number, number] = [53.9045, 27.5615]
const DEFAULT_ZOOM = 11

type CityItem = {
  id: number
  code: string
  name: string
  active: boolean
}

type CitiesResponse = { items: CityItem[] }
type VehiclesResponse = { items: MapVehicleFull[] }

type ClassFilter = '' | 'ECONOMY' | 'COMFORT' | 'BUSINESS'

const CLASS_OPTIONS: { value: ClassFilter; label: string }[] = [
  { value: '', label: 'Все классы' },
  { value: 'ECONOMY', label: 'Эконом' },
  { value: 'COMFORT', label: 'Комфорт' },
  { value: 'BUSINESS', label: 'Бизнес' },
]

interface ActiveBooking {
  id: number
  vehicleId: number
  vehicleTitle: string
  status: string
  startAt: string | null
}

interface RouteData { points: { lat: number; lon: number; ts: string; speedKph: number }[]; distanceKm: number; avgSpeedKph: number }

function FitBounds({ points, pause }: { points: [number, number][]; pause: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (pause) return
    if (points.length === 0) {
      map.setView(MINSK_CENTER, DEFAULT_ZOOM)
      return
    }
    if (points.length === 1) {
      map.setView(points[0], 13)
      return
    }
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 14 })
  }, [map, points, pause])
  return null
}

function FlyToSelected({
  position,
  enabled,
}: {
  position: [number, number] | null
  enabled: boolean
}) {
  const map = useMap()
  useEffect(() => {
    if (!enabled || !position) return
    map.flyTo(position, 15, { duration: 0.45 })
  }, [map, position, enabled])
  return null
}

export function MapPage() {
  const { isAuthenticated, accessToken } = useAuth()
  const [cities, setCities] = useState<CityItem[]>([])
  const [cityId, setCityId] = useState<string>('')
  const [classFilter, setClassFilter] = useState<ClassFilter>('')
  const [vehicleFilterId, setVehicleFilterId] = useState<string>('')
  const [vehicles, setVehicles] = useState<MapVehicleFull[]>([])
  const [tariffs, setTariffs] = useState<TariffPublic[]>([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [loadingTariffs, setLoadingTariffs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null)
  const [liveRoute, setLiveRoute] = useState<RouteData | null>(null)

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
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadTariffs = async () => {
      setLoadingTariffs(true)
      try {
        const res = await fetch('/api/v1/public/tariffs')
        if (!res.ok) throw new Error('tariffs')
        const data = (await res.json()) as TariffPublic[]
        if (!cancelled) setTariffs(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setTariffs([])
      } finally {
        if (!cancelled) setLoadingTariffs(false)
      }
    }
    void loadTariffs()
    return () => { cancelled = true }
  }, [])

  const loadMarkers = useCallback(async () => {
    setLoadingVehicles(true)
    setError(null)
    try {
      const qs = cityId !== '' ? `?cityId=${encodeURIComponent(cityId)}` : ''
      const res = await fetch(`/api/v1/public/vehicles/map${qs}`)
      if (!res.ok) throw new Error('map')
      const data = (await res.json()) as VehiclesResponse
      setVehicles(data.items ?? [])
    } catch {
      setError('Не удалось загрузить машины для карты.')
      setVehicles([])
    } finally {
      setLoadingVehicles(false)
    }
  }, [cityId])

  useEffect(() => {
    void loadMarkers()
  }, [loadMarkers])

  const loadActiveBooking = useCallback(async () => {
    if (!isAuthenticated || !accessToken) { setActiveBooking(null); return }
    try {
      const res = await fetch('/api/v1/bookings/active', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        setActiveBooking(await res.json())
      } else {
        setActiveBooking(null)
      }
    } catch {
      setActiveBooking(null)
    }
  }, [isAuthenticated, accessToken])

  useEffect(() => { void loadActiveBooking() }, [loadActiveBooking])

  const loadLiveRoute = useCallback(async () => {
    if (!activeBooking || !accessToken) { setLiveRoute(null); return }
    try {
      const res = await fetch(`/api/v1/bookings/${activeBooking.id}/route`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) setLiveRoute(await res.json())
    } catch { /* ignore */ }
  }, [activeBooking, accessToken])

  useEffect(() => {
    void loadLiveRoute()
    if (!activeBooking) return
    const interval = setInterval(loadLiveRoute, 5000)
    return () => clearInterval(interval)
  }, [loadLiveRoute, activeBooking])

  useEffect(() => {
    setVehicleFilterId('')
    setSelectedVehicleId(null)
  }, [cityId, classFilter])

  const vehiclesForDropdown = useMemo(() => {
    let list = vehicles
    if (classFilter !== '') {
      list = list.filter((v) => v.vehicleClassCode === classFilter)
    }
    return [...list].sort((a, b) => a.displayTitle.localeCompare(b.displayTitle, 'ru'))
  }, [vehicles, classFilter])

  const filteredForMap = useMemo(() => {
    let list = vehicles
    if (classFilter !== '') {
      list = list.filter((v) => v.vehicleClassCode === classFilter)
    }
    if (vehicleFilterId !== '') {
      const id = Number(vehicleFilterId)
      list = list.filter((v) => v.id === id)
    }
    return list
  }, [vehicles, classFilter, vehicleFilterId])

  const points = useMemo(() => {
    const list: [number, number][] = []
    for (const v of filteredForMap) {
      if (v.latitude != null && v.longitude != null && !Number.isNaN(v.latitude) && !Number.isNaN(v.longitude)) {
        list.push([v.latitude, v.longitude])
      }
    }
    return list
  }, [filteredForMap])

  const selectedVehicle = useMemo(
    () => (selectedVehicleId != null ? vehicles.find((v) => v.id === selectedVehicleId) ?? null : null),
    [vehicles, selectedVehicleId],
  )

  const flyPosition = useMemo((): [number, number] | null => {
    if (!selectedVehicle?.latitude || !selectedVehicle.longitude) return null
    return [selectedVehicle.latitude, selectedVehicle.longitude]
  }, [selectedVehicle])

  const showLoading = loadingCities || loadingVehicles || loadingTariffs

  const handleMarkerClick = (v: MapVehicleFull) => {
    setVehicleFilterId(String(v.id))
    setSelectedVehicleId(v.id)
  }

  const handleVehicleSelect = (id: string) => {
    setVehicleFilterId(id)
    if (id === '') setSelectedVehicleId(null)
  }

  const handleBooked = () => {
    loadActiveBooking()
    loadMarkers()
  }

  const handleEndRide = async () => {
    if (!activeBooking || !accessToken) return
    try {
      const res = await fetch(`/api/v1/bookings/${activeBooking.id}/end`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        setActiveBooking(null)
        setLiveRoute(null)
        loadMarkers()
      }
    } catch { /* ignore */ }
  }

  const liveRoutePositions = useMemo(
    () => liveRoute?.points.map(p => [p.lat, p.lon] as [number, number]) ?? [],
    [liveRoute],
  )

  return (
    <PublicPageShell>
      <div className="page-main page-main--map">
        <h1>Карта автомобилей</h1>
        <p className="lead">
          Нажмите на маркер автомобиля — откроется карточка с тарифами и бронированием.
        </p>

        {activeBooking && (
          <div className="map-active-ride">
            <div className="map-active-ride__info">
              <span className="map-active-ride__dot" />
              <strong>Активная поездка:</strong> {activeBooking.vehicleTitle}
              {activeBooking.startAt && (
                <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                  с {new Date(activeBooking.startAt).toLocaleTimeString('ru')}
                </span>
              )}
              {liveRoute && liveRoute.points.length > 0 && (
                <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                  · {liveRoute.distanceKm.toFixed(2)} км · {liveRoute.avgSpeedKph.toFixed(0)} км/ч
                </span>
              )}
            </div>
            <button className="map-active-ride__end" onClick={handleEndRide}>
              Завершить поездку
            </button>
          </div>
        )}

        <div className="map-page__toolbar map-page__toolbar--grid">
          <label htmlFor="map-city">
            Город
            <select id="map-city" value={cityId} onChange={(e) => setCityId(e.target.value)} disabled={loadingCities} aria-label="Фильтр по городу">
              <option value="">Все города</option>
              {cities.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </label>

          <label htmlFor="map-class">
            Класс
            <select id="map-class" value={classFilter} onChange={(e) => setClassFilter(e.target.value as ClassFilter)} disabled={loadingVehicles} aria-label="Фильтр по классу автомобиля">
              {CLASS_OPTIONS.map((o) => <option key={o.value === '' ? 'all' : o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>

          <label htmlFor="map-vehicle">
            Машина
            <select id="map-vehicle" value={vehicleFilterId} onChange={(e) => handleVehicleSelect(e.target.value)} disabled={loadingVehicles} aria-label="Показать только выбранный автомобиль">
              <option value="">Все на карте</option>
              {vehiclesForDropdown.map((v) => <option key={v.id} value={String(v.id)}>{v.displayTitle} ({v.vehicleClassTitle})</option>)}
            </select>
          </label>
        </div>

        {error && <div className="fleet-error">{error}</div>}
        {showLoading && <div className="fleet-loading">Загрузка карты…</div>}
        {!showLoading && !error && filteredForMap.length === 0 && (
          <div className="map-page__empty-banner">Нет автомобилей для выбранных фильтров или нет координат.</div>
        )}

        {!showLoading && (
          <div className="map-page__frame">
            <MapContainer
              key={`${cityId === '' ? 'all' : cityId}-${classFilter}-${vehicleFilterId}`}
              center={MINSK_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom
              className="map-page__leaflet"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds points={points} pause={selectedVehicleId != null} />
              <FlyToSelected position={flyPosition} enabled={selectedVehicleId != null} />

              {liveRoutePositions.length > 1 && (
                <Polyline positions={liveRoutePositions} color="#2563eb" weight={4} opacity={0.8} />
              )}
              {liveRoutePositions.length > 0 && (
                <>
                  <Marker position={liveRoutePositions[0]} />
                  {liveRoutePositions.length > 1 && (
                    <Marker position={liveRoutePositions[liveRoutePositions.length - 1]} />
                  )}
                </>
              )}

              {filteredForMap.map((v) => {
                if (v.latitude == null || v.longitude == null) return null
                const isActive = selectedVehicleId === v.id
                const isRented = activeBooking?.vehicleId === v.id
                return (
                  <CircleMarker
                    key={v.id}
                    center={[v.latitude, v.longitude]}
                    radius={isActive ? 12 : isRented ? 11 : 8}
                    pathOptions={{
                      color: isRented ? '#059669' : isActive ? '#c2410c' : '#3730a3',
                      fillColor: isRented ? '#34d399' : isActive ? '#fb923c' : '#818cf8',
                      fillOpacity: 0.9,
                      weight: isActive || isRented ? 3 : 2,
                    }}
                    eventHandlers={{ click: () => handleMarkerClick(v) }}
                  />
                )
              })}
            </MapContainer>
          </div>
        )}

        {selectedVehicle && (
          <VehicleBookingPanel
            key={selectedVehicle.id}
            vehicle={selectedVehicle}
            tariffs={tariffs}
            onClose={() => setSelectedVehicleId(null)}
            onBooked={handleBooked}
          />
        )}
      </div>
    </PublicPageShell>
  )
}

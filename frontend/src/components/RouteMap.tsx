import { MapContainer, TileLayer, Polyline, Marker, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface RoutePoint {
  lat: number
  lon: number
}

interface Props {
  points: RoutePoint[]
  isActive: boolean
  height?: string
  interactive?: boolean
}

export function RouteMap({ points, isActive, height = '400px', interactive = true }: Props) {
  if (points.length === 0) return null

  const positions = points.map(p => [p.lat, p.lon] as [number, number])
  const startPos = positions[0]
  const lastPos = positions[positions.length - 1]

  return (
    <MapContainer
      center={lastPos}
      zoom={14}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      style={{ height, width: '100%', borderRadius: '12px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={positions} color="#2563eb" weight={4} />

      <Marker position={startPos}>
        <Popup>Старт</Popup>
      </Marker>

      {isActive ? (
        <CircleMarker
          center={lastPos}
          radius={10}
          pathOptions={{
            color: '#1e293b',
            fillColor: '#3b82f6',
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>Текущее положение</Popup>
        </CircleMarker>
      ) : (
        positions.length > 1 && (
          <Marker position={lastPos}>
            <Popup>Финиш</Popup>
          </Marker>
        )
      )}
    </MapContainer>
  )
}

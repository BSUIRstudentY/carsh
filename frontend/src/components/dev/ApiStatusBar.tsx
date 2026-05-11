import { useEffect, useState } from 'react'

type HealthResponse = {
  status: string
  service: string
}

export function ApiStatusBar() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/v1/health')
      .then((r) => {
        if (!r.ok) throw new Error('bad status')
        return r.json() as Promise<HealthResponse>
      })
      .then(setHealth)
      .catch(() => setError(true))
  }, [])

  return (
    <footer className="dev-bar" role="status">
      {health && (
        <span>
          API: {health.service} — {health.status}
        </span>
      )}
      {error && <span>API недоступен (запустите Spring Boot :8080)</span>}
    </footer>
  )
}

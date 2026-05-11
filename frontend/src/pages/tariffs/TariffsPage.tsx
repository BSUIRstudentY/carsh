import { useCallback, useEffect, useMemo, useState } from 'react'
import { PublicPageShell } from '../../layouts/PublicPageShell'
import './tariffs.css'

type TariffMode = 'PER_TIME' | 'PER_KM' | 'BULK_TIME'

type TariffPublic = {
  id: number
  title: string
  tariffMode: TariffMode
  pricePerMinute: string | number | null
  pricePerKm: string | number | null
  dailyCapAmount: string | number | null
  bulkTimeHours: string | number | null
  bulkPackagePrice: string | number | null
}

function formatRate(value: string | number | null): string {
  if (value == null || value === '') return '—'
  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(n)) return '—'
  return n.toFixed(2)
}

function sortByTitle(a: TariffPublic, b: TariffPublic): number {
  return a.title.localeCompare(b.title, 'ru')
}

export function TariffsPage() {
  const [items, setItems] = useState<TariffPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/public/tariffs')
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const json = (await res.json()) as TariffPublic[]
      if (!Array.isArray(json)) {
        throw new Error('Unexpected response')
      }
      setItems(json)
    } catch {
      setError('Не удалось загрузить тарифы. Убедитесь, что API запущен на :8080.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const { timeRows, kmRows, bulkRows } = useMemo(() => {
    const time = items.filter((t) => t.tariffMode === 'PER_TIME').sort(sortByTitle)
    const km = items.filter((t) => t.tariffMode === 'PER_KM').sort(sortByTitle)
    const bulk = items.filter((t) => t.tariffMode === 'BULK_TIME').sort(sortByTitle)
    return { timeRows: time, kmRows: km, bulkRows: bulk }
  }, [items])

  return (
    <PublicPageShell>
      <div className="page-main page-main--wide">
        <h1>Тарифы</h1>
        <p className="lead">
          Данные с API: <code style={{ fontSize: '0.85em' }}>GET /api/v1/public/tariffs</code> — полный
          список активных тарифов без пагинации.
        </p>

        {error && <div className="tariffs-error">{error}</div>}

        {loading && <div className="tariffs-loading">Загрузка…</div>}

        {!loading && !error && items.length === 0 && (
          <div className="tariffs-empty">Нет активных тарифов в базе.</div>
        )}

        {!loading && items.length > 0 && (
          <>
            <section className="tariffs-section" aria-labelledby="tariffs-per-time">
              <h2 id="tariffs-per-time" className="tariffs-section__title">
                По времени (поминутно)
              </h2>
              <p className="tariffs-section__lead">
                Оплата за минуту использования, в белорусских рублях.
              </p>
              <div className="tariffs-table-wrap">
                <table className="tariffs-table">
                  <thead>
                    <tr>
                      <th scope="col">Название</th>
                      <th scope="col" className="tariffs-table__numeric">
                        BYN / мин
                      </th>
                      <th scope="col" className="tariffs-table__numeric">
                        Потолок / сутки
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeRows.length === 0 ? (
                      <tr className="tariffs-empty-row">
                        <td colSpan={3}>Нет тарифов этого типа.</td>
                      </tr>
                    ) : (
                      timeRows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.title}</td>
                          <td className="tariffs-table__numeric">{formatRate(row.pricePerMinute)}</td>
                          <td className="tariffs-table__numeric">{formatRate(row.dailyCapAmount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="tariffs-section" aria-labelledby="tariffs-per-km">
              <h2 id="tariffs-per-km" className="tariffs-section__title">
                По километрам
              </h2>
              <p className="tariffs-section__lead">Начисление за пройденный километраж.</p>
              <div className="tariffs-table-wrap">
                <table className="tariffs-table">
                  <thead>
                    <tr>
                      <th scope="col">Название</th>
                      <th scope="col" className="tariffs-table__numeric">
                        BYN / км
                      </th>
                      <th scope="col" className="tariffs-table__numeric">
                        Потолок / сутки
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {kmRows.length === 0 ? (
                      <tr className="tariffs-empty-row">
                        <td colSpan={3}>Нет тарифов этого типа.</td>
                      </tr>
                    ) : (
                      kmRows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.title}</td>
                          <td className="tariffs-table__numeric">{formatRate(row.pricePerKm)}</td>
                          <td className="tariffs-table__numeric">{formatRate(row.dailyCapAmount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="tariffs-section" aria-labelledby="tariffs-bulk">
              <h2 id="tariffs-bulk" className="tariffs-section__title">
                Оптовое время (пакеты)
              </h2>
              <p className="tariffs-section__lead">
                Фиксированная цена за пакет часов (например, 10 ч подряд).
              </p>
              <div className="tariffs-table-wrap">
                <table className="tariffs-table">
                  <thead>
                    <tr>
                      <th scope="col">Название</th>
                      <th scope="col" className="tariffs-table__numeric">
                        Часов в пакете
                      </th>
                      <th scope="col" className="tariffs-table__numeric">
                        Цена пакета (BYN)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkRows.length === 0 ? (
                      <tr className="tariffs-empty-row">
                        <td colSpan={3}>Нет тарифов этого типа.</td>
                      </tr>
                    ) : (
                      bulkRows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.title}</td>
                          <td className="tariffs-table__numeric">{formatRate(row.bulkTimeHours)}</td>
                          <td className="tariffs-table__numeric">{formatRate(row.bulkPackagePrice)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </PublicPageShell>
  )
}

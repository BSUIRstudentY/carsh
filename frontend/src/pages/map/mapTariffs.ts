export type TariffMode = 'PER_TIME' | 'PER_KM' | 'BULK_TIME'

export type TariffPublic = {
  id: number
  code: string
  title: string
  tariffMode: TariffMode
  pricePerMinute: string | number | null
  pricePerKm: string | number | null
  dailyCapAmount: string | number | null
  bulkTimeHours: string | number | null
  bulkPackagePrice: string | number | null
}

/** Тарифы, относящиеся к классу авто (ECONOMY / COMFORT / BUSINESS). */
export function tariffsForVehicleClass(classCode: string, tariffs: TariffPublic[]): TariffPublic[] {
  return tariffs.filter(
    (t) => t.code === classCode || t.code.startsWith(`${classCode}_`),
  )
}

export function num(v: string | number | null | undefined): number | null {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

export function formatMoney(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `${value.toFixed(2)} BYN`
}

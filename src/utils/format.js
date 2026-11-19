const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const NUMBER_FORMATTER = new Intl.NumberFormat('en')

export function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return DATE_FORMATTER.format(date)
}

export function formatNumber(value) {
  const numeric = Number(value)
  return NUMBER_FORMATTER.format(Number.isFinite(numeric) ? numeric : 0)
}

export function formatRelativeDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const absolute = Math.abs(diffSeconds)

  if (absolute < 45) return 'Just now'
  if (absolute < 3600) return `${Math.round(diffSeconds / 60)}m ago`
  if (absolute < 86400) return `${Math.round(diffSeconds / 3600)}h ago`
  if (absolute < 604800) return `${Math.round(diffSeconds / 86400)}d ago`
  return formatDate(date)
}

export function formatBytes(bytes) {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value <= 0) return '0 KB'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function slugifyFileName(value, fallback = 'qr-code') {
  const slug = String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  return slug || fallback
}

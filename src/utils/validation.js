export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const UPI_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,}@[a-zA-Z][a-zA-Z0-9.-]{1,}$/

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function normalizeUrl(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return null

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return null
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    if (!url.hostname || !url.hostname.includes('.')) return null
    return url.href
  } catch {
    return null
  }
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? '').trim())
}

export function phoneDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function isValidPhone(value, min = 6, max = 15) {
  const digits = phoneDigits(value)
  return digits.length >= min && digits.length <= max
}

export function normalizePhone(value) {
  const trimmed = String(value ?? '').trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = phoneDigits(trimmed)
  return digits ? `${hasPlus ? '+' : ''}${digits}` : ''
}

export function isValidUpiId(value) {
  return UPI_PATTERN.test(String(value ?? '').trim())
}

export function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value ?? '').trim())
}

export function byteLength(value) {
  if (typeof TextEncoder === 'undefined') {
    return String(value ?? '').length
  }
  return new TextEncoder().encode(String(value ?? '')).length
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

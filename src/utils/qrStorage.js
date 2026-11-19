import {
  generateId,
  readStorage,
  STORAGE_KEYS,
  writeStorage,
} from './storage'

export { generateId, STORAGE_KEYS }

function isValidDate(value) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
}

export function normalizeQRCode(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null
  if (typeof item.id !== 'string' || !item.id) return null
  if (typeof item.type !== 'string' || !item.type) return null

  const now = new Date().toISOString()
  const createdAt = isValidDate(item.createdAt) ? item.createdAt : now
  const updatedAt = isValidDate(item.updatedAt) ? item.updatedAt : createdAt
  const normalized = {
    id: item.id,
    name:
      typeof item.name === 'string' && item.name.trim()
        ? item.name.trim()
        : 'Untitled QR code',
    type: item.type,
    fields:
      item.fields && typeof item.fields === 'object' && !Array.isArray(item.fields)
        ? item.fields
        : {},
    customization:
      item.customization &&
      typeof item.customization === 'object' &&
      !Array.isArray(item.customization)
        ? item.customization
        : {},
    createdAt,
    updatedAt,
    downloads: Number.isFinite(item.downloads) ? Math.max(0, item.downloads) : 0,
  }

  if (typeof item.content === 'string') {
    normalized.content = item.content
  }

  return normalized
}

export function loadQRCodes() {
  const stored = readStorage(STORAGE_KEYS.qrCodes, [])
  if (!Array.isArray(stored)) return []
  return stored.map(normalizeQRCode).filter(Boolean)
}

export function saveQRCodes(qrCodes) {
  return writeStorage(STORAGE_KEYS.qrCodes, Array.isArray(qrCodes) ? qrCodes : [])
}

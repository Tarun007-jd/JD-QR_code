const QR_CODES_KEY = 'qrstudio:qrcodes:v1'
const SETTINGS_KEY = 'qrstudio:settings:v1'

export const STORAGE_KEYS = Object.freeze({
  qrCodes: QR_CODES_KEY,
  settings: SETTINGS_KEY,
})

const STORAGE_MESSAGES = Object.freeze({
  unavailable:
    'Local storage is unavailable in this browser, so this change was not saved. Your current view is unchanged.',
  quota:
    'Browser storage is full, so this change was not saved. Free up space (for example, delete a saved QR code or reset preferences) and try again.',
  serialization:
    'This change could not be prepared for saving. Try again, or remove the logo if the problem continues.',
  unknown:
    'The browser blocked this save. Check site storage permissions and try again.',
})

function getLocalStorage() {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage ?? null
  } catch (error) {
    console.warn('QR Studio could not access local storage.', error)
    return null
  }
}

function isQuotaExceededError(error) {
  if (!error) return false
  return (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error.code === 22 ||
    error.code === 1014
  )
}

function storageFailure(reason, error = null) {
  return {
    ok: false,
    reason,
    error,
    message: STORAGE_MESSAGES[reason] || STORAGE_MESSAGES.unknown,
  }
}

export function readStorage(key, fallback) {
  const storage = getLocalStorage()
  if (!storage) return fallback

  try {
    const raw = storage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (error) {
    console.warn(`QR Studio could not read "${key}" from local storage.`, error)
    return fallback
  }
}

/**
 * Persists a value and reports whether the write actually succeeded.
 *
 * Callers must wait for `ok: true` before updating visible state or showing a
 * success message. Failures never throw, so a blocked or full localStorage
 * cannot crash the application or silently discard the user's edits.
 */
export function writeStorage(key, value) {
  const storage = getLocalStorage()
  if (!storage) return storageFailure('unavailable')

  let serialized
  try {
    serialized = JSON.stringify(value)
  } catch (error) {
    console.warn(`QR Studio could not serialize "${key}".`, error)
    return storageFailure('serialization', error)
  }

  try {
    storage.setItem(key, serialized)
    return { ok: true, reason: null, error: null, bytes: serialized.length }
  } catch (error) {
    const reason = isQuotaExceededError(error) ? 'quota' : 'unknown'
    console.warn(`QR Studio could not write "${key}" to local storage.`, error)
    return storageFailure(reason, error)
  }
}

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `qr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export function loadSettings() {
  const stored = readStorage(SETTINGS_KEY, {})
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
}

export function saveSettings(settings) {
  return writeStorage(SETTINGS_KEY, settings || {})
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  generateId,
  loadQRCodes,
  saveQRCodes,
  STORAGE_KEYS,
} from '../utils/qrStorage'
import QRCodeContext from './qrCodesContext'

const MISSING_CODE =
  'This QR code is no longer in your library. Refresh the page and try again.'
const BUSY_SAVE =
  'Another save is already in progress. Wait a moment and try again.'

function sameValue(left, right) {
  if (left === right) return true

  try {
    return JSON.stringify(left) === JSON.stringify(right)
  } catch {
    return false
  }
}

function hasQRCodeChanges(current, updates) {
  const ignored = new Set(['id', 'createdAt', 'updatedAt', 'downloads'])

  return Object.keys(updates || {}).some(
    (key) => !ignored.has(key) && !sameValue(current[key], updates[key]),
  )
}

export default function QRCodeProvider({ children }) {
  const [qrCodes, setQrCodes] = useState(() => loadQRCodes())
  const qrCodesRef = useRef(qrCodes)
  const savingRef = useRef(false)

  useEffect(() => {
    function syncFromStorage(event) {
      if (event.key === null || event.key === STORAGE_KEYS.qrCodes) {
        const stored = loadQRCodes()
        qrCodesRef.current = stored
        setQrCodes(stored)
      }
    }

    window.addEventListener('storage', syncFromStorage)
    return () => window.removeEventListener('storage', syncFromStorage)
  }, [])

  /**
   * The single write boundary for QR records. State only changes after the
   * storage write succeeds, so a failed save never hides or discards data.
   */
  const persistCodes = useCallback((nextCodes) => {
    if (savingRef.current) {
      return { ok: false, reason: 'busy', message: BUSY_SAVE }
    }

    savingRef.current = true
    try {
      const result = saveQRCodes(nextCodes)
      if (!result.ok) return result

      qrCodesRef.current = nextCodes
      setQrCodes(nextCodes)
      return result
    } finally {
      savingRef.current = false
    }
  }, [])

  const addQRCode = useCallback(
    (data) => {
      const now = new Date().toISOString()
      const record = {
        id: generateId(),
        name: data.name || 'Untitled QR code',
        type: data.type,
        fields: data.fields || {},
        content: typeof data.content === 'string' ? data.content : '',
        customization: data.customization || {},
        createdAt: now,
        updatedAt: now,
        downloads: 0,
      }

      const result = persistCodes([record, ...qrCodesRef.current])
      return result.ok ? { ...result, record } : result
    },
    [persistCodes],
  )

  const updateQRCode = useCallback(
    (id, updates) => {
      const current = qrCodesRef.current
      const target = current.find((qr) => qr.id === id)
      if (!target) return { ok: false, reason: 'missing', message: MISSING_CODE }

      if (!hasQRCodeChanges(target, updates)) {
        return { ok: true, unchanged: true, record: target }
      }

      const updated = {
        ...target,
        ...updates,
        id: target.id,
        createdAt: target.createdAt,
        downloads: target.downloads,
        updatedAt: new Date().toISOString(),
      }
      const next = current.map((qr) => (qr.id === id ? updated : qr))
      const result = persistCodes(next)

      return result.ok ? { ...result, record: updated } : result
    },
    [persistCodes],
  )

  const renameQRCode = useCallback(
    (id, name) => {
      const safeName = String(name ?? '').trim()
      if (!safeName) {
        return { ok: false, reason: 'invalid', message: 'Give your QR code a name.' }
      }

      const current = qrCodesRef.current
      const target = current.find((qr) => qr.id === id)
      if (!target) return { ok: false, reason: 'missing', message: MISSING_CODE }
      if (target.name === safeName) {
        return { ok: true, unchanged: true, record: target }
      }

      const updated = {
        ...target,
        name: safeName,
        updatedAt: new Date().toISOString(),
      }
      const next = current.map((qr) => (qr.id === id ? updated : qr))
      const result = persistCodes(next)

      return result.ok ? { ...result, record: updated } : result
    },
    [persistCodes],
  )

  const deleteQRCode = useCallback(
    (id) => {
      const current = qrCodesRef.current
      const next = current.filter((qr) => qr.id !== id)

      if (next.length === current.length) {
        return { ok: false, reason: 'missing', message: MISSING_CODE }
      }

      return persistCodes(next)
    },
    [persistCodes],
  )

  const incrementDownloads = useCallback(
    (id) => {
      const current = qrCodesRef.current
      const target = current.find((qr) => qr.id === id)
      if (!target) return { ok: false, reason: 'missing', message: MISSING_CODE }

      const updated = {
        ...target,
        downloads: Math.max(0, Number(target.downloads) || 0) + 1,
      }
      const next = current.map((qr) => (qr.id === id ? updated : qr))
      const result = persistCodes(next)

      return result.ok ? { ...result, record: updated } : result
    },
    [persistCodes],
  )

  const clearQRCodes = useCallback(() => {
    if (qrCodesRef.current.length === 0) {
      return { ok: true, unchanged: true }
    }

    return persistCodes([])
  }, [persistCodes])

  const value = useMemo(
    () => ({
      qrCodes,
      addQRCode,
      updateQRCode,
      renameQRCode,
      deleteQRCode,
      incrementDownloads,
      clearQRCodes,
    }),
    [
      qrCodes,
      addQRCode,
      updateQRCode,
      renameQRCode,
      deleteQRCode,
      incrementDownloads,
      clearQRCodes,
    ],
  )

  return <QRCodeContext.Provider value={value}>{children}</QRCodeContext.Provider>
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isHexColor } from '../utils/validation'
import { getScannability, QR_RESOLUTIONS } from '../utils/qrUtils'
import { loadSettings, saveSettings } from '../utils/storage'
import { DEFAULT_SETTINGS } from '../data/settings'
import SettingsContext from './settingsContext'

function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const validSizes = QR_RESOLUTIONS.map((resolution) => resolution.value)
  const requestedColor =
    typeof source.defaultQrColor === 'string' && isHexColor(source.defaultQrColor)
      ? source.defaultQrColor
      : DEFAULT_SETTINGS.defaultQrColor
  const colorIsScannable = getScannability(requestedColor, '#FFFFFF').scannable

  return {
    theme: ['light', 'dark', 'system'].includes(source.theme)
      ? source.theme
      : DEFAULT_SETTINGS.theme,
    defaultQrColor: colorIsScannable ? requestedColor : DEFAULT_SETTINGS.defaultQrColor,
    defaultExportSize: validSizes.includes(Number(source.defaultExportSize))
      ? Number(source.defaultExportSize)
      : DEFAULT_SETTINGS.defaultExportSize,
  }
}

function getSystemPreference() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => normalizeSettings(loadSettings()))
  const settingsRef = useRef(settings)
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPreference)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event) => setSystemPrefersDark(event.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  const resolvedTheme =
    settings.theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : settings.theme

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme
    const themeMeta = document.querySelector('meta[name="theme-color"]')
    if (themeMeta) {
      themeMeta.setAttribute('content', resolvedTheme === 'dark' ? '#080C14' : '#F8FAFC')
    }
  }, [resolvedTheme])

  const updateSettings = useCallback((patch) => {
    const next = normalizeSettings({ ...settingsRef.current, ...patch })
    const result = saveSettings(next)
    if (!result.ok) return result

    settingsRef.current = next
    setSettings(next)
    return result
  }, [])

  const resetSettings = useCallback(() => {
    const next = { ...DEFAULT_SETTINGS }
    const result = saveSettings(next)
    if (!result.ok) return result

    settingsRef.current = next
    setSettings(next)
    return result
  }, [])

  const value = useMemo(
    () => ({
      settings,
      resolvedTheme,
      updateSettings,
      resetSettings,
    }),
    [settings, resolvedTheme, updateSettings, resetSettings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

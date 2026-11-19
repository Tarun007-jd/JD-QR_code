import { useCallback, useMemo, useState } from 'react'
import { getDefaultQRFields, isValidQRType } from '../data/qrTypes'
import {
  DEFAULT_CUSTOMIZATION,
  getDefaultQRName,
  getScannability,
  mergeCustomization,
  validateQR,
} from '../utils/qrUtils'

function mergeFields(type, fields) {
  return {
    ...getDefaultQRFields(type),
    ...(fields && typeof fields === 'object' ? fields : {}),
  }
}

/**
 * Keeps all QR content/design state, validation, and scannability checks out of
 * the page component. The generator UI only renders what this hook returns.
 */
export default function useQRGenerator({
  initialType = 'url',
  initialFields,
  initialName = '',
  initialCustomization,
  defaults = DEFAULT_CUSTOMIZATION,
} = {}) {
  const seedType = isValidQRType(initialType) ? initialType : 'url'
  const [type, setType] = useState(seedType)
  const [fields, setFields] = useState(() => mergeFields(seedType, initialFields))
  const [name, setName] = useState(initialName || '')
  const [customization, setCustomizationState] = useState(() =>
    mergeCustomization({ ...defaults, ...(initialCustomization || {}) }, defaults),
  )
  const [showErrors, setShowErrors] = useState(false)

  const { errors, payload } = useMemo(
    () => validateQR(type, fields),
    [type, fields],
  )

  const effectiveBackground = customization.transparent
    ? '#FFFFFF'
    : customization.bgColor

  const scannability = useMemo(
    () => getScannability(customization.fgColor, effectiveBackground),
    [customization.fgColor, effectiveBackground],
  )

  const autoName = getDefaultQRName(type, fields)
  const displayName = name.trim() || autoName
  const isScannable = scannability.scannable
  const isReady = Boolean(payload) && isScannable

  const changeType = useCallback(
    (nextType) => {
      if (!isValidQRType(nextType) || nextType === type) return
      setType(nextType)
      setFields(getDefaultQRFields(nextType))
      setShowErrors(false)
    },
    [type],
  )

  const updateCustomization = useCallback(
    (patch) => {
      setCustomizationState((previous) => {
        const next =
          typeof patch === 'function'
            ? patch(previous)
            : { ...previous, ...(patch || {}) }
        return mergeCustomization(next, defaults)
      })
    },
    [defaults],
  )

  const reset = useCallback(
    (options = {}) => {
      const nextType = isValidQRType(options.type) ? options.type : 'url'
      setType(nextType)
      setFields(mergeFields(nextType, options.fields))
      setName(options.name || '')
      setCustomizationState(
        mergeCustomization(
          {
            ...defaults,
            ...(options.customization || {}),
          },
          defaults,
        ),
      )
      setShowErrors(false)
    },
    [defaults],
  )

  return {
    type,
    setType,
    fields,
    setFields,
    name,
    setName,
    customization,
    setCustomization: updateCustomization,
    showErrors,
    setShowErrors,
    errors,
    payload,
    scannability,
    isScannable,
    isReady,
    autoName,
    displayName,
    changeType,
    reset,
  }
}

import { isHexColor } from './validation'

export const QR_ERROR_CORRECTION = 'H'
export const MAX_QR_PAYLOAD_BYTES = 1000
export const MAX_LOGO_FILE_SIZE = 1024 * 1024
export const MIN_LOGO_SIZE_PERCENT = 14
export const MAX_LOGO_SIZE_PERCENT = 25

export const QR_ERROR_LEVELS = [
  { value: 'L', label: 'L', detail: '7% recovery' },
  { value: 'M', label: 'M', detail: '15% recovery' },
  { value: 'Q', label: 'Q', detail: '25% recovery' },
  { value: 'H', label: 'H', detail: '30% recovery' },
]

export const QR_RESOLUTIONS = [
  { value: 512, label: 'Standard', detail: '512 × 512 px' },
  { value: 1024, label: 'High', detail: '1024 × 1024 px' },
  { value: 2048, label: 'Ultra', detail: '2048 × 2048 px' },
]

export const QR_COLOR_PRESETS = [
  { name: 'Ink', fgColor: '#0F172A', bgColor: '#FFFFFF' },
  { name: 'Indigo', fgColor: '#312E81', bgColor: '#EEF2FF' },
  { name: 'Ocean', fgColor: '#0C4A6E', bgColor: '#F0F9FF' },
  { name: 'Forest', fgColor: '#064E3B', bgColor: '#ECFDF5' },
  { name: 'Plum', fgColor: '#4C1D95', bgColor: '#FAF5FF' },
  { name: 'Rosewood', fgColor: '#831843', bgColor: '#FFF1F2' },
  { name: 'Amber', fgColor: '#78350F', bgColor: '#FFFBEB' },
  { name: 'Graphite', fgColor: '#1E293B', bgColor: '#F8FAFC' },
]

export const QR_LOGO_POSITIONS = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
]

export const DEFAULT_CUSTOMIZATION = {
  fgColor: '#0F172A',
  bgColor: '#FFFFFF',
  size: 1024,
  marginSize: 4,
  errorCorrection: QR_ERROR_CORRECTION,
  logo: null,
  logoSize: 22,
  logoPosition: 'center',
  transparent: false,
}

const VALID_LOGO_POSITIONS = new Set(QR_LOGO_POSITIONS.map((position) => position.value))
const VALID_ERROR_LEVELS = new Set(QR_ERROR_LEVELS.map((level) => level.value))

export function mergeCustomization(customization, defaults = DEFAULT_CUSTOMIZATION) {
  const value = customization && typeof customization === 'object' ? customization : {}
  const allowedSizes = QR_RESOLUTIONS.map((resolution) => resolution.value)
  const size = Number(value.size)
  const marginSize = Number(value.marginSize)
  const logoSize = Number(value.logoSize)
  const errorCorrection = String(value.errorCorrection ?? '').toUpperCase()
  const logo =
    typeof value.logo === 'string' && value.logo.startsWith('data:image/')
      ? value.logo
      : null
  const requestedLogoSize = Number.isFinite(logoSize) ? logoSize : defaults.logoSize

  return {
    fgColor: isHexColor(value.fgColor) ? value.fgColor : defaults.fgColor,
    bgColor: isHexColor(value.bgColor) ? value.bgColor : defaults.bgColor,
    size: allowedSizes.includes(size) ? size : defaults.size,
    marginSize: Number.isFinite(marginSize)
      ? Math.min(8, Math.max(2, Math.round(marginSize)))
      : defaults.marginSize,
    // A logo hides part of the code, so the safe level is part of the design
    // itself rather than a recommendation that could be ignored during export.
    errorCorrection: logo
      ? QR_ERROR_CORRECTION
      : VALID_ERROR_LEVELS.has(errorCorrection)
        ? errorCorrection
        : defaults.errorCorrection || QR_ERROR_CORRECTION,
    logo,
    logoSize: Math.min(
      MAX_LOGO_SIZE_PERCENT,
      Math.max(
        MIN_LOGO_SIZE_PERCENT,
        Math.round(Number(requestedLogoSize) || DEFAULT_CUSTOMIZATION.logoSize),
      ),
    ),
    logoPosition: VALID_LOGO_POSITIONS.has(value.logoPosition)
      ? value.logoPosition
      : defaults.logoPosition || 'center',
    transparent: Boolean(value.transparent ?? defaults.transparent),
  }
}

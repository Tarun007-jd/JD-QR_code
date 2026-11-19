/**
 * QR utilities are grouped by concern:
 * - qrConfig: presets, defaults, and customization normalization
 * - qrPayload: QR payload builders and display helpers
 * - qrValidation: field validation and contrast/scannability checks
 * - qrExport: logo preparation and file downloads
 *
 * This barrel keeps existing imports stable while the generator hook and newer
 * components import the focused modules directly.
 */
export * from './qrConfig'
export * from './qrPayload'
export * from './qrValidation'
export * from './qrExport'

import { MAX_LOGO_FILE_SIZE } from './qrConfig'
import { getQRSafety } from './qrValidation'
import {
  downloadQRCodeAsPng as downloadPng,
  downloadQRCodeAsSvg as downloadSvg,
  saveBlob,
} from './download'

export { saveBlob }

/**
 * Every export path goes through this guard. A logo must already be paired
 * with level H and a bounded logo size before the file is created.
 */
function assertSafeExport(customization) {
  if (!customization || typeof customization !== 'object') {
    throw new Error(
      'The QR design could not be verified for export. Refresh the page and try again.',
    )
  }

  const safety = getQRSafety(customization)
  if (!safety.safe) {
    throw new Error(safety.reason || 'This QR design is not safe to export.')
  }
}

export async function downloadQRCodeAsPng(
  svgElement,
  name = 'qr-code',
  options = {},
) {
  assertSafeExport(options.customization)
  return downloadPng(svgElement, name, options)
}

export function downloadQRCodeAsSvg(svgElement, name = 'qr-code', options = {}) {
  assertSafeExport(options.customization)
  return downloadSvg(svgElement, name)
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () =>
      reject(new Error('The logo could not be read. Please try another image.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () =>
      reject(new Error('The logo could not be loaded. Try a PNG or JPG file.'))
    image.src = source
  })
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

/**
 * Converts an uploaded file into a padded, rounded badge. The white badge keeps
 * the logo readable while leaving the code's error-recovery budget intact.
 */
export async function createLogoBadge(file) {
  if (!file) throw new Error('Choose a logo image first.')
  if (!file.type?.startsWith('image/')) {
    throw new Error('Please upload a PNG, JPG, WEBP, or SVG image.')
  }
  if (file.size > MAX_LOGO_FILE_SIZE) {
    throw new Error('Logo files must be 1 MB or smaller.')
  }

  const source = await readFileAsDataUrl(file)
  const image = await loadImage(source)

  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 480
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser could not prepare the logo.')

  ctx.clearRect(0, 0, 480, 480)
  ctx.fillStyle = '#FFFFFF'
  roundedRect(ctx, 4, 4, 472, 472, 84)
  ctx.fill()

  const maxLogoSize = 336
  const ratio = Math.min(maxLogoSize / image.width, maxLogoSize / image.height)
  const width = Math.max(1, image.width * ratio)
  const height = Math.max(1, image.height * ratio)
  ctx.drawImage(image, (480 - width) / 2, (480 - height) / 2, width, height)

  return canvas.toDataURL('image/png')
}

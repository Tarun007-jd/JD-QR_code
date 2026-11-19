import { toPng } from 'html-to-image'
import { slugifyFileName } from './format'

function triggerDownload(href, fileName) {
  const link = document.createElement('a')
  link.download = fileName
  link.href = href
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  try {
    triggerDownload(url, fileName)
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

function serializeSvg(svgElement) {
  if (!svgElement) throw new Error('The QR code is not ready yet.')
  const clone = svgElement.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  if (!clone.getAttribute('width') || !clone.getAttribute('height')) {
    const viewBox = clone.getAttribute('viewBox')
    if (viewBox) {
      const parts = viewBox.split(/\s+/)
      clone.setAttribute('width', parts[2] || '1024')
      clone.setAttribute('height', parts[3] || '1024')
    }
  }

  return new XMLSerializer().serializeToString(clone)
}

function loadSvgImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The QR image could not be rasterized.'))
    image.src = source
  })
}

export function downloadQRCodeAsSvg(svgElement, name = 'qr-code') {
  const serialized = serializeSvg(svgElement)
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`], {
    type: 'image/svg+xml;charset=utf-8',
  })
  saveBlob(blob, `${slugifyFileName(name)}.svg`)
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('The PNG file could not be created.'))
    }, 'image/png')
  })
}

export async function downloadQRCodeAsPng(
  svgElement,
  name = 'qr-code',
  { size = 1024, backgroundColor = '#FFFFFF', transparent = false } = {},
) {
  const targetSize = Math.max(256, Math.min(4096, Math.round(Number(size) || 1024)))
  const fileName = `${slugifyFileName(name)}.png`
  const serialized = serializeSvg(svgElement)
  const svgBlob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' })
  const objectUrl = URL.createObjectURL(svgBlob)

  try {
    const image = await loadSvgImage(objectUrl)
    const canvas = document.createElement('canvas')
    canvas.width = targetSize
    canvas.height = targetSize
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('A canvas could not be created in this browser.')

    if (!transparent) {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, targetSize, targetSize)
    }
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(image, 0, 0, targetSize, targetSize)

    const blob = await canvasToBlob(canvas)
    saveBlob(blob, fileName)
  } catch {
    // Fallback for browsers with stricter SVG rasterization rules.
    const rect = svgElement?.getBoundingClientRect()
    const width = rect?.width || targetSize
    const dataUrl = await toPng(svgElement, {
      ...(transparent ? {} : { backgroundColor }),
      cacheBust: true,
      pixelRatio: Math.max(1, targetSize / width),
    })
    triggerDownload(dataUrl, fileName)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

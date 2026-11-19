import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  mergeCustomization,
  QR_ERROR_CORRECTION,
} from '../../utils/qrConfig'

const QRVisual = forwardRef(function QRVisual(
  {
    value,
    customization,
    size = 1024,
    title = 'QR code',
    className = 'h-auto w-full',
  },
  ref,
) {
  const design = mergeCustomization(customization)
  const errorCorrection = design.logo
    ? QR_ERROR_CORRECTION
    : design.errorCorrection || QR_ERROR_CORRECTION
  const logoWidth = Math.round(size * (design.logoSize / 100))
  const svgNodeRef = useRef(null)
  const [moduleCount, setModuleCount] = useState(0)

  const setSvgRef = useCallback(
    (node) => {
      svgNodeRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref],
  )

  useEffect(() => {
    const svg = svgNodeRef.current
    if (!svg) return
    const viewBox = svg.getAttribute('viewBox')
    if (!viewBox) return
    const count = Number(viewBox.split(/\s+/)[2])
    if (Number.isFinite(count) && count > 0) {
      setModuleCount((previous) => (previous === count ? previous : count))
    }
  }, [value, size, design.marginSize, design.errorCorrection, errorCorrection])

  const imageSettings = useMemo(() => {
    if (!design.logo) return undefined

    const settings = {
      src: design.logo,
      height: logoWidth,
      width: logoWidth,
      excavate: true,
    }

    if (!moduleCount) return settings

    // qrcode.react expects x/y in pixels, then converts them to module units.
    // Work inside the data area so edge logos stay inside the quiet zone.
    const marginPixels = (size / moduleCount) * design.marginSize
    const dataArea = Math.max(1, size - marginPixels * 2)
    const centered = Math.max(0, Math.round((dataArea - logoWidth) / 2))
    const far = Math.max(0, Math.round(dataArea - logoWidth))

    switch (design.logoPosition) {
      case 'top':
        settings.x = centered
        settings.y = 0
        break
      case 'bottom':
        settings.x = centered
        settings.y = far
        break
      case 'left':
        settings.x = 0
        settings.y = centered
        break
      case 'right':
        settings.x = far
        settings.y = centered
        break
      default:
        // qrcode.react centers the image when x/y are omitted.
        break
    }

    return settings
  }, [design.logo, design.logoPosition, design.marginSize, logoWidth, moduleCount, size])

  return (
    <QRCodeSVG
      ref={setSvgRef}
      value={value}
      size={size}
      level={errorCorrection}
      boostLevel={false}
      bgColor={design.transparent ? 'transparent' : design.bgColor}
      fgColor={design.fgColor}
      marginSize={design.marginSize}
      imageSettings={imageSettings}
      title={title}
      className={className}
    />
  )
})

export default QRVisual

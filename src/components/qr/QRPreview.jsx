import { QrCode as QrCodeIcon } from 'lucide-react'
import QRVisual from './QRVisual'
import { cn } from '../../utils/cn'

export default function QRPreview({ payload, customization, svgRef, title }) {
  if (!payload) {
    return (
      <div className="dot-grid flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-line bg-surface-muted/60 p-4">
        <div className="flex max-w-[11.5rem] flex-col items-center rounded-2xl bg-surface/90 px-5 py-4 text-center shadow-[var(--shadow-sm)] backdrop-blur-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
            <QrCodeIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-2.5 text-[0.8125rem] font-semibold text-ink">
            Your QR preview appears here
          </p>
          <p className="mt-1 text-[0.6875rem] leading-[1.1rem] text-ink-faint">
            Pick a type and add content to generate it live.
          </p>
        </div>
      </div>
    )
  }

  const transparent = Boolean(customization.transparent)

  return (
    <div
      className={cn(
        'qr-frame w-full border border-line p-2.5 transition-colors duration-200',
        transparent && 'checkerboard',
      )}
      style={transparent ? undefined : { backgroundColor: customization.bgColor }}
      data-transparent={transparent ? 'true' : undefined}
    >
      <QRVisual
        ref={svgRef}
        value={payload}
        customization={customization}
        size={customization.size}
        title={title ? `QR code for ${title}` : 'QR code'}
        className="h-auto w-full rounded-[0.65rem]"
      />
    </div>
  )
}

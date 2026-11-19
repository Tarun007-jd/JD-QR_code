import { FileCode2, FileImage } from 'lucide-react'
import Button from '../ui/Button'
import { QR_RESOLUTIONS } from '../../utils/qrConfig'

export default function QRDownload({
  onDownload,
  disabled = false,
  busyFormat = null,
  size = 1024,
  onSizeChange,
  transparent = false,
  onTransparentChange,
}) {
  const isBusy = Boolean(busyFormat)
  const canChangeSize = typeof onSizeChange === 'function'
  const canChangeTransparent = typeof onTransparentChange === 'function'

  return (
    <div>
      {canChangeSize || canChangeTransparent ? (
        <div className="mb-2.5 rounded-xl border border-line bg-surface-soft p-2.5">
          {canChangeSize ? (
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="qr-export-size"
                className="text-[0.6875rem] font-medium text-ink-soft"
              >
                Export size
              </label>
              <select
                id="qr-export-size"
                value={size}
                onChange={(event) => onSizeChange(Number(event.target.value))}
                className="control h-7 w-auto py-0 pl-2 pr-6 text-[0.6875rem]"
              >
                {QR_RESOLUTIONS.map((resolution) => (
                  <option key={resolution.value} value={resolution.value}>
                    {resolution.value} px · {resolution.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {canChangeTransparent ? (
            <label
              className={`flex cursor-pointer items-center justify-between gap-2 ${
                canChangeSize ? 'mt-2 border-t border-line pt-2' : ''
              }`}
            >
              <span className="min-w-0">
                <span className="block text-[0.6875rem] font-medium text-ink-soft">
                  Transparent background
                </span>
                <span className="block text-[0.625rem] text-ink-faint">
                  Supported in PNG and SVG
                </span>
              </span>
              <input
                type="checkbox"
                checked={Boolean(transparent)}
                onChange={(event) => onTransparentChange(event.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-line"
                aria-label="Download with a transparent background"
              />
            </label>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => onDownload('png')}
          disabled={disabled || isBusy}
          loading={busyFormat === 'png'}
        >
          {busyFormat !== 'png' ? (
            <FileImage className="h-4 w-4" aria-hidden="true" />
          ) : null}
          PNG
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => onDownload('svg')}
          disabled={disabled || isBusy}
          loading={busyFormat === 'svg'}
        >
          {busyFormat !== 'svg' ? (
            <FileCode2 className="h-4 w-4" aria-hidden="true" />
          ) : null}
          SVG
        </Button>
      </div>
      <p className="mt-2 text-center text-[0.625rem] leading-4 text-ink-faint">
        {size} px PNG · Vector SVG · {transparent ? 'transparent' : 'solid'} background
      </p>
    </div>
  )
}

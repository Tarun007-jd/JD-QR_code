import { useId, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  CircleAlert,
  CircleCheck,
  Focus,
  ImagePlus,
  Palette,
  RotateCcw,
  ScanLine,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '../ui/Button'
import {
  MAX_LOGO_SIZE_PERCENT,
  MIN_LOGO_SIZE_PERCENT,
  QR_COLOR_PRESETS,
  QR_ERROR_LEVELS,
  QR_LOGO_POSITIONS,
  QR_RESOLUTIONS,
} from '../../utils/qrConfig'
import { createLogoBadge } from '../../utils/qrExport'
import { getScannability } from '../../utils/qrValidation'
import { cn } from '../../utils/cn'

const LOGO_POSITION_ICONS = {
  center: Focus,
  top: ChevronsUp,
  bottom: ChevronsDown,
  left: ChevronsLeft,
  right: ChevronsRight,
}

function ColorField({ label, value, onChange }) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-soft p-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-xs font-medium text-ink">
          {label}
        </label>
        <p className="mt-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.03em] text-ink-faint">
          {value}
        </p>
      </div>
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-line shadow-[var(--shadow-sm)]">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute -inset-2 h-[3.25rem] w-[3.25rem] cursor-pointer border-0 bg-transparent p-0"
          aria-label={`${label} color`}
        />
      </div>
    </div>
  )
}

function DesignSection({ title, summary, icon: Icon, open, onToggle, children }) {
  const panelId = useId()
  return (
    <div className="py-1">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 py-3 text-left"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-soft">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.8125rem] font-semibold text-ink">{title}</span>
          <span className="mt-0.5 block truncate text-[0.6875rem] text-ink-faint">
            {summary}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200',
            open ? 'rotate-180' : 'rotate-0',
          )}
          aria-hidden="true"
        />
      </button>
      <div id={panelId} hidden={!open} className="pb-4">
        {children}
      </div>
    </div>
  )
}

export default function QRCustomization({ value, onChange, onReset }) {
  const [openSections, setOpenSections] = useState({
    colors: true,
    size: true,
    logo: true,
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const scannability = getScannability(
    value.fgColor,
    value.transparent ? '#FFFFFF' : value.bgColor,
  )
  const currentResolution =
    QR_RESOLUTIONS.find((resolution) => resolution.value === value.size) ??
    QR_RESOLUTIONS[1]
  const positionLabel =
    QR_LOGO_POSITIONS.find((position) => position.value === value.logoPosition)?.label ??
    'Center'

  const toggleSection = (section) => {
    setOpenSections((previous) => ({ ...previous, [section]: !previous[section] }))
  }

  const update = (patch) => onChange(patch)
  const isPresetActive = (preset) =>
    !value.transparent &&
    preset.fgColor.toLowerCase() === value.fgColor.toLowerCase() &&
    preset.bgColor.toLowerCase() === value.bgColor.toLowerCase()

  async function handleLogoFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    try {
      const logo = await createLogoBadge(file)
      update({ logo })
      toast.success('Logo added', {
        description:
          'Error correction is locked to level H while a logo is attached. Test a real scan before sharing.',
      })
    } catch (error) {
      toast.error('Logo could not be added', {
        description: error?.message || 'Please try another image.',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="card">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-[0.6875rem] font-semibold text-ink-soft">
            03
          </span>
          <div className="min-w-0">
            <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
              Customize
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-ink-soft">
              Make it yours while keeping it easy to scan.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="-mr-1 shrink-0 px-2"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>

      <div className="divide-y divide-line px-4 sm:px-5">
        <DesignSection
          title="Colors"
          summary={
            value.transparent
              ? `${value.fgColor.toUpperCase()} on transparent`
              : `${value.fgColor.toUpperCase()} on ${value.bgColor.toUpperCase()}`
          }
          icon={Palette}
          open={openSections.colors}
          onToggle={() => toggleSection('colors')}
        >
          <div className="grid grid-cols-2 gap-2.5">
            <ColorField
              label="Foreground"
              value={value.fgColor}
              onChange={(fgColor) => update({ fgColor })}
            />
            <ColorField
              label="Background"
              value={value.bgColor}
              onChange={(bgColor) => update({ bgColor, transparent: false })}
            />
          </div>

          <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface-soft p-3 transition-colors hover:border-line-strong">
            <span className="min-w-0">
              <span className="block text-xs font-medium text-ink">
                Transparent background
              </span>
              <span className="mt-0.5 block text-[0.6875rem] leading-5 text-ink-faint">
                PNG and SVG exports omit the background fill.
              </span>
            </span>
            <input
              type="checkbox"
              checked={Boolean(value.transparent)}
              onChange={(event) => update({ transparent: event.target.checked })}
              className="h-4 w-4 shrink-0 rounded border-line"
              aria-label="Export with a transparent background"
            />
          </label>

          <div className="mt-3">
            <p className="text-[0.6875rem] font-medium text-ink-faint">Color presets</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QR_COLOR_PRESETS.map((preset) => {
                const active = isPresetActive(preset)
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      update({
                        fgColor: preset.fgColor,
                        bgColor: preset.bgColor,
                        transparent: false,
                      })
                    }
                    title={preset.name}
                    aria-label={`${preset.name} color preset`}
                    aria-pressed={active}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border transition-all',
                      active
                        ? 'border-brand ring-2 ring-brand/25 ring-offset-2 ring-offset-surface'
                        : 'border-line hover:scale-105 hover:border-line-strong',
                    )}
                  >
                    <span
                      className="relative flex h-5 w-5 items-center justify-center rounded-full border border-black/5"
                      style={{ backgroundColor: preset.bgColor }}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: preset.fgColor }}
                      />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div
            className={cn(
              'mt-3 flex items-start gap-2 rounded-lg px-2.5 py-2 text-[0.6875rem] leading-5',
              scannability.scannable
                ? 'bg-success-soft text-[var(--success-text)]'
                : 'bg-warning-soft text-[var(--warning-text)]',
            )}
          >
            {scannability.scannable ? (
              <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>
              {scannability.scannable
                ? `Good contrast (${scannability.ratio.toFixed(1)}:1). Ready to scan.${
                    value.transparent
                      ? ' Transparent codes scan best on light surfaces.'
                      : ''
                  }`
                : scannability.reason}
            </span>
          </div>
        </DesignSection>

        <DesignSection
          title="Size & quiet zone"
          summary={`${currentResolution.value} px · ${value.marginSize} module quiet zone`}
          icon={ScanLine}
          open={openSections.size}
          onToggle={() => toggleSection('size')}
        >
          <p className="mb-2 text-[0.6875rem] font-medium text-ink-faint">
            Export resolution
          </p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Export resolution">
            {QR_RESOLUTIONS.map((resolution) => {
              const active = resolution.value === value.size
              return (
                <button
                  key={resolution.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => update({ size: resolution.value })}
                  className={cn(
                    'rounded-xl border px-2 py-2.5 text-center transition-colors',
                    active
                      ? 'border-brand bg-brand-soft text-brand-ink'
                      : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-muted',
                  )}
                >
                  <span className="block text-xs font-semibold">{resolution.label}</span>
                  <span className="mt-0.5 block text-[0.625rem] opacity-70">
                    {resolution.value}px
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="qr-quiet-zone"
                className="text-[0.8125rem] font-medium text-ink"
              >
                Quiet zone
              </label>
              <span className="rounded-md bg-surface-muted px-2 py-1 font-mono text-[0.625rem] text-ink-soft">
                {value.marginSize} modules
              </span>
            </div>
            <input
              id="qr-quiet-zone"
              type="range"
              min="2"
              max="8"
              step="1"
              value={value.marginSize}
              onChange={(event) => update({ marginSize: Number(event.target.value) })}
              className="mt-2 w-full"
            />
            <div className="mt-0.5 flex justify-between text-[0.625rem] text-ink-faint">
              <span>2</span>
              <span>4 is the scanning standard</span>
              <span>8</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[0.8125rem] font-medium text-ink">
                Error correction
              </span>
              <span className="rounded-md bg-surface-muted px-2 py-1 font-mono text-[0.625rem] text-ink-soft">
                Level {value.errorCorrection}
              </span>
            </div>
            <div
              className="mt-2 grid grid-cols-4 gap-2"
              role="radiogroup"
              aria-label="Error correction level"
            >
              {QR_ERROR_LEVELS.map((level) => {
                const active = level.value === value.errorCorrection
                const locked = Boolean(value.logo) && level.value !== 'H'
                return (
                  <button
                    key={level.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-disabled={locked}
                    disabled={locked}
                    title={
                      locked
                        ? 'Remove the logo to use a lower error correction level.'
                        : undefined
                    }
                    onClick={() => update({ errorCorrection: level.value })}
                    className={cn(
                      'rounded-lg border px-1 py-2 text-center transition-colors',
                      active
                        ? 'border-brand bg-brand-soft text-brand-ink'
                        : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-muted',
                      locked && 'cursor-not-allowed opacity-40 hover:border-line hover:bg-surface',
                    )}
                  >
                    <span className="block text-xs font-semibold">{level.label}</span>
                    <span className="mt-0.5 block text-[0.5625rem] opacity-70">
                      {level.detail}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-[0.6875rem] leading-5 text-ink-faint">
              {value.logo
                ? 'Level H is required while a logo is attached, so lower levels are locked. H improves error recovery but does not guarantee a scan—test before printing.'
                : 'Level H offers the most error recovery. It becomes required if you add a logo.'}
            </p>
          </div>
        </DesignSection>

        <DesignSection
          title="Logo"
          summary={
            value.logo
              ? `Custom logo · ${value.logoSize}% · ${positionLabel}`
              : 'No logo added'
          }
          icon={ImagePlus}
          open={openSections.logo}
          onToggle={() => toggleSection('logo')}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleLogoFile}
            className="sr-only"
            tabIndex={-1}
          />

          {value.logo ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-soft p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white p-1">
                  <img
                    src={value.logo}
                    alt="Uploaded QR logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink">Custom logo</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-0.5 text-[0.6875rem] font-semibold text-brand-ink transition-opacity hover:opacity-70"
                    disabled={uploading}
                  >
                    Replace image
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => update({ logo: null })}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-danger-soft hover:text-[var(--danger-text)]"
                  aria-label="Remove logo"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="qr-logo-size" className="text-[0.8125rem] font-medium text-ink">
                    Logo size
                  </label>
                  <span className="rounded-md bg-surface-muted px-2 py-1 font-mono text-[0.625rem] text-ink-soft">
                    {value.logoSize}%
                  </span>
                </div>
                <input
                  id="qr-logo-size"
                  type="range"
                  min={MIN_LOGO_SIZE_PERCENT}
                  max={MAX_LOGO_SIZE_PERCENT}
                  step="1"
                  value={value.logoSize}
                  onChange={(event) => update({ logoSize: Number(event.target.value) })}
                  className="mt-2 w-full"
                />
                <p className="mt-1.5 text-[0.6875rem] leading-5 text-ink-faint">
                  Logo size is capped at {MAX_LOGO_SIZE_PERCENT}% of the QR width. Level H
                  is required with a logo, and modules beneath it are cleared
                  automatically. Test a real scan before sharing.
                </p>
              </div>

              <div className="mt-4">
                <p className="text-[0.8125rem] font-medium text-ink">Logo position</p>
                <div
                  className="mt-2 grid grid-cols-5 gap-1.5"
                  role="radiogroup"
                  aria-label="Logo position"
                >
                  {QR_LOGO_POSITIONS.map((position) => {
                    const Icon = LOGO_POSITION_ICONS[position.value] ?? Focus
                    const active = position.value === value.logoPosition
                    return (
                      <button
                        key={position.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={`${position.label} logo position`}
                        title={`${position.label} logo position`}
                        onClick={() => update({ logoPosition: position.value })}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-colors',
                          active
                            ? 'border-brand bg-brand-soft text-brand-ink'
                            : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-muted',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="text-[0.5625rem] font-medium">
                          {position.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="mt-1.5 text-[0.6875rem] leading-5 text-ink-faint">
                  Center is the safest choice. Edge positions are best for short content
                  and a small logo.
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-surface-soft px-4 py-5 text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-ink-faint shadow-[var(--shadow-sm)]">
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="mt-2.5 text-xs font-medium text-ink">Add your mark</p>
              <p className="mx-auto mt-1 max-w-[15rem] text-[0.6875rem] leading-5 text-ink-faint">
                A centred logo works best. PNG, JPG, WEBP or SVG up to 1 MB.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                loading={uploading}
                className="mt-3"
              >
                {!uploading ? <Upload className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                Upload logo
              </Button>
            </div>
          )}
        </DesignSection>
      </div>
    </section>
  )
}

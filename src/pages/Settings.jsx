import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Database,
  Download,
  HardDrive,
  Info,
  LayoutGrid,
  Monitor,
  Moon,
  Palette,
  QrCode,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sun,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import Modal from '../components/ui/Modal'
import QRVisual from '../components/qr/QRVisual'
import { useSettings } from '../hooks/useSettings'
import { DEFAULT_SETTINGS } from '../data/settings'
import { useQRCodes } from '../hooks/useQRCodes'
import {
  getContrastRatio,
  getScannability,
  QR_COLOR_PRESETS,
  QR_RESOLUTIONS,
} from '../utils/qrUtils'
import { byteLength } from '../utils/validation'
import { formatBytes, formatNumber } from '../utils/format'
import { cn } from '../utils/cn'

const THEME_OPTIONS = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright and focused',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow your device',
    icon: Monitor,
  },
]

function CardIntro({ icon: Icon, title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-soft">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-5 text-ink-soft">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function StatTile({ icon: Icon, label, value, tone = 'slate' }) {
  return (
    <div className="rounded-xl border border-line bg-surface-soft p-3">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg tone-${tone}`}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <p className="mt-2 text-base font-semibold tracking-[-0.03em] text-ink">{value}</p>
      <p className="mt-0.5 text-[0.625rem] leading-4 text-ink-faint">{label}</p>
    </div>
  )
}

export default function Settings() {
  const { settings, resolvedTheme, updateSettings, resetSettings } = useSettings()
  const { qrCodes, clearQRCodes } = useQRCodes()
  const [clearOpen, setClearOpen] = useState(false)

  const totalDownloads = qrCodes.reduce(
    (total, qr) => total + (Number(qr.downloads) || 0),
    0,
  )
  const typesUsed = new Set(qrCodes.map((qr) => qr.type)).size
  const storageBytes = useMemo(
    () =>
      byteLength(
        JSON.stringify({
          qrstudioQrCodes: qrCodes,
          qrstudioSettings: settings,
        }),
      ),
    [qrCodes, settings],
  )
  const contrast = getContrastRatio(settings.defaultQrColor, '#FFFFFF')
  const isDefaultPreferences =
    settings.theme === DEFAULT_SETTINGS.theme &&
    settings.defaultQrColor.toUpperCase() ===
      DEFAULT_SETTINGS.defaultQrColor.toUpperCase() &&
    settings.defaultExportSize === DEFAULT_SETTINGS.defaultExportSize

  function handleThemeChange(theme) {
    if (theme === settings.theme) return
    const result = updateSettings({ theme })
    if (!result.ok) {
      toast.error('Appearance was not saved', {
        description: result.message,
      })
    }
  }

  function handleColorChange(color) {
    const scannability = getScannability(color, '#FFFFFF')
    if (!scannability.scannable) {
      toast.error('Choose a darker QR color', {
        description: scannability.reason,
      })
      return
    }
    const result = updateSettings({ defaultQrColor: color })
    if (!result.ok) {
      toast.error('Default color was not saved', {
        description: result.message,
      })
    }
  }

  function handleResetPreferences() {
    if (isDefaultPreferences) return
    const previous = { ...settings }
    const result = resetSettings()
    if (!result.ok) {
      toast.error('Preferences were not reset', {
        description: result.message,
      })
      return
    }
    toast('Preferences reset', {
      description: 'Appearance, default color, and export size are back to standard.',
      action: {
        label: 'Undo',
        onClick: () => {
          const undoResult = updateSettings(previous)
          if (!undoResult.ok) {
            toast.error('Preferences were not restored', {
              description: undoResult.message,
            })
          }
        },
      },
    })
  }

  function handleClearHistory() {
    const count = qrCodes.length
    const result = clearQRCodes()
    if (!result.ok) {
      toast.error('QR history was not cleared', {
        description: result.message,
      })
      return
    }
    setClearOpen(false)
    toast.success('QR history cleared', {
      description: `${count} ${count === 1 ? 'saved code was' : 'saved codes were'} removed from this browser.`,
    })
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings."
        description="Tune how QR Studio looks and behaves. Preferences are stored beside your library, on this device."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleResetPreferences}
            disabled={isDefaultPreferences}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset preferences
          </Button>
        }
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-6">
        <div className="min-w-0 space-y-5 sm:space-y-6">
          <section className="card">
            <CardIntro
              icon={Sun}
              title="Appearance"
              description="Choose how the workspace should look on this device."
            />
            <div className="p-4 sm:p-5">
              <div
                className="grid gap-2 sm:grid-cols-3"
                role="radiogroup"
                aria-label="Color theme"
              >
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const active = settings.theme === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleThemeChange(option.value)}
                      className={cn(
                        'relative flex items-center gap-3 rounded-xl border p-3 text-left transition-colors sm:flex-col sm:items-start sm:gap-2',
                        active
                          ? 'border-brand bg-brand-soft'
                          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          active
                            ? 'bg-surface text-brand'
                            : 'bg-surface-muted text-ink-soft',
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block text-xs font-semibold',
                            active ? 'text-brand-ink' : 'text-ink',
                          )}
                        >
                          {option.label}
                        </span>
                        <span
                          className={cn(
                            'mt-0.5 block text-[0.625rem]',
                            active ? 'text-brand-ink/70' : 'text-ink-faint',
                          )}
                        >
                          {option.description}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                          active
                            ? 'border-brand bg-brand text-white'
                            : 'border-line',
                        )}
                        aria-hidden="true"
                      >
                        {active ? (
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        ) : null}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-[0.6875rem] leading-5 text-ink-faint">
                Currently using{' '}
                <span className="font-medium text-ink-soft">{resolvedTheme}</span>{' '}
                appearance
                {settings.theme === 'system' ? ' based on your device setting' : ''}.
              </p>
            </div>
          </section>

          <section className="card">
            <CardIntro
              icon={Palette}
              title="Default QR color"
              description="New QR codes begin with this foreground color for reliable scanning."
            />
            <div className="p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_9.5rem] lg:items-start">
                <div className="min-w-0">
                  <div
                    className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-4 2xl:grid-cols-8"
                    role="group"
                    aria-label="Default QR color presets"
                  >
                    {QR_COLOR_PRESETS.map((preset) => {
                      const active =
                        preset.fgColor.toLowerCase() ===
                        settings.defaultQrColor.toLowerCase()
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleColorChange(preset.fgColor)}
                          aria-pressed={active}
                          aria-label={`Use ${preset.name} as the default QR color`}
                          title={preset.name}
                          className={cn(
                            'flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors',
                            active
                              ? 'border-brand bg-brand-soft'
                              : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted',
                          )}
                        >
                          <span
                            className="relative flex h-7 w-7 items-center justify-center rounded-full border border-black/10"
                            style={{ backgroundColor: preset.bgColor }}
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full"
                              style={{ backgroundColor: preset.fgColor }}
                            />
                          </span>
                          <span
                            className={cn(
                              'max-w-full truncate text-[0.5625rem] font-medium leading-none',
                              active ? 'text-brand-ink' : 'text-ink-faint',
                            )}
                          >
                            {preset.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface-soft px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[0.6875rem] font-medium text-ink">
                        Custom color
                      </p>
                      <p className="mt-0.5 font-mono text-[0.625rem] uppercase text-ink-faint">
                        {settings.defaultQrColor}
                      </p>
                    </div>
                    <label className="relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-sm)]">
                      <input
                        type="color"
                        value={settings.defaultQrColor}
                        onChange={(event) => handleColorChange(event.target.value)}
                        className="absolute -inset-2 h-[3rem] w-[3rem] cursor-pointer border-0 bg-transparent p-0"
                        aria-label="Choose a custom default QR color"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[0.6875rem] text-ink-faint">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    {contrast.toFixed(1)}:1 contrast on white · scan-ready
                  </div>
                </div>

                <div className="mx-auto w-full max-w-[9.5rem] rounded-2xl border border-line bg-white p-2.5 shadow-[var(--shadow-sm)]">
                  <QRVisual
                    value="https://example.com/qr-studio"
                    customization={{
                      fgColor: settings.defaultQrColor,
                      bgColor: '#FFFFFF',
                      size: 512,
                      marginSize: 4,
                    }}
                    size={512}
                    title="Preview of your default QR color"
                    className="h-auto w-full rounded-md"
                  />
                  <p className="mt-2 text-center text-[0.5625rem] font-medium uppercase tracking-[0.12em] text-slate-400">
                    Color preview
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <CardIntro
              icon={ScanLine}
              title="Default export size"
              description="The starting resolution for every new PNG export."
            />
            <div className="p-4 sm:p-5">
              <div
                className="grid grid-cols-3 gap-2"
                role="radiogroup"
                aria-label="Default export size"
              >
                {QR_RESOLUTIONS.map((resolution) => {
                  const active = settings.defaultExportSize === resolution.value
                  return (
                    <button
                      key={resolution.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() =>
                        updateSettings({ defaultExportSize: resolution.value })
                      }
                      className={cn(
                        'rounded-xl border px-2 py-3 text-center transition-colors',
                        active
                          ? 'border-brand bg-brand-soft text-brand-ink'
                          : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-muted',
                      )}
                    >
                      <span className="block text-xs font-semibold">
                        {resolution.label}
                      </span>
                      <span className="mt-1 block text-[0.625rem] opacity-70">
                        {resolution.detail}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-[0.6875rem] leading-5 text-ink-faint">
                You can still change the resolution for each individual QR code in
                the generator.
              </p>
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-soft">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[0.8125rem] font-semibold text-ink">
                    Start fresh
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] leading-5 text-ink-soft">
                    Restore appearance, default color, and export size. Your QR
                    library is not affected.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleResetPreferences}
                disabled={isDefaultPreferences}
                className="shrink-0 self-start sm:self-auto"
              >
                Reset preferences
              </Button>
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-5 sm:space-y-6">
          <section className="card">
            <CardIntro
              icon={Database}
              title="Your data"
              description="A snapshot of the library stored in this browser."
            />
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-2">
                <StatTile
                  icon={QrCode}
                  label="Saved QR codes"
                  value={formatNumber(qrCodes.length)}
                  tone="indigo"
                />
                <StatTile
                  icon={Download}
                  label="Total downloads"
                  value={formatNumber(totalDownloads)}
                  tone="emerald"
                />
                <StatTile
                  icon={LayoutGrid}
                  label="Types in use"
                  value={formatNumber(typesUsed)}
                  tone="violet"
                />
                <StatTile
                  icon={HardDrive}
                  label="Local data size"
                  value={formatBytes(storageBytes)}
                  tone="slate"
                />
              </div>

              <Link
                to="/my-qr-codes"
                className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-line bg-surface-soft px-3 py-2.5 text-xs font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
              >
                Manage your library
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>

              <div className="mt-4 border-t border-line pt-4">
                <div className="flex items-start gap-2">
                  <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger-text)]" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink">Clear QR history</p>
                    <p className="mt-0.5 text-[0.6875rem] leading-5 text-ink-soft">
                      Permanently remove every saved QR code and its download count
                      from this browser.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="danger-ghost"
                  size="sm"
                  onClick={() => setClearOpen(true)}
                  disabled={qrCodes.length === 0}
                  className="mt-3 w-full"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {qrCodes.length === 0 ? 'No saved data to clear' : 'Clear QR history'}
                </Button>
              </div>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-line bg-surface-soft px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-soft text-[var(--success-text)]">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <h2 className="text-[0.8125rem] font-semibold text-ink">
                  Local-first by design
                </h2>
              </div>
            </div>
            <div className="space-y-3 px-4 py-4 text-[0.6875rem] leading-5 text-ink-soft sm:px-5">
              <p>
                QR Studio has no account, server, or cloud sync. Your saved codes,
                preferences, and download counts live in this browser&apos;s local
                storage.
              </p>
              <div className="flex items-start gap-2 rounded-lg border border-line bg-surface-soft px-2.5 py-2">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
                <span>
                  Clearing your browser data or using private browsing may remove
                  your library. Export important QR codes as PNG or SVG.
                </span>
              </div>
              <dl className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-faint">App version</dt>
                  <dd className="font-medium text-ink-soft">1.0.0</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-faint">Storage</dt>
                  <dd className="font-medium text-ink-soft">Browser localStorage</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-faint">Exports</dt>
                  <dd className="font-medium text-ink-soft">On-device PNG &amp; SVG</dd>
                </div>
              </dl>
              <Link
                to="/generator"
                className={buttonStyles({
                  variant: 'soft',
                  size: 'sm',
                  className: 'w-full',
                })}
              >
                Create a QR code
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </aside>
      </div>

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear your QR history?"
        description="This removes every saved QR code and its download count from this browser."
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setClearOpen(false)}
            >
              Keep my codes
            </Button>
            <Button type="button" variant="danger" onClick={handleClearHistory}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear everything
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-line bg-surface-soft p-3">
          <p className="text-sm font-semibold text-ink">
            {formatNumber(qrCodes.length)}{' '}
            {qrCodes.length === 1 ? 'saved QR code' : 'saved QR codes'}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {formatNumber(totalDownloads)}{' '}
            {totalDownloads === 1 ? 'download' : 'downloads'} tracked on this device
          </p>
        </div>
        <p className="mt-3 text-xs leading-5 text-ink-faint">
          This action cannot be undone. Export any codes you want to keep before
          continuing.
        </p>
      </Modal>
    </div>
  )
}

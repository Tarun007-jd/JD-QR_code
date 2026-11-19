import { useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  CircleAlert,
  CircleCheck,
  Clock3,
  FolderOpen,
  Plus,
  Save,
  Sparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import Input from '../components/ui/Input'
import QRTypeSelector from '../components/qr/QRTypeSelector'
import QRContentForm from '../components/qr/QRContentForm'
import QRCustomization from '../components/qr/QRCustomization'
import QRPreview from '../components/qr/QRPreview'
import QRDownload from '../components/qr/QRDownload'
import { useQRCodes } from '../hooks/useQRCodes'
import { useSettings } from '../hooks/useSettings'
import useQRGenerator from '../hooks/useQRGenerator'
import { getQRType, isValidQRType, QR_TYPES } from '../data/qrTypes'
import { getTemplateById } from '../data/templates'
import {
  DEFAULT_CUSTOMIZATION,
  getQRSafety,
  mergeCustomization,
} from '../utils/qrUtils'
import {
  downloadQRCodeAsPng,
  downloadQRCodeAsSvg,
} from '../utils/qrExport'
import { formatRelativeDate } from '../utils/format'

export default function Generator() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { qrCodes, addQRCode, updateQRCode, incrementDownloads } = useQRCodes()
  const { settings } = useSettings()

  const existing = id ? qrCodes.find((qr) => qr.id === id) ?? null : null
  const templateId = searchParams.get('template')
  const template = getTemplateById(templateId)
  const typeParam = searchParams.get('type')
  const seedType =
    existing?.type ?? template?.type ?? (isValidQRType(typeParam) ? typeParam : 'url')

  const baseCustomization = {
    ...DEFAULT_CUSTOMIZATION,
    fgColor: settings.defaultQrColor,
    size: settings.defaultExportSize,
  }

  const {
    type,
    fields,
    setFields,
    name,
    customization,
    setCustomization,
    setName,
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
  } = useQRGenerator({
    initialType: seedType,
    initialFields: existing?.fields ?? template?.fields,
    initialName: existing?.name || template?.name || '',
    initialCustomization: mergeCustomization({
      ...baseCustomization,
      ...(template?.customization || {}),
      ...(existing?.customization || {}),
    }),
    defaults: baseCustomization,
  })

  const [busyFormat, setBusyFormat] = useState(null)
  const [saving, setSaving] = useState(false)
  const [templateBannerOpen, setTemplateBannerOpen] = useState(
    Boolean(template && !existing),
  )
  const svgRef = useRef(null)
  const saveLockRef = useRef(false)

  const typeMeta = getQRType(type)
  const TypeIcon = typeMeta.icon
  const isEditing = Boolean(existing)

  function handleTypeChange(nextType) {
    changeType(nextType)
  }

  function handleCustomizationChange(patch) {
    setCustomization(patch)
  }

  function resetCustomization() {
    const previous = customization
    setCustomization(mergeCustomization(baseCustomization))
    toast('Customization reset', {
      description: 'Your content and name are untouched.',
      action: {
        label: 'Undo',
        onClick: () => setCustomization(previous),
      },
    })
  }

  function handleSave() {
    if (saveLockRef.current) return
    setShowErrors(true)

    if (Object.keys(errors).length > 0 || !payload) {
      toast.error('Your QR code is not ready yet', {
        description:
          errors._form ||
          'Complete the highlighted fields, then try again.',
      })
      return
    }

    if (!isScannable) {
      toast.error('Increase the contrast to save', {
        description: scannability.reason,
      })
      return
    }

    const safety = getQRSafety(customization)
    if (!safety.safe) {
      toast.error('Make the logo setup safe before saving', {
        description: safety.reason,
      })
      return
    }

    const record = {
      name: displayName,
      type,
      fields,
      content: payload,
      customization,
    }

    saveLockRef.current = true
    setSaving(true)
    let created = false

    try {
      if (existing) {
        const result = updateQRCode(existing.id, record)
        if (!result.ok) {
          toast.error('Changes were not saved', {
            description: result.message,
          })
          return
        }
        if (result.unchanged) {
          toast('No changes to save', {
            description: 'This QR code is already up to date.',
          })
          return
        }
        toast.success('QR code updated', {
          description: 'Saved in this browser.',
        })
        return
      }

      const result = addQRCode(record)
      if (!result.ok) {
        toast.error('QR code was not saved', {
          description: result.message,
        })
        return
      }

      created = true
      setTemplateBannerOpen(false)
      toast.success('QR code saved', {
        description: 'You can find it anytime in My QR Codes.',
      })
      navigate(`/generator/${result.record.id}`, { replace: true })
    } finally {
      // Keep the lock closed after a successful creation until the route
      // change unmounts this form, so a double-click cannot save twice.
      if (!created) saveLockRef.current = false
      setSaving(false)
    }
  }

  async function handleDownload(format) {
    setShowErrors(true)

    if (!payload) {
      toast.error('Add content before downloading', {
        description: 'Complete the QR fields to generate a downloadable code.',
      })
      return
    }

    if (!isScannable) {
      toast.error('This QR needs more contrast', {
        description: scannability.reason,
      })
      return
    }

    const safety = getQRSafety(customization)
    if (!safety.safe) {
      toast.error('Make the logo setup safe before downloading', {
        description: safety.reason,
      })
      return
    }

    if (!svgRef.current) {
      toast.error('The QR preview is not ready yet. Try again in a moment.')
      return
    }

    setBusyFormat(format)

    try {
      if (format === 'svg') {
        downloadQRCodeAsSvg(svgRef.current, displayName, {
          customization,
        })
      } else {
        await downloadQRCodeAsPng(svgRef.current, displayName, {
          size: customization.size,
          backgroundColor: customization.bgColor,
          transparent: customization.transparent,
          customization,
        })
      }

      const downloadResult = existing ? incrementDownloads(existing.id) : null

      toast.success(`${format.toUpperCase()} downloaded`, {
        description: `${displayName} · ${
          format === 'svg'
            ? 'vector'
            : `${customization.size}px${customization.transparent ? ' transparent' : ''}`
        }`,
      })

      if (downloadResult && !downloadResult.ok) {
        toast.warning('Download count was not saved', {
          description: downloadResult.message,
        })
      }
    } catch (error) {
      toast.error('Download failed', {
        description: error?.message || 'Please try again.',
      })
    } finally {
      setBusyFormat(null)
    }
  }

  const status = !payload
    ? {
        label: 'Waiting for content',
        dotClass: 'bg-ink-faint',
      }
    : !isScannable
      ? {
          label: 'Contrast needs attention',
          dotClass: 'bg-warning',
        }
      : {
          label: 'Scan ready',
          dotClass: 'bg-success',
        }

  function handleStartBlank() {
    setTemplateBannerOpen(false)
    reset({
      type: template?.type || 'url',
      customization: baseCustomization,
    })
    toast('Template removed', {
      description: 'You are starting from a blank design.',
    })
  }

  if (id && !existing) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
          <TypeIcon className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-ink">
          That QR code isn’t here.
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">
          It may have been deleted, or this link is no longer valid. The rest of your
          workspace is right where you left it.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/my-qr-codes" className={buttonStyles({ size: 'md' })}>
            <FolderOpen className="h-4 w-4" aria-hidden="true" />
            Back to My QR Codes
          </Link>
          <Link
            to="/generator"
            className={buttonStyles({ variant: 'secondary', size: 'md' })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create a new QR
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={isEditing ? 'Editing saved code' : 'QR generator'}
        title={isEditing ? 'Refine your QR code.' : 'Create a QR code.'}
        description={
          isEditing
            ? 'Update the content or design, then save your changes. Downloads are tracked on this device.'
            : 'Pick a format, add your content, and shape the design. Your QR updates live as you type.'
        }
        actions={
          <>
            <Link
              to="/my-qr-codes"
              className={buttonStyles({ variant: 'secondary', size: 'md' })}
            >
              <FolderOpen className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">My QR codes</span>
              <span className="sm:hidden">Library</span>
            </Link>
            <Link
              to={isEditing ? '/generator' : '/templates'}
              className={buttonStyles({ variant: 'ghost', size: 'md' })}
            >
              {isEditing ? (
                <Plus className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              )}
              {isEditing ? 'New QR' : 'Templates'}
            </Link>
          </>
        }
      />

      {template && !existing && templateBannerOpen ? (
        <div className="callout callout-info items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink">
                Starting with “{template.name}”
              </p>
              <p className="mt-0.5 text-[0.6875rem] leading-5">
                Sample content and colors are pre-filled. Everything is editable before
                you save.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleStartBlank}
              className="rounded-md px-2 py-1 text-[0.6875rem] font-semibold text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
            >
              Start blank
            </button>
            <button
              type="button"
              onClick={() => setTemplateBannerOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
              aria-label="Dismiss template notice"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="card order-1 min-w-0 xl:col-start-1 xl:row-start-1">
          <div className="flex items-start gap-3 border-b border-line px-4 py-4 sm:px-5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-[0.6875rem] font-semibold text-ink-soft">
              01
            </span>
            <div className="min-w-0">
              <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
                Choose a QR type
              </h2>
              <p className="mt-0.5 text-xs leading-5 text-ink-soft">
                {QR_TYPES.length} formats for everyday moments.
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <QRTypeSelector value={type} onChange={handleTypeChange} />
          </div>
        </section>

        <aside className="order-2 mx-auto w-full min-w-0 max-w-[540px] xl:sticky xl:top-24 xl:col-start-2 xl:row-span-3 xl:row-start-1 xl:mx-0 xl:max-w-none xl:self-start">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                <h2 className="text-[0.8125rem] font-semibold text-ink">Live preview</h2>
              </div>
              <span className="rounded-full border border-line bg-surface-soft px-2 py-1 text-[0.625rem] font-medium text-ink-soft">
                {status.label}
              </span>
            </div>

            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <div className="rounded-2xl border border-line bg-surface-muted/60 p-3 sm:p-4">
                <div className="mx-auto w-full max-w-[260px]">
                  <QRPreview
                    payload={payload}
                    customization={customization}
                    svgRef={svgRef}
                    title={displayName}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.625rem] font-semibold tone-${typeMeta.tone}`}
                >
                  <TypeIcon className="h-3 w-3" aria-hidden="true" />
                  {typeMeta.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-soft px-2.5 py-1 text-[0.625rem] font-medium text-ink-faint">
                  Error correction {customization.errorCorrection}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-soft px-2.5 py-1 text-[0.625rem] font-medium text-ink-faint">
                  {customization.size}px
                </span>
              </div>

              {payload && !isScannable ? (
                <div className="callout callout-warning mt-4" role="alert">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{scannability.reason}</span>
                </div>
              ) : null}

              <div className="mt-4">
                <Input
                  label="QR code name"
                  optional
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={autoName}
                  maxLength={60}
                />
              </div>

              <Button
                type="button"
                size="lg"
                className="mt-3 w-full"
                onClick={handleSave}
                loading={saving}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {isEditing ? 'Save changes' : 'Save QR code'}
              </Button>

              <div className="mt-2">
                <QRDownload
                  onDownload={handleDownload}
                  disabled={!isReady}
                  busyFormat={busyFormat}
                  size={customization.size}
                  onSizeChange={(size) => setCustomization({ size })}
                  transparent={customization.transparent}
                  onTransparentChange={(transparent) =>
                    setCustomization({ transparent })
                  }
                />
              </div>

              {isReady ? (
                <div className="mt-3 flex items-start justify-center gap-1.5 text-center text-[0.625rem] leading-4 text-ink-faint">
                  <CircleCheck
                    className="mt-0.5 h-3 w-3 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  Contrast and content checks passed.
                </div>
              ) : (
                <p className="mt-3 text-center text-[0.625rem] leading-4 text-ink-faint">
                  Add the required content and check your colors to enable downloads.
                </p>
              )}

              {existing ? (
                <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-line pt-3 text-[0.625rem] text-ink-faint">
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                  Saved locally · updated {formatRelativeDate(existing.updatedAt)}
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <section
          id="qr-content"
          className="card order-3 min-w-0 xl:col-start-1 xl:row-start-2"
        >
          <div className="flex items-start gap-3 border-b border-line px-4 py-4 sm:px-5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-[0.6875rem] font-semibold text-ink-soft">
              02
            </span>
            <div className="min-w-0">
              <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
                Add your content
              </h2>
              <p className="mt-0.5 text-xs leading-5 text-ink-soft">
                Only the essentials. Everything is encoded locally.
              </p>
            </div>
          </div>
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <QRContentForm
              key={type}
              type={type}
              fields={fields}
              errors={errors}
              showErrors={showErrors}
              onChange={setFields}
            />
          </div>
        </section>

        <div className="order-4 min-w-0 xl:col-start-1 xl:row-start-3">
          <QRCustomization
            value={customization}
            onChange={handleCustomizationChange}
            onReset={resetCustomization}
          />
        </div>
      </div>
    </div>
  )
}

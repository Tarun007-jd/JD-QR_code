import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Download,
  FileCode2,
  FileImage,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import QRVisual from './QRVisual'
import { getQRType } from '../../data/qrTypes'
import { useQRCodes } from '../../hooks/useQRCodes'
import {
  buildQRPayload,
  getQRContentSummary,
  getQRSafety,
  mergeCustomization,
} from '../../utils/qrUtils'
import { formatDate } from '../../utils/format'
import {
  downloadQRCodeAsPng,
  downloadQRCodeAsSvg,
} from '../../utils/qrExport'
import { cn } from '../../utils/cn'

function TinyAction({ label, onClick, disabled = false, children }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="text-ink-faint hover:text-ink"
    >
      {children}
    </Button>
  )
}

export default function QRCard({ qr, view = 'grid' }) {
  const navigate = useNavigate()
  const { renameQRCode, deleteQRCode, incrementDownloads } = useQRCodes()
  const svgRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [draftName, setDraftName] = useState(qr.name)
  const [nameError, setNameError] = useState('')
  const [busyFormat, setBusyFormat] = useState(null)

  const type = getQRType(qr.type)
  const TypeIcon = type.icon
  const design = mergeCustomization(qr.customization)
  const payload = buildQRPayload(qr.type, qr.fields)
  const summary = getQRContentSummary(qr.type, qr.fields)

  useEffect(() => {
    if (!menuOpen) return undefined
    function closeOnEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  function openRename() {
    setDraftName(qr.name)
    setNameError('')
    setMenuOpen(false)
    setRenameOpen(true)
  }

  function submitRename(event) {
    event.preventDefault()
    const cleanName = draftName.trim()
    if (!cleanName) {
      setNameError('Give your QR code a name.')
      return
    }
    if (cleanName.length > 60) {
      setNameError('Keep the name under 60 characters.')
      return
    }
    const result = renameQRCode(qr.id, cleanName)
    if (!result.ok) {
      setNameError(result.message)
      toast.error('Name was not saved', {
        description: result.message,
      })
      return
    }
    setRenameOpen(false)
    if (!result.unchanged) {
      toast.success('QR code renamed')
    }
  }

  function confirmDelete() {
    const result = deleteQRCode(qr.id)
    if (!result.ok) {
      toast.error('QR code was not deleted', {
        description: result.message,
      })
      return
    }
    setDeleteOpen(false)
    toast.success('QR code deleted', {
      description: `${qr.name} was removed from this browser.`,
    })
  }

  async function handleDownload(format = 'png') {
    const safety = getQRSafety(design)
    if (!safety.safe) {
      toast.error('This saved design needs attention', {
        description: safety.reason,
      })
      return
    }

    if (!svgRef.current || !payload) {
      toast.error('This QR code could not be prepared for download.')
      return
    }

    setMenuOpen(false)
    setBusyFormat(format)

    try {
      if (format === 'svg') {
        downloadQRCodeAsSvg(svgRef.current, qr.name, {
          customization: design,
        })
      } else {
        await downloadQRCodeAsPng(svgRef.current, qr.name, {
          size: design.size,
          backgroundColor: design.bgColor,
          transparent: design.transparent,
          customization: design,
        })
      }
      const downloadResult = incrementDownloads(qr.id)
      toast.success(`${format.toUpperCase()} downloaded`, {
        description: qr.name,
      })
      if (!downloadResult.ok) {
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

  function goToEditor() {
    setMenuOpen(false)
    navigate(`/generator/${qr.id}`)
  }

  const menu = menuOpen ? (
    <>
      <div
        className="fixed inset-0 z-[45]"
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />
      <div
        role="menu"
        aria-label={`Actions for ${qr.name}`}
        className="animate-slide-in absolute right-3 top-12 z-[46] w-48 rounded-xl border border-line bg-surface p-1.5 shadow-[var(--shadow-float)]"
      >
        <button
          type="button"
          role="menuitem"
          onClick={openRename}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Rename
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => handleDownload('png')}
          disabled={Boolean(busyFormat)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-50"
        >
          <FileImage className="h-3.5 w-3.5" aria-hidden="true" />
          Download PNG
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => handleDownload('svg')}
          disabled={Boolean(busyFormat)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-50"
        >
          <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
          Download SVG
        </button>
        <div className="my-1 border-t border-line" />
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            setMenuOpen(false)
            setDeleteOpen(true)
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-[var(--danger-text)] transition-colors hover:bg-danger-soft"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </button>
      </div>
    </>
  ) : null

  const menuButton = (
    <button
      type="button"
      onClick={() => setMenuOpen((current) => !current)}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
      aria-label={`More actions for ${qr.name}`}
      aria-haspopup="menu"
      aria-expanded={menuOpen}
    >
      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
    </button>
  )

  const modals = (
    <>
      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename QR code"
        description="Choose a name that is easy to find later."
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form={`rename-${qr.id}`}>
              Save name
            </Button>
          </>
        }
      >
        <form
          id={`rename-${qr.id}`}
          onSubmit={submitRename}
          className="space-y-4"
        >
          <Input
            label="QR code name"
            value={draftName}
            onChange={(event) => {
              setDraftName(event.target.value)
              if (nameError) setNameError('')
            }}
            error={nameError}
            maxLength={60}
            placeholder="e.g. Studio guest Wi-Fi"
            data-autofocus
          />
          <p className="text-xs leading-5 text-ink-faint">
            The name is only used in your workspace. It does not change the QR content.
          </p>
        </form>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this QR code?"
        description="This removes the saved code and its download count from this browser."
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
            >
              Keep it
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete QR code
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-line bg-surface-soft p-3">
          <p className="truncate text-sm font-semibold text-ink">{qr.name}</p>
          <p className="mt-1 text-xs text-ink-soft">
            {type.label} · Saved {formatDate(qr.createdAt)}
          </p>
        </div>
        <p className="mt-3 text-xs leading-5 text-ink-faint">
          This action cannot be undone.
        </p>
      </Modal>
    </>
  )

  if (view === 'list') {
    return (
      <>
        <article className="card relative flex items-center gap-3 p-3 transition-colors hover:border-line-strong sm:p-3.5">
          <Link
            to={`/generator/${qr.id}`}
            aria-label={`Edit ${qr.name}`}
            className={cn(
              'block w-[3.75rem] shrink-0 rounded-lg border border-line p-1 transition-transform hover:scale-[1.02] sm:w-[4.25rem]',
              design.transparent && 'checkerboard',
            )}
            style={design.transparent ? undefined : { backgroundColor: design.bgColor }}
          >
            {payload ? (
              <QRVisual
                ref={svgRef}
                value={payload}
                customization={design}
                size={minSize(design.size)}
                title={`${qr.name} QR code`}
                className="h-auto w-full"
              />
            ) : (
              <span className="flex aspect-square items-center justify-center text-[0.625rem] text-ink-soft">
                Preview unavailable
              </span>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/generator/${qr.id}`}
                className="truncate text-[0.8125rem] font-semibold text-ink transition-colors hover:text-brand-ink"
              >
                {qr.name}
              </Link>
              <span
                className={`hidden shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.5625rem] font-semibold sm:inline-flex tone-${type.tone}`}
              >
                <TypeIcon className="h-2.5 w-2.5" aria-hidden="true" />
                {type.label}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-ink-soft">{summary}</p>
            <p className="mt-1 text-[0.625rem] text-ink-faint">
              {formatDate(qr.createdAt)} · {qr.downloads} downloads
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <TinyAction label={`Edit ${qr.name}`} onClick={goToEditor}>
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </TinyAction>
            <TinyAction
              label={`Download ${qr.name} as PNG`}
              onClick={() => handleDownload('png')}
              disabled={Boolean(busyFormat)}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
            </TinyAction>
            {menuButton}
          </div>

          {menu}
        </article>
        {modals}
      </>
    )
  }

  return (
    <>
      <article className="group card relative flex flex-col transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-[var(--shadow-float)]">
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg tone-${type.tone}`}
              >
                <TypeIcon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <Link
                  to={`/generator/${qr.id}`}
                  className="block truncate text-[0.8125rem] font-semibold text-ink transition-colors hover:text-brand-ink"
                >
                  {qr.name}
                </Link>
                <p className="mt-0.5 text-[0.625rem] font-medium text-ink-faint">
                  {type.label} · {formatDate(qr.createdAt)}
                </p>
              </div>
            </div>
            {menuButton}
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-surface-soft p-3">
            <Link
              to={`/generator/${qr.id}`}
              aria-label={`Edit ${qr.name}`}
              className={cn(
                'block w-[5.5rem] shrink-0 rounded-lg border border-line p-1 transition-transform group-hover:scale-[1.015]',
                design.transparent && 'checkerboard',
              )}
              style={design.transparent ? undefined : { backgroundColor: design.bgColor }}
            >
              {payload ? (
                <QRVisual
                  ref={svgRef}
                  value={payload}
                  customization={design}
                  size={minSize(design.size)}
                  title={`${qr.name} QR code`}
                  className="h-auto w-full"
                />
              ) : (
                <span className="flex aspect-square items-center justify-center text-[0.625rem] text-ink-soft">
                  Preview unavailable
                </span>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-3 text-xs leading-5 text-ink-soft">{summary}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-surface px-2 py-1 text-[0.625rem] font-medium text-ink-faint shadow-[var(--shadow-sm)]">
                <Download className="h-2.5 w-2.5" aria-hidden="true" />
                {qr.downloads} {qr.downloads === 1 ? 'download' : 'downloads'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line px-3.5 py-2.5">
          <span className="inline-flex items-center gap-1.5 text-[0.625rem] text-ink-faint">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                payload ? 'bg-success' : 'bg-ink-faint',
              )}
            />
            {payload ? 'Ready to scan' : 'Needs attention'}
          </span>
          <div className="flex items-center gap-0.5">
            <TinyAction label={`Edit ${qr.name}`} onClick={goToEditor}>
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </TinyAction>
            <TinyAction
              label={`Download ${qr.name} as PNG`}
              onClick={() => handleDownload('png')}
              disabled={Boolean(busyFormat)}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
            </TinyAction>
          </div>
        </div>

        {menu}
      </article>
      {modals}
    </>
  )
}

function minSize(size) {
  return Math.min(Number(size) || 1024, 1024)
}

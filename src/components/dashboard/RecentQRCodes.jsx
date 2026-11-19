import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FolderOpen, Plus, Search, SearchX, X } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import QRVisual from '../qr/QRVisual'
import { getQRType } from '../../data/qrTypes'
import {
  buildQRPayload,
  getQRContentSummary,
  getQRSearchText,
  mergeCustomization,
} from '../../utils/qrUtils'
import { formatRelativeDate } from '../../utils/format'
import { buttonStyles } from '../ui/buttonStyles'

export default function RecentQRCodes({ qrCodes }) {
  const [query, setQuery] = useState('')

  const sorted = [...qrCodes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
  const normalizedQuery = query.trim().toLowerCase()
  const results = normalizedQuery
    ? sorted.filter((qr) => getQRSearchText(qr).includes(normalizedQuery)).slice(0, 6)
    : sorted.slice(0, 5)

  return (
    <section className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <div className="min-w-0">
          <h2 className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-ink">
            Recent QR codes
          </h2>
          <p className="mt-1 text-xs leading-5 text-ink-soft">
            Pick up where you left off.
          </p>
        </div>
        {qrCodes.length > 0 ? (
          <Link
            to="/my-qr-codes"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[0.6875rem] font-semibold text-brand-ink transition-colors hover:bg-brand-soft"
          >
            View all
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {qrCodes.length > 0 ? (
        <div className="px-4 pb-4 sm:px-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your QR codes…"
              className="control h-9 pl-8 pr-8 text-xs"
              aria-label="Search your QR codes"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-faint hover:bg-surface-muted hover:text-ink"
                aria-label="Clear QR search"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {qrCodes.length === 0 ? (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <EmptyState
            compact
            icon={FolderOpen}
            title="Your library is ready"
            description="Create your first QR code and it will appear here, ready to edit or download."
            action={
              <Link
                to="/generator"
                className={buttonStyles({ size: 'sm', className: 'rounded-[0.625rem]' })}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Create QR code
              </Link>
            }
            secondaryAction={
              <Link
                to="/templates"
                className={buttonStyles({
                  variant: 'ghost',
                  size: 'sm',
                  className: 'rounded-[0.625rem]',
                })}
              >
                Browse templates
              </Link>
            }
          />
        </div>
      ) : results.length > 0 ? (
        <div className="divide-y divide-line border-t border-line">
          {results.map((qr) => {
            const type = getQRType(qr.type)
            const TypeIcon = type.icon
            const payload = buildQRPayload(qr.type, qr.fields)
            const design = mergeCustomization(qr.customization)

            return (
              <Link
                key={qr.id}
                to={`/generator/${qr.id}`}
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-soft sm:px-5"
              >
                <div
                  className={`w-10 shrink-0 rounded-md border border-line p-1 ${
                    design.transparent ? 'checkerboard' : ''
                  }`}
                  style={
                    design.transparent
                      ? undefined
                      : { backgroundColor: design.bgColor }
                  }
                >
                  {payload ? (
                    <QRVisual
                      value={payload}
                      customization={design}
                      size={160}
                      title={`${qr.name} QR code`}
                      className="h-auto w-full"
                    />
                  ) : (
                    <span className="flex aspect-square items-center justify-center bg-surface-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[0.8125rem] font-medium text-ink">
                      {qr.name}
                    </p>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-[0.6875rem] text-ink-faint">
                    <TypeIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {type.label} · {getQRContentSummary(qr.type, qr.fields)}
                    </span>
                  </p>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-0.5 text-[0.625rem] text-ink-faint sm:flex">
                  <span>{formatRelativeDate(qr.updatedAt)}</span>
                  <span>
                    {qr.downloads} {qr.downloads === 1 ? 'download' : 'downloads'}
                  </span>
                </div>
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="border-t border-line px-5 py-8 text-center">
          <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted text-ink-faint">
            <SearchX className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="mt-2.5 text-sm font-medium text-ink">No matching QR codes</p>
          <p className="mt-1 text-xs text-ink-soft">Try a different name or type.</p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-3 text-xs font-semibold text-brand-ink hover:opacity-70"
          >
            Clear search
          </button>
        </div>
      )}
    </section>
  )
}

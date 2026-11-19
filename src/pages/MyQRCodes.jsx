import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FolderOpen,
  LayoutGrid,
  List,
  Plus,
  Search,
  SearchX,
  Sparkles,
  X,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import EmptyState from '../components/ui/EmptyState'
import QRCard from '../components/qr/QRCard'
import { useQRCodes } from '../hooks/useQRCodes'
import { QR_TYPES } from '../data/qrTypes'
import { getQRSearchText } from '../utils/qrUtils'
import { formatNumber } from '../utils/format'
import { cn } from '../utils/cn'

const SORT_OPTIONS = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'created', label: 'Newest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'downloads', label: 'Most downloaded' },
]

const VIEW_OPTIONS = [
  { value: 'grid', label: 'Grid view', icon: LayoutGrid },
  { value: 'list', label: 'List view', icon: List },
]

const SORT_VALUES = new Set(SORT_OPTIONS.map((option) => option.value))
const TYPE_VALUES = new Set(QR_TYPES.map((type) => type.id))

export default function MyQRCodes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { qrCodes } = useQRCodes()

  const query = searchParams.get('q') ?? ''
  const typeParam = searchParams.get('type')
  const sortParam = searchParams.get('sort')
  const viewParam = searchParams.get('view')
  const typeFilter = TYPE_VALUES.has(typeParam) ? typeParam : 'all'
  const sort = SORT_VALUES.has(sortParam) ? sortParam : 'updated'
  const view = viewParam === 'list' ? 'list' : 'grid'
  const hasCodes = qrCodes.length > 0

  const counts = useMemo(() => {
    const next = { all: qrCodes.length }
    for (const qr of qrCodes) {
      next[qr.type] = (next[qr.type] || 0) + 1
    }
    return next
  }, [qrCodes])

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = qrCodes.filter((qr) => {
      const matchesType = typeFilter === 'all' || qr.type === typeFilter
      if (!matchesType) return false
      if (!normalizedQuery) return true
      return getQRSearchText(qr).includes(normalizedQuery)
    })

    return [...filtered].sort((first, second) => {
      if (sort === 'name') {
        return first.name.localeCompare(second.name, undefined, {
          sensitivity: 'base',
          numeric: true,
        })
      }
      if (sort === 'downloads') {
        return (Number(second.downloads) || 0) - (Number(first.downloads) || 0)
      }
      if (sort === 'created') {
        return (
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
        )
      }
      return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
    })
  }, [qrCodes, query, sort, typeFilter])

  const hasFilters = Boolean(query.trim()) || typeFilter !== 'all'
  const totalDownloads = qrCodes.reduce(
    (total, qr) => total + (Number(qr.downloads) || 0),
    0,
  )

  function updateParam(key, value, defaultValue = '') {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (!value || value === defaultValue) {
          next.delete(key)
        } else {
          next.set(key, value)
        }
        return next
      },
      { replace: true },
    )
  }

  function clearFilters() {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('q')
        next.delete('type')
        next.delete('sort')
        return next
      },
      { replace: true },
    )
  }

  const header = (
    <PageHeader
      eyebrow="Your library"
      title="My QR codes."
      description="Everything you save stays in this browser. Search, refine, and export your collection whenever you need it."
      actions={
        <>
          <Link
            to="/generator"
            className={buttonStyles({
              size: 'md',
              className: 'hidden sm:inline-flex',
            })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create QR code
          </Link>
          <Link
            to="/templates"
            className={buttonStyles({ variant: 'secondary', size: 'md' })}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Templates
          </Link>
        </>
      }
    />
  )

  if (!hasCodes) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon={FolderOpen}
          title="Your QR library is empty"
          description="Create a QR code or start from a template. Saved codes appear here with their content, design, and download history."
          action={
            <Link to="/generator" className={buttonStyles({ size: 'md' })}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create your first QR
            </Link>
          }
          secondaryAction={
            <Link
              to="/templates"
              className={buttonStyles({ variant: 'secondary', size: 'md' })}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Browse templates
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {header}

      <section className="card p-3 sm:p-4" aria-label="Filter your QR codes">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => updateParam('q', event.target.value)}
              placeholder="Search QR codes…"
              className="control h-9 pl-8 pr-8 text-xs"
              aria-label="Search saved QR codes"
            />
            {query ? (
              <button
                type="button"
                onClick={() => updateParam('q', '')}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:flex sm:items-center">
            <div className="relative min-w-0">
              <label htmlFor="qr-type-filter" className="sr-only">
                Filter by QR type
              </label>
              <select
                id="qr-type-filter"
                value={typeFilter}
                onChange={(event) =>
                  updateParam('type', event.target.value, 'all')
                }
                className="control h-9 w-full appearance-none py-0 pr-8 text-xs sm:w-[9.75rem]"
              >
                <option value="all">All types ({counts.all})</option>
                {QR_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label} ({counts[type.id] || 0})
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-faint"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m3 4.5 3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="relative min-w-0">
              <label htmlFor="qr-sort" className="sr-only">
                Sort QR codes
              </label>
              <select
                id="qr-sort"
                value={sort}
                onChange={(event) =>
                  updateParam('sort', event.target.value, 'updated')
                }
                className="control h-9 w-full appearance-none py-0 pr-8 text-xs sm:w-[10.5rem]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-faint"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m3 4.5 3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div
              className="col-span-full flex h-9 items-center justify-self-end rounded-xl border border-line bg-surface p-0.5 sm:col-span-1"
              role="group"
              aria-label="Collection layout"
            >
              {VIEW_OPTIONS.map((option) => {
                const Icon = option.icon
                const active = view === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateParam('view', option.value, 'grid')}
                    aria-pressed={active}
                    aria-label={option.label}
                    title={option.label}
                    className={cn(
                      'flex h-[1.7rem] w-8 items-center justify-center rounded-[0.45rem] transition-colors',
                      active
                        ? 'bg-brand-soft text-brand-ink'
                        : 'text-ink-faint hover:bg-surface-muted hover:text-ink',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-[0.6875rem] text-ink-faint" aria-live="polite">
            <span className="font-medium text-ink-soft">
              {formatNumber(results.length)}
            </span>{' '}
            {results.length === 1 ? 'QR code' : 'QR codes'}
            {hasFilters ? ` of ${formatNumber(qrCodes.length)} shown` : ' in your library'}
            <span className="hidden sm:inline">
              {' '}
              · {formatNumber(totalDownloads)}{' '}
              {totalDownloads === 1 ? 'download' : 'downloads'}
            </span>
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[0.6875rem] font-semibold text-brand-ink transition-colors hover:bg-brand-soft"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Clear filters
            </button>
          ) : (
            <span className="text-[0.625rem] text-ink-faint">
              Local to this browser
            </span>
          )}
        </div>
      </section>

      {results.length > 0 ? (
        view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((qr) => (
              <QRCard key={qr.id} qr={qr} view="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {results.map((qr) => (
              <QRCard key={qr.id} qr={qr} view="list" />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={SearchX}
          title="No QR codes match"
          description="Try a different search term or type, or clear the filters to see your whole library again."
          action={
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
          secondaryAction={
            <Link
              to="/generator"
              className={buttonStyles({ variant: 'primary', size: 'md' })}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create a QR code
            </Link>
          }
        />
      )}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CornerDownLeft,
  Search,
  SearchX,
} from 'lucide-react'
import Modal from '../ui/Modal'
import { PRIMARY_NAVIGATION } from '../../data/navigation'
import { QR_TYPES } from '../../data/qrTypes'
import { useQRCodes } from '../../hooks/useQRCodes'
import {
  getQRContentSummary,
  getQRSearchText,
} from '../../utils/qrUtils'
import { cn } from '../../utils/cn'

export default function SearchDialog({ open, onClose }) {
  const navigate = useNavigate()
  const { qrCodes } = useQRCodes()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef(null)

  const groups = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const recentQRCodes = [...qrCodes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, normalized ? 8 : 3)

    const pages = PRIMARY_NAVIGATION.filter((item) =>
      `${item.label} ${item.shortLabel}`.toLowerCase().includes(normalized),
    ).map((item) => ({
      key: `page-${item.to}`,
      label: item.label,
      hint: item.to === '/' ? 'Overview and activity' : 'Workspace page',
      icon: item.icon,
      tone: 'slate',
      to: item.to,
    }))

    const filteredQRCodes = recentQRCodes
      .filter((qr) => (normalized ? getQRSearchText(qr).includes(normalized) : true))
      .map((qr) => {
        const type = QR_TYPES.find((entry) => entry.id === qr.type) ?? QR_TYPES[0]
        return {
          key: `qr-${qr.id}`,
          label: qr.name,
          hint: `${type.label} · ${getQRContentSummary(qr.type, qr.fields)}`,
          icon: type.icon,
          tone: type.tone,
          to: `/generator/${qr.id}`,
        }
      })

    const filteredTypes = QR_TYPES.filter((type) =>
      `${type.label} ${type.title} ${type.description}`.toLowerCase().includes(normalized),
    )
      .slice(0, normalized ? 10 : 5)
      .map((type) => ({
        key: `type-${type.id}`,
        label: type.title,
        hint: 'Create a new QR code',
        icon: type.icon,
        tone: type.tone,
        to: `/generator?type=${type.id}`,
      }))

    return [
      { label: 'Pages', items: pages },
      { label: normalized ? 'Saved QR codes' : 'Recent QR codes', items: filteredQRCodes },
      { label: 'Create by type', items: filteredTypes },
    ].filter((group) => group.items.length > 0)
  }, [query, qrCodes])

  const flatResults = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups],
  )
  const safeActiveIndex = flatResults.length
    ? Math.min(activeIndex, flatResults.length - 1)
    : 0

  useEffect(() => {
    if (!open || !listRef.current) return
    const active = listRef.current.querySelector(`[data-search-index="${safeActiveIndex}"]`)
    active?.scrollIntoView({ block: 'nearest' })
  }, [safeActiveIndex, open])

  function selectResult(result) {
    if (!result) return
    onClose()
    navigate(result.to)
  }

  function handleInputKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(
        flatResults.length ? (safeActiveIndex + 1) % flatResults.length : 0,
      )
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(
        flatResults.length
          ? (safeActiveIndex - 1 + flatResults.length) % flatResults.length
          : 0,
      )
    } else if (event.key === 'Enter') {
      event.preventDefault()
      selectResult(flatResults[safeActiveIndex])
    }
  }

  let runningIndex = -1

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Search QR Studio"
      description="Jump to a page, open a saved code, or start something new."
      size="lg"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3 text-[0.6875rem] text-ink-faint">
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="kbd">↑</span>
              <span className="kbd">↓</span>
              Navigate
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
              Open
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="kbd">Esc</span>
            Close
          </span>
        </div>
      }
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Search pages, saved QR codes, or QR types…"
          className="control h-12 pl-10 text-[0.9375rem]"
          aria-label="Search QR Studio"
          role="combobox"
          aria-expanded="true"
          aria-controls="qr-studio-search-results"
          aria-activedescendant={
            flatResults[safeActiveIndex]
              ? `search-result-${safeActiveIndex}`
              : undefined
          }
          data-autofocus
        />
      </div>

      <div ref={listRef} id="qr-studio-search-results" role="listbox" className="mt-3">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-muted text-ink-faint">
              <SearchX className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">No matches found</p>
            <p className="mt-1 text-xs leading-5 text-ink-soft">
              Try a different name, page, or QR type.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.label} role="group" aria-label={group.label}>
                <p className="px-2 pb-1.5 pt-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((result) => {
                    runningIndex += 1
                    const index = runningIndex
                    const Icon = result.icon
                    const isActive = safeActiveIndex === index

                    return (
                      <button
                        key={result.key}
                        id={`search-result-${index}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        data-search-index={index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectResult(result)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors',
                          isActive ? 'bg-surface-muted' : 'bg-transparent',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                            `tone-${result.tone}`,
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.8125rem] font-medium text-ink">
                            {result.label}
                          </span>
                          <span className="block truncate text-[0.6875rem] text-ink-faint">
                            {result.hint}
                          </span>
                        </span>
                        <ArrowRight
                          className={cn(
                            'h-3.5 w-3.5 shrink-0 transition-opacity',
                            isActive ? 'opacity-60' : 'opacity-0',
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

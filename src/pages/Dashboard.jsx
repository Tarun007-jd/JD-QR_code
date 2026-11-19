import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Download,
  LayoutGrid,
  Plus,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import StatsCard from '../components/dashboard/StatsCard'
import RecentQRCodes from '../components/dashboard/RecentQRCodes'
import { buttonStyles } from '../components/ui/buttonStyles'
import { useQRCodes } from '../hooks/useQRCodes'
import { QR_TYPES, getQRType } from '../data/qrTypes'
import { formatNumber, formatRelativeDate } from '../utils/format'

const QUICK_TYPES = ['url', 'wifi', 'vcard', 'upi', 'whatsapp', 'location']

export default function Dashboard() {
  const { qrCodes } = useQRCodes()

  const totalDownloads = qrCodes.reduce(
    (total, qr) => total + (Number(qr.downloads) || 0),
    0,
  )
  const typesUsed = new Set(qrCodes.map((qr) => qr.type)).size
  const [currentMonthStart] = useState(() => {
    const date = new Date()
    date.setDate(1)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  })
  const addedThisMonth = qrCodes.filter(
    (qr) => new Date(qr.createdAt).getTime() >= currentMonthStart,
  ).length
  const hasCodes = qrCodes.length > 0

  const activity = [...qrCodes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)
    .map((qr) => {
      const updatedAt = new Date(qr.updatedAt).getTime()
      const createdAt = new Date(qr.createdAt).getTime()
      return {
        ...qr,
        action: updatedAt - createdAt > 1000 ? 'Updated' : 'Created',
      }
    })

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="hero-wash relative overflow-hidden rounded-[1.5rem] border border-line p-5 sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-brand/10" />
        <div className="pointer-events-none absolute -right-4 -top-10 h-40 w-40 rounded-full border border-brand/10" />

        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-2.5 py-1 text-[0.6875rem] font-semibold text-ink-soft backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-brand" aria-hidden="true" />
              Your QR workspace
            </span>
            <h1 className="mt-4 text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.045em] text-ink sm:text-[2.4rem]">
              {hasCodes ? 'Welcome back to QR Studio.' : 'Welcome to QR Studio.'}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft sm:text-[0.9375rem]">
              Create, customize, and organize QR codes that look as considered as the
              rest of your work. Everything stays on this device.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                to="/generator"
                className={buttonStyles({
                  size: 'lg',
                  className: 'rounded-xl',
                })}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create QR code
              </Link>
              <Link
                to="/templates"
                className={buttonStyles({
                  variant: 'secondary',
                  size: 'lg',
                  className: 'rounded-xl',
                })}
              >
                Browse templates
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.6875rem] font-medium text-ink-faint">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                Local-first privacy
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ScanLine className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                Scan-optimized colors
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 text-ink-soft" aria-hidden="true" />
                PNG & SVG exports
              </span>
            </div>
          </div>

          <div className="relative hidden w-[315px] shrink-0 xl:block">
            <div className="absolute -inset-2 rounded-[1.35rem] border border-brand/10" />
            <div className="card relative rounded-[1.25rem] p-4">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Workspace pulse</p>
                <span className="inline-flex items-center gap-1 text-[0.625rem] font-medium text-ink-faint">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Ready
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-surface-muted p-3">
                  <QrCode className="h-4 w-4 text-brand" aria-hidden="true" />
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink">
                    {formatNumber(qrCodes.length)}
                  </p>
                  <p className="text-[0.625rem] text-ink-faint">Saved codes</p>
                </div>
                <div className="rounded-xl bg-surface-muted p-3">
                  <Download className="h-4 w-4 text-ink-soft" aria-hidden="true" />
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink">
                    {formatNumber(totalDownloads)}
                  </p>
                  <p className="text-[0.625rem] text-ink-faint">Downloads</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  'Level H error correction by default',
                  'Logos capped at 25% width',
                  'No account or cloud required',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-[0.6875rem] text-ink-soft"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success-soft text-[var(--success-text)]">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
        aria-label="Workspace statistics"
      >
        <StatsCard
          icon={QrCode}
          label="Saved QR codes"
          value={formatNumber(qrCodes.length)}
          hint={hasCodes ? 'In your local workspace' : 'Create your first code'}
          tone="indigo"
        />
        <StatsCard
          icon={Download}
          label="Total downloads"
          value={formatNumber(totalDownloads)}
          hint="Across all saved QR codes"
          tone="emerald"
        />
        <StatsCard
          icon={LayoutGrid}
          label="QR types in use"
          value={formatNumber(typesUsed)}
          hint={`${QR_TYPES.length} formats available`}
          tone="violet"
        />
        <StatsCard
          icon={CalendarDays}
          label="Added this month"
          value={formatNumber(addedThisMonth)}
          hint="New codes in the current month"
          tone="amber"
        />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-6">
        <div className="min-w-0 space-y-5 sm:space-y-6">
          <section className="card">
            <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
              <div>
                <h2 className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-ink">
                  Quick start
                </h2>
                <p className="mt-1 text-xs leading-5 text-ink-soft">
                  Choose a format and start creating.
                </p>
              </div>
              <Link
                to="/generator"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[0.6875rem] font-semibold text-brand-ink transition-colors hover:bg-brand-soft"
              >
                Generator
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-3 sm:px-5 sm:pb-5">
              {QUICK_TYPES.map((typeId) => {
                const type = getQRType(typeId)
                const Icon = type.icon
                return (
                  <Link
                    key={typeId}
                    to={`/generator?type=${typeId}`}
                    className="group flex items-center gap-2.5 rounded-xl border border-line bg-surface-soft p-2.5 transition-all duration-150 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface hover:shadow-[var(--shadow-sm)]"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg tone-${type.tone}`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.6875rem] font-medium text-ink">
                      {type.label}
                    </span>
                    <ArrowRight
                      className="h-3 w-3 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                )
              })}
            </div>
          </section>

          <RecentQRCodes qrCodes={qrCodes} />

          <section className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/templates"
              className="card group flex items-center gap-3 p-4 transition-colors hover:border-line-strong"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink">Start from a template</p>
                <p className="mt-0.5 text-[0.6875rem] text-ink-faint">
                  Menus, cards, Wi-Fi, payments, and more.
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/settings"
              className="card group flex items-center gap-3 p-4 transition-colors hover:border-line-strong"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-soft">
                <ScanLine className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink">Set your defaults</p>
                <p className="mt-0.5 text-[0.6875rem] text-ink-faint">
                  Export size, color, and appearance.
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </section>
        </div>

        <aside className="min-w-0 space-y-5 sm:space-y-6">
          <section className="card">
            <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
              <div>
                <h2 className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-ink">
                  Recent activity
                </h2>
                <p className="mt-1 text-xs text-ink-soft">Latest changes in your library.</p>
              </div>
              <Clock3 className="h-4 w-4 text-ink-faint" aria-hidden="true" />
            </div>

            {activity.length > 0 ? (
              <div className="divide-y divide-line border-t border-line">
                {activity.map((event) => {
                  const type = getQRType(event.type)
                  const Icon = type.icon
                  return (
                    <Link
                      key={event.id}
                      to={`/generator/${event.id}`}
                      className="group flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-surface-soft sm:px-5"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg tone-${type.tone}`}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-5 text-ink-soft">
                          <span className="font-medium text-ink">{event.action}</span>{' '}
                          <span className="break-words">{event.name}</span>
                        </p>
                        <p className="mt-0.5 text-[0.625rem] text-ink-faint">
                          {formatRelativeDate(event.updatedAt)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="border-t border-line px-5 py-7 text-center">
                <Clock3 className="mx-auto h-5 w-5 text-ink-faint" aria-hidden="true" />
                <p className="mt-2 text-xs font-medium text-ink">No activity yet</p>
                <p className="mt-1 text-[0.6875rem] leading-5 text-ink-soft">
                  Your latest QR creations and edits will appear here.
                </p>
              </div>
            )}
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-line bg-surface-soft px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-soft text-[var(--success-text)]">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <h2 className="text-[0.8125rem] font-semibold text-ink">
                  Built for reliable scans
                </h2>
              </div>
            </div>
            <div className="space-y-3 px-4 py-4 sm:px-5">
              {[
                'Level H error correction by default',
                'Contrast checked before download',
                'Logos locked to level H and a size cap',
                'Everything stored in this browser',
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="text-[0.6875rem] leading-5 text-ink-soft">{tip}</span>
                </div>
              ))}
              <Link
                to="/settings"
                className="inline-flex items-center gap-1 pt-1 text-[0.6875rem] font-semibold text-brand-ink transition-opacity hover:opacity-70"
              >
                Review your defaults
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

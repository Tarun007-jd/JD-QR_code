import { Link } from 'react-router-dom'
import { ArrowRight, Home, LayoutTemplate, Plus, QrCode } from 'lucide-react'
import { buttonStyles } from '../components/ui/buttonStyles'

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center">
      <section className="hero-wash relative w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-line px-5 py-10 text-center sm:px-10 sm:py-14">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface text-brand shadow-[var(--shadow-card)]">
            <QrCode className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-6 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-ink-faint">
            Error 404
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-ink sm:text-[2.65rem]">
            This page didn&apos;t scan.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">
            The link may be outdated, or the page moved. Your saved QR codes are
            still exactly where you left them.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Link to="/" className={buttonStyles({ size: 'lg', className: 'rounded-xl' })}>
              <Home className="h-4 w-4" aria-hidden="true" />
              Go to dashboard
            </Link>
            <Link
              to="/generator"
              className={buttonStyles({
                variant: 'secondary',
                size: 'lg',
                className: 'rounded-xl',
              })}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create QR code
            </Link>
          </div>

          <div className="mx-auto mt-8 grid max-w-sm gap-2 border-t border-line pt-5 text-left">
            <Link
              to="/my-qr-codes"
              className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-muted"
            >
              <span className="flex items-center gap-2.5 text-xs font-medium text-ink-soft">
                <QrCode className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
                Open My QR codes
              </span>
              <ArrowRight
                className="h-3.5 w-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/templates"
              className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-muted"
            >
              <span className="flex items-center gap-2.5 text-xs font-medium text-ink-soft">
                <LayoutTemplate className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
                Browse templates
              </span>
              <ArrowRight
                className="h-3.5 w-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

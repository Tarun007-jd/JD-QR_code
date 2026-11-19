import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import Logo from '../ui/Logo'
import { PRIMARY_NAVIGATION } from '../../data/navigation'
import { cn } from '../../utils/cn'

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-surface lg:flex xl:w-[264px]">
      <div className="px-5 pb-5 pt-6">
        <Logo />
        <p className="mt-3 text-[0.6875rem] font-medium tracking-[0.01em] text-ink-faint">
          QR codes, beautifully made.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4">
        <nav aria-label="Main navigation" className="space-y-1">
          <p className="eyebrow px-3 pb-2 pt-1 text-[0.625rem]">Workspace</p>
          {PRIMARY_NAVIGATION.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.8125rem] font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-brand-soft text-brand-ink'
                      : 'text-ink-soft hover:bg-surface-muted hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-[17px] w-[17px] shrink-0 transition-colors',
                        isActive ? 'text-brand-ink' : 'text-ink-faint group-hover:text-ink-soft',
                      )}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive ? (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                    ) : null}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-soft p-3.5">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-soft" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <p className="text-xs font-semibold text-ink">Local-first</p>
              </div>
              <p className="mt-2 text-[0.6875rem] leading-[1.15rem] text-ink-soft">
                Your QR codes stay in this browser. No account, no cloud.
              </p>
              <Link
                to="/settings"
                className="mt-2.5 inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-brand-ink transition-opacity hover:opacity-75"
              >
                Privacy settings
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-line px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[0.6875rem] text-ink-faint">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            Personal workspace
          </div>
          <span className="text-[0.625rem] font-medium text-ink-faint">v1.0.0</span>
        </div>
      </div>
    </aside>
  )
}

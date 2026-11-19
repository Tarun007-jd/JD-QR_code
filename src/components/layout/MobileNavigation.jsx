import { NavLink } from 'react-router-dom'
import { PRIMARY_NAVIGATION } from '../../data/navigation'
import { cn } from '../../utils/cn'

export default function MobileNavigation() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between rounded-2xl border border-line bg-surface/95 p-1.5 shadow-[var(--shadow-float)] backdrop-blur-xl">
        {PRIMARY_NAVIGATION.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.5625rem] font-semibold leading-none transition-colors',
                  isActive
                    ? 'bg-brand-soft text-brand-ink'
                    : 'text-ink-faint hover:text-ink-soft',
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
              <span className="max-w-full truncate">{item.shortLabel}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

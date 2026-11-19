export default function StatsCard({ icon: Icon, label, value, hint, tone = 'indigo' }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-medium leading-4 text-ink-soft sm:text-xs">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-ink sm:text-[1.75rem]">
            {value}
          </p>
        </div>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 tone-${tone}`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2.5 line-clamp-1 text-[0.625rem] leading-4 text-ink-faint sm:text-[0.6875rem]">
        {hint}
      </p>
    </div>
  )
}

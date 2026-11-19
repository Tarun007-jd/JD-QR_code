import { QrCode } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function EmptyState({
  icon: Icon = QrCode,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface-soft px-5 text-center',
        compact ? 'py-8' : 'py-12 sm:py-16',
        className,
      )}
    >
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand/10" />
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-ink-soft">{description}</p>
      ) : null}
      {action || secondaryAction ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  )
}

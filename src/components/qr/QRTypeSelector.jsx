import { Check } from 'lucide-react'
import { QR_TYPES } from '../../data/qrTypes'
import { cn } from '../../utils/cn'

export default function QRTypeSelector({ value, onChange }) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5"
      role="radiogroup"
      aria-label="QR code type"
    >
      {QR_TYPES.map((type) => {
        const Icon = type.icon
        const active = value === type.id

        return (
          <button
            key={type.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(type.id)}
            className={cn(
              'group relative flex min-h-[5.15rem] flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-150',
              active
                ? 'border-brand bg-brand-soft'
                : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted',
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-150 group-hover:-translate-y-0.5',
                active ? 'bg-surface text-brand' : `tone-${type.tone}`,
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <span
              className={cn(
                'text-[0.6875rem] font-semibold leading-[1.05rem] tracking-[-0.01em] sm:text-xs',
                active ? 'text-brand-ink' : 'text-ink',
              )}
            >
              {type.label}
            </span>
            {active ? (
              <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white">
                <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

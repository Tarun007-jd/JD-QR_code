import { cn } from '../../utils/cn'

const BASE_CLASSES =
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50'

const VARIANT_CLASSES = {
  primary:
    'border border-transparent bg-brand text-white shadow-[0_1px_2px_rgba(15,23,42,0.12)] hover:bg-brand-hover',
  secondary:
    'border border-line bg-surface text-ink shadow-[var(--shadow-sm)] hover:border-line-strong hover:bg-surface-muted',
  soft: 'border border-transparent bg-brand-soft text-brand-ink hover:brightness-[0.985]',
  ghost: 'border border-transparent text-ink-soft hover:bg-surface-muted hover:text-ink',
  danger:
    'border border-transparent bg-danger text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:brightness-95',
  'danger-ghost':
    'border border-transparent text-[var(--danger-text)] hover:bg-danger-soft',
}

const SIZE_CLASSES = {
  sm: 'h-9 rounded-[0.625rem] px-3 text-[0.8125rem]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  icon: 'h-10 w-10 px-0',
  'icon-sm': 'h-8 w-8 rounded-[0.625rem] px-0 text-sm',
  'icon-lg': 'h-11 w-11 px-0',
}

export function buttonStyles({ variant = 'primary', size = 'md', className = '' } = {}) {
  return cn(
    BASE_CLASSES,
    VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
    SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
    className,
  )
}

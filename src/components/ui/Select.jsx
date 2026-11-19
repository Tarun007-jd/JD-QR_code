import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { Field } from './Input'
import { cn } from '../../utils/cn'

const Select = forwardRef(function Select(
  {
    label,
    hint,
    error,
    id,
    className = '',
    containerClassName = '',
    optional = false,
    required = false,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const selectId = id || generatedId
  const message = error || hint

  return (
    <Field
      label={label}
      htmlFor={selectId}
      hint={hint}
      error={error}
      optional={optional}
      required={required}
      className={containerClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'control appearance-none pr-10',
            error ? 'border-[var(--danger)]' : '',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={message ? `${selectId}-message` : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
      </div>
    </Field>
  )
})

export default Select

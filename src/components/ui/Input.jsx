import { forwardRef, useId } from 'react'
import { cn } from '../../utils/cn'

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional = false,
  required = false,
  className = '',
  children,
}) {
  return (
    <div className={cn('min-w-0 space-y-1.5', className)}>
      {label ? (
        <div className="flex min-h-5 items-center justify-between gap-2">
          <label
            htmlFor={htmlFor}
            className="text-[0.8125rem] font-medium leading-5 text-ink"
          >
            {label}
            {required ? (
              <span className="ml-0.5 text-brand" aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
          {optional ? (
            <span className="text-[0.6875rem] font-medium text-ink-faint">Optional</span>
          ) : null}
        </div>
      ) : null}
      {children}
      {error || hint ? (
        <p
          id={htmlFor ? `${htmlFor}-message` : undefined}
          className={cn(
            'text-xs leading-5',
            error ? 'text-[var(--danger-text)]' : 'text-ink-faint',
          )}
        >
          {error || hint}
        </p>
      ) : null}
    </div>
  )
}

const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    id,
    className = '',
    containerClassName = '',
    optional = false,
    required = false,
    leading,
    trailing,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const message = error || hint

  return (
    <Field
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={error}
      optional={optional}
      required={required}
      className={containerClassName}
    >
      <div className="relative">
        {leading ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-faint">
            {leading}
          </div>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn('control', leading && 'pl-9', trailing && 'pr-11', className)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={message ? `${inputId}-message` : undefined}
          {...props}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
            {trailing}
          </div>
        ) : null}
      </div>
    </Field>
  )
})

export const Textarea = forwardRef(function Textarea(
  {
    label,
    hint,
    error,
    id,
    className = '',
    containerClassName = '',
    optional = false,
    required = false,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const textareaId = id || generatedId
  const message = error || hint

  return (
    <Field
      label={label}
      htmlFor={textareaId}
      hint={hint}
      error={error}
      optional={optional}
      required={required}
      className={containerClassName}
    >
      <textarea
        ref={ref}
        id={textareaId}
        className={cn('control', className)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={message ? `${textareaId}-message` : undefined}
        {...props}
      />
    </Field>
  )
})

export default Input

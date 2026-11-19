import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

export function BrandMark({ className = 'h-9 w-9' }) {
  return (
    <svg
      viewBox="0 0 36 36"
      className={className}
      role="img"
      aria-label="QR Studio logo"
    >
      <rect width="36" height="36" rx="10" fill="#4F46E5" />
      <path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M7.5 7.5h8.7v8.7H7.5V7.5Zm2.3 2.3v4.1h4.1V9.8H9.8Z"
        clipRule="evenodd"
      />
      <path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M19.8 7.5h8.7v8.7h-8.7V7.5Zm2.3 2.3v4.1h4.1V9.8h-4.1Z"
        clipRule="evenodd"
      />
      <path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M7.5 19.8h8.7v8.7H7.5v-8.7Zm2.3 2.3v4.1h4.1v-4.1H9.8Z"
        clipRule="evenodd"
      />
      <rect x="19.8" y="19.8" width="3.8" height="3.8" rx="0.8" fill="#FFFFFF" />
      <rect x="24.7" y="19.8" width="3.8" height="3.8" rx="0.8" fill="#C7D2FE" />
      <rect x="19.8" y="24.7" width="3.8" height="3.8" rx="0.8" fill="#C7D2FE" />
      <rect x="24.7" y="24.7" width="3.8" height="3.8" rx="0.8" fill="#FFFFFF" />
    </svg>
  )
}

export default function Logo({ className = '', compact = false }) {
  return (
    <Link
      to="/"
      aria-label="QR Studio — go to dashboard"
      className={cn(
        'inline-flex items-center gap-2.5 rounded-xl outline-offset-4',
        className,
      )}
    >
      <BrandMark className="h-9 w-9 shrink-0" />
      {!compact ? (
        <span className="text-[1rem] font-semibold tracking-[-0.035em] text-ink">
          QR Studio
        </span>
      ) : null}
    </Link>
  )
}

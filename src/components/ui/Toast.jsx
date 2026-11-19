import { Toaster } from 'sonner'
import { useSettings } from '../../hooks/useSettings'

export default function ToastProvider() {
  const { resolvedTheme } = useSettings()

  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme}
      closeButton
      offset={18}
      toastOptions={{
        duration: 3600,
        style: {
          background: 'var(--surface)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-float)',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
        },
      }}
    />
  )
}

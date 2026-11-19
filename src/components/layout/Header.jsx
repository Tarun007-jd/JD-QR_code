import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Plus, Search } from 'lucide-react'
import Logo from '../ui/Logo'
import SearchDialog from './SearchDialog'
import { buttonStyles } from '../ui/buttonStyles'
import { getPageTitle } from '../../data/navigation'

export default function Header() {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const pageTitle = getPageTitle(location.pathname)
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((current) => !current)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:h-[4.5rem] xl:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="hidden min-w-0 items-center gap-1.5 text-[0.8125rem] lg:flex">
            <span className="text-ink-faint">Workspace</span>
            <ChevronRight className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
            <span className="truncate font-medium text-ink">{pageTitle}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 items-center gap-2 rounded-xl border border-line bg-surface px-2.5 text-[0.8125rem] font-medium text-ink-soft shadow-[var(--shadow-sm)] transition-colors hover:border-line-strong hover:text-ink sm:h-10 sm:px-3"
            aria-label="Search QR Studio"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
            <span className="kbd ml-1 hidden md:inline-flex">
              {isMac ? '⌘ K' : 'Ctrl K'}
            </span>
          </button>

          <Link
            to="/generator"
            className={buttonStyles({
              size: 'md',
              className:
                'h-9 rounded-xl px-2.5 text-[0.8125rem] sm:h-10 sm:px-4 sm:text-sm',
            })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">New QR code</span>
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <SearchDialog open onClose={() => setSearchOpen(false)} />
      ) : null}
    </header>
  )
}

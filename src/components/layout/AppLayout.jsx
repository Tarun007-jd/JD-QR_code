import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNavigation from './MobileNavigation'

export default function AppLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
        <Sidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header />

          <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-10 xl:px-10">
            <div
              key={location.pathname}
              className="animate-page-in mx-auto w-full max-w-[1320px]"
            >
              <Outlet />
            </div>

            <footer className="mx-auto mt-12 hidden w-full max-w-[1320px] items-center justify-between border-t border-line pt-5 text-[0.6875rem] text-ink-faint sm:flex">
              <span>QR Studio · Local-first by design</span>
              <span>Version 1.0.0</span>
            </footer>
          </main>
        </div>
      </div>

      <MobileNavigation />
    </div>
  )
}

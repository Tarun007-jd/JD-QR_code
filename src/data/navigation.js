import {
  FolderOpen,
  LayoutDashboard,
  LayoutTemplate,
  QrCode,
  Settings,
} from 'lucide-react'

export const PRIMARY_NAVIGATION = [
  {
    to: '/',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/generator',
    label: 'Create QR',
    shortLabel: 'Create',
    icon: QrCode,
  },
  {
    to: '/my-qr-codes',
    label: 'My QR Codes',
    shortLabel: 'My QRs',
    icon: FolderOpen,
  },
  {
    to: '/templates',
    label: 'Templates',
    shortLabel: 'Templates',
    icon: LayoutTemplate,
  },
  {
    to: '/settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: Settings,
  },
]

export function getPageTitle(pathname) {
  if (pathname === '/') return 'Dashboard'
  if (pathname.startsWith('/generator')) return 'QR generator'
  if (pathname.startsWith('/my-qr-codes')) return 'My QR codes'
  if (pathname.startsWith('/templates')) return 'Templates'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'Page not found'
}

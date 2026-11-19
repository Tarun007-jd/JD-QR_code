import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ToastProvider from './components/ui/Toast'
import QRCodeProvider from './hooks/QRCodeProvider'
import SettingsProvider from './hooks/SettingsProvider'
import Dashboard from './pages/Dashboard'
import Generator from './pages/Generator'
import MyQRCodes from './pages/MyQRCodes'
import NotFound from './pages/NotFound'
import Settings from './pages/Settings'
import Templates from './pages/Templates'

function GeneratorRoute() {
  const location = useLocation()

  return (
    <Generator
      key={`${location.pathname}${location.search}`}
    />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <QRCodeProvider>
          <ToastProvider />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/generator" element={<GeneratorRoute />} />
              <Route path="/generator/:id" element={<GeneratorRoute />} />
              <Route path="/my-qr-codes" element={<MyQRCodes />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </QRCodeProvider>
      </SettingsProvider>
    </BrowserRouter>
  )
}

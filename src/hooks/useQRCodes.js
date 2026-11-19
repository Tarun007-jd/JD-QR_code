import { useContext } from 'react'
import QRCodeContext from './qrCodesContext'

export function useQRCodes() {
  const context = useContext(QRCodeContext)
  if (!context) {
    throw new Error('useQRCodes must be used inside a QRCodeProvider.')
  }
  return context
}

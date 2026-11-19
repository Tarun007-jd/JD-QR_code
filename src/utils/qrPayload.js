import { normalizePhone, normalizeUrl, phoneDigits } from './validation'
import { getQRType } from '../data/qrTypes'

function escapeWifi(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/([;,:])/g, '\\$1')
    .replace(/\r?\n/g, '\\n')
}

function escapeVCard(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

function formatAmount(value) {
  const amount = Number(String(value ?? '').trim())
  if (!Number.isFinite(amount) || amount <= 0) return ''
  return amount.toFixed(2)
}

function parseCoordinate(value) {
  const text = String(value ?? '').trim()
  if (!text) return null
  const coordinate = Number(text)
  return Number.isFinite(coordinate) ? coordinate : null
}

function whatsappDigits(fields) {
  const countryCode = phoneDigits(fields?.countryCode)
  const localNumber = phoneDigits(fields?.phone)

  if (!countryCode) return localNumber
  if (!localNumber) return countryCode

  return `${countryCode}${localNumber}`
}

export function buildQRPayload(type, fields = {}) {
  const safeFields = fields && typeof fields === 'object' ? fields : {}
  const value = (key) => String(safeFields[key] ?? '')
  const trimmed = (key) => value(key).trim()

  switch (type) {
    case 'url': {
      return normalizeUrl(value('url')) ?? ''
    }

    case 'text':
      return trimmed('text')

    case 'wifi': {
      const security = ['WPA', 'WEP', 'nopass'].includes(value('security'))
        ? value('security')
        : 'WPA'
      const ssid = trimmed('ssid')
      if (!ssid) return ''

      let payload = `WIFI:T:${security};S:${escapeWifi(ssid)};`
      if (security !== 'nopass') {
        payload += `P:${escapeWifi(value('password'))};`
      }
      if (safeFields.hidden) {
        payload += 'H:true;'
      }
      return `${payload};`
    }

    case 'email': {
      const email = trimmed('email')
      if (!email) return ''
      const params = []
      if (trimmed('subject')) {
        params.push(`subject=${encodeURIComponent(trimmed('subject'))}`)
      }
      if (trimmed('body')) {
        params.push(`body=${encodeURIComponent(trimmed('body'))}`)
      }
      return `mailto:${email}${params.length ? `?${params.join('&')}` : ''}`
    }

    case 'phone': {
      const phone = normalizePhone(value('phone'))
      return phone ? `tel:${phone}` : ''
    }

    case 'sms': {
      const phone = normalizePhone(value('phone'))
      if (!phone) return ''
      const message = trimmed('message')
      return message ? `SMSTO:${phone}:${message}` : `SMSTO:${phone}`
    }

    case 'whatsapp': {
      const digits = whatsappDigits(safeFields)
      if (!digits) return ''
      const message = trimmed('message')
      return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`
    }

    case 'vcard': {
      const name = trimmed('name')
      if (!name) return ''

      const nameParts = name.split(/\s+/)
      const firstName = nameParts.shift() ?? ''
      const lastName = nameParts.join(' ')
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
        `FN:${escapeVCard(name)}`,
      ]

      if (trimmed('organization')) {
        lines.push(`ORG:${escapeVCard(trimmed('organization'))}`)
      }
      if (trimmed('jobTitle')) {
        lines.push(`TITLE:${escapeVCard(trimmed('jobTitle'))}`)
      }
      if (trimmed('phone')) {
        lines.push(`TEL;TYPE=CELL:${escapeVCard(normalizePhone(value('phone')))}`)
      }
      if (trimmed('email')) {
        lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(trimmed('email'))}`)
      }
      if (trimmed('website')) {
        const website = normalizeUrl(value('website'))
        if (website) lines.push(`URL:${escapeVCard(website)}`)
      }

      lines.push('END:VCARD')
      return lines.join('\r\n')
    }

    case 'location': {
      const label = trimmed('label')
      const address = trimmed('address')
      const latitude = parseCoordinate(safeFields.latitude)
      const longitude = parseCoordinate(safeFields.longitude)
      const hasCoordinates = latitude !== null && longitude !== null

      if (hasCoordinates) {
        const coordinates = `${latitude},${longitude}`
        const query = label ? `${coordinates} (${label})` : coordinates
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      }

      if (!address) return ''
      const query = label ? `${label}, ${address}` : address
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    }

    case 'upi': {
      const upiId = trimmed('upiId')
      const payeeName = trimmed('payeeName')
      if (!upiId || !payeeName) return ''

      const params = [
        `pa=${encodeURIComponent(upiId)}`,
        `pn=${encodeURIComponent(payeeName)}`,
        'cu=INR',
      ]
      const amount = formatAmount(value('amount'))
      if (amount) params.push(`am=${encodeURIComponent(amount)}`)
      if (trimmed('note')) params.push(`tn=${encodeURIComponent(trimmed('note'))}`)

      return `upi://pay?${params.join('&')}`
    }

    default:
      return ''
  }
}

export function getDefaultQRName(type, fields = {}) {
  const trimmed = (key) => String(fields?.[key] ?? '').trim()
  let name = ''

  switch (type) {
    case 'url': {
      const normalized = normalizeUrl(fields?.url)
      if (normalized) {
        try {
          name = new URL(normalized).hostname.replace(/^www\./, '')
        } catch {
          name = ''
        }
      }
      break
    }
    case 'text':
      name = trimmed('text').slice(0, 42)
      break
    case 'wifi':
      name = trimmed('ssid')
      break
    case 'email':
      name = trimmed('email')
      break
    case 'phone':
    case 'sms':
      name = trimmed('phone')
      break
    case 'whatsapp':
      name = [trimmed('countryCode'), trimmed('phone')].filter(Boolean).join(' ')
      break
    case 'vcard':
      name = trimmed('name') || trimmed('organization')
      break
    case 'location':
      name = trimmed('label') || trimmed('address').slice(0, 42)
      break
    case 'upi':
      name = trimmed('payeeName')
      break
    default:
      name = ''
  }

  return name || getQRType(type).title
}

export function getQRContentSummary(type, fields = {}) {
  const trimmed = (key) => String(fields?.[key] ?? '').trim()

  switch (type) {
    case 'url':
      return trimmed('url') || 'Website link'
    case 'text':
      return trimmed('text') || 'Plain text'
    case 'wifi':
      return `${trimmed('ssid') || 'Wi-Fi network'} · ${trimmed('security') || 'WPA'}`
    case 'email':
      return trimmed('email') || 'Email message'
    case 'phone':
      return trimmed('phone') || 'Phone number'
    case 'sms':
      return trimmed('phone') || 'Text message'
    case 'whatsapp': {
      const number = [trimmed('countryCode'), trimmed('phone')].filter(Boolean).join(' ')
      return number || 'WhatsApp chat'
    }
    case 'vcard':
      return [trimmed('name'), trimmed('organization')].filter(Boolean).join(' · ') || 'Contact card'
    case 'location': {
      const coordinates = [trimmed('latitude'), trimmed('longitude')]
        .filter(Boolean)
        .join(', ')
      const place = [trimmed('label'), trimmed('address')].filter(Boolean).join(' · ')
      return [place, coordinates ? `(${coordinates})` : ''].filter(Boolean).join(' · ') || 'Location'
    }
    case 'upi':
      return [trimmed('payeeName'), trimmed('upiId')].filter(Boolean).join(' · ') || 'UPI payment'
    default:
      return 'QR code'
  }
}

export function getQRSearchText(qr) {
  const type = getQRType(qr?.type)
  const fieldValues = Object.values(qr?.fields || {})
    .map((value) => String(value ?? ''))
    .join(' ')
  return [qr?.name, qr?.content, type.label, type.title, getQRContentSummary(qr?.type, qr?.fields), fieldValues]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

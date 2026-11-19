import { buildQRPayload } from './qrPayload'
import {
  MAX_LOGO_SIZE_PERCENT,
  MAX_QR_PAYLOAD_BYTES,
  QR_ERROR_CORRECTION,
} from './qrConfig'
import {
  byteLength,
  isHexColor,
  isValidEmail,
  isValidPhone,
  isValidUpiId,
  normalizeUrl,
  phoneDigits,
} from './validation'

export function validateQR(type, fields = {}) {
  const errors = {}
  const value = (key) => String(fields?.[key] ?? '')
  const trimmed = (key) => value(key).trim()

  switch (type) {
    case 'url': {
      if (!trimmed('url')) {
        errors.url = 'Enter a website address.'
      } else if (!normalizeUrl(value('url'))) {
        errors.url = 'Enter a valid URL, like https://example.com.'
      }
      break
    }

    case 'text': {
      if (!trimmed('text')) {
        errors.text = 'Enter some text to encode.'
      } else if (value('text').length > 900) {
        errors.text = 'Keep the text under 900 characters.'
      }
      break
    }

    case 'wifi': {
      const ssid = trimmed('ssid')
      const security = value('security')
      const password = value('password')

      if (!ssid) {
        errors.ssid = 'Enter the network name (SSID).'
      } else if (byteLength(ssid) > 32) {
        errors.ssid = 'Wi-Fi network names can be at most 32 characters.'
      }

      if (!['WPA', 'WEP', 'nopass'].includes(security)) {
        errors.security = 'Choose a security type.'
      } else if (security !== 'nopass' && !password) {
        errors.password = 'Enter the Wi-Fi password.'
      } else if (security === 'WPA' && password.length > 0 && password.length < 8) {
        errors.password = 'WPA passwords need at least 8 characters.'
      }
      break
    }

    case 'email': {
      if (!trimmed('email')) {
        errors.email = 'Enter an email address.'
      } else if (!isValidEmail(value('email'))) {
        errors.email = 'Enter a valid email address.'
      }
      if (value('subject').length > 100) {
        errors.subject = 'Keep the subject under 100 characters.'
      }
      if (value('body').length > 600) {
        errors.body = 'Keep the message under 600 characters.'
      }
      break
    }

    case 'phone': {
      if (!trimmed('phone')) {
        errors.phone = 'Enter a phone number.'
      } else if (!isValidPhone(value('phone'), 6, 15)) {
        errors.phone = 'Enter a phone number with 6–15 digits.'
      }
      break
    }

    case 'sms': {
      if (!trimmed('phone')) {
        errors.phone = 'Enter a phone number.'
      } else if (!isValidPhone(value('phone'), 6, 15)) {
        errors.phone = 'Enter a phone number with 6–15 digits.'
      }
      if (value('message').length > 400) {
        errors.message = 'Keep the message under 400 characters.'
      }
      break
    }

    case 'whatsapp': {
      const countryCode = phoneDigits(value('countryCode'))
      const phone = phoneDigits(value('phone'))
      const rawPhone = trimmed('phone')
      const hasCountryCode = countryCode.length > 0

      if (hasCountryCode && countryCode.length > 4) {
        errors.countryCode = 'Country codes are 1–4 digits, like 91 or 1.'
      } else if (!hasCountryCode && !rawPhone.startsWith('+')) {
        errors.countryCode = 'Add a country code, like 91 or 1.'
      }

      if (!phone) {
        errors.phone = 'Enter the WhatsApp number.'
      } else if (hasCountryCode && rawPhone.startsWith('+')) {
        errors.phone = 'Enter the local number only, or clear the country code.'
      } else if (hasCountryCode && (phone.length < 6 || phone.length > 12)) {
        errors.phone = 'Enter the local number with 6–12 digits.'
      } else if (!hasCountryCode && (phone.length < 7 || phone.length > 15)) {
        errors.phone = 'Include the country code and 7–15 digits.'
      }

      if (hasCountryCode && phone.length > 0) {
        const totalDigits = countryCode.length + phone.length
        if (totalDigits < 7 || totalDigits > 15) {
          errors._form = 'WhatsApp numbers must have 7–15 digits including the country code.'
        }
      }

      if (value('message').length > 500) {
        errors.message = 'Keep the message under 500 characters.'
      }
      break
    }

    case 'vcard': {
      if (!trimmed('name')) {
        errors.name = 'Enter a full name.'
      } else if (trimmed('name').length > 80) {
        errors.name = 'Keep the name under 80 characters.'
      }

      if (trimmed('organization').length > 80) {
        errors.organization = 'Keep the organization under 80 characters.'
      }
      if (trimmed('jobTitle').length > 80) {
        errors.jobTitle = 'Keep the job title under 80 characters.'
      }

      if (trimmed('phone') && !isValidPhone(value('phone'), 6, 15)) {
        errors.phone = 'Enter a valid phone number or leave it blank.'
      }
      if (trimmed('email') && !isValidEmail(value('email'))) {
        errors.email = 'Enter a valid email address or leave it blank.'
      }
      if (trimmed('website') && !normalizeUrl(value('website'))) {
        errors.website = 'Enter a valid website URL or leave it blank.'
      }
      if (!trimmed('phone') && !trimmed('email')) {
        errors._form = 'Add a phone number or email so the contact card is useful.'
      }
      break
    }

    case 'location': {
      const latitudeText = trimmed('latitude')
      const longitudeText = trimmed('longitude')
      const address = trimmed('address')
      const latitude = latitudeText ? Number(latitudeText) : null
      const longitude = longitudeText ? Number(longitudeText) : null
      const hasLatitude = latitudeText.length > 0
      const hasLongitude = longitudeText.length > 0

      if (trimmed('label').length > 80) {
        errors.label = 'Keep the location name under 80 characters.'
      }

      if (hasLatitude && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
        errors.latitude = 'Enter a latitude between -90 and 90.'
      }
      if (
        hasLongitude &&
        (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
      ) {
        errors.longitude = 'Enter a longitude between -180 and 180.'
      }
      if (hasLatitude !== hasLongitude) {
        errors._form = 'Add both latitude and longitude, or use an address instead.'
      } else if (!hasLatitude && !hasLongitude && !address) {
        errors.address = 'Enter an address, or add latitude and longitude.'
      }
      if (address.length > 300) {
        errors.address = 'Keep the address under 300 characters.'
      }
      break
    }

    case 'upi': {
      if (!trimmed('upiId')) {
        errors.upiId = 'Enter the UPI ID.'
      } else if (!isValidUpiId(value('upiId'))) {
        errors.upiId = 'Enter a valid UPI ID, like name@bank.'
      }
      if (!trimmed('payeeName')) errors.payeeName = 'Enter the payee name.'
      if (trimmed('payeeName').length > 80) {
        errors.payeeName = 'Keep the payee name under 80 characters.'
      }

      if (trimmed('amount')) {
        const amount = value('amount').trim()
        if (!/^\d{1,7}(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
          errors.amount = 'Enter a valid amount greater than zero.'
        }
      }

      if (trimmed('note').length > 50) {
        errors.note = 'Keep the note under 50 characters.'
      }
      break
    }

    default:
      errors._form = 'Choose a supported QR type.'
  }

  const payload = buildQRPayload(type, fields)
  if (Object.keys(errors).length === 0) {
    if (!payload) {
      errors._form = 'Complete the QR content before generating your code.'
    } else if (byteLength(payload) > MAX_QR_PAYLOAD_BYTES) {
      errors._form = 'This QR contains too much data. Shorten the content to keep it scannable.'
    }
  }

  return {
    errors,
    payload: Object.keys(errors).length === 0 ? payload : '',
  }
}

function hexToRgb(hex) {
  if (!isHexColor(hex)) return null
  const normalized = hex.replace('#', '')
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ]
}

function channelLuminance(channel) {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const [red, green, blue] = rgb
  return (
    0.2126 * channelLuminance(red) +
    0.7152 * channelLuminance(green) +
    0.0722 * channelLuminance(blue)
  )
}

export function getContrastRatio(foreground, background) {
  const fg = relativeLuminance(foreground)
  const bg = relativeLuminance(background)
  if (fg === null || bg === null) return 0
  const lighter = Math.max(fg, bg)
  const darker = Math.min(fg, bg)
  return (lighter + 0.05) / (darker + 0.05)
}

export function getScannability(foreground, background) {
  const ratio = getContrastRatio(foreground, background)
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)

  if (foregroundLuminance === null || backgroundLuminance === null) {
    return {
      scannable: false,
      ratio: 0,
      reason: 'Choose valid foreground and background colors.',
    }
  }

  if (foregroundLuminance >= backgroundLuminance) {
    return {
      scannable: false,
      ratio,
      reason: 'Keep the foreground darker than the background for reliable scanning.',
    }
  }

  if (ratio < 4.5) {
    return {
      scannable: false,
      ratio,
      reason: 'Contrast is too low. Choose a darker foreground or a lighter background.',
    }
  }

  return { scannable: true, ratio, reason: null }
}

/**
 * Applies the same logo policy to the preview, saved records, and every export.
 * Level H and a bounded logo size reduce the risk of losing data, but they do
 * not guarantee that a real scanner will decode the result. Test scans before
 * printing or sharing.
 */
export function getQRSafety(customization = {}) {
  const value =
    customization && typeof customization === 'object' ? customization : {}
  const hasLogo =
    typeof value.logo === 'string' && value.logo.startsWith('data:image/')

  if (!hasLogo) {
    return { safe: true, hasLogo: false, code: null, reason: null }
  }

  const requestedLevel = String(value.errorCorrection ?? '').toUpperCase()
  if (requestedLevel && requestedLevel !== QR_ERROR_CORRECTION) {
    return {
      safe: false,
      hasLogo: true,
      code: 'logo-error-correction',
      reason: `A logo requires error correction level ${QR_ERROR_CORRECTION}. Choose level ${QR_ERROR_CORRECTION} or remove the logo.`,
    }
  }

  const logoSize = Number(value.logoSize)
  if (Number.isFinite(logoSize) && logoSize > MAX_LOGO_SIZE_PERCENT) {
    return {
      safe: false,
      hasLogo: true,
      code: 'logo-size',
      reason: `Logos can cover at most ${MAX_LOGO_SIZE_PERCENT}% of the QR width. Reduce the logo size and try again.`,
    }
  }

  return { safe: true, hasLogo: true, code: null, reason: null }
}

import {
  IndianRupee,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Type,
  UserRound,
  Wifi,
} from 'lucide-react'

export const QR_TYPES = [
  {
    id: 'url',
    label: 'Website',
    title: 'URL / Website',
    description: 'Send people straight to a page, product, or profile.',
    icon: Link2,
    tone: 'indigo',
    defaultFields: { url: '' },
  },
  {
    id: 'text',
    label: 'Plain text',
    title: 'Plain text',
    description: 'Share a note, instruction, or short message.',
    icon: Type,
    tone: 'slate',
    defaultFields: { text: '' },
  },
  {
    id: 'wifi',
    label: 'Wi-Fi',
    title: 'Wi-Fi network',
    description: 'Let guests join your network without typing a password.',
    icon: Wifi,
    tone: 'sky',
    defaultFields: { ssid: '', password: '', security: 'WPA', hidden: false },
  },
  {
    id: 'email',
    label: 'Email',
    title: 'Email',
    description: 'Open a pre-addressed email with a ready-to-send message.',
    icon: Mail,
    tone: 'rose',
    defaultFields: { email: '', subject: '', body: '' },
  },
  {
    id: 'phone',
    label: 'Phone',
    title: 'Phone call',
    description: 'Start a call with a single scan.',
    icon: Phone,
    tone: 'emerald',
    defaultFields: { phone: '' },
  },
  {
    id: 'sms',
    label: 'SMS',
    title: 'Text message',
    description: 'Open a text message with a pre-written draft.',
    icon: MessageSquare,
    tone: 'amber',
    defaultFields: { phone: '', message: '' },
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    title: 'WhatsApp chat',
    description: 'Start a WhatsApp conversation in one step.',
    icon: MessageCircle,
    tone: 'green',
    defaultFields: { countryCode: '', phone: '', message: '' },
  },
  {
    id: 'vcard',
    label: 'Contact card',
    title: 'Contact card',
    description: 'Share complete contact details that save straight to a phone.',
    icon: UserRound,
    tone: 'violet',
    defaultFields: {
      name: '',
      organization: '',
      jobTitle: '',
      phone: '',
      email: '',
      website: '',
    },
  },
  {
    id: 'location',
    label: 'Location',
    title: 'Location',
    description: 'Point people to an address or place on a map.',
    icon: MapPin,
    tone: 'orange',
    defaultFields: {
      label: '',
      address: '',
      latitude: '',
      longitude: '',
    },
  },
  {
    id: 'upi',
    label: 'UPI payment',
    title: 'UPI payment',
    description: 'Collect a payment through any UPI-enabled app.',
    icon: IndianRupee,
    tone: 'teal',
    defaultFields: { upiId: '', payeeName: '', amount: '', note: '' },
  },
]

export function getQRType(typeId) {
  return QR_TYPES.find((type) => type.id === typeId) ?? QR_TYPES[0]
}

export function getDefaultQRFields(typeId) {
  const type = getQRType(typeId)
  return { ...type.defaultFields }
}

export function isValidQRType(typeId) {
  return QR_TYPES.some((type) => type.id === typeId)
}

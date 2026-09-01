import { isValidPhoneNumber } from 'libphonenumber-js'

// Valida un número en formato E.164 (el que produce <PhoneInput>)
export function isValidWhatsapp(phone) {
  if (!phone) return false
  try {
    return isValidPhoneNumber(phone)
  } catch {
    return false
  }
}

// Normaliza CUALQUIER número guardado (E.164 nuevo o texto libre argentino
// legacy) a formato marcable "+<código país><número>". null si no hay nada usable.
export function toDialableE164(phone) {
  const trimmed = String(phone ?? '').trim()
  if (!trimmed) return null
  if (trimmed.startsWith('+')) {
    const cleaned = trimmed.replace(/[^\d+]/g, '')
    return cleaned.length > 1 ? cleaned : null
  }
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return null
  const cleaned = digits.startsWith('15') ? '11' + digits.slice(2) : digits
  return `+549${cleaned}`
}

// Única función usada en TODO el proyecto para armar un link de wa.me.
// `text` ya viene armado por el caller (mensaje final, sin encodear).
export function buildWaLink(phone, text) {
  const dialable = toDialableE164(phone)
  if (!dialable) return null
  const digits = dialable.replace(/\D/g, '')
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${digits}${query}`
}

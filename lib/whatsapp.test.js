import { describe, it, expect } from 'vitest'
import { toDialableE164, buildWaLink, isValidWhatsapp } from './whatsapp'

describe('toDialableE164', () => {
  it('normaliza un número argentino local sin código de país', () => {
    expect(toDialableE164('1130001234')).toBe('+5491130001234')
  })

  it('convierte el viejo prefijo "15" a "11"', () => {
    expect(toDialableE164('1512345678')).toBe('+5491112345678')
  })

  it('deja pasar un E.164 ya armado, solo limpiando caracteres no numéricos', () => {
    expect(toDialableE164('+54 9 11 2345-6789')).toBe('+5491123456789')
  })

  it('devuelve null para un valor vacío', () => {
    expect(toDialableE164('')).toBeNull()
    expect(toDialableE164(null)).toBeNull()
    expect(toDialableE164(undefined)).toBeNull()
  })

  it('devuelve null para "+" solo, sin dígitos', () => {
    expect(toDialableE164('+')).toBeNull()
  })
})

describe('buildWaLink', () => {
  it('arma el link con texto pre-cargado', () => {
    expect(buildWaLink('1130001234', 'Hola!')).toBe('https://wa.me/5491130001234?text=Hola!')
  })

  it('arma el link sin query de texto cuando no se pasa texto', () => {
    expect(buildWaLink('1130001234')).toBe('https://wa.me/5491130001234')
  })

  it('devuelve null si no hay número aprovechable', () => {
    expect(buildWaLink('', 'Hola!')).toBeNull()
  })
})

describe('isValidWhatsapp', () => {
  it('acepta un número argentino válido en E.164', () => {
    expect(isValidWhatsapp('+5491123456789')).toBe(true)
  })

  it('acepta un número de otro país en E.164 (no asume Argentina)', () => {
    expect(isValidWhatsapp('+34612345678')).toBe(true)
  })

  it('rechaza un número incompleto o inválido', () => {
    expect(isValidWhatsapp('123')).toBe(false)
  })

  it('rechaza valores vacíos', () => {
    expect(isValidWhatsapp('')).toBe(false)
    expect(isValidWhatsapp(null)).toBe(false)
  })
})

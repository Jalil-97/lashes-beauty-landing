import { describe, it, expect } from 'vitest'
import { calcularDescuento, validarCupon } from './cupones'

describe('calcularDescuento', () => {
  it('calcula un porcentaje y redondea al entero más cercano', () => {
    expect(calcularDescuento({ tipo: 'porcentaje', valor: 15 }, 49999)).toBe(7500)
  })

  it('devuelve 0 si no hay cupón o precio', () => {
    expect(calcularDescuento(null, 49999)).toBe(0)
    expect(calcularDescuento({ tipo: 'porcentaje', valor: 15 }, 0)).toBe(0)
  })

  it('devuelve el valor fijo redondeado para tipo "fijo"', () => {
    expect(calcularDescuento({ tipo: 'fijo', valor: 1000.4 }, 49999)).toBe(1000)
  })
})

describe('validarCupon', () => {
  const antesDelLimite = new Date('2026-09-01T12:00:00')
  const despuesDelLimite = new Date('2026-10-01T12:00:00')

  it('acepta un cupón vigente para el curso correcto', () => {
    const r = validarCupon('TREND10', 'lash-trends', antesDelLimite)
    expect(r.ok).toBe(true)
    expect(r.cupon.codigo).toBe('TREND10')
  })

  it('normaliza el código a mayúsculas antes de comparar', () => {
    const r = validarCupon('trend10', 'lash-trends', antesDelLimite)
    expect(r.ok).toBe(true)
  })

  it('rechaza un código inexistente', () => {
    const r = validarCupon('ASDF123', 'lash-trends', antesDelLimite)
    expect(r).toEqual({ ok: false, motivo: 'no_encontrado' })
  })

  it('rechaza un cupón vencido', () => {
    const r = validarCupon('TREND10', 'lash-trends', despuesDelLimite)
    expect(r).toEqual({ ok: false, motivo: 'vencido' })
  })

  it('rechaza un cupón que no aplica a otro curso', () => {
    const r = validarCupon('TREND10', 'korean-lift-online', antesDelLimite)
    expect(r).toEqual({ ok: false, motivo: 'no_aplica' })
  })

  it('rechaza un código vacío', () => {
    const r = validarCupon('', 'lash-trends', antesDelLimite)
    expect(r).toEqual({ ok: false, motivo: 'no_encontrado' })
  })
})

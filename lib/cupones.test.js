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

  it('un fijo nunca supera el precio del curso', () => {
    expect(calcularDescuento({ tipo: 'fijo', valor: 60000 }, 49999)).toBe(49999)
  })

  it('LASHCLUB (fijo 15000) sobre Lash Trends descuenta 15000 → total 34999', () => {
    const r = validarCupon('LASHCLUB', 'lash-trends', new Date('2026-10-20T12:00:00'))
    expect(r.ok).toBe(true)
    const descuento = calcularDescuento(r.cupon, 49999)
    expect(descuento).toBe(15000)
    expect(49999 - descuento).toBe(34999)
  })
})

describe('validarCupon', () => {
  const antesDelLimite = new Date('2026-09-01T12:00:00')
  const despuesDelLimite = new Date('2026-10-01T12:00:00')

  it('acepta un cupón vigente para el curso correcto', () => {
    const r = validarCupon('TRENDS10', 'lash-trends', antesDelLimite)
    expect(r.ok).toBe(true)
    expect(r.cupon.codigo).toBe('TRENDS10')
  })

  it('normaliza el código a mayúsculas antes de comparar', () => {
    const r = validarCupon('trends10', 'lash-trends', antesDelLimite)
    expect(r.ok).toBe(true)
  })

  it('rechaza un código inexistente', () => {
    const r = validarCupon('ASDF123', 'lash-trends', antesDelLimite)
    expect(r).toEqual({ ok: false, motivo: 'no_encontrado' })
  })

  it('rechaza el código viejo TREND10 (renombrado a TRENDS10)', () => {
    const r = validarCupon('TREND10', 'lash-trends', antesDelLimite)
    expect(r).toEqual({ ok: false, motivo: 'no_encontrado' })
  })

  it('rechaza un cupón vencido', () => {
    const r = validarCupon('TRENDS10', 'lash-trends', despuesDelLimite)
    expect(r).toEqual({ ok: false, motivo: 'vencido' })
  })

  it('rechaza un cupón que no aplica a otro curso', () => {
    const r = validarCupon('TRENDS10', 'korean-lift-online', antesDelLimite)
    expect(r).toEqual({ ok: false, motivo: 'no_aplica' })
  })

  it('LASHCLUB rechazado en otro curso y vencido tras el 05/11', () => {
    const antes = new Date('2026-10-20T12:00:00')
    expect(validarCupon('LASHCLUB', 'korean-lift-online', antes)).toEqual({ ok: false, motivo: 'no_aplica' })
    expect(validarCupon('LASHCLUB', 'lash-trends', new Date('2026-11-06T00:30:00')))
      .toEqual({ ok: false, motivo: 'vencido' })
  })

  it('rechaza un código vacío', () => {
    const r = validarCupon('', 'lash-trends', antesDelLimite)
    expect(r).toEqual({ ok: false, motivo: 'no_encontrado' })
  })
})

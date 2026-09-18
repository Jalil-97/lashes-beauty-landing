export const CUPONES = [
  {
    codigo: 'TREND10',
    tipo: 'porcentaje', // preparado para 'fijo' a futuro, hoy solo se usa porcentaje
    valor: 15,
    cursoId: 'lash-trends', // null significaría "todos los cursos"
    fechaLimiteISO: '2026-09-24',
    activo: true,
  },
]

// Monto del descuento en pesos, redondeado al entero más cercano. Se calcula
// SIEMPRE sobre el precio de lista del curso — nunca sobre precioTachado ni
// sobre el precio del kit. Única función de cálculo, usada por cliente y servidor.
export function calcularDescuento(cupon, precioCurso) {
  if (!cupon || !precioCurso) return 0
  if (cupon.tipo === 'porcentaje') return Math.round((precioCurso * cupon.valor) / 100)
  if (cupon.tipo === 'fijo') return Math.round(cupon.valor)
  return 0
}

// Busca y valida un código de cupón contra un curso y una fecha dadas.
// Única función de validación, usada por cliente y servidor, para que
// nunca puedan desincronizarse los criterios de qué cupón es válido.
export function validarCupon(codigo, cursoId, ahora = new Date()) {
  const normalizado = String(codigo ?? '').trim().toUpperCase()
  if (!normalizado) return { ok: false, motivo: 'no_encontrado' }

  const cupon = CUPONES.find(c => c.codigo === normalizado && c.activo)
  if (!cupon) return { ok: false, motivo: 'no_encontrado' }

  const limite = new Date(`${cupon.fechaLimiteISO}T23:59:59`)
  if (ahora > limite) return { ok: false, motivo: 'vencido' }

  if (cupon.cursoId !== null && cupon.cursoId !== cursoId) return { ok: false, motivo: 'no_aplica' }

  return { ok: true, cupon }
}

export const CUPON_MENSAJES = {
  no_encontrado: 'Cupón no encontrado',
  vencido: 'Cupón vencido',
  no_aplica: 'Este cupón no es válido para este curso',
}

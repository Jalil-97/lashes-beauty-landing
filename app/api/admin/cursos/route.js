import { CURSOS } from '@/lib/cursos'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data: alumnas, error } = await supabaseAdmin
    .from('alumnas')
    .select('curso_id, grupo, curso_finalizado')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const counts = {}
  const finalizadoKeys = new Set()

  for (const a of alumnas) {
    const key = `${a.curso_id}|${a.grupo ?? ''}`
    counts[key] = (counts[key] || 0) + 1
    if (a.curso_finalizado) finalizadoKeys.add(key)
  }

  const cursos = CURSOS.map(curso => {
    if (curso.grupos) {
      return {
        id: curso.id,
        nombre: curso.nombre,
        precio: curso.precio,
        precioKit: curso.kit?.disponible ? curso.kit.precio : null,
        fechas: curso.fechas || null,
        tieneCupos: curso.cupos !== null,
        grupos: curso.grupos.map(g => ({
          id: g.id,
          nombre: g.nombre,
          primeraFecha: g.presenciales?.[0] || null,
          alumnas: counts[`${curso.id}|${g.nombre}`] || 0,
          finalizado: finalizadoKeys.has(`${curso.id}|${g.nombre}`),
        })),
      }
    }

    const alumnaCount = Object.entries(counts)
      .filter(([k]) => k.startsWith(`${curso.id}|`))
      .reduce((sum, [, n]) => sum + n, 0)

    return {
      id: curso.id,
      nombre: curso.nombre,
      precio: curso.precio,
      precioKit: curso.kit?.disponible ? curso.kit.precio : null,
      fechas: curso.fechas || null,
      tieneCupos: curso.cupos !== null,
      grupos: null,
      alumnas: alumnaCount,
      finalizado: finalizadoKeys.has(`${curso.id}|`),
    }
  })

  return Response.json({ ok: true, cursos })
}

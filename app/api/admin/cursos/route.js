import { CURSOS } from '@/lib/cursos'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data: alumnas, error } = await supabaseAdmin
    .from('alumnas')
    .select('curso_id, grupo')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const counts = {}
  for (const a of alumnas) {
    const key = `${a.curso_id}|${a.grupo ?? ''}`
    counts[key] = (counts[key] || 0) + 1
  }

  const cursos = CURSOS.map(curso => {
    if (curso.grupos) {
      return {
        id: curso.id,
        nombre: curso.nombre,
        precio: curso.precio,
        precioKit: curso.kit?.disponible ? curso.kit.precio : null,
        cupos: curso.cupos,
        grupos: curso.grupos.map(g => ({
          id: g.id,
          nombre: g.nombre,
          cupos: g.cupos,
          alumnas: counts[`${curso.id}|${g.nombre}`] || 0,
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
      cupos: curso.cupos,
      grupos: null,
      alumnas: alumnaCount,
    }
  })

  return Response.json({ ok: true, cursos })
}

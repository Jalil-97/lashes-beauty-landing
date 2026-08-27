import { CURSOS } from '@/lib/cursos'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data: alumnas, error } = await supabaseAdmin
    .from('alumnas')
    .select('edicion_id, curso_id, curso_finalizado, curso_nombre, fecha_inicio, grupo')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const counts = {}
  const finalizadoKeys = new Set()
  // edicion_id → first-seen row metadata for DB-only edition display
  const dbEdicionMeta = {}

  for (const a of alumnas) {
    if (!a.edicion_id) continue
    counts[a.edicion_id] = (counts[a.edicion_id] || 0) + 1
    if (a.curso_finalizado) finalizadoKeys.add(a.edicion_id)
    if (!dbEdicionMeta[a.edicion_id]) {
      dbEdicionMeta[a.edicion_id] = {
        curso_id: a.curso_id,
        grupo: a.grupo,
        fecha_inicio: a.fecha_inicio,
      }
    }
  }

  const cursos = CURSOS.map(curso => {
    if (curso.grupos) {
      const libEdicionIds = new Set(curso.grupos.map(g => g.edicionId))

      const libGrupos = curso.grupos.map(g => ({
        id: g.id,
        edicionId: g.edicionId,
        nombre: g.nombre,
        primeraFecha: g.presenciales?.[0] || null,
        alumnas: counts[g.edicionId] || 0,
        finalizado: finalizadoKeys.has(g.edicionId),
        sinDefinicion: false,
      }))

      const dbOnlyGrupos = Object.entries(dbEdicionMeta)
        .filter(([eid, meta]) =>
          meta.curso_id === curso.id &&
          !libEdicionIds.has(eid) &&
          !finalizadoKeys.has(eid)
        )
        .map(([eid, meta]) => ({
          id: null,
          edicionId: eid,
          nombre: meta.grupo || meta.fecha_inicio || eid,
          primeraFecha: meta.fecha_inicio || null,
          alumnas: counts[eid] || 0,
          finalizado: false,
          sinDefinicion: true,
        }))

      return {
        id: curso.id,
        nombre: curso.nombre,
        precio: curso.precio,
        precioKit: curso.kit?.disponible ? curso.kit.precio : null,
        fechas: curso.fechas || null,
        tieneCupos: curso.cupos !== null,
        grupos: [...libGrupos, ...dbOnlyGrupos],
      }
    }

    // Non-grouped course
    const libEdicionId = curso.edicionId

    const dbOnlyEdiciones = Object.entries(dbEdicionMeta).filter(
      ([eid, meta]) =>
        meta.curso_id === curso.id &&
        eid !== libEdicionId &&
        !finalizadoKeys.has(eid)
    )

    if (dbOnlyEdiciones.length === 0) {
      return {
        id: curso.id,
        edicionId: curso.edicionId,
        nombre: curso.nombre,
        precio: curso.precio,
        precioKit: curso.kit?.disponible ? curso.kit.precio : null,
        fechas: curso.fechas || null,
        tieneCupos: curso.cupos !== null,
        grupos: null,
        alumnas: counts[curso.edicionId] || 0,
        finalizado: finalizadoKeys.has(curso.edicionId),
      }
    }

    // Temporarily expose as grouped when DB-only active editions exist
    const libGrupo = {
      id: null,
      edicionId: libEdicionId,
      nombre: curso.fechas || curso.nombre,
      primeraFecha: null,
      alumnas: counts[libEdicionId] || 0,
      finalizado: finalizadoKeys.has(libEdicionId),
      sinDefinicion: false,
    }

    const dbOnlyGrupos = dbOnlyEdiciones.map(([eid, meta]) => ({
      id: null,
      edicionId: eid,
      nombre: meta.grupo || meta.fecha_inicio || eid,
      primeraFecha: meta.fecha_inicio || null,
      alumnas: counts[eid] || 0,
      finalizado: false,
      sinDefinicion: true,
    }))

    return {
      id: curso.id,
      nombre: curso.nombre,
      precio: curso.precio,
      precioKit: curso.kit?.disponible ? curso.kit.precio : null,
      fechas: curso.fechas || null,
      tieneCupos: curso.cupos !== null,
      grupos: [libGrupo, ...dbOnlyGrupos],
    }
  })

  return Response.json({ ok: true, cursos })
}

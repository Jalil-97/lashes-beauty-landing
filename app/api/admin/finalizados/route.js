import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('alumnas')
    .select('edicion_id, curso_id, grupo, curso_nombre, fecha_inicio, curso_finalizado')
    .eq('curso_finalizado', true)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Aggregate by edicion_id — keeps curso_id and grupo as descriptive fields for the detail view
  const map = new Map()
  for (const a of data) {
    if (!a.edicion_id) continue
    if (!map.has(a.edicion_id)) {
      map.set(a.edicion_id, {
        key: a.edicion_id,
        edicion_id: a.edicion_id,
        curso_id: a.curso_id,
        grupo: a.grupo,
        curso_nombre: a.curso_nombre || a.edicion_id,
        fecha_inicio: a.fecha_inicio || null,
        alumnas: 0,
      })
    }
    map.get(a.edicion_id).alumnas++
  }

  return Response.json({ ok: true, finalizados: Array.from(map.values()) })
}

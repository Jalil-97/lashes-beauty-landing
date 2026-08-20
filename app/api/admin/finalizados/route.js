import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'
import { CURSOS } from '@/lib/cursos'

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('alumnas')
    .select('curso_id, grupo, curso_nombre, fecha_inicio, curso_finalizado')
    .eq('curso_finalizado', true)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Aggregate by (curso_id, grupo), preferring frozen curso_nombre over live cursos.js name
  const map = new Map()
  for (const a of data) {
    const key = `${a.curso_id}|${a.grupo ?? ''}`
    if (!map.has(key)) {
      const cursoData = CURSOS.find(c => c.id === a.curso_id)
      map.set(key, {
        key,
        curso_id: a.curso_id,
        grupo: a.grupo,
        curso_nombre: a.curso_nombre || cursoData?.nombre || a.curso_id,
        fecha_inicio: a.fecha_inicio || cursoData?.fechas || null,
        alumnas: 0,
      })
    }
    map.get(key).alumnas++
  }

  return Response.json({ ok: true, finalizados: Array.from(map.values()) })
}

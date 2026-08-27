import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

const SELECT_FIELDS = 'id, nombre, apellido, curso_nombre, grupo, edicion_id, curso_finalizado'

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()

  if (q.length < 2) return Response.json({ ok: true, resultados: [] })

  // Escape ILIKE wildcards in user input, then run two separate queries
  // instead of building a raw .or() filter string (avoids PostgREST filter injection)
  const pattern = `%${q.replace(/[%_]/g, '\\$&')}%`

  const [byNombre, byApellido] = await Promise.all([
    supabaseAdmin.from('alumnas').select(SELECT_FIELDS).ilike('nombre', pattern).limit(20),
    supabaseAdmin.from('alumnas').select(SELECT_FIELDS).ilike('apellido', pattern).limit(20),
  ])

  if (byNombre.error) return Response.json({ error: byNombre.error.message }, { status: 500 })
  if (byApellido.error) return Response.json({ error: byApellido.error.message }, { status: 500 })

  const merged = new Map()
  for (const a of [...byNombre.data, ...byApellido.data]) merged.set(a.id, a)

  const resultados = Array.from(merged.values())
    .sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`, 'es'))
    .slice(0, 30)

  return Response.json({ ok: true, resultados })
}

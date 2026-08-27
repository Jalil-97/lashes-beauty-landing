import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('ediciones_vistas')
    .select('edicion_id, alumnas_count')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, vistas: data })
}

export async function POST(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { edicion_id, alumnas_count } = body || {}

  if (!edicion_id || typeof alumnas_count !== 'number') {
    return Response.json({ error: 'Faltan campos: edicion_id, alumnas_count' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('ediciones_vistas')
    .upsert(
      { edicion_id, alumnas_count, updated_at: new Date().toISOString() },
      { onConflict: 'edicion_id' }
    )

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}

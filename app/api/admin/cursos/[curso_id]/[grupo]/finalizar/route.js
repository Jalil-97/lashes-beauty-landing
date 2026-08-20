import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function PATCH(request, ctx) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { curso_id, grupo } = await ctx.params

  let query = supabaseAdmin
    .from('alumnas')
    .update({ curso_finalizado: true })
    .eq('curso_id', curso_id)

  if (grupo === '_') {
    query = query.is('grupo', null)
  } else {
    query = query.eq('grupo', decodeURIComponent(grupo))
  }

  const { error } = await query

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}

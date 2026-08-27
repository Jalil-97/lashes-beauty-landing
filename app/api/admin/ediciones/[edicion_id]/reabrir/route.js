import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function PATCH(request, ctx) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { edicion_id } = await ctx.params

  const { error } = await supabaseAdmin
    .from('alumnas')
    .update({ curso_finalizado: false })
    .eq('edicion_id', decodeURIComponent(edicion_id))

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}

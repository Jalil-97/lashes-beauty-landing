import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function DELETE(request, ctx) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params

  const { error } = await supabaseAdmin.from('pagos').delete().eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}

export async function PATCH(request, ctx) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { monto, medio, fecha, nota } = body || {}

  const updates = {}
  if (monto !== undefined) updates.monto = Number(monto)
  if (medio !== undefined) updates.medio = medio
  if (fecha !== undefined) updates.fecha = fecha
  if (nota !== undefined) updates.nota = nota

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No hay campos para actualizar' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('pagos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, pago: data })
}

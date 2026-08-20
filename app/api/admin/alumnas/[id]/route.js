import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function DELETE(request, ctx) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params

  // Delete associated pagos first (in case no cascade is configured)
  await supabaseAdmin.from('pagos').delete().eq('alumna_id', id)

  const { error } = await supabaseAdmin.from('alumnas').delete().eq('id', id)

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

  const { nombre, apellido, whatsapp, kit, notas } = body || {}

  const updates = {}
  if (nombre !== undefined) updates.nombre = nombre
  if (apellido !== undefined) updates.apellido = apellido
  if (whatsapp !== undefined) updates.whatsapp = whatsapp
  if (kit !== undefined) updates.kit = !!kit
  if (notas !== undefined) updates.notas = notas

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No hay campos para actualizar' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('alumnas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, alumna: data })
}

import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function POST(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { alumna_id, monto, medio, fecha, nota } = body || {}

  if (!alumna_id || monto === undefined || monto === null || !medio || !fecha) {
    return Response.json(
      { error: 'Faltan campos obligatorios: alumna_id, monto, medio, fecha' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('pagos')
    .insert({ alumna_id, monto: Number(monto), medio, fecha, nota: nota || null })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, pago: data }, { status: 201 })
}

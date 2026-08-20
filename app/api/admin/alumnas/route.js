import { CURSOS } from '@/lib/cursos'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const curso_id = searchParams.get('curso_id')
  const grupo = searchParams.get('grupo')

  if (!curso_id) {
    return Response.json({ error: 'curso_id requerido' }, { status: 400 })
  }

  let query = supabaseAdmin
    .from('alumnas')
    .select('*, pagos(*)')
    .eq('curso_id', curso_id)
    .order('fecha_inscripcion', { ascending: true })

  if (grupo) query = query.eq('grupo', grupo)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const alumnas = data.map(a => {
    const totalPagado = (a.pagos || []).reduce((sum, p) => sum + Number(p.monto), 0)
    // Use frozen price fields stored at inscription time, not live cursos.js lookup
    const precioKit = a.kit ? (a.precio_kit || 0) : 0
    const total = (a.precio || 0) + precioKit
    return { ...a, total, totalPagado, saldoPendiente: total - totalPagado }
  })

  return Response.json({ ok: true, alumnas })
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

  const { nombre, apellido, whatsapp, kit, curso_id, grupo, notas } = body || {}

  if (!nombre || !apellido || !whatsapp || !curso_id) {
    return Response.json(
      { error: 'Faltan campos obligatorios: nombre, apellido, whatsapp, curso_id' },
      { status: 400 }
    )
  }

  // Freeze course data at inscription time so future price/name changes don't affect this record
  const cursoData = CURSOS.find(c => c.id === curso_id)
  const precioKit = cursoData?.kit?.disponible ? cursoData.kit.precio : null

  const { data, error } = await supabaseAdmin
    .from('alumnas')
    .insert({
      nombre,
      apellido,
      whatsapp,
      kit: !!kit,
      curso_id,
      grupo: grupo || null,
      notas: notas || null,
      origen: 'manual',
      fecha_inscripcion: new Date().toISOString().split('T')[0],
      curso_finalizado: false,
      curso_nombre: cursoData?.nombre ?? null,
      fecha_inicio: cursoData?.fechas ?? null,
      precio: cursoData?.precio ?? null,
      precio_kit: precioKit,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, alumna: data }, { status: 201 })
}

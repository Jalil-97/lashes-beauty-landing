import { CURSOS } from '@/lib/cursos'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

function isEdicionInCursos(eid) {
  return CURSOS.some(c =>
    c.grupos ? c.grupos.some(g => g.edicionId === eid) : c.edicionId === eid
  )
}

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const edicion_id = searchParams.get('edicion_id')

  if (!edicion_id) {
    return Response.json({ error: 'edicion_id requerido' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('alumnas')
    .select('*, pagos(*)')
    .eq('edicion_id', edicion_id)
    .order('fecha_inscripcion', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const alumnas = data.map(a => {
    const totalPagado = (a.pagos || []).reduce((sum, p) => sum + Number(p.monto), 0)
    // Use frozen price fields stored at inscription time, not live cursos.js lookup
    const precioKit = a.kit ? (a.precio_kit || 0) : 0
    const total = Math.max(0, (a.precio || 0) + precioKit - (a.descuento || 0))
    return { ...a, total, totalPagado, saldoPendiente: total - totalPagado }
  })

  // Edition metadata derived from frozen fields stored at inscription time
  const edicion = data.length > 0 ? {
    curso_id: data[0].curso_id,
    curso_nombre: data[0].curso_nombre || edicion_id,
    fecha_inicio: data[0].fecha_inicio || null,
    grupo: data[0].grupo || null,
    finalizado: data.every(a => a.curso_finalizado),
    sinDefinicion: !isEdicionInCursos(edicion_id),
  } : null

  return Response.json({ ok: true, alumnas, edicion })
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

  const { nombre, apellido, whatsapp, kit, edicion_id, notas, descuento } = body || {}

  if (!nombre || !apellido || !whatsapp || !edicion_id) {
    return Response.json(
      { error: 'Faltan campos obligatorios: nombre, apellido, whatsapp, edicion_id' },
      { status: 400 }
    )
  }

  if (descuento !== undefined && Number(descuento) < 0) {
    return Response.json({ error: 'El descuento no puede ser negativo' }, { status: 400 })
  }

  // Derive course and group from edicion_id — never from client-sent ids
  let cursoData = null
  let grupoData = null
  for (const c of CURSOS) {
    if (c.grupos) {
      const g = c.grupos.find(g => g.edicionId === edicion_id)
      if (g) { cursoData = c; grupoData = g; break }
    } else if (c.edicionId === edicion_id) {
      cursoData = c; break
    }
  }

  const grupo = grupoData?.nombre ?? null
  const precioKitDisponible = cursoData?.kit?.precio ?? null

  const { data, error } = await supabaseAdmin
    .from('alumnas')
    .insert({
      nombre,
      apellido,
      whatsapp,
      kit: !!kit,
      edicion_id,
      curso_id: cursoData?.id ?? null,
      grupo,
      notas: notas || null,
      origen: 'manual',
      fecha_inscripcion: new Date().toISOString().split('T')[0],
      curso_finalizado: false,
      curso_nombre: cursoData?.nombre ?? null,
      fecha_inicio: cursoData?.fechas ?? null,
      precio: cursoData?.precio ?? null,
      precio_kit_disponible: precioKitDisponible,
      precio_kit: !!kit ? (precioKitDisponible ?? 0) : 0,
      descuento: Number(descuento) || 0,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, alumna: data }, { status: 201 })
}

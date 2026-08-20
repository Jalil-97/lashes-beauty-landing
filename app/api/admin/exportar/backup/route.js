import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

function csvCell(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('alumnas')
    .select('*, pagos(*)')
    .order('fecha_inscripcion', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const header = [
    'nombre', 'apellido', 'whatsapp', 'curso_nombre', 'grupo', 'fecha_inicio',
    'fecha_inscripcion', 'kit', 'notas', 'precio', 'precio_kit', 'curso_finalizado',
    'pago_monto', 'pago_fecha', 'pago_medio', 'pago_nota',
  ]

  const rows = []
  for (const a of data || []) {
    const base = [
      a.nombre, a.apellido, a.whatsapp, a.curso_nombre, a.grupo, a.fecha_inicio,
      a.fecha_inscripcion, a.kit ? 'SI' : 'NO', a.notas,
      a.precio, a.precio_kit, a.curso_finalizado ? 'SI' : 'NO',
    ]
    const pagos = a.pagos || []
    if (pagos.length === 0) {
      rows.push([...base, '', '', '', ''])
    } else {
      for (const p of pagos) {
        rows.push([...base, p.monto, p.fecha, p.medio, p.nota])
      }
    }
  }

  const csv = [
    header.join(','),
    ...rows.map(row => row.map(csvCell).join(',')),
  ].join('\n')

  const today = new Date().toISOString().split('T')[0]
  const filename = `backup-alumnas-${today}.csv`
  const BOM = '﻿'

  return new Response(BOM + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

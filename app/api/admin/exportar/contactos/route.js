import supabaseAdmin from '@/lib/supabaseAdmin'
import { verifyAdminSession } from '@/lib/adminAuth'

function normalizePhone(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  return digits.startsWith('15') ? '11' + digits.slice(2) : digits
}

function escapeVcard(str) {
  return (str || '')
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
}

function foldLine(line) {
  if (line.length <= 75) return line
  const chunks = []
  let pos = 0
  while (pos < line.length) {
    const limit = pos === 0 ? 75 : 74
    chunks.push((pos > 0 ? ' ' : '') + line.slice(pos, pos + limit))
    pos += limit
  }
  return chunks.join('\r\n')
}

export async function GET(request) {
  const user = await verifyAdminSession(request)
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const curso_id = searchParams.get('curso_id')
  const grupo = searchParams.get('grupo') || null

  if (!curso_id) {
    return Response.json({ error: 'curso_id requerido' }, { status: 400 })
  }

  // Use or() to catch both false and NULL — SQL's "col = false" excludes NULLs silently
  let query = supabaseAdmin
    .from('alumnas')
    .select('id, nombre, apellido, whatsapp, curso_nombre, grupo, fecha_inicio, contacto_exportado')
    .eq('curso_id', curso_id)
    .or('contacto_exportado.eq.false,contacto_exportado.is.null')

  if (grupo) query = query.eq('grupo', grupo)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const withPhone = (data || []).filter(a => (a.whatsapp || '').replace(/\D/g, '').length > 0)

  if (withPhone.length === 0) {
    return Response.json(
      { error: 'No hay contactos nuevos para exportar. Todas las alumnas ya fueron exportadas o no tienen teléfono cargado.' },
      { status: 404 }
    )
  }

  const cards = withPhone.map(a => {
    const cleanedPhone = normalizePhone(a.whatsapp)
    const fn = escapeVcard(`${a.nombre} ${a.apellido} (${a.curso_nombre || ''})`)
    const n = `${escapeVcard(a.apellido)};${escapeVcard(a.nombre)};;;`
    const tel = `+549${cleanedPhone}`
    const noteRaw = a.grupo
      ? `${a.grupo} · Inicio ${a.fecha_inicio || ''}`
      : (a.fecha_inicio ? `Inicio ${a.fecha_inicio}` : '')

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      foldLine(`FN:${fn}`),
      foldLine(`N:${n}`),
      `TEL;TYPE=CELL:${tel}`,
    ]
    if (noteRaw) lines.push(foldLine(`NOTE:${escapeVcard(noteRaw)}`))
    lines.push('END:VCARD')

    return lines.join('\r\n')
  })

  // Blank line (\r\n\r\n) between cards is required by most parsers (iOS, Android)
  // Final \r\n terminates the last line per the spec
  const vcfContent = cards.join('\r\n\r\n') + '\r\n'

  const ids = withPhone.map(a => a.id)
  await supabaseAdmin
    .from('alumnas')
    .update({ contacto_exportado: true })
    .in('id', ids)

  const filename = `contactos-${curso_id}-${grupo || 'unico'}.vcf`

  return new Response(vcfContent, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

import { Resend } from 'resend'

const FROM_EMAIL = 'onboarding@resend.dev'

// Escapa valores del usuario antes de interpolarlos en el HTML del email.
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function row(label, value) {
  const v = esc(value).trim() || '—'
  return `
    <tr>
      <td style="padding:8px 12px;font-weight:600;color:#0F0F10;background:#FDE8EB;border-radius:6px 0 0 6px;white-space:nowrap;">${label}</td>
      <td style="padding:8px 12px;color:#2C2C2F;">${v}</td>
    </tr>`
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Body inválido' }, { status: 400 })
  }

  const {
    nombre,
    apellido,
    email,
    whatsapp,
    comoNosConociste,
    curso,
    nivel,
    modalidad,
    metodoPago,
  } = body || {}

  // Validación: nombre, email, curso y whatsapp son obligatorios.
  const required = { nombre, email, curso, whatsapp }
  const faltantes = Object.entries(required)
    .filter(([, value]) => !String(value ?? '').trim())
    .map(([key]) => key)

  if (faltantes.length > 0) {
    return Response.json(
      { ok: false, error: `Faltan campos obligatorios: ${faltantes.join(', ')}` },
      { status: 400 },
    )
  }

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0F0F10;">
    <h2 style="font-family:Georgia,serif;color:#0F0F10;">Nueva inscripción — Lashes Beauty Academy</h2>
    <p style="color:#2C2C2F;">Llegó una nueva pre-inscripción desde la landing:</p>
    <table style="border-collapse:separate;border-spacing:0 6px;width:100%;font-size:14px;">
      ${row('Nombre', `${nombre ?? ''} ${apellido ?? ''}`)}
      ${row('Email', email)}
      ${row('WhatsApp', whatsapp)}
      ${row('Cómo nos conoció', comoNosConociste)}
      ${row('Curso', curso)}
      ${row('Nivel', nivel)}
      ${row('Modalidad', modalidad)}
      ${row('Método de pago', metodoPago)}
    </table>
  </div>`

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `Nueva inscripción — ${nombre} ${apellido ?? ''}`.trim(),
      html,
    })

    if (error) {
      return Response.json(
        { ok: false, error: error.message || 'Error al enviar el email' },
        { status: 500 },
      )
    }

    return Response.json({ ok: true, id: data?.id }, { status: 200 })
  } catch (err) {
    return Response.json(
      { ok: false, error: err?.message || 'Error inesperado al enviar el email' },
      { status: 500 },
    )
  }
}

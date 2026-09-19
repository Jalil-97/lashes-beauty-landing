import { Resend } from 'resend'
import { buildWaLink, isValidWhatsapp } from '@/lib/whatsapp'

const FROM_EMAIL = 'Lashes Beauty Academy <inscripciones@lashesbeautyok.com>'

const rateLimit = new Map()

function checkRateLimit(ip) {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000
  const maxRequests = 5

  const record = rateLimit.get(ip)

  if (!record) {
    rateLimit.set(ip, { count: 1, start: now })
    return true
  }

  if (now - record.start > windowMs) {
    rateLimit.set(ip, { count: 1, start: now })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function POST(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: 'Demasiados intentos. Por favor esperá unos minutos antes de intentar de nuevo.' },
      { status: 429 },
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Body inválido' }, { status: 400 })
  }

  const { nombre, apellido, email, whatsapp, curso } = body || {}

  const required = { nombre, email, whatsapp, curso }
  const faltantes = Object.entries(required)
    .filter(([, value]) => !String(value ?? '').trim())
    .map(([key]) => key)

  if (faltantes.length > 0) {
    return Response.json(
      { ok: false, error: `Faltan campos obligatorios: ${faltantes.join(', ')}` },
      { status: 400 },
    )
  }

  if (!isValidWhatsapp(whatsapp)) {
    return Response.json({ ok: false, error: 'Número de WhatsApp inválido' }, { status: 400 })
  }

  const waUrl = esc(
    buildWaLink(whatsapp, `Hola ${nombre}! Vi tu interés en ${curso}. Te escribo para contarte las próximas fechas disponibles 🙌`) || ''
  )

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:Inter,Arial,sans-serif;">

<div style="max-width:560px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="background:#0F0F10;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
    <div style="font-family:Georgia,serif;font-size:20px;letter-spacing:0.04em;color:#ffffff;">
      LASHES<span style="color:#F7A8B8;">.BEAUTY</span>
    </div>
    <div style="width:40px;height:1px;background:#F7A8B8;opacity:0.4;margin:14px auto 0;"></div>
  </div>

  <!-- Nombre y curso -->
  <div style="background:#1A1A1C;padding:28px 32px;">
    <div style="font-size:11px;color:#C5A880;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">
      Lista de espera
    </div>
    <div style="font-family:Georgia,serif;font-size:22px;color:#ffffff;margin-bottom:4px;">
      ${esc(nombre)} ${esc(apellido ?? '')}
    </div>
    <div style="font-size:13px;color:#A3A3A8;">
      quiere anotarse en la lista de espera de <span style="color:#F7A8B8;">${esc(curso)}</span>
    </div>
  </div>

  <!-- Datos en grid -->
  <div style="background:#111113;padding:24px 32px;">
    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      <tr>
        <td style="background:#1A1A1C;padding:14px 16px;width:50%;border-bottom:1px solid #2C2C2F;border-right:1px solid #2C2C2F;">
          <div style="font-size:10px;color:#A3A3A8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Email</div>
          <div style="font-size:13px;color:#F7A8B8;">${esc(email)}</div>
        </td>
        <td style="background:#1A1A1C;padding:14px 16px;width:50%;border-bottom:1px solid #2C2C2F;">
          <div style="font-size:10px;color:#A3A3A8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">WhatsApp</div>
          <div style="font-size:13px;color:#ffffff;">${esc(whatsapp)}</div>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="background:#1A1A1C;padding:14px 16px;">
          <div style="font-size:10px;color:#A3A3A8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Curso</div>
          <div style="font-size:13px;color:#ffffff;">${esc(curso)}</div>
        </td>
      </tr>
    </table>

    <!-- Botón WhatsApp -->
    <a href="${waUrl}"
      style="display:block;background:#25D366;color:#ffffff;text-align:center;padding:14px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:0.06em;text-decoration:none;">
      Escribirle por WhatsApp →
    </a>
  </div>

  <!-- Footer -->
  <div style="background:#0F0F10;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;border-top:0.5px solid #2C2C2F;">
    <div style="font-size:11px;color:#555;letter-spacing:0.05em;">
      Lashes Beauty Academy · lashesbeautyok.com
    </div>
  </div>

</div>
</body>
</html>`

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `Lista de espera — ${curso} — ${nombre} ${apellido ?? ''}`.trim(),
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

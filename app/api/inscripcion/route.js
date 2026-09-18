import { Resend } from 'resend'
import { CURSOS } from '@/lib/cursos'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { buildWaLink, isValidWhatsapp } from '@/lib/whatsapp'
import { validarCupon, calcularDescuento } from '@/lib/cupones'

const FROM_EMAIL = 'Lashes Beauty Academy <inscripciones@lashesbeautyok.com>'

// Mismo número que usa components/ui/WhatsAppFloat.jsx y
// components/sections/ContactForm.jsx (MICA_WHATSAPP) — mantenerlos
// sincronizados si cambia.
const ACADEMIA_WHATSAPP = '+5491173657355'

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

// Intenta guardar la alumna en Supabase, con un reintento si el primer intento falla.
// Nunca lanza — devuelve true/false para que el caller decida si hace falta alertar.
async function insertAlumnaConReintento(payload) {
  for (let intento = 1; intento <= 2; intento++) {
    try {
      const { error } = await supabaseAdmin.from('alumnas').insert(payload)
      if (!error) return true
      console.error(`Error al guardar alumna en Supabase (intento ${intento}):`, error.message)
    } catch (err) {
      console.error(`Error al guardar alumna en Supabase (intento ${intento}):`, err?.message || err)
    }
    if (intento === 1) await new Promise(resolve => setTimeout(resolve, 1500))
  }
  return false
}

// Mail de alerta distinguible del aviso normal — se manda solo si los 2 intentos
// de guardado en Supabase fallaron, para que la inscripción no se pierda en silencio.
function buildAlertaHtml({ nombre, apellido, whatsapp, curso, grupo, kit }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:Inter,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 16px;">
  <div style="background:#7f1d1d;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
    <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.04em;">
      ⚠ ALERTA — Inscripción no guardada en el panel
    </div>
  </div>
  <div style="background:#1A1A1C;padding:28px 32px;">
    <p style="font-size:13px;color:#ffffff;line-height:1.7;margin:0 0 20px;">
      El mail de aviso de esta inscripción se mandó bien, pero no se pudo guardar en la
      base de datos del panel (falló dos veces). Cargala a mano desde "Agregar alumna"
      con estos datos:
    </p>
    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;">
      ${row('Nombre', nombre)}
      ${row('Apellido', apellido)}
      ${row('WhatsApp', whatsapp)}
      ${row('Curso', curso)}
      ${row('Grupo', grupo)}
      ${row('Kit', kit ? 'Sí' : 'No')}
    </table>
  </div>
  <div style="background:#0F0F10;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;border-top:0.5px solid #2C2C2F;">
    <div style="font-size:11px;color:#555;letter-spacing:0.05em;">
      Lashes Beauty Academy · lashesbeautyok.com
    </div>
  </div>
</div>
</body>
</html>`
}

// Mail de confirmación a la alumna — sin precio ni detalle adicional del
// curso, solo saludo + confirmación + botón de WhatsApp a la academia.
function buildConfirmacionAlumnaHtml({ nombre, curso }) {
  const waUrl = esc(
    buildWaLink(ACADEMIA_WHATSAPP, `Hola! Soy ${nombre}, acabo de inscribirme a ${curso} y quería consultarles algo.`) || ''
  )
  return `<!DOCTYPE html>
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

  <!-- Contenido -->
  <div style="background:#1A1A1C;padding:32px;">
    <div style="font-family:Georgia,serif;font-size:22px;color:#ffffff;margin-bottom:14px;">
      ¡Hola ${esc(nombre)}!
    </div>
    <p style="font-size:14px;color:#A3A3A8;line-height:1.7;margin:0 0 24px;">
      Recibimos tu pre-inscripción a <span style="color:#F7A8B8;">${esc(curso)}</span>. En breve nos
      contactamos con vos por WhatsApp para confirmar tu lugar. Si querés escribirnos antes, hacelo
      desde el botón de abajo.
    </p>
    <a href="${waUrl}"
      style="display:block;background:#25D366;color:#ffffff;text-align:center;padding:14px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:0.06em;text-decoration:none;">
      Escribirnos por WhatsApp →
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
}

// Manda el mail de confirmación a la alumna — nunca lanza y nunca devuelve
// error al caller, para que un fallo acá no afecte la respuesta al formulario
// ni dependa de si el mail a Mica o el guardado en Supabase funcionaron.
async function enviarConfirmacionAlumna(resend, { nombre, email, curso }) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Recibimos tu inscripción — Lashes Beauty Academy',
      html: buildConfirmacionAlumnaHtml({ nombre, curso }),
    })
    if (error) console.error('Error al mandar el mail de confirmación a la alumna:', error.message)
  } catch (err) {
    console.error('Error al mandar el mail de confirmación a la alumna:', err?.message || err)
  }
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

  const {
    nombre,
    apellido,
    email,
    whatsapp,
    comoNosConociste,
    curso,
    nivel,
    grupo,
    modalidad,
    metodoPago,
    kit,
    cupon,
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

  if (!isValidWhatsapp(whatsapp)) {
    return Response.json({ ok: false, error: 'Número de WhatsApp inválido' }, { status: 400 })
  }

  const cursoData = CURSOS.find(c => c.nombre === String(curso ?? '').trim())
  const kitPrecio = kit && cursoData?.kit?.disponible ? cursoData.kit.precio : null

  // Re-validación server-side del cupón — nunca confiar en si el cliente ya
  // lo daba por válido. Un código inválido/vencido/manipulado se ignora en
  // silencio: el cupón es un plus, no un requisito para completar la inscripción.
  const cuponValidado = validarCupon(cupon, cursoData?.id)
  const descuento = cuponValidado.ok ? calcularDescuento(cuponValidado.cupon, cursoData?.precio ?? 0) : 0

  // Derive edicion_id from the course + group selection
  let edicionId = null
  if (cursoData?.grupos && grupo) {
    const grupoData = cursoData.grupos.find(g => g.nombre === grupo)
    edicionId = grupoData?.edicionId ?? null
  } else if (cursoData) {
    edicionId = cursoData.edicionId ?? null
  }

  const waUrl = esc(
    buildWaLink(whatsapp, `Hola ${nombre}! Recibí tu pre-inscripción: ${curso}. Te contacto para coordinar el pago 🙌`) || ''
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
      Nueva inscripción
    </div>
    <div style="font-family:Georgia,serif;font-size:22px;color:#ffffff;margin-bottom:4px;">
      ${esc(nombre)} ${esc(apellido ?? '')}
    </div>
    <div style="font-size:13px;color:#A3A3A8;">
      quiere anotarse al <span style="color:#F7A8B8;">${esc(curso)}</span>
    </div>
  </div>

  <!-- Datos en grid -->
  <div style="background:#111113;padding:24px 32px;">
    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;margin-bottom:16px;">
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
        <td style="background:#1A1A1C;padding:14px 16px;border-bottom:1px solid #2C2C2F;border-right:1px solid #2C2C2F;">
          <div style="font-size:10px;color:#A3A3A8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Nivel</div>
          <div style="font-size:13px;color:#ffffff;">${esc(nivel ?? '')}</div>
        </td>
        <td style="background:#1A1A1C;padding:14px 16px;border-bottom:1px solid #2C2C2F;">
          <div style="font-size:10px;color:#A3A3A8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Modalidad</div>
          <div style="font-size:13px;color:#ffffff;">${esc(modalidad ?? '')}</div>
        </td>
      </tr>
      <tr>
        <td style="background:#1A1A1C;padding:14px 16px;${grupo ? 'border-bottom:1px solid #2C2C2F;' : ''}border-right:1px solid #2C2C2F;">
          <div style="font-size:10px;color:#A3A3A8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Método de pago</div>
          <div style="font-size:13px;color:#ffffff;">${esc(metodoPago ?? '')}</div>
        </td>
        <td style="background:#1A1A1C;padding:14px 16px;${grupo ? 'border-bottom:1px solid #2C2C2F;' : ''}">
          <div style="font-size:10px;color:#A3A3A8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Nos conoció por</div>
          <div style="font-size:13px;color:#ffffff;">${esc(comoNosConociste ?? '')}</div>
        </td>
      </tr>
      ${grupo ? `
      <tr>
        <td colspan="2" style="background:#1A1A1C;padding:14px 16px;">
          <div style="font-size:10px;color:#A3A3A8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Grupo</div>
          <div style="font-size:13px;color:#ffffff;">${esc(grupo)}</div>
        </td>
      </tr>` : ''}
    </table>

    <!-- Resumen financiero -->
    <div style="background:#1A1A1C;border:0.5px solid #2C2C2F;border-radius:8px;padding:16px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:12px;color:#A3A3A8;">Precio del curso</span>
        <span style="font-size:13px;color:#ffffff;">$${Number(cursoData?.precio ?? 0).toLocaleString('es-AR')}</span>
      </div>
      ${kitPrecio !== null ? `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:12px;color:#A3A3A8;">Kit de materiales</span>
        <span style="font-size:13px;color:#ffffff;">$${Number(kitPrecio).toLocaleString('es-AR')}</span>
      </div>` : ''}
      <div style="border-top:0.5px solid #2C2C2F;padding-top:10px;margin-top:4px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;color:#ffffff;font-weight:600;">Total</span>
        <span style="font-size:16px;color:#F7A8B8;font-weight:600;">$${(Number(cursoData?.precio ?? 0) + Number(kitPrecio ?? 0)).toLocaleString('es-AR')}</span>
      </div>
    </div>

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

    // Mail a Mica y mail de confirmación a la alumna van en paralelo — el
    // segundo nunca lanza ni rechaza (ver enviarConfirmacionAlumna), así que
    // no puede afectar este Promise.all ni demorar la respuesta al formulario.
    const [{ data, error }] = await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: process.env.TO_EMAIL,
        subject: `${curso} — ${nombre} ${apellido ?? ''}`.trim(),
        html,
      }),
      enviarConfirmacionAlumna(resend, { nombre, email, curso }),
    ])

    if (error) {
      return Response.json(
        { ok: false, error: error.message || 'Error al enviar el email' },
        { status: 500 },
      )
    }

    const precioKitDisponible = cursoData?.kit?.precio ?? null
    const guardada = await insertAlumnaConReintento({
      nombre,
      apellido: apellido || null,
      whatsapp,
      edicion_id: edicionId,
      curso_id: cursoData?.id || null,
      grupo: grupo || null,
      kit: !!kit,
      notas: cuponValidado.ok ? `Cupón aplicado: ${cuponValidado.cupon.codigo}` : null,
      descuento,
      origen: 'web',
      fecha_inscripcion: new Date().toISOString().split('T')[0],
      curso_finalizado: false,
      // Freeze course data at inscription time
      curso_nombre: cursoData?.nombre ?? null,
      fecha_inicio: cursoData?.fechas ?? null,
      precio: cursoData?.precio ?? null,
      precio_kit_disponible: precioKitDisponible,
      precio_kit: !!kit ? (precioKitDisponible ?? 0) : 0,
    })

    if (!guardada) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: process.env.TO_EMAIL,
          subject: 'ALERTA: inscripción no guardada en el panel',
          html: buildAlertaHtml({ nombre, apellido, whatsapp, curso, grupo, kit }),
        })
      } catch (alertErr) {
        console.error('No se pudo enviar el mail de alerta de inscripción no guardada:', alertErr?.message || alertErr)
      }
    }

    return Response.json({ ok: true, id: data?.id }, { status: 200 })
  } catch (err) {
    return Response.json(
      { ok: false, error: err?.message || 'Error inesperado al enviar el email' },
      { status: 500 },
    )
  }
}

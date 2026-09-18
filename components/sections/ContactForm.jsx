'use client'

import { useState, useEffect } from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { CURSOS } from '@/lib/cursos'
import { isValidWhatsapp, buildWaLink } from '@/lib/whatsapp'
import { validarCupon, calcularDescuento, CUPON_MENSAJES } from '@/lib/cupones'
import { Landmark, CreditCard, Banknote } from 'lucide-react'

const PAY_LABELS = {
  card: 'Tarjeta de crédito o débito',
  bank: 'Transferencia',
  cash: 'Efectivo',
  paypal: 'PayPal',
}

// Mismo número que usa components/ui/WhatsAppFloat.jsx — mantenerlos
// sincronizados si cambia. Con "+" adelante para que toDialableE164()
// lo trate como E.164 ya armado (el string de WhatsAppFloat no lleva "+").
const MICA_WHATSAPP = '+5491173657355'

const DATOS_TRANSFERENCIA = {
  activo: true, // apagador manual por si hay que sacarlo rápido
  titular: 'Micaela Rocio Sala',
  alias: 'micaelaasala.mp',
  cvu: '0000003100035756324843', // CVU de Mercado Pago, no CBU bancario tradicional
  plataforma: 'Mercado Pago',
  cuit: '23401282874', // guardado por si hace falta a futuro — NO mostrar en
                         // el cartel de la alumna, no hace falta para
                         // transferir por alias/CVU y expone un dato
                         // personal de Mica sin necesidad real
}

const PAYPAL_PATH = 'M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.291-.077.443-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.1zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z'

function getCurso(nombre) {
  return CURSOS.find(c => c.nombre === nombre)
}

function getModalidad(nombre) {
  return getCurso(nombre)?.modalidad || ''
}

export default function ContactForm({ preselectedCourse }) {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  // Paso 1
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [origen, setOrigen] = useState('')

  // Paso 2
  const [curso, setCurso] = useState('')
  const [nivel, setNivel] = useState('')

  // Paso 3
  const [payMethod, setPayMethod] = useState('')
  const [terms, setTerms] = useState(false)
  const [grupo, setGrupo] = useState('')
  const [kitSeleccionado, setKitSeleccionado] = useState(false)
  const [cuponAbierto, setCuponAbierto] = useState(false)
  const [cuponInput, setCuponInput] = useState('')

  // Lista de espera
  const [listaEsperaOk, setListaEsperaOk] = useState(false)
  const [listaEsperaSending, setListaEsperaSending] = useState(false)
  const [listaEsperaError, setListaEsperaError] = useState('')

  useEffect(() => {
    if (preselectedCourse) setCurso(preselectedCourse)
  }, [preselectedCourse])

  function goStep(n) {
    setErrors({})
    setStep(n)
    document.getElementById('s-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function clearError(field) {
    setErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const isEmailValid = (v) => /^\S+@\S+\.\S+$/.test(v.trim())

  function validateStep1() {
    const e = {}
    if (!nombre.trim()) e.nombre = 'Ingresá tu nombre'
    if (!apellido.trim()) e.apellido = 'Ingresá tu apellido'
    if (!email.trim()) e.email = 'Ingresá tu email'
    else if (!isEmailValid(email)) e.email = 'Ingresá un email válido'
    if (!whatsapp.trim()) e.whatsapp = 'Ingresá tu WhatsApp'
    else if (!isValidWhatsapp(whatsapp)) e.whatsapp = 'Ingresá un número de WhatsApp válido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e = {}
    if (!curso) e.curso = 'Elegí un curso'
    else if (getCurso(curso)?.soldOut) e.soldOut = true
    if (!nivel) e.nivel = 'Elegí tu nivel actual'
    else if (getCurso(curso)?.nivelRequerido === 'con-experiencia' && nivel === 'Principiante')
      e.nivel = 'Este curso requiere conocimientos previos. Te recomendamos comenzar con De Cero a Lash Artist o Lash Dúo.'
    if (getCurso(curso)?.grupos && !grupo) e.grupo = 'Por favor seleccioná un grupo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep3() {
    const e = {}
    if (!payMethod) e.payMethod = 'Elegí un método de pago'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function nextFrom(n) {
    if (n === 1 && !validateStep1()) return
    if (n === 2 && !validateStep2()) return
    goStep(n + 1)
  }

  function fieldError(name) {
    if (!errors[name]) return null
    return (
      <p className="field-error" role="alert"
        style={{ color: '#e5484d', fontSize: '0.8rem', marginTop: '6px' }}>
        {errors[name]}
      </p>
    )
  }

  async function submit() {
    if (sending) return
    if (!validateStep3()) return
    setError('')
    setSending(true)
    try {
      const res = await fetch('/api/inscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          whatsapp,
          comoNosConociste: origen,
          curso,
          nivel,
          grupo: grupo || undefined,
          modalidad: getModalidad(curso),
          metodoPago: PAY_LABELS[payMethod] || payMethod,
          kit: kitSeleccionado,
          cupon: cuponInput.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'request failed')
      }
      setSubmitted(true)
      document.getElementById('s-form')?.scrollIntoView({ behavior: 'smooth' })
    } catch (err) {
      setError(err?.message && err.message !== 'request failed'
        ? err.message
        : 'Hubo un error al enviar. Intentá de nuevo.')
    } finally {
      setSending(false)
    }
  }

  async function sendListaEspera() {
    if (listaEsperaSending) return
    setListaEsperaError('')
    setListaEsperaSending(true)
    try {
      const res = await fetch('/api/lista-espera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, email, whatsapp, curso }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'request failed')
      }
      setListaEsperaOk(true)
      document.getElementById('s-form')?.scrollIntoView({ behavior: 'smooth' })
    } catch (err) {
      setListaEsperaError(
        err?.message && err.message !== 'request failed'
          ? err.message
          : 'Hubo un error. Intentá de nuevo.'
      )
    } finally {
      setListaEsperaSending(false)
    }
  }

  const stepClass = (n) => {
    if (n < step) return 'step done'
    if (n === step) return 'step active'
    return 'step'
  }

  const cursoSoldOut = !!(curso && getCurso(curso)?.soldOut)
  const isOnline = getCurso(curso)?.modalidad === 'Online'

  // Validación en vivo del cupón — misma función que revalida el servidor,
  // para que nunca puedan desincronizarse los criterios de qué cupón aplica.
  const cuponValidacion = cuponInput.trim() ? validarCupon(cuponInput, getCurso(curso)?.id) : null
  const cuponAplicado = cuponValidacion?.ok ? cuponValidacion.cupon : null
  const descuento = cuponAplicado ? calcularDescuento(cuponAplicado, getCurso(curso)?.precio) : 0

  // Única fuente del total — usado tanto en el resumen del paso 3 como
  // en el bloque de datos de transferencia post-envío, nunca recalculado.
  // El descuento se calcula sobre el precio del curso, nunca sobre el kit.
  const total = getCurso(curso)
    ? Math.max(0, getCurso(curso).precio + (kitSeleccionado && getCurso(curso)?.kit?.precio ? getCurso(curso).kit.precio : 0) - descuento)
    : 0

  const transferenciaDisponible = isOnline && payMethod === 'bank'
    && DATOS_TRANSFERENCIA.activo
    && !!DATOS_TRANSFERENCIA.titular && !!DATOS_TRANSFERENCIA.alias && !!DATOS_TRANSFERENCIA.cvu

  const waTransferLink = transferenciaDisponible
    ? buildWaLink(MICA_WHATSAPP, `Hola Mica! Soy ${nombre}, terminé mi inscripción a ${curso} y te comparto el comprobante de la transferencia:`)
    : null

  const sectionHeader = (
    <div className="sec-hd">
      <div className="tag tag-center">Inscripción</div>
      <h2>Reservá tu <em>lugar</em></h2>
      <p>Cupos limitados — trabajamos con grupos exclusivos de hasta 6 alumnas para asegurar una experiencia más personalizada.</p>
    </div>
  )

  if (listaEsperaOk) {
    return (
      <section className="section" id="s-form">
        {sectionHeader}
        <div className="form-wrap">
          <div className="success-screen">
            <div className="success-icon">✓</div>
            <h3>¡Te anotamos en la <em>lista de espera</em>!</h3>
            <p>
              Cuando haya nuevas fechas para {curso}, vas a ser una de las primeras en enterarte.
              ¡Gracias por tu interés!
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (submitted) {
    return (
      <section className="section" id="s-form">
        <style>{`
          .transfer-block {
            background: rgba(247,168,184,0.06);
            border: 1px solid rgba(247,168,184,0.3);
            border-radius: 10px;
            padding: 22px 24px;
            max-width: 400px;
            margin: 28px auto 0;
            text-align: left;
          }
          .transfer-block h4 {
            color: var(--pk);
            font-size: 1rem;
            margin: 0 0 10px;
            text-align: center;
          }
          .transfer-block > p {
            color: var(--mt);
            font-size: .82rem;
            line-height: 1.6;
            margin: 0 0 16px;
            text-align: center;
          }
          .transfer-block > p strong { color: var(--wh); }
          .transfer-data {
            background: var(--bk);
            border: 1px solid var(--mg);
            border-radius: 8px;
            padding: 14px 16px;
            margin-bottom: 16px;
          }
          .transfer-row { display: flex; justify-content: space-between; gap: 12px; font-size: .82rem; margin-bottom: 8px; }
          .transfer-row:last-child { margin-bottom: 0; }
          .transfer-row span:first-child { color: var(--mt); flex-shrink: 0; }
          .transfer-row span:last-child { color: var(--wh); font-weight: 500; text-align: right; word-break: break-all; }
          .transfer-wa-btn {
            display: block;
            width: 100%;
            box-sizing: border-box;
            text-align: center;
            padding: 12px;
            background: #25D366;
            color: #fff;
            font-family: var(--fb);
            font-size: .85rem;
            font-weight: 600;
            border-radius: 6px;
            text-decoration: none;
            transition: var(--tr);
          }
          .transfer-wa-btn:hover { opacity: .9; }
        `}</style>
        {sectionHeader}
        <div className="form-wrap">
          <div className="success-screen">
            <div className="success-icon">✓</div>
            <h3>¡Solicitud <em>enviada</em>!</h3>
            <p>
              {transferenciaDisponible
                ? 'Recibimos tu pre-inscripción.'
                : 'Recibimos tu pre-inscripción. Te contactamos en menos de 24hs por WhatsApp para confirmar tu lugar y coordinar el pago.'}
            </p>
            <div className="success-detail">
              <div className="sd-row"><span>Nombre</span><span>{`${nombre} ${apellido}`.trim() || '—'}</span></div>
              <div className="sd-row"><span>Curso</span><span>{curso || '—'}</span></div>
              <div className="sd-row"><span>Modalidad</span><span>{getModalidad(curso) || '—'}</span></div>
            </div>
            {!transferenciaDisponible && (
              <p className="success-note">
                Revisá tu WhatsApp — te llegará confirmación dentro de las próximas horas.
              </p>
            )}
            {transferenciaDisponible && (
              <div className="transfer-block">
                <h4>Un último paso para confirmar tu lugar</h4>
                <p>
                  Transferí <strong>${total.toLocaleString('es-AR')}</strong> por {DATOS_TRANSFERENCIA.plataforma} a:
                </p>
                <div className="transfer-data">
                  <div className="transfer-row"><span>Alias</span><span>{DATOS_TRANSFERENCIA.alias}</span></div>
                  <div className="transfer-row"><span>Titular</span><span>{DATOS_TRANSFERENCIA.titular}</span></div>
                  <div className="transfer-row"><span>CVU</span><span>{DATOS_TRANSFERENCIA.cvu}</span></div>
                </div>
                {waTransferLink && (
                  <a className="transfer-wa-btn" href={waTransferLink} target="_blank" rel="noopener noreferrer">
                    Enviar comprobante por WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section" id="s-form">
      <style>{`
        .fc-phone {
          display: flex;
          align-items: center;
          width: 100%;
          background: var(--bk);
          border: 1px solid var(--mg);
          border-radius: 5px;
          padding: 0 14px;
          transition: var(--tr);
        }
        .fc-phone:focus-within { border-color: var(--pk); }
        .fc-phone .PhoneInputCountry {
          margin-right: 10px;
          border-right: 1px solid var(--mg);
          padding-right: 10px;
        }
        .fc-phone .PhoneInputCountrySelect { background: var(--bk); color: var(--wh); }
        .fc-phone .PhoneInputCountryIcon { box-shadow: none; }
        .fc-phone-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 11px 0;
          color: var(--wh);
          font-family: var(--fb);
          font-size: .88rem;
        }
        .fc-phone-input::placeholder { color: var(--lg); }
      `}</style>
      {sectionHeader}

      <div className="form-wrap">
        <div className="form-inner" id="form-inner">

          {/* Sidebar */}
          <div className="form-side">
            <div>
              <h3>Tu próximo paso <em>empieza acá</em></h3>
              <p>
                Completá el formulario y te contactamos en menos de 24hs para confirmar
                disponibilidad y coordinar el pago.
              </p>
              <div className="urgency">
                <p>⚡ ¡Quedan los últimos lugares disponibles!</p>
              </div>
            </div>
          </div>

          {/* Form main */}
          <div className="form-main">
            {/* Steps indicator */}
            <div className="steps">
              <div className={stepClass(1)} id="step-1">
                <div className="step-n">1</div><span>Tus datos</span>
              </div>
              <div className={`step-line${step > 1 ? ' done' : ''}`} id="line-1" />
              <div className={stepClass(2)} id="step-2">
                <div className="step-n">2</div><span>Tu curso</span>
              </div>
              <div className={`step-line${step > 2 ? ' done' : ''}`} id="line-2" />
              <div className={stepClass(3)} id="step-3">
                <div className="step-n">3</div><span>Pago</span>
              </div>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div id="step-screen-1">
                <div className="frow">
                  <div className="fg">
                    <label>Nombre</label>
                    <input className="fc" type="text" placeholder="Camila"
                      value={nombre} onChange={e => { setNombre(e.target.value); clearError('nombre') }} />
                    {fieldError('nombre')}
                  </div>
                  <div className="fg">
                    <label>Apellido</label>
                    <input className="fc" type="text" placeholder="Pérez"
                      value={apellido} onChange={e => { setApellido(e.target.value); clearError('apellido') }} />
                    {fieldError('apellido')}
                  </div>
                </div>
                <div className="fg">
                  <label>Email</label>
                  <input className="fc" type="email" placeholder="camila@gmail.com"
                    value={email} onChange={e => { setEmail(e.target.value); clearError('email') }} />
                  {fieldError('email')}
                </div>
                <div className="fg">
                  <label>WhatsApp</label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="AR"
                    value={whatsapp || undefined}
                    onChange={(v) => { setWhatsapp(v || ''); clearError('whatsapp') }}
                    placeholder="Ej: 11 2345 6789"
                    className="fc-phone"
                    numberInputProps={{ className: 'fc-phone-input' }}
                  />
                  {fieldError('whatsapp')}
                </div>
                <div className="fg">
                  <label>¿Cómo nos conociste?</label>
                  <select className="fc" value={origen} onChange={e => setOrigen(e.target.value)}>
                    <option value="">Seleccioná</option>
                    <option>Instagram</option>
                    <option>Recomendación de alumna</option>
                    <option>Google</option>
                    <option>Otro</option>
                  </select>
                </div>
                <button className="btn btn-p btn-full" onClick={() => nextFrom(1)}>
                  Continuar →
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div id="step-screen-2">
                <div className="fg">
                  <label>Curso de interés</label>
                  <select className="fc" value={curso} onChange={e => { setCurso(e.target.value); setGrupo(''); setKitSeleccionado(false); setPayMethod(''); clearError('curso'); clearError('grupo') }}>
                    <option value="">Seleccioná un curso</option>
                    {CURSOS.map(c => (
                      <option key={c.id} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                  {fieldError('curso')}
                  {cursoSoldOut && (
                    <p style={{ color: '#A3A3A8', fontSize: '13px', marginTop: '8px', marginBottom: 0 }}>
                      Este curso no tiene cupos disponibles en este momento.
                    </p>
                  )}
                  {curso && getCurso(curso) && !cursoSoldOut && (
                    <div style={{ marginTop: '8px', color: '#A3A3A8', fontSize: '0.82rem', lineHeight: '1.6' }}>
                      <div>Modalidad: {getCurso(curso).modalidad}</div>
                      <div>{getCurso(curso).labelNivel}</div>
                    </div>
                  )}
                </div>

                {/* Lista de espera — sold out */}
                {cursoSoldOut && (
                  <>
                    <button
                      className="btn btn-s btn-full"
                      onClick={sendListaEspera}
                      disabled={listaEsperaSending}
                    >
                      {listaEsperaSending ? 'Enviando...' : 'Quiero anotarme en la lista de espera'}
                    </button>
                    {listaEsperaError && (
                      <p role="alert" style={{ color: '#e5484d', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>
                        {listaEsperaError}
                      </p>
                    )}
                    <div className="nav-btns" style={{ marginTop: '16px' }}>
                      <button className="btn btn-s" style={{ flex: 1 }} onClick={() => goStep(1)}>← Volver</button>
                    </div>
                  </>
                )}

                {/* Flujo normal — no sold out */}
                {!cursoSoldOut && (
                  <>
                    {getCurso(curso)?.grupos && (
                      <div className="fg">
                        <label>Seleccioná tu grupo</label>
                        <select className="fc" value={grupo} onChange={e => { setGrupo(e.target.value); clearError('grupo') }}>
                          <option value="">Seleccioná un grupo</option>
                          {getCurso(curso).grupos.map(g => (
                            <option key={g.id} value={g.nombre} disabled={g.cupos === 0}>
                              {g.cupos === 0
                                ? `${g.nombre} — Sin cupos disponibles`
                                : `${g.nombre} — ${g.cupos} cupo${g.cupos !== 1 ? 's' : ''} disponible${g.cupos !== 1 ? 's' : ''}`}
                            </option>
                          ))}
                        </select>
                        {fieldError('grupo')}
                      </div>
                    )}
                    {getCurso(curso)?.kit?.disponible && (
                      <div className="fg">
                        <label>¿Querés sumar el kit de materiales?</label>
                        <p style={{ fontSize: '12px', color: '#666666', lineHeight: '1.6', marginBottom: '14px' }}>
                          Opcional. Todos los materiales de práctica están incluidos en el curso. El kit es para que puedas empezar a trabajar de forma independiente al terminar.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { value: false, label: 'No por ahora' },
                            { value: true, label: `Sí, quiero el kit — $${getCurso(curso).kit.precio.toLocaleString('es-AR')}` },
                          ].map(opt => (
                            <div
                              key={String(opt.value)}
                              onClick={() => setKitSeleccionado(opt.value)}
                              style={{
                                border: `0.5px solid ${kitSeleccionado === opt.value ? '#F7A8B8' : '#2C2C2F'}`,
                                borderRadius: '8px',
                                padding: '12px 14px',
                                cursor: 'pointer',
                                background: kitSeleccionado === opt.value ? 'rgba(247,168,184,0.06)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                              }}
                            >
                              <div style={{
                                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                                border: `1.5px solid ${kitSeleccionado === opt.value ? '#F7A8B8' : '#A3A3A8'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {kitSeleccionado === opt.value && (
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F7A8B8' }} />
                                )}
                              </div>
                              <span style={{ fontSize: '13px', color: kitSeleccionado === opt.value ? '#fff' : '#A3A3A8' }}>
                                {opt.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="fg">
                      <label>Tu nivel actual</label>
                      <select className="fc" value={nivel} onChange={e => { setNivel(e.target.value); clearError('nivel') }}>
                        <option value="">Seleccioná tu nivel</option>
                        <option value="Principiante">Principiante</option>
                        <option value="Tengo algo de experiencia">Tengo algo de experiencia</option>
                        <option value="Avanzada">Avanzada</option>
                      </select>
                      {fieldError('nivel')}
                    </div>
                    <div className="nav-btns">
                      <button className="btn btn-s" style={{ flex: 1 }} onClick={() => goStep(1)}>← Volver</button>
                      <button className="btn btn-p" style={{ flex: 2 }} onClick={() => nextFrom(2)}>Continuar →</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div id="step-screen-3">
                <div className="fg">
                  <label>Método de pago</label>
                  <div className="pay-methods">
                    {(isOnline
                      ? [
                          { key: 'bank', icon: <Landmark size={22} color="#A3A3A8" />, label: 'Transferencia bancaria' },
                          { key: 'card', icon: <CreditCard size={22} color="#A3A3A8" />, label: 'Tarjeta de crédito o débito — 10% de recargo' },
                          { key: 'paypal', icon: (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="#009CDE">
                              <path d={PAYPAL_PATH} />
                            </svg>
                          ), label: 'PayPal' },
                        ]
                      : [
                          { key: 'cash', icon: <Banknote size={22} color="#A3A3A8" />, label: 'Efectivo — 10% de descuento' },
                          { key: 'bank', icon: <Landmark size={22} color="#A3A3A8" />, label: 'Transferencia bancaria' },
                          { key: 'card', icon: <CreditCard size={22} color="#A3A3A8" />, label: 'Tarjeta de crédito o débito — 10% de recargo' },
                        ]
                    ).map(opt => (
                      <div
                        key={opt.key}
                        className={`pm${payMethod === opt.key ? ' sel' : ''}`}
                        onClick={() => { setPayMethod(opt.key); clearError('payMethod') }}
                      >
                        <div className="pm-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{opt.icon}</div>
                        <div className="pm-label">{opt.label}</div>
                      </div>
                    ))}
                  </div>
                  {fieldError('payMethod')}
                </div>
                <div className="fg">
                  {!cuponAbierto && (
                    <button
                      type="button"
                      onClick={() => setCuponAbierto(true)}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#F7A8B8', fontSize: '.82rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      ¿Tenés un cupón?
                    </button>
                  )}
                  {cuponAbierto && (
                    <>
                      <label>Código de cupón</label>
                      <input
                        className="fc"
                        type="text"
                        value={cuponInput}
                        onChange={e => setCuponInput(e.target.value)}
                      />
                      {cuponInput.trim() && !cuponAplicado && (
                        <p className="field-error" role="alert" style={{ color: '#e5484d', fontSize: '0.8rem', marginTop: '6px' }}>
                          {CUPON_MENSAJES[cuponValidacion.motivo]}
                        </p>
                      )}
                      {cuponAplicado && (
                        <p style={{ color: '#7CD992', fontSize: '0.8rem', marginTop: '6px' }}>
                          Cupón {cuponAplicado.codigo} aplicado — ${descuento.toLocaleString('es-AR')} de descuento
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="summary-box">
                  <div className="summary-row">
                    <span>Curso</span>
                    <span>{getCurso(curso) ? `${curso} — $${getCurso(curso).precio.toLocaleString('es-AR')}` : curso || '—'}</span>
                  </div>
                  {kitSeleccionado && getCurso(curso)?.kit?.disponible && (
                    <div className="summary-row">
                      <span>Kit de materiales</span>
                      <span>${getCurso(curso).kit.precio.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  {grupo && <div className="summary-row"><span>Grupo</span><span>{grupo}</span></div>}
                  <div className="summary-row"><span>Modalidad</span><span>{getModalidad(curso) || '—'}</span></div>
                  {cuponAplicado && (
                    <div className="summary-row">
                      <span>Descuento ({cuponAplicado.codigo})</span>
                      <span>-${descuento.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Total</span>
                    <span>
                      {getCurso(curso) ? (
                        <>
                          {cuponAplicado && (
                            <span style={{ textDecoration: 'line-through', color: '#A3A3A8', fontSize: '.85em', marginRight: '8px' }}>
                              ${(total + descuento).toLocaleString('es-AR')}
                            </span>
                          )}
                          ${total.toLocaleString('es-AR')}
                        </>
                      ) : '—'}
                    </span>
                  </div>
                </div>
                <div className="cb">
                  <input
                    type="checkbox"
                    id="f-terms"
                    checked={terms}
                    onChange={e => setTerms(e.target.checked)}
                  />
                  <label htmlFor="f-terms">
                    Acepto recibir información sobre fechas disponibles e instructivos de
                    pre-inscripción de Lashes Beauty Academy.
                  </label>
                </div>
                <div className="nav-btns">
                  <button
                    className="btn btn-s"
                    style={{ flex: 1 }}
                    onClick={() => goStep(2)}
                    disabled={sending}
                  >← Volver</button>
                  <button
                    className="btn btn-p"
                    style={{ flex: 2, textAlign: 'center' }}
                    onClick={submit}
                    disabled={sending}
                  >
                    {sending ? 'Enviando...' : 'Reservar mi lugar'}
                  </button>
                </div>
                {error && (
                  <p className="form-error" role="alert" style={{ color: '#e5484d', marginTop: '12px', textAlign: 'center' }}>
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

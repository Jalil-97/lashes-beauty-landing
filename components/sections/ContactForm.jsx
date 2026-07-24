'use client'

import { useState, useEffect } from 'react'
import { CURSOS } from '@/lib/cursos'

const PAY_LABELS = {
  card: 'Tarjeta / MP',
  bank: 'Transferencia',
  cash: 'Efectivo',
}

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

  const isWhatsappValid = (v) => {
    if (!/^[+\d\s-]+$/.test(v.trim())) return false
    const digits = v.replace(/\D/g, '').length
    return digits >= 8 && digits <= 15
  }

  function validateStep1() {
    const e = {}
    if (!nombre.trim()) e.nombre = 'Ingresá tu nombre'
    if (!apellido.trim()) e.apellido = 'Ingresá tu apellido'
    if (!email.trim()) e.email = 'Ingresá tu email'
    else if (!isEmailValid(email)) e.email = 'Ingresá un email válido'
    if (!whatsapp.trim()) e.whatsapp = 'Ingresá tu WhatsApp'
    else if (!isWhatsappValid(whatsapp)) e.whatsapp = 'Ingresá un número de WhatsApp válido (ej: 1130001234 o +5491130001234)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e = {}
    if (!curso) e.curso = 'Elegí un curso'
    if (!nivel) e.nivel = 'Elegí tu nivel actual'
    else if (getCurso(curso)?.nivelRequerido === 'con-experiencia' && nivel === 'Principiante')
      e.nivel = 'Este curso requiere conocimientos previos. Te recomendamos comenzar con De Cero a Lash Artist.'
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
          modalidad: getModalidad(curso),
          metodoPago: PAY_LABELS[payMethod] || payMethod,
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

  const stepClass = (n) => {
    if (n < step) return 'step done'
    if (n === step) return 'step active'
    return 'step'
  }

  if (submitted) {
    return (
      <section className="section" id="s-form">
        <div className="sec-hd">
          <div className="tag tag-center">Inscripción</div>
          <h2>Reservá tu <em>lugar</em></h2>
          <p>Cupos limitados — trabajamos con grupos exclusivos de hasta 6 alumnas para asegurar una experiencia más personalizada.</p>
        </div>
        <div className="form-wrap">
          <div className="success-screen">
            <div className="success-icon">✓</div>
            <h3>¡Solicitud <em>enviada</em>!</h3>
            <p>
              Recibimos tu pre-inscripción. Te contactamos en menos de 24hs por WhatsApp
              para confirmar tu lugar y coordinar el pago.
            </p>
            <div className="success-detail">
              <div className="sd-row"><span>Nombre</span><span>{`${nombre} ${apellido}`.trim() || '—'}</span></div>
              <div className="sd-row"><span>Curso</span><span>{curso || '—'}</span></div>
              <div className="sd-row"><span>Modalidad</span><span>{getModalidad(curso) || '—'}</span></div>
            </div>
            <p className="success-note">
              Revisá tu WhatsApp — te llegará confirmación dentro de las próximas horas.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section" id="s-form">
      <div className="sec-hd">
        <div className="tag tag-center">Inscripción</div>
        <h2>Reservá tu <em>lugar</em></h2>
        <p>Cupos limitados — trabajamos con grupos exclusivos de hasta 6 alumnas para asegurar una experiencia más personalizada.</p>
      </div>

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
                  <input className="fc" type="tel" placeholder="+54 11 ..."
                    value={whatsapp} onChange={e => { setWhatsapp(e.target.value); clearError('whatsapp') }} />
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
                  <select className="fc" value={curso} onChange={e => { setCurso(e.target.value); clearError('curso') }}>
                    <option value="">Seleccioná un curso</option>
                    {CURSOS.map(c => (
                      <option key={c.id} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                  {fieldError('curso')}
                  {curso && getCurso(curso) && (
                    <div style={{ marginTop: '8px', color: '#A3A3A8', fontSize: '0.82rem', lineHeight: '1.6' }}>
                      <div>Modalidad: {getCurso(curso).modalidad}</div>
                      <div>{getCurso(curso).labelNivel}</div>
                    </div>
                  )}
                </div>
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
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div id="step-screen-3">
                <div className="fg">
                  <label>Método de pago</label>
                  <div className="pay-methods">
                    <div className={`pm${payMethod === 'card' ? ' sel' : ''}`} onClick={() => { setPayMethod('card'); clearError('payMethod') }}>
                      <div className="pm-icon">💳</div>
                      <div className="pm-label">Tarjeta / MP</div>
                    </div>
                    <div className={`pm${payMethod === 'bank' ? ' sel' : ''}`} onClick={() => { setPayMethod('bank'); clearError('payMethod') }}>
                      <div className="pm-icon">🏦</div>
                      <div className="pm-label">Transferencia</div>
                    </div>
                    <div className={`pm${payMethod === 'cash' ? ' sel' : ''}`} onClick={() => { setPayMethod('cash'); clearError('payMethod') }}>
                      <div className="pm-icon">💵</div>
                      <div className="pm-label">Efectivo</div>
                    </div>
                  </div>
                  {fieldError('payMethod')}
                </div>
                <div className="summary-box">
                  <div className="summary-row"><span>Curso</span><span>{curso || '—'}</span></div>
                  <div className="summary-row"><span>Modalidad</span><span>{getModalidad(curso) || '—'}</span></div>
                  <div className="summary-row">
                    <span>Total</span>
                    <span>{getCurso(curso) ? '$' + getCurso(curso).precio.toLocaleString('es-AR') : '—'}</span>
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

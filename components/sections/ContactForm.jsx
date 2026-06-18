'use client'

import { useState, useEffect } from 'react'

const wspSvg = (
  <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
)

const igSvg = (
  <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
)

const PAY_LABELS = {
  card: 'Tarjeta / MP',
  bank: 'Transferencia',
  cash: 'Efectivo',
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
  const [modalidad, setModalidad] = useState('')

  // Paso 3
  const [payMethod, setPayMethod] = useState('')
  const [plan, setPlan] = useState('full')
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
    if (!modalidad) e.modalidad = 'Elegí una modalidad'
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
          modalidad,
          metodoPago: PAY_LABELS[payMethod] || payMethod,
        }),
      })
      if (!res.ok) throw new Error('request failed')
      setSubmitted(true)
      document.getElementById('s-form')?.scrollIntoView({ behavior: 'smooth' })
    } catch {
      setError('Hubo un error al enviar. Intentá de nuevo.')
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
          <p>Cupos limitados — máximo 4 alumnas por fecha para atención 100% personalizada.</p>
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
              <div className="sd-row"><span>Modalidad</span><span>{modalidad || '—'}</span></div>
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
        <p>Cupos limitados — máximo 4 alumnas por fecha para atención 100% personalizada.</p>
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
                <p>⚡ Quedan <strong>X lugares</strong> disponibles para el próximo turno presencial</p>
              </div>
            </div>
            <div className="contact-links">
              <a className="cl" href="https://wa.me/549XXXXXXXXXX" target="_blank" rel="noopener">
                <div className="cl-icon wsp">{wspSvg}</div>
                <span>WhatsApp directo</span>
              </a>
              <a className="cl" href="https://instagram.com/lashes.beautyacademy" target="_blank" rel="noopener">
                <div className="cl-icon ig">{igSvg}</div>
                <span>@lashes.beautyacademy</span>
              </a>
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
                    <option>Instagram @lashes.beautyacademy</option>
                    <option>Instagram @lashes.beautyok</option>
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
                    <option value="Curso Inicial Completo">Curso Inicial Completo</option>
                    <option value="Perfeccionamiento y Mapping">Perfeccionamiento y Mapping</option>
                    <option value="Especialización Volumen Ruso">Especialización Volumen Ruso</option>
                  </select>
                  {fieldError('curso')}
                </div>
                <div className="fg">
                  <label>Tu nivel actual</label>
                  <div className="radio-group" id="nivel-group">
                    <div
                      className={`radio-opt${nivel === 'Principiante' ? ' sel' : ''}`}
                      onClick={() => { setNivel('Principiante'); clearError('nivel') }}
                    >
                      <input type="radio" name="nivel" readOnly checked={nivel === 'Principiante'} />
                      <div className="r-dot" />
                      <div><h5>Principiante</h5><p>Sin experiencia previa</p></div>
                    </div>
                    <div
                      className={`radio-opt${nivel === 'Lashista activa' ? ' sel' : ''}`}
                      onClick={() => { setNivel('Lashista activa'); clearError('nivel') }}
                    >
                      <input type="radio" name="nivel" readOnly checked={nivel === 'Lashista activa'} />
                      <div className="r-dot" />
                      <div><h5>Lashista activa</h5><p>Busco perfeccionamiento</p></div>
                    </div>
                  </div>
                  {fieldError('nivel')}
                </div>
                <div className="fg">
                  <label>Modalidad preferida</label>
                  <div className="radio-group" id="mod-group">
                    <div
                      className={`radio-opt${modalidad === 'Presencial' ? ' sel' : ''}`}
                      onClick={() => { setModalidad('Presencial'); clearError('modalidad') }}
                    >
                      <input type="radio" name="mod" readOnly checked={modalidad === 'Presencial'} />
                      <div className="r-dot" />
                      <div><h5>Presencial</h5><p>Villa Ballester</p></div>
                    </div>
                    <div
                      className={`radio-opt${modalidad === 'Híbrido' ? ' sel' : ''}`}
                      onClick={() => { setModalidad('Híbrido'); clearError('modalidad') }}
                    >
                      <input type="radio" name="mod" readOnly checked={modalidad === 'Híbrido'} />
                      <div className="r-dot" />
                      <div><h5>Híbrido</h5><p>Online + presencial</p></div>
                    </div>
                  </div>
                  {fieldError('modalidad')}
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
                <div className="fg">
                  <label>Plan de pago</label>
                  <div className="radio-group" id="plan-group">
                    <div
                      className={`radio-opt${plan === 'full' ? ' sel' : ''}`}
                      onClick={() => setPlan('full')}
                    >
                      <input type="radio" name="plan" readOnly checked={plan === 'full'} />
                      <div className="r-dot" />
                      <div><h5>Pago completo</h5><p>$XXX</p></div>
                    </div>
                    <div
                      className={`radio-opt${plan === 'cuotas' ? ' sel' : ''}`}
                      onClick={() => setPlan('cuotas')}
                    >
                      <input type="radio" name="plan" readOnly checked={plan === 'cuotas'} />
                      <div className="r-dot" />
                      <div><h5>Cuotas</h5><p>X × $XXX</p></div>
                    </div>
                  </div>
                </div>
                <div className="summary-box">
                  <div className="summary-row"><span>Curso</span><span>{curso || '—'}</span></div>
                  <div className="summary-row"><span>Modalidad</span><span>{modalidad || '—'}</span></div>
                  <div className="summary-row"><span>Total</span><span>$XXX</span></div>
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

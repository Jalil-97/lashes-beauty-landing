'use client'

import { useState } from 'react'
import { CURSOS } from '@/lib/cursos'

const ALT_TEXTS = {
  'lash-artist': 'Curso De Cero a Lash Artist en Lashes Beauty Academy Villa Ballester',
  'korean-lift': 'Curso Korean Lift Técnica Coreana en Lashes Beauty Academy Villa Ballester',
  'lash-duo': 'Curso Lash Dúo en Lashes Beauty Academy Villa Ballester',
  'lash-trends': 'Curso Lash Trends Efectos en Tendencia en Lashes Beauty Academy',
  'korean-lift-online': 'Curso Korean Lift 100% Online en Lashes Beauty Academy',
}

const COURSES = CURSOS.map(c => ({
  id: c.id,
  cat: c.filtros,
  badge: { label: c.nivelRequerido === 'principiante' ? 'Principiantes' : 'Presencial', style: {} },
  image: c.imagen,
  imgPlaceholder: c.nombre,
  altText: ALT_TEXTS[c.id] || `Curso ${c.nombre} en Lashes Beauty Academy`,
  tags: [c.modalidad, c.nivel],
  title: c.nombre,
  desc: c.descripcion,
  details: [
    { value: c.duracion, label: 'Duración' },
    c.sede ? { value: c.sede, label: 'Sede' } : null,
    c.material ? { value: c.material, label: 'Material' } : null,
    { value: c.certificacion, label: 'Título' },
  ].filter(Boolean),
  nextDates: c.fechas,
  cupos: c.cupos,
  price: '$' + c.precio.toLocaleString('es-AR'),
  priceOld: '$' + c.precioTachado.toLocaleString('es-AR'),
  btnClass: c.nivelRequerido === 'principiante' ? 'btn-p' : 'btn-s',
  soldOut: c.soldOut || false,
  grupos: c.grupos || null,
  virtuales: c.virtuales || null,
}))

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'ini', label: 'Principiantes' },
  { key: 'adv', label: 'Avanzadas' },
  { key: 'hyb', label: 'Híbrido' },
  { key: 'onl', label: 'Online' },
]

export default function Courses({ onPreselect }) {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [modalCurso, setModalCurso] = useState(null)
  const [modalTemario, setModalTemario] = useState(null)

  const visible = COURSES.filter(
    c => activeFilter === 'todos' || c.cat.includes(activeFilter)
  )

  function handleInscribirse(title) {
    if (onPreselect) onPreselect(title)
    document.getElementById('s-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <section className="section alt" id="s-courses">
        <div className="sec-hd">
          <div className="tag tag-center">Formaciones</div>
          <h2>Elegí tu <em>nivel</em></h2>
          <p>Comenzá desde cero o llevá tu técnica al siguiente nivel. Encontrá la formación que te va a permitir convertir tu pasión en una carrera profesional rentable.</p>
        </div>

        <div className="ftabs">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`ftab${activeFilter === f.key ? ' on' : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="courses" id="courses-grid" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '24px', alignItems: 'stretch' }}>
          {visible.map(course => (
            <div className="cc" key={course.id} style={{ maxWidth: '400px', width: '100%', height: '100%' }}>
              {course.soldOut ? (
                <span className="cc-badge" style={{ background: '#2C2C2F', color: '#A3A3A8' }}>SIN CUPOS</span>
              ) : course.badge && (
                <span className="cc-badge" style={course.badge.style}>{course.badge.label}</span>
              )}
              <div className="cc-img" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: '#2C2C2F', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
                  <span style={{ color: '#A3A3A8', fontSize: '0.85rem' }}>{course.imgPlaceholder}</span>
                </div>
                <img
                  src={course.image}
                  alt={course.altText}
                  style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div className="cc-body">
                <div className="mtags">
                  {course.tags.map(t => <span key={t} className="mt-tag">{t}</span>)}
                </div>
                <h3>{course.title}</h3>
                <p className="cd">{course.desc}</p>
                <div className="cc-details">
                  {course.details.map(d => (
                    <div key={d.label} className="di" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#A3A3A8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.label}</span>
                      <strong>{d.value}</strong>
                    </div>
                  ))}
                </div>
                {!course.soldOut && course.nextDates && (
                  <div style={{ fontSize: '0.8rem', color: '#A3A3A8', margin: '10px 0 6px' }}>
                    <span>📅 Próximas fechas: {course.nextDates}</span>
                    {course.cupos > 0 && <span style={{ marginLeft: '12px' }}>👥 {course.cupos} cupos</span>}
                  </div>
                )}
                {!course.soldOut && course.grupos && (
                  <div style={{ fontSize: '0.8rem', margin: '4px 0 10px' }}>
                    <span style={{ color: '#A3A3A8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '2px' }}>Grupos</span>
                    <strong style={{ color: '#F7A8B8' }}>{course.grupos.length} grupo{course.grupos.length !== 1 ? 's' : ''} disponible{course.grupos.length !== 1 ? 's' : ''}</strong>
                  </div>
                )}
                {!course.soldOut && course.grupos && (
                  <button
                    onClick={() => setModalCurso(CURSOS.find(c => c.id === course.id))}
                    style={{
                      background: 'transparent',
                      border: '0.5px solid rgba(247,168,184,0.35)',
                      color: '#F7A8B8',
                      borderRadius: '4px',
                      padding: '10px',
                      fontSize: '12px',
                      letterSpacing: '0.08em',
                      width: '100%',
                      cursor: 'pointer',
                      marginBottom: '12px',
                      fontFamily: 'inherit',
                      textTransform: 'uppercase',
                    }}
                  >
                    Ver calendario
                  </button>
                )}
                <button
                  onClick={() => setModalTemario(CURSOS.find(c => c.id === course.id))}
                  style={{
                    background: 'transparent',
                    border: '0.5px solid rgba(247,168,184,0.35)',
                    color: '#F7A8B8',
                    borderRadius: '4px',
                    padding: '10px',
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    width: '100%',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    fontFamily: 'inherit',
                    textTransform: 'uppercase',
                  }}
                >
                  ¿Qué vas a aprender?
                </button>
                <div className="cc-price">
                  <div style={{ color: '#C5A880', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Precio especial web
                  </div>
                  {course.priceOld && (
                    <span style={{ textDecoration: 'line-through', color: '#A3A3A8', fontSize: '16px', display: 'block', marginBottom: '3px' }}>
                      {course.priceOld}
                    </span>
                  )}
                  <span className="amt" style={{ fontSize: '28px', fontWeight: '700', color: '#F7A8B8' }}>{course.price}</span>
                </div>
                {course.soldOut ? (
                  <button
                    className="btn btn-full"
                    disabled
                    style={{ color: '#A3A3A8', cursor: 'not-allowed', background: 'transparent', border: '0.5px solid #2C2C2F' }}
                  >
                    Sin cupos disponibles
                  </button>
                ) : (
                  <button
                    className="btn btn-p btn-full"
                    onClick={() => handleInscribirse(course.title)}
                  >
                    Inscribirme
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de grupos */}
      {modalCurso && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setModalCurso(null)}
        >
          <div
            style={{ background: '#1A1A1C', border: '0.5px solid #2C2C2F', borderRadius: '12px', width: 'min(480px, 90vw)', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '0.5px solid #2C2C2F' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#fff' }}>{modalCurso.nombre} — Grupos</span>
              <button
                onClick={() => setModalCurso(null)}
                style={{ color: '#A3A3A8', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 0 0 16px' }}
              >×</button>
            </div>

            {/* Nota informativa */}
            <div style={{ margin: '16px 20px 0', background: 'rgba(197,168,128,0.08)', border: '0.5px solid rgba(197,168,128,0.25)', borderRadius: '6px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: '#C5A880', fontSize: '14px', flexShrink: 0 }}>ℹ</span>
              <p style={{ fontSize: '12px', color: '#A3A3A8', lineHeight: '1.7', margin: 0 }}>
                Las clases virtuales son en vivo y quedan grabadas. Podés sumarte aunque el curso haya iniciado, siempre que no haya pasado tu primera práctica presencial.
              </p>
            </div>

            {/* Clases virtuales */}
            {modalCurso.virtuales && (
              <div style={{ padding: '16px 20px 0' }}>
                <div style={{ fontSize: '10px', color: '#C5A880', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>
                  {modalCurso.grupos && modalCurso.grupos.length > 1 ? 'CLASES VIRTUALES — AMBOS GRUPOS' : 'CLASES VIRTUALES'}
                </div>
                {modalCurso.virtuales.map((v, i) => (
                  <div key={i} style={{ fontSize: '13px', color: '#A3A3A8', lineHeight: '1.9' }}>{v}</div>
                ))}
              </div>
            )}

            {/* Prácticas presenciales */}
            {modalCurso.grupos && (
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: '10px', color: '#F7A8B8', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '10px' }}>
                  PRÁCTICAS PRESENCIALES
                </div>
                {modalCurso.grupos.map(g => (
                  <div key={g.id} style={{ background: '#111113', borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: g.cupos === 0 ? '#A3A3A8' : '#F7A8B8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
                      {g.nombre} — {g.cupos === 0 ? 'SIN CUPOS' : `${g.cupos} ${g.cupos === 1 ? 'CUPO DISPONIBLE' : 'CUPOS DISPONIBLES'}`}
                    </div>
                    {g.presenciales.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < g.presenciales.length - 1 ? '4px' : 0 }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#F7A8B8', flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: '12px', color: '#A3A3A8' }}>{p}</span>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: 'rgba(247,168,184,0.15)', color: '#F7A8B8', marginLeft: 'auto', whiteSpace: 'nowrap' }}>Presencial</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal de temario */}
      {modalTemario && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setModalTemario(null)}
        >
          <div
            style={{ background: '#1A1A1C', border: '0.5px solid #2C2C2F', borderRadius: '12px', width: 'min(480px, 90vw)', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '0.5px solid #2C2C2F' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#fff' }}>{modalTemario.nombre} — ¿Qué vas a aprender?</span>
              <button
                onClick={() => setModalTemario(null)}
                style={{ color: '#A3A3A8', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 0 0 16px' }}
              >×</button>
            </div>
            <div style={{ padding: '20px' }}>
              {modalTemario.temario && modalTemario.temario.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {modalTemario.temario.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#F7A8B8', flexShrink: 0, display: 'inline-block', marginTop: '7px' }} />
                      <span style={{ fontSize: '13px', color: '#A3A3A8', lineHeight: '1.6' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '13px', color: '#A3A3A8', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
                  Contenido disponible próximamente.
                </p>
              )}
              {modalTemario.formasPago && (
                <div style={{ borderTop: '0.5px solid #2C2C2F', marginTop: '16px', paddingTop: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#C5A880', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>
                    FORMAS DE PAGO
                  </div>
                  {modalTemario.formasPago.textoSeña && (
                    <p style={{ fontSize: '12px', color: '#A3A3A8', lineHeight: '1.7', margin: '0 0 10px' }}>
                      {modalTemario.formasPago.textoSeña}
                    </p>
                  )}
                  {modalTemario.formasPago.metodos.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C5A880', flexShrink: 0, display: 'inline-block', marginTop: '5px' }} />
                      <span style={{ fontSize: '12px', color: '#A3A3A8' }}>{m}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

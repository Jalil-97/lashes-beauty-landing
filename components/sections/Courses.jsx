'use client'

import { useState } from 'react'
import { CURSOS } from '@/lib/cursos'

const COURSES = CURSOS.map(c => ({
  id: c.id,
  cat: c.filtros,
  badge: { label: c.nivelRequerido === 'principiante' ? 'Principiantes' : 'Presencial', style: {} },
  image: c.imagen,
  imgPlaceholder: c.nombre,
  tags: [c.modalidad, c.nivel],
  title: c.nombre,
  desc: c.descripcion,
  details: [
    { value: c.duracion, label: 'Duración' },
    { value: c.sede, label: 'Sede' },
    { value: c.material, label: 'Material' },
    { value: c.certificacion, label: 'Título' },
  ],
  nextDates: c.fechas,
  cupos: c.cupos,
  price: '$' + c.precio.toLocaleString('es-AR'),
  priceOld: '$' + c.precioTachado.toLocaleString('es-AR'),
  btnClass: c.nivelRequerido === 'principiante' ? 'btn-p' : 'btn-s',
}))

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'ini', label: 'Principiantes' },
  { key: 'adv', label: 'Avanzadas' },
  { key: 'onl', label: 'Online / Híbrido' },
]

export default function Courses({ onPreselect }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const visible = COURSES.filter(
    c => activeFilter === 'all' || c.cat.includes(activeFilter)
  )

  function handleInscribirse(title) {
    if (onPreselect) onPreselect(title)
    document.getElementById('s-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
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

      <div className="courses" id="courses-grid" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '24px' }}>
        {visible.map(course => (
          <div className="cc" key={course.id} style={{ maxWidth: '400px', width: '100%' }}>
            {course.badge && (
              <span className="cc-badge" style={course.badge.style}>{course.badge.label}</span>
            )}
            <div className="cc-img" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: '#2C2C2F', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
                <span style={{ color: '#A3A3A8', fontSize: '0.85rem' }}>{course.imgPlaceholder}</span>
              </div>
              <img
                src={course.image}
                alt={course.title}
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
              {course.nextDates && (
                <div style={{ fontSize: '0.8rem', color: '#A3A3A8', margin: '10px 0 6px' }}>
                  <span>📅 Próximas fechas: {course.nextDates}</span>
                  {course.cupos && <span style={{ marginLeft: '12px' }}>👥 {course.cupos} cupos</span>}
                </div>
              )}
              <div className="cc-price">
                <div style={{ color: '#C5A880', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Precio de lanzamiento
                </div>
                {course.priceOld && (
                  <span style={{ textDecoration: 'line-through', color: '#A3A3A8', fontSize: '16px', display: 'block', marginBottom: '3px' }}>
                    {course.priceOld}
                  </span>
                )}
                <span className="amt" style={{ fontSize: '28px', fontWeight: '700', color: '#F7A8B8' }}>{course.price}</span>
              </div>
              <button
                className={`btn ${course.btnClass} btn-full`}
                onClick={() => handleInscribirse(course.title)}
              >
                Inscribirme
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'

const COURSES = [
  {
    id: 1,
    cat: ['ini'],
    badge: { label: 'Best Seller', style: {} },
    imgAlt: '[ Foto: Clase inicial ]',
    tags: ['Presencial', 'Híbrido', 'Principiantes'],
    title: 'Curso Inicial Completo',
    desc: 'Desde cero. Técnica clásica, aislamiento perfecto, salud ocular y diseño de mirada. Incluye práctica con modelo real.',
    details: [
      { value: '3 clases · 15hs', label: 'Duración' },
      { value: 'Villa Ballester', label: 'Sede' },
      { value: 'Kit completo', label: 'Material' },
      { value: 'Certificación', label: 'Título' },
    ],
    price: '$XXX',
    installment: 'o X cuotas de $XXX',
    btnClass: 'btn-p',
  },
  {
    id: 2,
    cat: ['adv'],
    badge: null,
    imgAlt: '[ Foto: Mapping avanzado ]',
    tags: ['Presencial', 'Avanzado'],
    title: 'Perfeccionamiento y Mapping',
    desc: 'Para lashistas activas. Retención, velocidad, foxy eyes y corrección de asimetrías oculares con modelo supervisado.',
    details: [
      { value: '1 clase intensiva', label: 'Duración' },
      { value: 'Villa Ballester', label: 'Sede' },
      { value: 'Insumos en clase', label: 'Material' },
      { value: 'Nivel avanzado', label: 'Título' },
    ],
    price: '$XXX',
    installment: 'o X cuotas de $XXX',
    btnClass: 'btn-s',
  },
  {
    id: 3,
    cat: ['adv', 'onl'],
    badge: { label: 'Competencia', style: { background: 'var(--gd)', color: '#1a1000' } },
    imgAlt: '[ Foto: Volumen Ruso ]',
    tags: ['Híbrido', 'Élite'],
    title: 'Especialización Volumen Ruso',
    desc: 'Abanicos perfectos 2D–6D, adhesión magnética y control de peso. Técnica de nivel competencia dictada por la formadora.',
    details: [
      { value: '2 clases + 1 virtual', label: 'Duración' },
      { value: 'Híbrido', label: 'Modalidad' },
      { value: 'Kit pinzas', label: 'Material' },
      { value: 'Especialista', label: 'Título' },
    ],
    price: '$XXX',
    installment: 'o X cuotas de $XXX',
    btnClass: 'btn-s',
  },
]

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
        <p>Desde principiantes absolutas hasta perfeccionamiento de élite. Presencial, online e híbrido.</p>
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

      <div className="courses" id="courses-grid">
        {visible.map(course => (
          <div className="cc" key={course.id}>
            {course.badge && (
              <span className="cc-badge" style={course.badge.style}>{course.badge.label}</span>
            )}
            <div className="cc-img">
              <span className="ph-txt">{course.imgAlt}</span>
            </div>
            <div className="cc-body">
              <div className="mtags">
                {course.tags.map(t => <span key={t} className="mt-tag">{t}</span>)}
              </div>
              <h3>{course.title}</h3>
              <p className="cd">{course.desc}</p>
              <div className="cc-details">
                {course.details.map(d => (
                  <div key={d.label} className="di">
                    <strong>{d.value}</strong>{d.label}
                  </div>
                ))}
              </div>
              <div className="cc-price">
                <span className="amt">{course.price}</span>
                <span className="installment">{course.installment}</span>
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

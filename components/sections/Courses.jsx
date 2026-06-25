'use client'

import { useState } from 'react'

const COURSES = [
  {
    id: 1,
    cat: ['ini', 'onl'],
    badge: { label: 'Best Seller', style: {} },
    imgAlt: '[ Foto: Clase inicial ]',
    tags: ['Híbrido', 'Principiantes'],
    title: 'De Cero a Lash Artist',
    desc: 'Desde cero. Técnica clásica, aislamiento perfecto, salud ocular y diseño de mirada. Incluye práctica con modelo real.',
    details: [
      { value: '[A COMPLETAR]', label: 'Duración' },
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
    imgAlt: '[ Foto: Lifting Coreano ]',
    tags: ['Presencial'],
    title: 'Lifting Coreano',
    desc: '[A COMPLETAR]',
    details: [
      { value: '[A COMPLETAR]', label: 'Duración' },
      { value: 'Villa Ballester', label: 'Sede' },
      { value: 'Insumos en clase', label: 'Material' },
      { value: 'Certificación', label: 'Título' },
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

'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: '¿Necesito experiencia previa para unirme a la mentoría De Cero a Lash Artist?',
    a: '[COMPLETAR]',
  },
  {
    q: '¿Cómo funcionan los cursos híbridos?',
    a: '[COMPLETAR]',
  },
  {
    q: '¿El certificado tiene validez?',
    a: '[COMPLETAR]',
  },
  {
    q: '¿Cuántas alumnas hay por clase?',
    a: 'Trabajamos con grupos de hasta 6 alumnas para garantizar atención personalizada en cada práctica.',
  },
  {
    q: '¿Qué materiales están incluidos en la formación?',
    a: '[COMPLETAR]',
  },
  {
    q: '¿Puedo pagar en cuotas?',
    a: '[COMPLETAR]',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  function toggle(i) {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <section className="section alt" id="s-faq">
      <div className="sec-hd">
        <div className="tag tag-center">FAQ</div>
        <h2>Preguntas <em>frecuentes</em></h2>
      </div>
      <div className="faq-wrap">
        {FAQS.map((item, i) => (
          <div key={i} className="fi">
            <div className="fq" onClick={() => toggle(i)}>
              {item.q}
              <span className={`fi-ico${openIndex === i ? ' rotated' : ''}`}>+</span>
            </div>
            {openIndex === i && (
              <div className="fa">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

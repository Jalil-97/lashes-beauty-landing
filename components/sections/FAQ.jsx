'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: '¿Necesito conocimientos previos para el Curso Inicial?',
    a: 'No, ninguno. El curso empieza desde cero: anatomía del ojo, aislamiento, salud ocular y prácticas con modelos reales. Llegás sin experiencia y te vas trabajando.',
  },
  {
    q: '¿Cómo funcionan los cursos híbridos?',
    a: 'Combinan una fase teórica online con videoclases y material descargable, y una fase práctica presencial intensiva en nuestro estudio de Villa Ballester con supervisión directa de Micaela.',
  },
  {
    q: '¿El certificado tiene validez?',
    a: 'Sí. Al completar el curso y cumplir los estándares técnicos de la academia, recibís una certificación oficial firmada por Micaela Sala, reconocida en el sector de la estética a nivel nacional.',
  },
  {
    q: '¿Cuántas alumnas hay por clase?',
    a: 'Máximo 4 alumnas por fecha de cursada presencial. Esto garantiza atención personalizada y corrección directa de cada técnica durante la práctica.',
  },
  {
    q: '¿Qué incluye el kit del Curso Inicial?',
    a: 'El kit incluye todo lo necesario para empezar: pestañas, adhesivo profesional, pinzas, parches y materiales de práctica. No necesitás comprar nada adicional para el curso.',
  },
  {
    q: '¿Puedo pagar en cuotas?',
    a: 'Sí. Todos los cursos tienen opción de pago en cuotas. También aceptamos transferencia bancaria, Mercado Pago y efectivo. Podés coordinar la modalidad al momento de reservar tu lugar.',
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

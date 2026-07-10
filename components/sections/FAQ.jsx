'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: '¿Necesito experiencia previa para unirme a la mentoría De Cero a Lash Artist?',
    a: 'No. Esta mentoría está diseñada para quienes empiezan desde cero. Vas a aprender todo paso a paso: desde la teoría hasta la aplicación correcta, la atención al cliente y cómo comenzar a generar ingresos con este servicio.',
  },
  {
    q: '¿Cómo funcionan los cursos híbridos?',
    a: 'Nuestros cursos híbridos combinan lo mejor de ambas modalidades. Primero accedés al contenido teórico y las clases virtuales. Luego vienen las jornadas presenciales con prácticas en modelo real. En cada técnica nueva, una práctica presencial para que puedas aprenderla al 100%.',
  },
  {
    q: '¿Cuántas alumnas hay por clase?',
    a: 'Trabajamos con grupos de hasta 6 alumnas para garantizar atención personalizada en cada práctica.',
  },
  {
    q: '¿Qué materiales están incluidos en la formación?',
    a: 'La mentoría incluye materiales de la mejor calidad en las prácticas presenciales, coffee break en cada encuentro, acceso a las clases grabadas durante 3 meses, acompañamiento antes, durante y después de la cursada, grupo privado de seguimiento, y almuerzo con brindis de graduación. Además podés adquirir tus materiales directamente en la academia para iniciar tu camino profesional con todo lo necesario.',
  },
  {
    q: '¿El certificado tiene validez?',
    a: 'Sí. Al finalizar y aprobar el curso recibís un certificado por cada técnica, y un certificado distintivo por haber completado la mentoría. Nuestras capacitaciones están avaladas por dos academias internacionales de Lash Trainers.',
  },
  {
    q: '¿Necesito llevar modelo para las prácticas?',
    a: 'Sí. Para todas las prácticas presenciales solicitamos que cada alumna cuente con una modelo.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Podés abonar en efectivo, por transferencia o con tarjeta de crédito. Mediante efectivo y transferencia ofrecemos planes de pago personalizados.',
  },
  {
    q: '¿Cómo coordino el pago una vez que completo el formulario?',
    a: 'Una vez que recibimos tu formulario, Micaela se va a contactar con vos en menos de 24hs para coordinar el método de pago y confirmar tu lugar.',
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

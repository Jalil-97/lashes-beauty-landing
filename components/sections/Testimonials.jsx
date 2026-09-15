'use client'

import { useState, useEffect } from 'react'

const TESTIMONIOS = [
  {
    foto: '/images/testimonio-1.webp',
    texto: 'Sos la mejor profe Mica, como explicás, como te dedicás a que aprendamos, es un verdadero lujo.',
    nombre: 'Cintia Eguren',
    curso: 'De Cero a Lash Artist',
  },
  {
    foto: '/images/testimonio-2.webp',
    texto: 'La mejor profe. Gracias por enseñarme con tanta dedicación y por ayudarme a crecer. ¡Sos una genia!',
    nombre: 'Natalia Estigarribia',
    curso: 'De Cero a Lash Artist',
  },
  {
    foto: '/images/testimonio-3.webp',
    texto: 'Quiero agradecerle a Mica por la paciencia que tuvo conmigo, por enseñarme con tanta dedicación y por hacer que aprender se sintiera mucho más fácil. Se nota cuando alguien enseña porque realmente le gusta lo que hace. Me llevo un montón de conocimientos, más confianza en mí y muchas ganas de seguir practicando y creciendo.',
    nombre: 'Agustina Venegoni',
    curso: 'De Cero a Lash Artist',
  },
  {
    foto: '/images/testimonio-4.webp',
    texto: 'Amé el curso y la forma en que nos explicaste y acompañaste en cada paso. ¡Gracias Mica!',
    nombre: 'Maia Salto',
    curso: 'De Cero a Lash Artist',
  },
  {
    foto: '/images/testimonio-5.webp',
    // Foto de cuerpo entero (retrato muy angosto) — las caras quedan en el
    // tercio superior, el recorte centrado por defecto las cortaría.
    fotoPos: 'center 25%',
    texto: 'Mica, quedé super conforme con el curso, me encantó desde inicio a fin, tu paciencia, dedicación y compromiso para enseñarnos. Super recomendable, ahora a poner en práctica todo lo aprendido.',
    nombre: 'Carla Lazarte',
    curso: 'De Cero a Lash Artist',
  },
  {
    foto: '/images/testimonio-6.webp',
    texto: 'Mica más que conforme con el curso, la profesionalidad y dedicación que le ponés a lo que hacés se nota y es para destacar. Super contenta con todo lo aprendido y fue un placer compartir con mis compañeras.',
    nombre: 'Nadia Loperfido',
    curso: 'De Cero a Lash Artist',
  },
  {
    foto: '/images/testimonio-7.webp',
    texto: 'Me encantó el curso Mica. Super lindo todo, muy profesional y además un ambiente hermoso.',
    nombre: 'Valentina Barrientos',
    curso: 'De Cero a Lash Artist',
  },
]

const N = TESTIMONIOS.length

function Card({ t }) {
  return (
    <div className="t-real-card">
      <img
        src={t.foto}
        alt={`Testimonio de ${t.nombre} sobre el curso ${t.curso}`}
        style={{ objectPosition: t.fotoPos || 'center' }}
      />
      <div className="t-real-body">
        <div className="t-real-row1">
          <span className="t-real-nombre">{t.nombre}</span>
          <span className="t-real-curso">{t.curso}</span>
        </div>
        <p className="t-real-texto">"{t.texto}"</p>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const [offset, setOffset] = useState(0)
  const [visible, setVisible] = useState(true)

  function advance(next) {
    setVisible(false)
    setTimeout(() => {
      setOffset(typeof next === 'function' ? next : () => next)
      setTimeout(() => {
        setVisible(true)
      }, 50)
    }, 300)
  }

  useEffect(() => {
    const id = setInterval(() => advance(o => (o + 1) % N), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="section" id="s-testimonios">
      <style>{`
        .t-real-card {
          background: #1A1A1C;
          border: 0.5px solid #2C2C2F;
          border-radius: 8px;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          width: 100%;
        }
        .t-real-card img {
          width: 92px;
          height: 92px;
          flex-shrink: 0;
          border-radius: 8px;
          border: 1px solid var(--mg);
          object-fit: cover;
          display: block;
        }
        .t-real-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .t-real-row1 {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 4px 10px;
        }
        .t-real-nombre {
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }
        .t-real-curso {
          font-size: 0.78rem;
          color: #F7A8B8;
          margin: 0;
          letter-spacing: 0.04em;
        }
        .t-real-texto {
          font-style: italic;
          color: #A3A3A8;
          line-height: 1.5;
          font-size: 0.85rem;
          margin: 0;
        }
        .t-carousel-desktop {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .t-carousel-mobile {
          display: none;
        }
        .t-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 28px;
        }
        @media (max-width: 768px) {
          .t-carousel-desktop { display: none; }
          .t-carousel-mobile { display: block; }
        }
      `}</style>

      <div className="sec-hd">
        <div className="tag tag-center">Alumnas</div>
        <h2>Resultados <em>reales</em></h2>
        <p>Lo que dicen quienes ya cursaron y transformaron su carrera.</p>
      </div>

      {/* Desktop: 3 cards a la vez */}
      <div className="t-carousel-desktop" style={{ transition: 'opacity 300ms ease-in-out', opacity: visible ? 1 : 0 }}>
        {[0, 1, 2].map(j => (
          <Card key={j} t={TESTIMONIOS[(offset + j) % N]} />
        ))}
      </div>

      {/* Mobile: 1 card a la vez */}
      <div className="t-carousel-mobile" style={{ transition: 'opacity 300ms ease-in-out', opacity: visible ? 1 : 0 }}>
        <Card t={TESTIMONIOS[offset]} />
      </div>

      {/* Dots */}
      <div className="t-dots">
        {TESTIMONIOS.map((_, i) => (
          <button
            key={i}
            onClick={() => advance(i)}
            aria-label={`Testimonio ${i + 1}`}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: i === offset ? '#F7A8B8' : '#444',
              transition: 'background 300ms',
            }}
          />
        ))}
      </div>
    </section>
  )
}

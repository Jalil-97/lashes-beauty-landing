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
      <img src={t.foto} alt={`Testimonio de ${t.nombre} sobre el curso ${t.curso}`} />
      <div className="t-real-body">
        <p className="t-real-texto">"{t.texto}"</p>
        <p className="t-real-nombre">{t.nombre}</p>
        <p className="t-real-curso">{t.curso}</p>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setOffset(o => (o + 1) % N), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="section" id="s-testimonios">
      <style>{`
        .t-real-card {
          background: #1A1A1C;
          border: 0.5px solid #2C2C2F;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .t-real-card img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .t-real-body {
          padding: 20px 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        .t-real-texto {
          font-style: italic;
          color: #A3A3A8;
          line-height: 1.6;
          margin: 0;
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
      <div className="t-carousel-desktop">
        {[0, 1, 2].map(j => (
          <Card key={j} t={TESTIMONIOS[(offset + j) % N]} />
        ))}
      </div>

      {/* Mobile: 1 card a la vez */}
      <div className="t-carousel-mobile">
        <Card t={TESTIMONIOS[offset]} />
      </div>

      {/* Dots */}
      <div className="t-dots">
        {TESTIMONIOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setOffset(i)}
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

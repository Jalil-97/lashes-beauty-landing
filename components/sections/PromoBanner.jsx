'use client'

import { useState, useEffect } from 'react'
import { CURSOS } from '@/lib/cursos'

const PROMO = {
  activo: true,
  cursoId: 'lash-trends',
  // Fecha tope para auto-ocultar (1 día antes del inicio real del curso).
  // Verificado: lib/cursos.js sigue teniendo 'Viernes 25 de septiembre · 18hs'.
  fechaLimiteISO: '2026-09-24',
  textoBoton: '¡Quiero inscribirme!',
}

export default function PromoBanner({ onPreselect }) {
  // Mount-check: en el primer render (server y cliente) esto es false y
  // el componente no muestra nada, evitando hydration mismatch — recién
  // en el useEffect (solo cliente) se decide si corresponde mostrarse,
  // ya que esa decisión depende de la fecha actual y de sessionStorage.
  const [mounted, setMounted] = useState(false)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      if (sessionStorage.getItem('promoBannerClosed') === '1') setClosed(true)
    } catch {}
  }, [])

  if (!mounted || closed || !PROMO.activo) return null

  const curso = CURSOS.find(c => c.id === PROMO.cursoId)
  if (!curso) return null

  const limite = new Date(`${PROMO.fechaLimiteISO}T23:59:59`)
  if (new Date() > limite) return null

  function handleClick() {
    if (onPreselect) onPreselect(curso.nombre)
    document.getElementById('s-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleClose() {
    setClosed(true)
    try {
      sessionStorage.setItem('promoBannerClosed', '1')
    } catch {}
  }

  return (
    <div className="promo-banner">
      <style>{`
        .promo-banner {
          background: var(--dg);
          border-bottom: 1px solid var(--mg);
          padding: 10px 44px;
          position: relative;
        }
        .promo-banner-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 8px 20px;
          text-align: center;
        }
        .promo-banner-text {
          margin: 0;
          font-family: var(--fb);
          font-size: .85rem;
          color: var(--wh);
        }
        .promo-banner-text strong { color: var(--pk); }
        .promo-banner-text span { color: var(--mt); }
        .promo-banner-btn {
          display: inline-block;
          padding: 8px 20px;
          background: var(--pk);
          color: var(--bk);
          font-family: var(--fb);
          font-size: .78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .5px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: var(--tr);
          white-space: nowrap;
        }
        .promo-banner-btn:hover { background: var(--pk2); }
        .promo-banner-close {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--mt);
          font-size: 1.3rem;
          line-height: 1;
          cursor: pointer;
          padding: 4px 8px;
        }
        .promo-banner-close:hover { color: var(--wh); }
        @media (max-width: 640px) {
          .promo-banner { padding: 12px 40px; }
          .promo-banner-inner { flex-direction: column; gap: 8px; }
        }
      `}</style>

      <div className="promo-banner-inner">
        <p className="promo-banner-text">
          <strong>{curso.nombre}</strong> <span>— Próxima fecha: {curso.fechas}</span>
        </p>
        <button className="promo-banner-btn" onClick={handleClick}>
          {PROMO.textoBoton}
        </button>
      </div>

      <button className="promo-banner-close" onClick={handleClose} aria-label="Cerrar banner">
        ×
      </button>
    </div>
  )
}

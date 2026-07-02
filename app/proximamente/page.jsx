'use client'

import { useState, useEffect } from 'react'

// July 15, 2026 00:00 Argentina time (UTC-3) = 03:00 UTC
const TARGET = new Date('2026-07-15T03:00:00Z')

function getTimeLeft() {
  const diff = TARGET - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }
  const totalSeconds = Math.floor(diff / 1000)
  const minutes = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3600) % 24
  const days = Math.floor(totalSeconds / 86400)
  return { days, hours, minutes }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function CountBlock({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <span style={{
        fontFamily: 'var(--font-cormorant, Georgia, serif)',
        fontSize: '26px',
        fontWeight: 600,
        color: '#F7A8B8',
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{
        fontSize: '10px',
        color: '#A3A3A8',
        letterSpacing: '0.1em',
      }}>
        {label}
      </span>
    </div>
  )
}

export default function Proximamente() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <style>{`
        @media (max-width: 480px) {
          .prox-title { font-size: 28px !important; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0F0F10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          padding: '40px 24px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
        }}>

          {/* Logo */}
          <div style={{
            fontFamily: 'var(--font-cormorant, Georgia, serif)',
            fontSize: '22px',
            letterSpacing: '0.04em',
            lineHeight: 1,
          }}>
            <span style={{ color: '#fff' }}>LASHES</span>
            <span style={{ color: '#F7A8B8' }}>.BEAUTY</span>
          </div>

          {/* Divider */}
          <div style={{
            width: '64px',
            height: '1px',
            background: '#F7A8B8',
            opacity: 0.4,
          }} />

          {/* Title */}
          <h1
            className="prox-title"
            style={{
              fontFamily: 'var(--font-cormorant, Georgia, serif)',
              fontSize: '40px',
              lineHeight: 1.2,
              margin: 0,
              color: '#fff',
              fontWeight: 400,
            }}
          >
            Estamos preparando<br />
            <em style={{ color: '#F7A8B8' }}>algo especial</em>
          </h1>

          {/* Description */}
          <p style={{
            color: '#A3A3A8',
            fontSize: '15px',
            maxWidth: '420px',
            lineHeight: 1.6,
            margin: 0,
          }}>
            Lashes Beauty Academy está preparando su nueva plataforma, donde vas a encontrar
            toda la información sobre nuestras formaciones y vas a poder inscribirte de forma
            rápida y simple.
          </p>

          {/* Countdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CountBlock value={pad(timeLeft.days)} label="DÍAS" />
            <span style={{ color: '#444', fontSize: '26px', fontWeight: 600, paddingBottom: '18px' }}>:</span>
            <CountBlock value={pad(timeLeft.hours)} label="HORAS" />
            <span style={{ color: '#444', fontSize: '26px', fontWeight: 600, paddingBottom: '18px' }}>:</span>
            <CountBlock value={pad(timeLeft.minutes)} label="MIN" />
          </div>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* Instagram */}
            <a
              href="https://instagram.com/lashes.beautyok"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver nuestro trabajo en Instagram"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid rgba(247,168,184,0.35)',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                textDecoration: 'none',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F7A8B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="#F7A8B8" stroke="none" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/5491173657355"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                textDecoration: 'none',
              }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>

          {/* Footer text */}
          <p style={{
            color: '#666',
            fontSize: '11px',
            letterSpacing: '0.05em',
            margin: '16px 0 0',
          }}>
            VILLA BALLESTER, BUENOS AIRES
          </p>

        </div>
      </div>
    </>
  )
}

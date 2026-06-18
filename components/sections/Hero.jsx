export default function Hero() {
  return (
    <section className="hero" id="s-hero">
      <div className="hero-l">
        <div className="tag">Lashes Beauty Academy</div>
        <h1>Formate con<br /><em>Estándares Internacionales</em></h1>
        <p className="sub">
          Aprendé las técnicas más avanzadas en extensiones de pestañas. Certificaciones de
          prestigio, metodología práctica y formación dictada por una referente internacional del sector.
        </p>
        <style>{`
          .ig-hero-btn-wrap { position: relative; display: inline-flex; align-self: center; }
          .ig-hero-tip {
            position: absolute;
            bottom: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            background: #1A1A1C;
            border: 1px solid rgba(247,168,184,0.25);
            color: #F7A8B8;
            font-size: 11px;
            letter-spacing: 0.1em;
            white-space: nowrap;
            padding: 7px 12px;
            border-radius: 4px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 200ms ease;
          }
          .ig-hero-tip::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 5px solid transparent;
            border-top-color: #1A1A1C;
          }
          .ig-hero-btn-wrap:hover .ig-hero-tip { opacity: 1; }
        `}</style>
        <div className="hero-btns">
          <a href="#s-courses" className="btn btn-p">Ver Cursos</a>
          <span className="ig-hero-btn-wrap">
            <a
              className="ig-hero-btn"
              href="https://instagram.com/lashes.beautyok"
              target="_blank"
              rel="noopener"
              aria-label="Ver nuestro trabajo en Instagram"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '13px 16px',
                borderRadius: '4px',
                border: '1px solid rgba(247,168,184,0.35)',
                background: 'transparent',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F7A8B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="#F7A8B8" stroke="none" />
              </svg>
            </a>
            <span className="ig-hero-tip">VER NUESTRO TRABAJO</span>
          </span>
        </div>
      </div>

      <div className="hero-r">
        <div className="hero-card">
          <div className="hero-card-img">
            <div className="monogram">MS</div>
            <h3>Micaela Sala</h3>
            <p>Lash Artist &amp; Educadora Internacional</p>
          </div>
          <div className="hero-card-body">
            <span className="hero-badge">Campeona Volumen Ruso</span>
            <span className="hero-badge">Lash Speaker</span>
            <span className="hero-badge">Jueza Internacional</span>
            <span className="hero-badge">+XXX Alumnas</span>
          </div>
        </div>
      </div>
    </section>
  )
}

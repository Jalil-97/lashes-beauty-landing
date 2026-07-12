export default function About() {
  return (
    <section className="section" id="s-about">
      <style>{`
        .about-photo-col { width: 42%; flex-shrink: 0; }
        .about-photo-col .about-photo { width: 100%; }
        @media (max-width: 768px) {
          .about-photo-col { width: 100%; max-width: 340px; margin: 0 auto; }
        }
      `}</style>
      <div className="about-grid">
        <div className="about-photo-col">
          <div className="about-photo">
            <img
              src="/images/about-mica.webp"
              alt="Micaela Sala dando una conferencia sobre extensiones de pestañas"
              style={{ objectPosition: 'center top' }}
            />
          </div>
          <h3 style={{ fontSize: '1.6rem', marginTop: '20px', marginBottom: '4px' }}>Micaela Sala</h3>
          <p style={{ fontSize: '.78rem', color: 'var(--mt)', lineHeight: '1.6' }}>
            Lash Artist · Educadora · Jueza Internacional<br />Villa Ballester, Buenos Aires
          </p>
        </div>

        <div className="about-r">
          <div className="tag">La Formadora</div>
          <h2>Aprendés de quien <em>compite y gana</em> en el mundo</h2>
          <p className="quote">
            "No te enseño solo a colocar pestañas. Te entreno para crear un negocio rentable
            con los estándares técnicos más exigentes de la industria."
          </p>
          <p className="desc">
            Mi trayectoria como jueza, competidora y educadora me permitió desarrollar una metodología
            para que aprendas con precisión, sin atajos y sin perder años en prueba y error. Vas a
            dominar técnicas que realmente transforman resultados y te acompañarán durante toda tu
            carrera profesional.
          </p>
          <div className="ach-grid" style={{ alignItems: 'stretch' }}>
            <div className="ach" style={{ height: '100%' }}>
              <div className="num">Lashes Beauty Conference</div>
              <div className="dsc">Creadora del primer evento argentino que convocó a referentes internacionales de la industria para elevar el estándar profesional de las lash artists de la región.</div>
            </div>
            <div className="ach" style={{ height: '100%' }}>
              <div className="num">Formadora Internacional</div>
              <div className="dsc">He capacitado a más de 500 lash artists, combinando estándares de competencia internacional con una metodología práctica y accesible.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function About() {
  return (
    <section className="section" id="s-about">
      <div className="about-grid">
        <div className="about-photo">
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', minHeight: '300px', background: '#2C2C2F', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <span style={{ color: '#A3A3A8', fontSize: '0.85rem', position: 'absolute', zIndex: 0 }}>Foto de Micaela</span>
            <img
              src="/images/about-mica.jpg"
              alt="Micaela Sala"
              style={{ position: 'relative', zIndex: 1, width: '100%', objectFit: 'cover', display: 'block', minHeight: '300px' }}
            />
          </div>
          <h3>Micaela Sala</h3>
          <p className="role">Lash Artist · Educadora · Jueza Internacional<br />Villa Ballester, Buenos Aires</p>
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
          <div className="ach-grid">
            <div className="ach">
              <div className="num">Creadora</div>
              <div className="ttl">Lashes Beauty Conference</div>
              <div className="dsc">El primer evento argentino que convocó a referentes internacionales de la industria para elevar el estándar profesional de las lash artists de la región.</div>
            </div>
            <div className="ach">
              <div className="num">Formadora Internacional</div>
              <div className="dsc">He capacitado a más de 500 lash artists, combinando estándares de competencia internacional con una metodología práctica y accesible.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

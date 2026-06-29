export default function About() {
  return (
    <section className="section" id="s-about">
      <div className="about-grid">
        <div className="about-photo">
          <div className="mono">MS</div>
          <h3>Micaela Sala</h3>
          <p className="role">Lash Artist · Educadora · Jueza Internacional<br />Villa Ballester, Buenos Aires</p>
          <div className="ph-label">[ Foto profesional — retrato en estudio ]</div>
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
              <div className="num">Speaker Int.</div>
              <div className="ttl">Jueza y Formadora</div>
              <div className="dsc">Speaker internacional, jueza y formadora.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

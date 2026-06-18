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
            Como jueza internacional y competidora galardonada, Micaela estructuró los programas
            de Lashes Beauty Academy para acortar tu curva de aprendizaje y darte criterio
            técnico impecable desde el primer día.
          </p>
          <div className="ach-grid">
            <div className="ach">
              <div className="num">1ra Ed.</div>
              <div className="ttl">Lashes Beauty Conference</div>
              <div className="dsc">Congreso internacional organizado en Argentina</div>
            </div>
            <div className="ach">
              <div className="num">Jueza Int.</div>
              <div className="ttl">Volumen Ruso</div>
              <div className="dsc">Reconocimiento nacional y latinoamericano</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

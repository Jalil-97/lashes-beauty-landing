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
        <div className="hero-btns">
          <a href="#s-courses" className="btn btn-p">Ver Cursos</a>
          <a href="#s-form"    className="btn btn-s">Asesoría Gratuita</a>
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

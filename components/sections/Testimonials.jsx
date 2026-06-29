const TESTIMONIALS = [
  { initials: 'CA', name: '[Nombre Alumna]', course: 'De Cero a Lash Artist · [Ciudad]' },
  { initials: 'LM', name: '[Nombre Alumna]', course: 'De Cero a Lash Artist · [Ciudad]' },
  { initials: 'VP', name: '[Nombre Alumna]', course: 'Korean Lift — Técnica Coreana · [Ciudad]' },
  { initials: 'RS', name: '[Nombre Alumna]', course: 'Korean Lift — Técnica Coreana · [Ciudad]' },
]

export default function Testimonials() {
  return (
    <section className="section" id="s-testimonios">
      <div className="sec-hd">
        <div className="tag tag-center">Alumnas</div>
        <h2>Resultados <em>reales</em></h2>
        <p>Lo que dicen quienes ya cursaron y transformaron su carrera.</p>
      </div>
      <div className="tgrid">
        {TESTIMONIALS.map((t, i) => (
          <div className="tc" key={i}>
            <div className="tprof">
              <div className="tav">{t.initials}</div>
              <div className="tinfo">
                <h5>{t.name}</h5>
                <p>{t.course}</p>
              </div>
            </div>
            <div className="tstars">★★★★★</div>
            <p className="ttext">"[Testimonio real de la alumna]"</p>
            <div className="t-placeholder">[ Completar con testimonio real ]</div>
          </div>
        ))}
      </div>
    </section>
  )
}

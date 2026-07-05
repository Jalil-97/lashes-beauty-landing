export default function Salon() {
  return (
    <>
      {/* El Espacio */}
      <section className="section" id="s-space">
        <div className="salon">
          <div className="salon-l">
            <div className="tag">El Espacio</div>
            <h2>Viví una experiencia de <em>aprendizaje profesional</em></h2>
            <p>
              Aprendé y practicá en un entorno diseñado para desarrollar tu técnica al más alto nivel.
            </p>
            <p style={{ marginBottom: '24px' }}>
              En Lashes Beauty Academy vas a practicar en un espacio equipado con los estándares de un
              estudio profesional real, para que desde el primer día desarrolles confianza, criterio
              técnico y experiencia genuina.
            </p>
            <div className="feat">
              <div className="feat-dot">✓</div>
              <div>
                <h4>Iluminación de precisión</h4>
                <p>Iluminación profesional diseñada para que cada detalle de la técnica sea visible y reproducible desde la primera práctica.</p>
              </div>
            </div>
            <div className="feat">
              <div className="feat-dot">✓</div>
              <div>
                <h4>Camillas ergonómicas premium</h4>
                <p>Pensadas para la postura correcta de la alumna y la modelo durante toda la jornada de trabajo.</p>
              </div>
            </div>
            <div className="feat">
              <div className="feat-dot">✓</div>
              <div>
                <h4>Materiales profesionales incluidos</h4>
                <p>Materiales y herramientas de marcas líderes del mercado incluidos en cada práctica, para que entrenes con los mismos insumos que vas a usar en tu estudio.</p>
              </div>
            </div>
          </div>

          <div className="salon-gallery">
            <div className="gph main">
              <img
                src="/images/espacio-1.webp"
                alt="Estudio principal Lashes Beauty Academy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
              <div className="gph-cap">
                <span>Estudio principal</span>
                <p>Camillas &amp; ambient light</p>
              </div>
            </div>
            <div className="gph">
              <img
                src="/images/espacio-2.webp"
                alt="Macro close-up extensión"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
              <div className="gph-cap">
                <span>Macro close-up</span>
                <p>Extensión terminada</p>
              </div>
            </div>
            <div className="gph">
              <img
                src="/images/espacio-3.webp"
                alt="Área de práctica"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
              <div className="gph-cap">
                <span>Área de práctica</span>
                <p>Insumos &amp; camilla beige</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section className="section alt map-section" id="s-ubicacion">
        <div className="sec-hd" style={{ marginBottom: '28px' }}>
          <div className="tag tag-center">Ubicación</div>
          <h2>Encontranos en <em>Villa Ballester</em></h2>
          <p>Charlone 5224, Villa Ballester, Buenos Aires</p>
        </div>
        <div className="map-wrapper">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2394.3250832565745!2d-58.55322521893839!3d-34.53996913912282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb0a972808d73%3A0x385f1d1b5cb9b40b!2sCharlone%205224%2C%20B1653%20Villa%20Ballester%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1781805100185!5m2!1ses-419!2sar"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Lashes Beauty Academy"
          />
          <div className="map-info">
            <div className="map-info-icon">📍</div>
            <div>
              <h5>Lashes Beauty Academy</h5>
              <p>Charlone 5224, Villa Ballester, Buenos Aires · Lunes a Viernes</p>
            </div>
            <a
              href="https://maps.google.com/?q=Charlone+5224+Villa+Ballester+Buenos+Aires"
              target="_blank"
              rel="noopener"
            >
              Ver en Maps →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

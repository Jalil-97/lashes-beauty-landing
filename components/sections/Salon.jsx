export default function Salon() {
  return (
    <>
      {/* El Espacio */}
      <section className="section" id="s-space">
        <div className="salon">
          <div className="salon-l">
            <div className="tag">El Espacio</div>
            <h2>Un estudio diseñado para la <em>excelencia práctica</em></h2>
            <p>
              Nuestra sede en Villa Ballester replica las condiciones de un estudio profesional de
              alta gama para que tu práctica sea óptima desde el primer día.
            </p>
            <div className="feat">
              <div className="feat-dot">✓</div>
              <div>
                <h4>Iluminación profesional sin sombras</h4>
                <p>Aros de luz LED para captar cada detalle de la pestaña natural.</p>
              </div>
            </div>
            <div className="feat">
              <div className="feat-dot">✓</div>
              <div>
                <h4>Camillas ergonómicas premium</h4>
                <p>Comodidad para el modelo de práctica y postura correcta durante las horas de trabajo.</p>
              </div>
            </div>
            <div className="feat">
              <div className="feat-dot">✓</div>
              <div>
                <h4>Zona foto con neón "Lashes Beauty"</h4>
                <p>Aprendé a fotografiar tus trabajos para redes desde el primer día de práctica.</p>
              </div>
            </div>
          </div>

          <div className="salon-gallery">
            <div className="gph main">
              <div className="gph-cap">
                <span>Estudio principal</span>
                <p>Camillas &amp; ambient light</p>
              </div>
            </div>
            <div className="gph">
              <div className="gph-cap">
                <span>Macro close-up</span>
                <p>Extensión terminada</p>
              </div>
            </div>
            <div className="gph">
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

export default function CredentialsBar() {
  return (
    <section className="cred">
      {/* Distribución uniforme en desktop (primer ítem pegado a la izquierda,
          último a la derecha). En ≤1024px se mantiene el grid responsivo original.
          Se usa el selector section.cred para ganar especificidad sobre .cred. */}
      <style>{`
        section.cred { display: flex; justify-content: space-between; }
        @media (max-width: 1024px) { section.cred { display: grid; } }
        /* En desktop, padding horizontal simétrico (96px) para que el primer y
           último ítem queden parejos y el último despeje el botón flotante de
           WhatsApp (fixed, abajo-derecha). */
        @media (min-width: 1025px) { section.cred { padding-left: 96px; padding-right: 96px; } }
      `}</style>
      <div className="cred-item">
        <div className="cred-ico">🏆</div>
        <div><h5>Tri Campeona</h5><p>Volumen Ruso</p></div>
      </div>
      <div className="cred-item">
        <div className="cred-ico">🌎</div>
        <div><h5>Speaker &amp; Jueza</h5><p>Congresos internacionales</p></div>
      </div>
      <div className="cred-item">
        <div className="cred-ico">🎓</div>
        <div><h5>+500 Alumnas</h5><p>En toda Latinoamérica</p></div>
      </div>
      <div className="cred-item">
        <div className="cred-ico">✨</div>
        <div><h5>Modalidad Híbrida</h5><p>Presencial + Online</p></div>
      </div>
    </section>
  )
}

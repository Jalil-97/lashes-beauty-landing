const ITEMS = [
  { ico: '🏆', title: 'Tri Campeona', sub: 'Volumen Ruso' },
  { ico: '🌎', title: 'Speaker & Jueza', sub: 'Congresos internacionales' },
  { ico: '🎓', title: '+500 Alumnas', sub: 'En toda Latinoamérica' },
  { ico: '✨', title: 'Modalidad Híbrida', sub: 'Presencial + Online' },
]

const ALL = [...ITEMS, ...ITEMS]

export default function CredentialsBar() {
  return (
    <section className="cred">
      <style>{`
        section.cred { padding-left: 0; padding-right: 0; overflow: hidden; }
        .cred-ticker-wrap { overflow: hidden; width: 100%; }
        .cred-ticker {
          display: flex;
          align-items: center;
          width: max-content;
          animation: cred-scroll 20s linear infinite;
        }
        @keyframes cred-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cred-ticker {
            animation: none;
            flex-wrap: wrap;
            width: 100%;
            justify-content: space-around;
          }
        }
      `}</style>
      <div className="cred-ticker-wrap">
        <div className="cred-ticker">
          {ALL.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div className="cred-item" style={{ flexShrink: 0 }}>
                <div className="cred-ico">{item.ico}</div>
                <div><h5>{item.title}</h5><p>{item.sub}</p></div>
              </div>
              <span style={{ color: '#C5A880', margin: '0 28px', fontSize: '14px', flexShrink: 0, opacity: 0.7 }}>✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

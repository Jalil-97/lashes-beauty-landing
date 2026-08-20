export const metadata = {
  title: 'Admin | Lashes Beauty Academy',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }) {
  return (
    <>
      <style>{`
        body { padding-top: 0 !important; }
        a[aria-label="Contactar por WhatsApp"] { display: none !important; }
      `}</style>
      {children}
    </>
  )
}

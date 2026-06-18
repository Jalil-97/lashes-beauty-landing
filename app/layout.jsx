import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'Lashes Beauty Academy — Formación Profesional',
  description: 'Academia de extensiones de pestañas de alta gama en Villa Ballester. Formación con Micaela Sala, campeona en Volumen Ruso, jueza internacional y educadora.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}

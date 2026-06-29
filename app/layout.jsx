import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import WhatsAppFloat from '@/components/ui/WhatsAppFloat'

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
  openGraph: {
    title: 'Lashes Beauty Academy — Formación Profesional',
    description: 'Formación en extensiones de pestañas con Micaela Sala, tri campeona en Volumen Ruso, jueza internacional y educadora. Villa Ballester, Buenos Aires.',
    url: 'https://lashes-beauty-landing.vercel.app',
    siteName: 'Lashes Beauty Academy',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lashes Beauty Academy — Formación Profesional',
    description: 'Formación en extensiones de pestañas con Micaela Sala, tri campeona en Volumen Ruso.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  )
}

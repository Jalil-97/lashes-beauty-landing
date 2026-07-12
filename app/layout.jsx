import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import WhatsAppFloat from '@/components/ui/WhatsAppFloat'
import { CURSOS } from '@/lib/cursos'

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
  title: {
    default: 'Lashes Beauty Academy — Formación Profesional en Extensiones de Pestañas',
    template: '%s | Lashes Beauty Academy',
  },
  description:
    'Formate como Lash Artist profesional con Micaela Sala, tri campeona internacional en Volumen Ruso. Cursos presenciales e híbridos en Villa Ballester, Buenos Aires. Certificación avalada y +500 alumnas formadas.',
  keywords: [
    'curso de pestañas Buenos Aires',
    'extensiones de pestañas Villa Ballester',
    'Lash Artist Argentina',
    'curso profesional de pestañas',
    'Micaela Sala pestañas',
    'academia de pestañas',
    'curso de extensiones de pestañas',
    'lifting de pestañas',
    'korean lift Buenos Aires',
    'capacitación lash artist',
  ],
  authors: [{ name: 'Micaela Sala' }],
  creator: 'Lashes Beauty Academy',
  publisher: 'Lashes Beauty Academy',
  metadataBase: new URL('https://lashesbeautyok.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Lashes Beauty Academy — Formación Profesional',
    description:
      'Formación en extensiones de pestañas con Micaela Sala, tri campeona internacional en Volumen Ruso. Villa Ballester, Buenos Aires.',
    url: 'https://lashesbeautyok.com',
    siteName: 'Lashes Beauty Academy',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lashes Beauty Academy — Formación Profesional',
    description:
      'Formación en extensiones de pestañas con Micaela Sala, tri campeona internacional en Volumen Ruso.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'EducationalOrganization'],
      name: 'Lashes Beauty Academy',
      description:
        'Academia de formación profesional en extensiones de pestañas dirigida por Micaela Sala, tri campeona internacional.',
      url: 'https://lashesbeautyok.com',
      telephone: '+5491173657355',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Charlone 5224',
        addressLocality: 'Villa Ballester',
        addressRegion: 'Buenos Aires',
        postalCode: 'B1653',
        addressCountry: 'AR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -34.5399,
        longitude: -58.5532,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        description: 'Con cita previa',
      },
      founder: {
        '@type': 'Person',
        name: 'Micaela Sala',
        jobTitle: 'Lash Artist & Educadora Internacional',
      },
      sameAs: ['https://instagram.com/lashes.beautyok'],
    },
    ...CURSOS.map(c => ({
      '@type': 'Course',
      name: c.nombre,
      description: c.descripcion,
      provider: {
        '@type': 'Organization',
        name: 'Lashes Beauty Academy',
        url: 'https://lashesbeautyok.com',
      },
      courseMode: c.modalidad === 'Híbrido' ? 'blended' : 'onsite',
      educationalLevel: c.nivelRequerido === 'principiante' ? 'Beginner' : 'Intermediate',
      offers: {
        '@type': 'Offer',
        price: c.precio,
        priceCurrency: 'ARS',
      },
    })),
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  )
}

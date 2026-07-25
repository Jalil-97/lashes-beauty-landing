import Proximamente from './proximamente/page'
import Sitio from './sitio/page'

export default function Home() {
  const ahora = new Date()
  const lanzamiento = new Date('2026-07-24T21:00:00-03:00')

  if (ahora >= lanzamiento) {
    return <Sitio />
  }

  return <Proximamente />
}
/*aaa*/
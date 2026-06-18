'use client'

import { useEffect, useRef, useState } from 'react'

export default function FadeIn({ children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    // Respetar prefers-reduced-motion: mostrar sin animación.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true)
      setVisible(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const style = reduced
    ? undefined
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 500ms ease-out, transform 500ms ease-out',
      }

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  )
}

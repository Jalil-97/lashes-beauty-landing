'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import CredentialsBar from '@/components/sections/CredentialsBar'
import About from '@/components/sections/About'
import Courses from '@/components/sections/Courses'
import Salon from '@/components/sections/Salon'
import Testimonials from '@/components/sections/Testimonials'
import FAQ from '@/components/sections/FAQ'
import ContactForm from '@/components/sections/ContactForm'

export default function Home() {
  const [preselectedCourse, setPreselectedCourse] = useState('')

  return (
    <>
      <Header />
      <main>
        <Hero />
        <CredentialsBar />
        <About />
        <Courses onPreselect={setPreselectedCourse} />
        <Salon />
        <Testimonials />
        <FAQ />
        <ContactForm preselectedCourse={preselectedCourse} />
      </main>
      <Footer />
    </>
  )
}

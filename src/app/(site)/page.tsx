// src/app/(site)/page.tsx
import Navbar from '@/components/site/Navbar'
import Hero from '@/components/site/Hero'
import Pillars from '@/components/site/Pillars'
import Services from '@/components/site/Services'
import About from '@/components/site/About'
import Clinic from '@/components/site/Clinic'
import Testimonials from '@/components/site/Testimonials'
import Location from '@/components/site/Location'
import Footer from '@/components/site/Footer'
import WhatsAppFloat from '@/components/site/WhatsAppFloat'
import BookingSection from '@/components/site/BookingSection'
import { getCachedDentists, getCachedTestimonials, getCachedSiteSettings, getCachedServices } from '@/lib/cache'

export default async function HomePage() {
  const [testimonials, dentists, settings, services] = await Promise.all([
    getCachedTestimonials(),
    getCachedDentists(),
    getCachedSiteSettings(),
    getCachedServices(),
  ])

  const waNumber = settings.whatsappNumber

  return (
    <>
      <Navbar waNumber={waNumber} />
      <main>
        <Hero waNumber={waNumber} />
        <Pillars />
        <Services waNumber={waNumber} services={services} />
        <About waNumber={waNumber} />
        <Clinic />
        <BookingSection dentists={dentists} />
        <Testimonials testimonials={testimonials} />
        <Location settings={settings} />
      </main>
      <Footer settings={settings} />
      <WhatsAppFloat waNumber={waNumber} />
    </>
  )
}

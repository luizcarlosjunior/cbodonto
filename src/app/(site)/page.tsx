// src/app/(site)/page.tsx
import About from '@/components/site/About'
import BookingSection from '@/components/site/BookingSection'
import Clinic from '@/components/site/Clinic'
import Footer from '@/components/site/Footer'
import Hero from '@/components/site/Hero'
import Location from '@/components/site/Location'
import Navbar from '@/components/site/Navbar'
import Pillars from '@/components/site/Pillars'
import Services from '@/components/site/Services'
import Testimonials from '@/components/site/Testimonials'
import WhatsAppFloat from '@/components/site/WhatsAppFloat'
import { getCachedDentists, getCachedServices, getCachedSiteSettings, getCachedTestimonials } from '@/lib/cache'

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
      <Navbar waNumber={waNumber} instagramUrl={settings.instagramUrl} facebookUrl={settings.facebookUrl} />
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

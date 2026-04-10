// src/app/(site)/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import WhatsAppFloat from '@/components/site/WhatsAppFloat'
import {
  getCachedPageBySlug,
  getCachedActivePageSlugs,
  getCachedSiteSettings,
} from '@/lib/cache'

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const pages = await getCachedActivePageSlugs()
  return pages.map((p) => ({ slug: p.slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const page = await getCachedPageBySlug(params.slug)
  if (!page) return {}

  const title = page.seoTitle || page.title
  const description = page.seoDesc ?? undefined
  const keywords = page.seoTags ?? undefined

  return {
    title,
    description,
    keywords,
    openGraph: { title, description, type: 'website' },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const [page, settings] = await Promise.all([
    getCachedPageBySlug(params.slug),
    getCachedSiteSettings(),
  ])

  if (!page) notFound()

  const waNumber = settings.whatsappNumber

  return (
    <>
      <Navbar waNumber={waNumber} forceLight instagramUrl={settings.instagramUrl} facebookUrl={settings.facebookUrl} />

      <main className="min-h-screen bg-cream pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-[5%]">
          {/* Header */}
          <header className="mb-10 pb-8 border-b border-gold/20">
            <p className="text-[0.65rem] tracking-widest uppercase text-burgundy font-medium mb-3">
              /{page.slug}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight">
              {page.title}
            </h1>
            {page.seoDesc && (
              <p className="mt-4 text-stone-500 text-base leading-relaxed max-w-xl">
                {page.seoDesc}
              </p>
            )}
          </header>

          {/* Content */}
          {page.content ? (
            <div
              className="prose prose-stone prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-stone-900
                prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-stone-600 prose-p:leading-relaxed
                prose-a:text-burgundy prose-a:no-underline hover:prose-a:underline
                prose-strong:text-stone-800
                prose-blockquote:border-l-burgundy prose-blockquote:text-stone-500 prose-blockquote:font-serif prose-blockquote:text-xl
                prose-hr:border-gold/20
                prose-ul:text-stone-600 prose-ol:text-stone-600"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <p className="text-stone-400 italic">Conteúdo em breve.</p>
          )}
        </div>
      </main>

      <Footer settings={settings} />
      <WhatsAppFloat waNumber={waNumber} />
    </>
  )
}

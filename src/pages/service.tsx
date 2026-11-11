import { lazy, Suspense, type ComponentType } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ArticleCard, Container, ContactBand, PageHeader, ProjectCard, SectionTitle } from '@/components/blocks'
import { Reveal } from '@/components/motion/reveal'
import { ServiceIcon } from '@/components/service-icon'
import { articlesForService, getService, projectsForService, services, type ServiceKey } from '@/lib/content'
import { useSeo } from '@/hooks/use-seo'
import NotFoundPage from './not-found'

/** una sezione interattiva diversa per ogni servizio */
const interactive: Record<ServiceKey, { eyebrow: string; title: string; highlight?: string[]; C: ComponentType }> = {
  architettura: { eyebrow: 'Esplora', title: 'Quale spazio vuole trasformare?', highlight: ['spazio'], C: lazy(() => import('@/components/interactive/architettura-explorer')) },
  'efficientamento-energetico': { eyebrow: 'Sezione interattiva', title: 'Dove un edificio perde energia', highlight: ['energia'], C: lazy(() => import('@/components/interactive/efficienza-section')) },
  'fonti-rinnovabili': { eyebrow: 'Diagramma solare', title: 'Il percorso del sole su Darfo, mese per mese', highlight: ['sole'], C: lazy(() => import('@/components/interactive/sun-path')) },
  'direzione-lavori': { eyebrow: 'Percorso a tappe', title: 'Il cantiere, fase per fase', highlight: ['fase'], C: lazy(() => import('@/components/interactive/cantiere-timeline')) },
  'sicurezza-nei-cantieri': { eyebrow: 'Verifica rapida', title: 'Il suo cantiere ha bisogno del coordinatore?', highlight: ['coordinatore?'], C: lazy(() => import('@/components/interactive/sicurezza-check')) },
  'progettazione-impiantistica': { eyebrow: 'Livelli impiantistici', title: 'Gli impianti, uno strato alla volta', highlight: ['strato'], C: lazy(() => import('@/components/interactive/impianti-layers')) },
  'innovazione-e-tecnologia': { eyebrow: 'Dal modello al render', title: 'BIM, MEP e Real-Time Rendering', highlight: ['Real-Time'], C: lazy(() => import('@/components/interactive/innovazione-compare')) },
  'progettazione-antincendio': { eyebrow: 'Pianta interattiva', title: 'Esodo, compartimenti, presidi', highlight: ['Esodo,'], C: lazy(() => import('@/components/interactive/antincendio-plan')) },
  'calcoli-strutturali': { eyebrow: 'Laboratorio', title: 'Sposti il carico, guardi la trave rispondere', highlight: ['trave'], C: lazy(() => import('@/components/interactive/beam-lab')) },
}

export default function ServicePage() {
  const { slug = '' } = useParams()
  const service = getService(slug)
  useSeo(service ? service.short : 'Pagina non trovata', service ? `${service.short}: ${service.tagline}. ${service.paragraphs[0]}` : undefined)
  if (!service) return <NotFoundPage />

  const block = interactive[service.key]
  const related = projectsForService(service.key)
  const relatedArticles = articlesForService(service.key)
  const prev = services[(service.index - 1 + services.length) % services.length]
  const next = services[(service.index + 1) % services.length]
  const tagline = service.tagline.charAt(0).toUpperCase() + service.tagline.slice(1)
  const [lead, ...rest] = service.paragraphs

  return (
    <>
      <PageHeader
        eyebrow={`Servizi · ${String(service.index + 1).padStart(2, '0')}`}
        title={service.short}
        intro={tagline}
        aside={
          <div className="relative ml-auto grid aspect-square w-full max-w-[280px] place-items-center rounded-full border border-white/15">
            <div className="absolute inset-6 rounded-full border border-dashed border-gold/60 motion-safe:animate-[spin_40s_linear_infinite]" />
            <span className="grid size-24 place-items-center rounded-full bg-gold text-ink shadow-[0_20px_50px_-20px_rgba(199,146,42,0.9)]">
              <ServiceIcon slug={service.slug} className="size-10" />
            </span>
          </div>
        }
      />

      {/* testo originale del servizio */}
      <section className="py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <p className="font-serif text-[clamp(1.5rem,2.6vw,2.2rem)] leading-snug text-ink">{lead}</p>
          </Reveal>
          <div className="space-y-6 text-[1.05rem] leading-[1.85] text-[#5f6866]">
            {rest.map((p, i) => <Reveal key={i} delay={i * 0.06}><p>{p}</p></Reveal>)}
          </div>
        </Container>
      </section>

      {/* sezione interattiva dedicata */}
      <section className="bg-sand py-20 md:py-28">
        <Container>
          <SectionTitle eyebrow={block.eyebrow} title={block.title} highlight={block.highlight} />
          <div className="mt-12">
            <Suspense fallback={<div className="h-[420px] animate-pulse rounded-lg bg-sand" />}>
              <block.C />
            </Suspense>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="py-20 md:py-28">
          <Container>
            <SectionTitle eyebrow="Lavori correlati" title={`${service.short} nei nostri progetti`} />
            <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 6).map((p, i) => <Reveal key={p.slug} delay={(i % 3) * 0.08}><ProjectCard project={p} /></Reveal>)}
            </div>
          </Container>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className="bg-forest py-20 md:py-28">
          <Container>
            <SectionTitle dark eyebrow="Approfondimenti" title="Da leggere" />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {relatedArticles.slice(0, 3).map((a, i) => <Reveal key={a.slug} delay={i * 0.08}><ArticleCard article={a} /></Reveal>)}
            </div>
          </Container>
        </section>
      )}

      <nav className="border-t border-ink/5" aria-label="Altri servizi">
        <Container className="grid md:grid-cols-2">
          <Link to={`/servizi/${prev.slug}`} className="group flex items-center gap-5 border-b border-ink/5 py-10 md:border-b-0 md:border-r md:pr-8">
            <ArrowLeft className="size-6 shrink-0 text-gold transition-transform group-hover:-translate-x-1" />
            <span><span className="eyebrow block">Servizio precedente</span><span className="mt-1 block font-serif text-2xl text-ink">{prev.short}</span></span>
          </Link>
          <Link to={`/servizi/${next.slug}`} className="group flex items-center justify-end gap-5 py-10 text-right md:pl-8">
            <span><span className="eyebrow block">Servizio successivo</span><span className="mt-1 block font-serif text-2xl text-ink">{next.short}</span></span>
            <ArrowRight className="size-6 shrink-0 text-gold transition-transform group-hover:translate-x-1" />
          </Link>
        </Container>
      </nav>

      <ContactBand />
    </>
  )
}

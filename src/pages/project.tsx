import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react'
import { Container, ContactBand, ProjectCard } from '@/components/blocks'
import { ParallaxImage, Reveal, SplitHeading } from '@/components/motion/reveal'
import { Badge } from '@/components/ui/badge'
import { getProject, getService, projects } from '@/lib/content'
import { useSeo } from '@/hooks/use-seo'
import { cn } from '@/lib/utils'
import NotFoundPage from './not-found'

export default function ProjectPage() {
  const { slug = '' } = useParams()
  const project = getProject(slug)
  const [zoom, setZoom] = useState(false)
  useSeo(project ? project.title : 'Pagina non trovata', project?.description)
  if (!project) return <NotFoundPage />

  const idx = projects.indexOf(project)
  const next = projects[(idx + 1) % projects.length]
  const prev = projects[(idx - 1 + projects.length) % projects.length]
  const others = projects.filter((p) => p.slug !== project.slug && p.area === project.area).slice(0, 3)
  const img = project.image
  const tall = img && img.h > img.w * 1.1

  return (
    <>
      <article>
        <header className="relative overflow-hidden bg-forest pb-36 pt-36 text-white md:pb-44 md:pt-44">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_85%_10%,rgba(233,180,76,0.16),transparent_70%)]" />
          <Container className="relative">
            <Reveal><Link to="/progetti" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-gold"><ArrowLeft className="size-4" /> Tutti i progetti</Link></Reveal>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-end">
              <div>
                <Reveal><Badge>{project.area}</Badge></Reveal>
                <SplitHeading as="h1" text={project.title} className="mt-5 text-[clamp(2.6rem,6.6vw,6rem)] leading-[0.95] text-white" />
              </div>
              <Reveal delay={0.2}>
                <p className="font-serif text-[1.35rem] leading-snug text-white/85">{project.description}</p>
              </Reveal>
            </div>
          </Container>
        </header>

        {img && (
          <Container className="relative z-10 -mt-24 md:-mt-32">
            <Reveal>
              <button type="button" onClick={() => setZoom(true)} className="group relative block w-full overflow-hidden rounded-lg bg-sand shadow-[0_40px_80px_-40px_rgba(22,37,33,0.6)]" aria-label="Ingrandisci l'immagine">
                {project.isLogo ? (
                  <div className="grid aspect-[16/7] place-items-center bg-white">
                    <img src={img.src} alt={img.alt} width={img.w} height={img.h} className="max-h-[60%] w-auto max-w-[60%] object-contain" />
                  </div>
                ) : (
                  <ParallaxImage src={img.src} alt={img.alt} width={img.w} height={img.h} eager className={cn(tall ? 'aspect-[4/5] md:aspect-[16/10]' : 'aspect-[16/9]')} imgClassName={tall ? 'object-[50%_30%]' : ''} strength={8} />
                )}
                <span className="absolute bottom-5 right-5 grid size-12 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"><Expand className="size-5" /></span>
              </button>
            </Reveal>
          </Container>
        )}

        <section className="py-16 md:py-24">
          <Container className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <Reveal>
              <dl className="space-y-6 border-t-2 border-gold pt-6">
                <div><dt className="eyebrow">Ambito</dt><dd className="mt-1 font-serif text-xl text-ink">{project.area}</dd></div>
                {project.place && <div><dt className="eyebrow">Luogo</dt><dd className="mt-1 font-serif text-xl text-ink">{project.place}</dd></div>}
                {project.client && <div><dt className="eyebrow">Committente</dt><dd className="mt-1 font-serif text-xl text-ink">{project.client}</dd></div>}
              </dl>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="eyebrow">Servizi coinvolti</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {project.services.map((k) => {
                  const s = getService(k)
                  return s ? (
                    <li key={k}>
                      <Link to={`/servizi/${s.slug}`} className="group flex items-center justify-between rounded-md bg-white px-5 py-4 ring-1 ring-ink/5 transition-colors hover:bg-ink hover:text-white">
                        <span className="font-serif text-lg text-ink group-hover:text-white">{s.short}</span>
                        <ArrowRight className="size-4 text-gold transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ) : null
                })}
              </ul>
            </Reveal>
          </Container>
        </section>
      </article>

      <nav className="border-y border-ink/5 bg-white" aria-label="Altri progetti">
        <Container className="grid md:grid-cols-2">
          <Link to={`/progetti/${prev.slug}`} className="group flex items-center gap-5 border-b border-ink/5 py-10 md:border-b-0 md:border-r md:pr-8">
            <ArrowLeft className="size-6 shrink-0 text-gold transition-transform group-hover:-translate-x-1" />
            <span><span className="eyebrow block">Precedente</span><span className="mt-1 block font-serif text-2xl text-ink">{prev.title}</span></span>
          </Link>
          <Link to={`/progetti/${next.slug}`} className="group flex items-center justify-end gap-5 py-10 text-right md:pl-8">
            <span><span className="eyebrow block">Successivo</span><span className="mt-1 block font-serif text-2xl text-ink">{next.title}</span></span>
            <ArrowRight className="size-6 shrink-0 text-gold transition-transform group-hover:translate-x-1" />
          </Link>
        </Container>
      </nav>

      {others.length > 0 && (
        <section className="py-20 md:py-28">
          <Container>
            <h2 className="text-[clamp(1.8rem,3.6vw,2.8rem)]">Altri lavori: {project.area.toLowerCase()}</h2>
            <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3">
              {others.map((p, i) => <Reveal key={p.slug} delay={i * 0.08}><ProjectCard project={p} /></Reveal>)}
            </div>
          </Container>
        </section>
      )}

      <ContactBand />

      <AnimatePresence>
        {zoom && img && (
          <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-ink/92 p-4 md:p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(false)} role="dialog" aria-modal="true" aria-label={project.title}>
            <motion.img src={img.src} alt={img.alt} className={cn('max-h-full max-w-full rounded-md object-contain', project.isLogo && 'bg-white p-10')} initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} />
            <button className="absolute right-5 top-5 grid size-12 place-items-center rounded-full bg-gold text-ink" aria-label="Chiudi" autoFocus><X className="size-5" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

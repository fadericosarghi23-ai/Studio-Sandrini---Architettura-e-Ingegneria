import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Hero } from '@/components/hero/hero'
import { ArticleCard, Container, ContactBand, ProjectCard, SectionTitle } from '@/components/blocks'
import { Counter, Marquee, Reveal, Stagger, staggerItem } from '@/components/motion/reveal'
import { gsap, ScrollTrigger } from '@/components/motion/smooth-scroll'
import { ServiceIcon } from '@/components/service-icon'
import { Button } from '@/components/ui/button'
import { articles, projects, services, technologies, terrain } from '@/lib/content'
import { useSeo } from '@/hooks/use-seo'
import { motion } from 'framer-motion'

/** su mobile: carosello orizzontale a scorrimento; da md in su: griglia */
const rail = '-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 no-scrollbar md:mx-0 md:grid md:overflow-visible md:px-0 md:pb-0'
const railItem = 'w-[80%] shrink-0 snap-start md:w-auto'

export default function HomePage() {
  useSeo(null, services[0].paragraphs[0] + ' ' + services[0].paragraphs[1])
  const featured = ['linea-d-alpe', 'condominio', 'pro-loco-ski-area-centro-congressi', 'palazzo-comunale', 'fotovoltaico', 'interior-design']
    .map((s) => projects.find((p) => p.slug === s)!)
  const clients = projects.filter((p) => p.isLogo)

  return (
    <>
      <Hero />
      <div id="dopo-hero" />

      <section className="bg-gold py-6 text-ink">
        <Marquee items={services.map((s) => s.short)} />
      </section>

      {/* Le nostre attività: fascia verde bosco, come i blocchi del sito originale */}
      <section className="relative overflow-hidden bg-forest py-16 md:py-36">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_100%_0%,rgba(233,180,76,0.12),transparent_70%)]" />
        <Container>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionTitle dark eyebrow="Le nostre attività" title="Dall'idea al cantiere, ogni disciplina in un solo studio" highlight={['studio']} />
            <Reveal><Button asChild variant="outline-light"><Link to="/servizi">Tutti i servizi <ArrowRight /></Link></Button></Reveal>
          </div>
          <Stagger className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/10 md:mt-16 lg:grid-cols-3">
            {services.map((s) => (
              <motion.div key={s.slug} variants={staggerItem} className="bg-forest last:col-span-2 lg:last:col-span-1">
                <Link to={`/servizi/${s.slug}`} className="group relative flex h-full flex-col overflow-hidden p-4 transition-colors duration-500 hover:bg-[#25403e] sm:p-8 md:p-10">
                  <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
                  <div className="flex items-start justify-between">
                    <span className="grid size-10 place-items-center rounded-md bg-white/10 sm:size-12 text-gold transition-all duration-500 group-hover:-rotate-6 group-hover:bg-gold group-hover:text-ink">
                      <ServiceIcon slug={s.slug} className="size-5" />
                    </span>
                    <span className="font-serif text-sm text-white/30">{String(s.index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-[1.08rem] leading-tight text-white sm:mt-8 sm:text-[1.6rem]">{s.short}</h3>
                  <p className="mt-3 hidden text-[0.95rem] text-white/65 first-letter:uppercase sm:block">{s.tagline}</p>
                  <span className="mt-auto hidden items-center gap-2 pt-6 text-sm font-extrabold text-white opacity-60 sm:inline-flex transition-opacity group-hover:opacity-100">
                    Scopri <ArrowUpRight className="size-4 text-gold" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </Stagger>
        </Container>
      </section>

      <Numbers />

      <TechScroller />

      {/* Alcuni nostri lavori */}
      <section className="py-16 md:py-36">
        <Container>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionTitle eyebrow="Alcuni nostri lavori" title="Progetti dalla Val Camonica alle stazioni di Milano" highlight={['Val', 'Camonica']} />
            <Reveal><Button asChild variant="outline"><Link to="/progetti">Tutti i progetti <ArrowRight /></Link></Button></Reveal>
          </div>
          <div className={`mt-10 md:mt-16 md:gap-x-8 md:gap-y-14 md:grid-cols-2 lg:grid-cols-3 ${rail}`}>
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.12} y={0} className={railItem}>
                <ProjectCard project={p} wipe={(i % 3) * 0.12} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* committenti (dai progetti con logo) */}
      <section className="bg-forest py-12 md:py-20">
        <Container>
          <Reveal><p className="eyebrow text-center text-gold">Alcuni committenti dei nostri lavori</p></Reveal>
          <Stagger className="mt-6 grid grid-cols-3 items-center gap-3 md:mt-10 md:gap-6 lg:grid-cols-5">
            {clients.map((p) => (
              <motion.div key={p.slug} variants={staggerItem}>
                <Link to={`/progetti/${p.slug}`} className="group grid aspect-[3/2] place-items-center rounded-md bg-white p-3 ring-1 md:p-6 ring-ink/5 transition-shadow hover:shadow-lg" title={p.title}>
                  {p.image && <img src={p.image.sm} alt={p.image.alt} loading="lazy" className="max-h-20 w-full scale-110 object-contain opacity-75 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0" />}
                </Link>
              </motion.div>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Approfondimenti */}
      <section className="bg-sand py-16 md:py-36">
        <Container>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionTitle eyebrow="Approfondimenti" title="Incentivi e scadenze, spiegati dallo studio" highlight={['spiegati']} />
            <Reveal><Button asChild variant="outline"><Link to="/approfondimenti">Tutti gli articoli <ArrowRight /></Link></Button></Reveal>
          </div>
          <div className={`mt-10 md:mt-14 md:gap-6 md:grid-cols-3 ${rail}`}>
            {articles.slice(0, 3).map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.08} className={railItem}><ArticleCard article={a} /></Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ContactBand />
    </>
  )
}

function Numbers() {
  const items = [
    { n: services.length, label: 'discipline, dall’architettura ai calcoli strutturali' },
    { n: projects.length, label: 'lavori nel portfolio, pubblici e privati' },
    { n: technologies.length, label: 'tecnologie di progetto: BIM, MEP e Real-Time Rendering' },
    { n: Math.round(terrain.kmW), label: 'km di valle nel rilievo qui sopra, disegnato con dati reali' },
  ]
  return (
    <section className="bg-sand py-12 md:py-20">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-8 md:gap-10 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={i} delay={i * 0.08} className="border-l-2 border-gold pl-4 md:pl-6">
            <Counter value={it.n} className="font-serif text-5xl text-petrol md:text-7xl" />
            <p className="mt-2 max-w-[16rem] text-xs text-ink/70 md:mt-3 md:text-sm">{it.label}</p>
          </Reveal>
        ))}
      </Container>
    </section>
  )
}

/** BIM, MEP, Real-Time Rendering: scorrimento orizzontale agganciato allo scroll (desktop) */
function TechScroller() {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const el = track.current!
      const tween = gsap.to(el, {
        x: () => -(el.scrollWidth - window.innerWidth + 64),
        ease: 'none',
        scrollTrigger: { trigger: wrap.current, start: 'top top', end: () => `+=${el.scrollWidth - window.innerWidth}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
      })
      return () => { tween.scrollTrigger?.kill(); tween.kill() }
    })
    const t = setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => { clearTimeout(t); mm.revert() }
  }, [])

  return (
    <section ref={wrap} className="relative overflow-hidden bg-ink lg:h-screen">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_15%_50%,rgba(233,180,76,0.10),transparent_70%)]" />
      <div ref={track} className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 py-16 no-scrollbar md:gap-8 md:px-8 lg:h-full lg:w-max lg:snap-none lg:items-center lg:gap-16 lg:overflow-visible lg:py-0 lg:pl-[max(2rem,calc((100vw-1320px)/2+2rem))]">
        <div className="w-[80%] max-w-md shrink-0 snap-start self-center lg:w-auto">
          <p className="eyebrow text-gold">Innovazione e tecnologia</p>
          <h2 className="mt-4 text-[clamp(2rem,4.4vw,3.6rem)] text-white">Il progetto prende forma <span className="mark-gold">prima</span> del cantiere</h2>
          <Link to="/servizi/innovazione-e-tecnologia" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-white">
            Come lavoriamo <ArrowRight className="size-4 text-gold" />
          </Link>
        </div>
        {technologies.map((t, i) => (
          <article key={t.slug} className="group grid w-[82%] shrink-0 snap-start content-start gap-4 rounded-lg bg-white p-4 ring-1 ring-ink/5 md:w-[460px] lg:w-[760px] lg:grid-cols-[1fr_1.1fr] lg:gap-6 lg:p-6">
            <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-sand lg:aspect-auto">
              {t.image && <img src={t.image.sm} alt={t.image.alt.slice(0, 120)} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />}
            </div>
            <div className="flex flex-col py-1 lg:py-2">
              <span className="font-serif text-3xl text-gold lg:text-5xl">0{i + 1}</span>
              <h3 className="mt-2 font-serif text-xl leading-tight lg:mt-4 lg:text-2xl">{t.title}</h3>
              <p className="mt-3 line-clamp-4 text-[0.92rem] lg:mt-4 lg:line-clamp-[8] lg:text-[0.95rem]">{t.paragraphs[0]}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

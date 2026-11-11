import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Box, HardHat, PlugZap, Sparkles } from 'lucide-react'
import { Container, ContactBand, PageHeader, SectionTitle } from '@/components/blocks'
import { ContourField } from '@/components/contour-field'
import { Counter, Reveal } from '@/components/motion/reveal'
import { getProject, places, projects, services, site, technologies, terrain } from '@/lib/content'
import { useSeo } from '@/hooks/use-seo'
import { cn } from '@/lib/utils'

/*
 * NOTA: il sito attuale non ha una pagina "chi siamo" (la pagina About Us è lorem ipsum del tema).
 * I testi di questa pagina sono scritti da Altalogik a partire dai contenuti del sito e vanno
 * confermati dal cliente.
 */

const method = [
  { icon: Box, title: 'Modello BIM', text: 'Architettura, strutture e impianti nello stesso modello digitale: le interferenze si risolvono a tavolino.', to: '/servizi/innovazione-e-tecnologia' },
  { icon: PlugZap, title: 'Impianti coordinati', text: 'Con il MEP gli impianti meccanici, elettrici e idraulici si incastrano fra loro prima del cantiere.', to: '/servizi/progettazione-impiantistica' },
  { icon: Sparkles, title: 'Render in tempo reale', text: 'Il committente vede gli spazi prima che esistano e decide con consapevolezza.', to: '/servizi/innovazione-e-tecnologia' },
  { icon: HardHat, title: 'Cantiere seguito', text: 'Direzione lavori e sicurezza con presenza costante, fino alla consegna.', to: '/servizi/direzione-lavori' },
]

export default function StudioPage() {
  useSeo('Lo studio', `Studio Sandrini, Architettura e Ingegneria: ${site.contact.address}. Progettazione architettonica, impiantistica, strutturale ed energetica in Val Camonica e oltre.`)
  return (
    <>
      <PageHeader
        eyebrow="Lo studio"
        title="Architettura e ingegneria dalla Val Camonica"
        highlight={['Val', 'Camonica']}
        intro={<>Lo studio ha sede a {site.city}, in {site.contact.address.replace(/,.*$/, '')}. Progetta edifici e impianti, li rende più efficienti e ne segue la realizzazione: per enti pubblici, imprese e privati, in valle e fuori regione.</>}
      />

      <ValleyMap />

      <section className="bg-gold py-16 text-ink md:py-20">
        <Container className="grid gap-10 sm:grid-cols-3">
          {[
            { n: services.length, l: 'discipline di progetto' },
            { n: projects.length, l: 'lavori nel portfolio' },
            { n: technologies.length, l: 'tecnologie: BIM, MEP, Real-Time' },
          ].map((x, i) => (
            <Reveal key={x.l} delay={i * 0.08} className="border-l-2 border-ink/25 pl-6">
              <Counter value={x.n} className="font-serif text-7xl text-ink" />
              <p className="mt-2 text-ink/75">{x.l}</p>
            </Reveal>
          ))}
        </Container>
      </section>

      <section className="bg-sand py-24 md:py-32">
        <Container>
          <SectionTitle eyebrow="Come lavoriamo" title="Strumenti digitali, presenza in cantiere" highlight={['cantiere']}>
            Il metodo dello studio unisce la progettazione integrata in BIM e MEP alla visualizzazione in tempo reale, senza perdere il contatto diretto con il cantiere.
          </SectionTitle>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {method.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.08}>
                <Link to={m.to} className="group flex h-full flex-col rounded-lg bg-white p-7 ring-1 ring-ink/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(22,37,33,0.4)]">
                  <span className="grid size-12 place-items-center rounded-md bg-sand text-petrol transition-colors group-hover:bg-gold group-hover:text-ink"><m.icon className="size-5" /></span>
                  <h3 className="mt-6 font-serif text-2xl">{m.title}</h3>
                  <p className="mt-3 text-[0.95rem]">{m.text}</p>
                  <ArrowRight className="mt-auto size-5 pt-0 text-gold transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-ink py-20">
        <Container>
          <Reveal><p className="eyebrow text-gold">Per chi lavoriamo</p></Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            {['Ansaldo STS', 'Ferrovie Nord', 'DHL', 'Edifici pubblici in valle', 'Condomìni e privati'].map((c, i) => (
              <Reveal key={c} delay={i * 0.05} as="span" className="rounded-full bg-white px-5 py-3 font-serif text-lg text-ink ring-1 ring-ink/5">{c}</Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ContactBand title="Venga a trovarci a Darfo" />
    </>
  )
}

/** mappa a curve di livello con i lavori in valle: passando sui punti compare il progetto */
function ValleyMap() {
  const [active, setActive] = useState(0)
  const toPct = (lon: number, lat: number) => ({
    left: `${((lon - terrain.bbox.west) / (terrain.bbox.east - terrain.bbox.west)) * 100}%`,
    top: `${((terrain.bbox.north - lat) / (terrain.bbox.north - terrain.bbox.south)) * 100}%`,
  })
  const place = places[active]
  const project = getProject(place.project)

  return (
    <section className="py-20 md:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <Reveal className="relative aspect-square w-full overflow-hidden rounded-lg bg-white ring-1 ring-ink/5">
          <ContourField className="absolute inset-0 h-full w-full text-petrol/45" every={1} />
          {places.map((p, i) => (
            <button
              key={p.name}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              style={toPct(p.lon, p.lat)}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              aria-label={p.name}
              aria-pressed={i === active}
            >
              <span className={cn('block rounded-full border-[3px] border-white shadow-md transition-all duration-300', i === active ? 'size-6 bg-gold' : 'size-4 bg-petrol group-hover:bg-gold')} />
              {i === active && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-gold/50" />}
              <span className={cn('absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-ink', i === active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>{p.name}</span>
            </button>
          ))}
          <span className="absolute bottom-3 left-3 text-[0.65rem] text-text">Rilievo reale, curve ogni 100 m. Nord in alto.</span>
        </Reveal>
        <div>
          <SectionTitle eyebrow="Radici in valle" title="I nostri lavori, sulla mappa della Val Camonica" highlight={['mappa']} />
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="mt-10">
              {'studio' in place && place.studio ? (
                <div className="rounded-lg bg-forest p-7 text-white">
                  <p className="eyebrow text-gold">{place.name}</p>
                  <h3 className="mt-2 font-serif text-3xl text-white">La sede dello studio</h3>
                  <p className="mt-3 text-white/75">{site.contact.address}</p>
                  {project && <Link to={`/progetti/${project.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-gold">In città: {project.title} <ArrowRight className="size-4" /></Link>}
                </div>
              ) : project ? (
                <Link to={`/progetti/${project.slug}`} className="group grid grid-cols-[120px_1fr] gap-5 rounded-lg bg-white p-4 ring-1 ring-ink/5">
                  {project.image && <img src={project.image.sm} alt={project.image.alt} className="aspect-square w-full rounded-md object-cover" loading="lazy" />}
                  <div className="py-1">
                    <p className="eyebrow">{place.name}</p>
                    <h3 className="mt-1 font-serif text-2xl group-hover:text-petrol">{project.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm">{project.description}</p>
                  </div>
                </Link>
              ) : null}
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex flex-wrap gap-2">
            {places.map((p, i) => (
              <button key={p.name} onClick={() => setActive(i)} className={cn('rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors', i === active ? 'bg-ink text-white' : 'bg-sand text-ink hover:bg-gold')}>{p.name}</button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

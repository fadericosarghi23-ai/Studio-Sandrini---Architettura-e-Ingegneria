import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Container, ContactBand, PageHeader } from '@/components/blocks'
import { Reveal } from '@/components/motion/reveal'
import { ServiceIcon } from '@/components/service-icon'
import { services } from '@/lib/content'
import { useSeo } from '@/hooks/use-seo'
import { cn } from '@/lib/utils'

export default function ServicesPage() {
  useSeo('Servizi', 'Architettura, efficientamento energetico, fonti rinnovabili, direzione lavori, sicurezza nei cantieri, progettazione impiantistica e antincendio, calcoli strutturali, BIM e MEP.')
  const [hover, setHover] = useState<number | null>(null)

  return (
    <>
      <PageHeader eyebrow="Le nostre attività" title="Nove discipline, un solo interlocutore" highlight={['interlocutore']} intro="Dalla prima idea al collaudo: progettazione architettonica, impiantistica e strutturale, energia, sicurezza e direzione lavori nello stesso studio." />
      <section className="py-16 md:py-24">
        <Container>
          <ul className="border-t border-ink/10" onMouseLeave={() => setHover(null)}>
            {services.map((s, i) => (
              <Reveal as="li" key={s.slug} delay={i * 0.03} className="border-b border-ink/10">
                <Link to={`/servizi/${s.slug}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-5 py-7 md:grid-cols-[80px_1.1fr_1.4fr_auto] md:gap-8 md:py-9">
                  <span className="font-serif text-lg text-ink/30 transition-colors group-hover:text-gold">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className={cn('font-serif text-[clamp(1.6rem,3.6vw,3rem)] leading-none transition-all duration-500', hover !== null && hover !== i && 'opacity-30', 'group-hover:translate-x-2')}>
                    {s.short}
                  </h2>
                  <p className={cn('hidden text-[0.98rem] transition-opacity duration-500 md:block', hover !== null && hover !== i && 'opacity-30')}>
                    <span className="first-letter:uppercase">{s.tagline}</span>
                  </p>
                  <span className="grid size-12 place-items-center rounded-full border border-ink/15 text-ink transition-all duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold">
                    <ArrowUpRight className="size-5" />
                  </span>
                  <AnimatePresence>
                    {hover === i && (
                      <motion.span
                        layoutId="svc-icon"
                        className="pointer-events-none absolute right-24 top-1/2 hidden size-16 -translate-y-1/2 place-items-center rounded-full bg-forest text-gold lg:grid"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                      >
                        <ServiceIcon slug={s.slug} className="size-6" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>
      <ContactBand />
    </>
  )
}

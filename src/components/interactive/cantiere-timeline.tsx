import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck2, ClipboardList, Eye, HardHat, Users } from 'lucide-react'
import { gsap, ScrollTrigger } from '@/components/motion/smooth-scroll'
import { cn } from '@/lib/utils'

/** le tappe riprendono le attività elencate nel testo originale della direzione lavori */
const steps = [
  { icon: ClipboardList, title: 'Avvio del cantiere', text: 'Il progetto esecutivo diventa un programma di lavoro: fasi, squadre, forniture.' },
  { icon: HardHat, title: 'Gestione del cantiere', text: 'Ogni lavorazione viene seguita e verificata rispetto al progetto e agli standard qualitativi.' },
  { icon: Users, title: 'Coordinamento delle squadre', text: 'Imprese e artigiani lavorano nella sequenza giusta, senza sovrapposizioni.' },
  { icon: CalendarCheck2, title: 'Tempi, costi e qualità', text: 'Avanzamento, contabilità e varianti sotto controllo, con il committente sempre informato.' },
  { icon: Eye, title: 'Presenza costante', text: 'Un lavoro supervisionato nei minimi dettagli, fino alla consegna dell’opera.' },
]

export default function CantiereTimeline() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top 18%',
        end: () => `+=${steps.length * 380}`,
        pin: true,
        scrub: true,
        onUpdate: (self) => setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))),
      })
      gsap.fromTo('.cantiere-progress', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 18%', end: () => `+=${steps.length * 380}`, scrub: true } })
      return () => st.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <div ref={root} className="bg-white">
      {/* desktop: tappe agganciate allo scroll */}
      <div className="hidden lg:block">
        <div className="relative h-1 rounded-full bg-sand">
          <div className="cantiere-progress absolute inset-0 origin-left rounded-full bg-gold" />
        </div>
        <ol className="mt-8 grid grid-cols-5 gap-4">
          {steps.map((s, i) => (
            <li key={s.title}>
              <button onClick={() => setActive(i)} className={cn('w-full text-left transition-opacity duration-500', i <= active ? 'opacity-100' : 'opacity-35')}>
                <span className={cn('grid size-12 place-items-center rounded-full transition-colors duration-500', i === active ? 'bg-gold text-ink' : i < active ? 'bg-forest text-gold' : 'bg-sand text-ink')}>
                  <s.icon className="size-5" />
                </span>
                <span className="mt-4 block font-serif text-lg leading-tight text-ink">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-12 grid min-h-[200px] grid-cols-[120px_1fr] items-start gap-8 rounded-lg bg-paper p-10">
          <motion.span key={`n${active}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-8xl leading-none text-gold">0{active + 1}</motion.span>
          <motion.div key={active} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h3 className="font-serif text-4xl">{steps[active].title}</h3>
            <p className="mt-4 max-w-2xl text-lg">{steps[active].text}</p>
          </motion.div>
        </div>
      </div>

      {/* mobile: lista verticale */}
      <ol className="relative space-y-8 border-l-2 border-sand pl-8 lg:hidden">
        {steps.map((s, i) => (
          <motion.li key={s.title} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ delay: 0.05 * i }} className="relative">
            <span className="absolute -left-[3.15rem] grid size-9 place-items-center rounded-full bg-gold text-ink"><s.icon className="size-4" /></span>
            <span className="font-serif text-sm text-gold">0{i + 1}</span>
            <h3 className="font-serif text-2xl">{s.title}</h3>
            <p className="mt-2">{s.text}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

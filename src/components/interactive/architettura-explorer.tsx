import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Ear, Search, ScanEye } from 'lucide-react'
import { ProjectCard } from '@/components/blocks'
import { projects } from '@/lib/content'
import { cn } from '@/lib/utils'

/** le quattro tipologie citate nel testo originale del servizio */
const spaces = [
  { key: 'residenze', label: 'Residenze private' },
  { key: 'commerciali', label: 'Edifici commerciali' },
  { key: 'pubblici', label: 'Spazi pubblici' },
  { key: 'riqualificazione', label: 'Interventi di riqualificazione' },
] as const

/** l'approccio, con le tre parole del testo originale */
const approach = [
  { icon: Ear, title: 'Ascolto', text: 'Il progetto parte dalle esigenze di chi abiterà o userà lo spazio.' },
  { icon: Search, title: 'Ricerca', text: 'Soluzioni, materiali e tecnologie scelti per quel luogo e quel budget.' },
  { icon: ScanEye, title: 'Attenzione ai dettagli', text: 'Estetica e praticità in equilibrio, fino all’ultimo particolare.' },
]

export default function ArchitetturaExplorer() {
  const [active, setActive] = useState<(typeof spaces)[number]['key']>('residenze')
  const list = projects.filter((p) => p.spaces?.includes(active))

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar lg:flex-col lg:overflow-visible" role="tablist" aria-label="Tipologia di spazio">
          {spaces.map((s, i) => {
            const n = projects.filter((p) => p.spaces?.includes(s.key)).length
            const on = s.key === active
            return (
              <button
                key={s.key}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(s.key)}
                className={cn(
                  'group relative flex shrink-0 items-center justify-between gap-6 rounded-md px-5 py-4 text-left transition-colors duration-300 lg:py-5',
                  on ? 'bg-ink text-white' : 'bg-paper text-ink hover:bg-sand',
                )}
              >
                <span className="flex items-baseline gap-3">
                  <span className={cn('font-serif text-sm', on ? 'text-gold' : 'text-ink/35')}>0{i + 1}</span>
                  <span className="font-serif text-lg leading-tight lg:text-xl">{s.label}</span>
                </span>
                <span className={cn('grid size-8 place-items-center rounded-full text-xs font-extrabold', on ? 'bg-gold text-ink' : 'bg-white text-ink')}>{n}</span>
              </button>
            )
          })}
        </div>

        <motion.div layout className="grid content-start gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3" role="tabpanel">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <motion.div key={p.slug} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-20 grid gap-px overflow-hidden rounded-lg bg-ink/10 md:grid-cols-3">
        {approach.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.7 }}
            className="group bg-paper p-8 transition-colors hover:bg-forest"
          >
            <a.icon className="size-7 text-gold transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
            <h3 className="mt-6 font-serif text-2xl transition-colors group-hover:text-white">{a.title}</h3>
            <p className="mt-2 transition-colors group-hover:text-white/75">{a.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

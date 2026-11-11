import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Container, ContactBand, PageHeader, ProjectCard } from '@/components/blocks'
import { projectAreas, projects } from '@/lib/content'
import { useSeo } from '@/hooks/use-seo'
import { cn } from '@/lib/utils'

export default function ProjectsPage() {
  useSeo('Progetti', 'Alcuni lavori dello Studio Sandrini: efficientamento energetico di edifici pubblici in Val Camonica, impianti per stazioni ferroviarie, prevenzione incendi, fotovoltaico, architettura e interior design.')
  const [area, setArea] = useState<string>('Tutti')
  // prima i lavori con foto, poi quelli rappresentati dal logo del committente
  const ordered = [...projects.filter((p) => !p.isLogo), ...projects.filter((p) => p.isLogo)]
  const list = area === 'Tutti' ? ordered : ordered.filter((p) => p.area === area)
  const filters = ['Tutti', ...projectAreas]

  return (
    <>
      <PageHeader eyebrow="Alcuni nostri lavori" title="Progetti" intro="Edifici pubblici e privati in Val Camonica, impianti per il trasporto ferroviario, prevenzione incendi e analisi energetiche per grandi committenti." />
      <section className="py-14 md:py-20">
        <Container>
          <LayoutGroup>
            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar md:flex-wrap" role="tablist" aria-label="Filtra per ambito">
              {filters.map((f) => {
                const n = f === 'Tutti' ? projects.length : projects.filter((p) => p.area === f).length
                const on = f === area
                return (
                  <button key={f} role="tab" aria-selected={on} onClick={() => setArea(f)} className={cn('relative shrink-0 rounded-full px-5 py-2.5 text-sm font-extrabold transition-colors', on ? 'text-white' : 'text-ink hover:bg-sand')}>
                    {on && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                    <span className="relative">{f} <span className={cn('ml-1 text-xs', on ? 'text-gold' : 'text-ink/40')}>{n}</span></span>
                  </button>
                )
              })}
            </div>
            <motion.div layout className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {list.map((p, i) => (
                  <motion.div key={p.slug} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}>
                    <ProjectCard project={p} priority={i < 3} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        </Container>
      </section>
      <ContactBand title="Ha un progetto simile?" />
    </>
  )
}

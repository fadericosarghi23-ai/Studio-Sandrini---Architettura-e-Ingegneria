import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ArticleCard, Container, ContactBand, PageHeader } from '@/components/blocks'
import { Reveal } from '@/components/motion/reveal'
import { Badge } from '@/components/ui/badge'
import { articles } from '@/lib/content'
import { useSeo } from '@/hooks/use-seo'
import { cn, formatDate } from '@/lib/utils'

export default function ArticlesPage() {
  useSeo('Approfondimenti', 'Conto Termico 3.0, DM FER X, officine elettriche e incentivi per il fotovoltaico: gli approfondimenti dello Studio Sandrini.')
  const cats = ['Tutti', ...new Set(articles.flatMap((a) => a.categories))]
  const [cat, setCat] = useState('Tutti')
  const [first, ...rest] = articles
  const list = cat === 'Tutti' ? rest : articles.filter((a) => a.categories.includes(cat))

  return (
    <>
      <PageHeader eyebrow="Approfondimenti" title="Incentivi, scadenze, novità" highlight={['scadenze,']} intro="Conto Termico 3.0, fotovoltaico, impianti FER: gli aggiornamenti normativi che riguardano i nostri clienti, spiegati dallo studio." />

      <section className="pt-14 md:pt-20">
        <Container>
          <Reveal>
            <Link to={`/approfondimenti/${first.slug}`} className="group grid overflow-hidden rounded-lg bg-white ring-1 ring-ink/5 lg:grid-cols-[1.1fr_1fr]">
              <div className="relative aspect-[16/10] overflow-hidden bg-forest lg:aspect-auto">
                {first.cover && <img src={first.cover.src} alt={first.cover.alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />}
              </div>
              <div className="flex flex-col p-8 md:p-12">
                <Badge className="self-start">In evidenza</Badge>
                <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-petrol">{first.categories[0]} · <time dateTime={first.date}>{formatDate(first.date)}</time></p>
                <h2 className="mt-3 text-[clamp(1.8rem,3.2vw,2.6rem)] leading-tight transition-colors group-hover:text-petrol">{first.title}</h2>
                <p className="mt-5">{first.excerpt}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-extrabold text-ink">Leggi l&apos;articolo <ArrowRight className="size-4 text-gold transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
          </Reveal>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorie">
            {cats.map((c) => (
              <button key={c} role="tab" aria-selected={c === cat} onClick={() => setCat(c)} className={cn('rounded-full px-5 py-2.5 text-sm font-extrabold transition-colors', c === cat ? 'bg-ink text-white' : 'bg-sand text-ink hover:bg-gold')}>
                {c}
              </button>
            ))}
          </div>
          <motion.div layout className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((a) => (
                <motion.div key={a.slug} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4 }}>
                  <ArticleCard article={a} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </Container>
      </section>
      <ContactBand title="Vuole capire se può accedere agli incentivi?" />
    </>
  )
}

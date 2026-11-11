import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Mail, Phone } from 'lucide-react'
import { ContourField } from '@/components/contour-field'
import { Reveal, SplitHeading } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { site, type Article, type Project } from '@/lib/content'
import { cn, formatDate, telHref } from '@/lib/utils'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1320px] px-5 md:px-8', className)}>{children}</div>
}

/** intestazione delle pagine interne */
export function PageHeader({
  eyebrow, title, intro, children, highlight, aside,
}: { eyebrow: string; title: string; intro?: ReactNode; children?: ReactNode; highlight?: string[]; aside?: ReactNode }) {
  return (
    <header className="relative overflow-hidden bg-forest pb-16 pt-36 text-white md:pb-24 md:pt-44">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_85%_10%,rgba(233,180,76,0.16),transparent_70%),radial-gradient(ellipse_50%_70%_at_0%_100%,rgba(6,102,100,0.45),transparent_70%)]" />
      <ContourField className="pointer-events-none absolute -right-24 top-0 h-full w-[70%] text-gold/25 max-md:w-[140%]" />
      <Container className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <Reveal><p className="eyebrow text-gold">{eyebrow}</p></Reveal>
          <SplitHeading as="h1" text={title} highlight={highlight} className="mt-5 text-[clamp(2.6rem,6.4vw,5.6rem)] leading-[0.98] text-white" />
          {intro && <Reveal delay={0.25} className="mt-7 max-w-2xl text-[1.08rem] text-white/75">{intro}</Reveal>}
          {children}
        </div>
        {aside && <Reveal delay={0.35} className="hidden lg:block">{aside}</Reveal>}
      </Container>
    </header>
  )
}

/** dark: per le sezioni su fondo verde bosco o petrolio */
export function SectionTitle({ eyebrow, title, className, highlight, children, dark }: { eyebrow: string; title: string; className?: string; highlight?: string[]; children?: ReactNode; dark?: boolean }) {
  return (
    <div className={cn('max-w-3xl', className)}>
      <Reveal><p className={cn('eyebrow', dark && 'text-gold')}>{eyebrow}</p></Reveal>
      <SplitHeading text={title} highlight={highlight} className={cn('mt-4 text-[clamp(2rem,4.4vw,3.6rem)]', dark && 'text-white')} />
      {children && <Reveal delay={0.2} className={cn('mt-5 text-[1.05rem]', dark && 'text-white/75')}>{children}</Reveal>}
    </div>
  )
}

/**
 * wipe: entrata con tendina oro che scorre via e scopre la foto (ritardo in secondi).
 * Senza wipe la scheda non ha animazioni proprie (le gestisce chi la contiene).
 */
export function ProjectCard({ project, className, priority, tall, wipe }: { project: Project; className?: string; priority?: boolean; tall?: boolean; wipe?: number }) {
  const img = project.image
  const wiping = wipe !== undefined
  const ease = [0.76, 0, 0.24, 1] as const
  return (
    <motion.article layout className={cn('group relative', className)}>
      <Link to={`/progetti/${project.slug}`} className="block">
        <div className={cn('relative overflow-hidden rounded-md bg-sand', tall ? 'aspect-[4/3] lg:aspect-[4/5]' : 'aspect-[4/3]')}>
          {wiping && (
            <motion.span
              aria-hidden
              className="absolute inset-0 z-10 origin-right bg-gold"
              initial={{ scaleX: 1 }}
              whileInView={{ scaleX: 0 }}
              viewport={{ once: true, margin: '0px 0px -12% 0px' }}
              transition={{ duration: 0.9, delay: wipe + 0.15, ease }}
            />
          )}
          {img && (
            <motion.div
              className="absolute inset-0"
              initial={wiping ? { scale: 1.18 } : false}
              whileInView={wiping ? { scale: 1 } : undefined}
              viewport={{ once: true, margin: '0px 0px -12% 0px' }}
              transition={{ duration: 1.4, delay: wipe ? wipe + 0.15 : 0, ease: [0.22, 1, 0.36, 1] }}
            >
            <img
              src={img.sm}
              alt={img.alt}
              width={img.w}
              height={img.h}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className={cn(
                'absolute inset-0 h-full w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]',
                project.isLogo ? 'bg-white object-contain p-[14%]' : 'object-cover',
              )}
            />
            </motion.div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(22,37,33,0.75))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="absolute right-4 top-4 grid size-11 translate-y-2 place-items-center rounded-full bg-gold text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-5" />
          </span>
          <Badge variant="soft" className="absolute left-4 top-4 bg-white/90 backdrop-blur">{project.area}</Badge>
        </div>
        <div className="mt-4">
          <h3 className="font-serif text-[1.45rem] leading-tight transition-colors group-hover:text-petrol">{project.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[0.95rem]">{project.description}</p>
          {project.place && <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.16em] text-petrol">{project.place}</p>}
        </div>
      </Link>
    </motion.article>
  )
}

export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  return (
    <article className={cn('group relative flex h-full flex-col overflow-hidden rounded-md bg-white ring-1 ring-ink/10 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(22,37,33,0.35)]', className)}>
      <Link to={`/approfondimenti/${article.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-forest">
          {article.cover ? (
            <img src={article.cover.sm} alt={article.cover.alt} width={article.cover.w} height={article.cover.h} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
          ) : (
            <div className="grid h-full place-items-center">
              <ContourField animate={false} className="absolute inset-0 h-full w-full text-gold/40" />
              <span className="relative font-serif text-2xl text-white">{article.categories[0]}</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-wrap items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-petrol">
            <span>{article.categories[0]}</span>
            <span className="text-ink/30">·</span>
            <time dateTime={article.date} className="text-text">{formatDate(article.date)}</time>
          </div>
          <h3 className="mt-3 font-serif text-[1.3rem] leading-snug transition-colors group-hover:text-petrol">{article.title}</h3>
          <p className="mt-3 line-clamp-3 text-[0.94rem]">{article.excerpt}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-extrabold text-ink">
            Leggi <ArrowRight className="size-4 text-gold transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </article>
  )
}

/** fascia contatti in chiusura di pagina */
export function ContactBand({ title = 'Parliamo del suo progetto' }: { title?: string }) {
  return (
    <section className="relative overflow-hidden bg-forest py-16 text-white md:py-32">
      <ContourField className="pointer-events-none absolute inset-0 h-full w-full text-gold/15" />
      <Container className="relative grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-end">
        <div>
          <Reveal><p className="eyebrow text-gold">Contatti</p></Reveal>
          <SplitHeading text={title} className="mt-4 text-[clamp(2.2rem,5.4vw,4.6rem)] text-white" />
          <Reveal delay={0.2} className="mt-6 max-w-xl text-white/75">
            {site.contact.address}. Orari: dalle {site.contact.hours}.
          </Reveal>
        </div>
        <Reveal delay={0.3} className="flex flex-col gap-3">
          <Button asChild size="lg"><Link to="/contatti">Scrivici <ArrowRight /></Link></Button>
          <a href={telHref(site.contact.phones[0])} className="flex items-center gap-3 rounded-md border border-white/15 px-5 py-3 transition-colors hover:border-gold">
            <Phone className="size-4 text-gold" /> {site.contact.phones[0]}
          </a>
          <a href={`mailto:${site.contact.email}`} className="flex items-center gap-3 rounded-md border border-white/15 px-5 py-3 transition-colors hover:border-gold">
            <Mail className="size-4 text-gold" /> {site.contact.email}
          </a>
        </Reveal>
      </Container>
    </section>
  )
}

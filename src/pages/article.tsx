import { Link, useParams } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { ArticleCard, Container, ContactBand } from '@/components/blocks'
import { Reveal, SplitHeading } from '@/components/motion/reveal'
import { Badge } from '@/components/ui/badge'
import { articles, getArticle } from '@/lib/content'
import { useSeo } from '@/hooks/use-seo'
import { formatDate } from '@/lib/utils'
import NotFoundPage from './not-found'

export default function ArticlePage() {
  const { slug = '' } = useParams()
  const article = getArticle(slug)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  useSeo(article ? article.title : 'Pagina non trovata', article?.excerpt)
  if (!article) return <NotFoundPage />
  const more = articles.filter((a) => a.slug !== article.slug).slice(0, 3)

  return (
    <>
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gold" style={{ scaleX: progress }} aria-hidden />
      <article>
        <header className="relative overflow-hidden bg-forest pb-14 pt-36 text-white md:pb-20 md:pt-44">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_85%_10%,rgba(233,180,76,0.16),transparent_70%)]" />
          <Container className="relative max-w-4xl">
            <Reveal><Link to="/approfondimenti" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-gold"><ArrowLeft className="size-4" /> Approfondimenti</Link></Reveal>
            <Reveal delay={0.1} className="mt-8 flex flex-wrap items-center gap-3">
              {article.categories.map((c) => <Badge key={c}>{c}</Badge>)}
              <time dateTime={article.date} className="text-sm text-white/70">{formatDate(article.date)}</time>
              {article.author && <span className="text-sm text-white/70">· {article.author}</span>}
            </Reveal>
            <SplitHeading as="h1" text={article.title} className="mt-6 text-[clamp(2rem,4.8vw,3.8rem)] leading-[1.05] text-white" />
          </Container>
        </header>
        {article.cover && (
          <Container className="max-w-5xl pt-12 md:pt-16">
            <Reveal>
              <img src={article.cover.src} alt={article.cover.alt} width={article.cover.w} height={article.cover.h} className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain" />
            </Reveal>
          </Container>
        )}
        <Container className="max-w-3xl py-14 md:py-20">
          <Reveal>
            <div className="prose-sandrini" dangerouslySetInnerHTML={{ __html: article.html }} />
          </Reveal>
          {article.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 border-t border-ink/10 pt-8">
              {article.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
            </div>
          )}
        </Container>
      </article>
      <section className="bg-sand py-20">
        <Container>
          <h2 className="text-[clamp(1.8rem,3.6vw,2.8rem)]">Altri approfondimenti</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {more.map((a, i) => <Reveal key={a.slug} delay={i * 0.08}><ArticleCard article={a} /></Reveal>)}
          </div>
        </Container>
      </section>
      <ContactBand />
    </>
  )
}

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { animate, motion, useInView, useMotionValue, useScroll, useTransform, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

/** entrata allo scroll */
export function Reveal({
  children, className, delay = 0, y = 32, as = 'div',
}: { children: ReactNode; className?: string; delay?: number; y?: number; as?: 'div' | 'section' | 'li' | 'article' | 'p' | 'span' }) {
  const M = motion[as] as typeof motion.div
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </M>
  )
}

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}
export function Stagger({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'ul' | 'ol' }) {
  const M = motion[as] as typeof motion.div
  return (
    <M className={className} variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -10% 0px' }}>
      {children}
    </M>
  )
}

/** titolo che sale parola per parola dietro una maschera */
export function SplitHeading({
  text, as: Tag = 'h2', className, delay = 0, highlight,
}: { text: string; as?: ElementType; className?: string; delay?: number; highlight?: string[] }) {
  const words = text.split(' ')
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className={cn('inline-block', highlight?.some((h) => w.toLowerCase().startsWith(h.toLowerCase())) && 'mark-gold')}
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: delay + i * 0.06, ease }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  )
}

/** numero che conta quando entra in vista */
export function Counter({ value, className, duration = 1.8, format }: { value: number; className?: string; duration?: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const mv = useMotionValue(0)
  const [out, setOut] = useState('0')
  useEffect(() => {
    if (!inView) return
    const c = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setOut(format ? format(v) : Math.round(v).toLocaleString('it-IT')) })
    return () => c.stop()
  }, [inView, value, duration, format, mv])
  return <span ref={ref} className={cn('tabular-nums', className)}>{out}</span>
}

/** immagine con parallasse dentro una cornice */
export function ParallaxImage({
  src, alt, className, imgClassName, strength = 12, width, height, eager,
}: { src: string; alt: string; className?: string; imgClassName?: string; strength?: number; width?: number; height?: number; eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`])
  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={{ y, scale: 1 + strength / 50 }}
        className={cn('h-full w-full object-cover', imgClassName)}
      />
    </div>
  )
}

/** striscia che scorre */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = [...items, ...items]
  return (
    <div className={cn('relative flex overflow-hidden', className)} aria-hidden>
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap hover:[animation-play-state:paused]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-serif text-3xl md:text-5xl">
            {t}
            <span className="inline-block size-2.5 rotate-45 bg-current opacity-50" />
          </span>
        ))}
      </div>
    </div>
  )
}

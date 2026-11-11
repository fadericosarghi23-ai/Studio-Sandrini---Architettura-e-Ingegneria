import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MoveHorizontal } from 'lucide-react'
import { technologies } from '@/lib/content'
import { cn } from '@/lib/utils'

/** confronto trascinabile: a sinistra le linee del modello, a destra il render */
function Compare() {
  const box = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)
  const drag = useRef(false)
  const rtr = technologies.find((t) => t.slug === 'real-time-rendering')!
  const move = useCallback((x: number) => {
    const r = box.current!.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)))
  }, [])

  return (
    <div
      ref={box}
      className="relative aspect-[2/1] w-full touch-pan-y select-none overflow-hidden rounded-lg bg-paper"
      onPointerDown={(e) => { drag.current = true; move(e.clientX) }}
      onPointerMove={(e) => drag.current && move(e.clientX)}
      onPointerUp={() => (drag.current = false)}
      onPointerLeave={() => (drag.current = false)}
    >
      <img src={rtr.image!.src} alt="Render in tempo reale di un edificio residenziale" className="absolute inset-0 h-full w-full object-cover" loading="lazy" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src="/media/tech-real-time-rendering-linee.webp" alt="Lo stesso edificio come disegno a linee" className="h-full w-full object-cover" loading="lazy" draggable={false} />
      </div>
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink">Modello</span>
      <span className="absolute right-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-white">Render</span>
      <div className="absolute inset-y-0 w-0.5 bg-gold" style={{ left: `${pos}%` }}>
        <button
          type="button"
          role="slider"
          aria-label="Confronto modello e render"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5))
            if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5))
          }}
          className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-gold text-ink shadow-lg"
        >
          <MoveHorizontal className="size-5" />
        </button>
      </div>
    </div>
  )
}

export default function InnovazioneCompare() {
  const [tab, setTab] = useState(0)
  const t = technologies[tab]
  const label = (s: string) => (s === 'bim' ? 'BIM' : s === 'mep' ? 'MEP' : 'Real-Time Rendering')
  return (
    <div className="space-y-16">
      <Compare />
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="flex flex-wrap gap-2" role="tablist">
            {technologies.map((x, i) => (
              <button key={x.slug} role="tab" aria-selected={i === tab} onClick={() => setTab(i)} className={cn('rounded-full px-5 py-2.5 text-sm font-extrabold transition-colors', i === tab ? 'bg-ink text-white' : 'bg-paper text-ink hover:bg-sand')}>
                {label(x.slug)}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={t.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="mt-8">
              <h3 className="font-serif text-3xl leading-tight">{t.title}</h3>
              <div className="mt-5 space-y-4">{t.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
            </motion.div>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          {t.image && (
            <motion.div key={t.slug} initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }} className="overflow-hidden rounded-lg bg-paper">
              <img src={t.image.src} alt={t.title} width={t.image.w} height={t.image.h} loading="lazy" className="h-full max-h-[520px] w-full object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

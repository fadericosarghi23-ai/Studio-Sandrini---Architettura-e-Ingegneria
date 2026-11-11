import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/** i quattro tipi di impianto citati nel testo originale */
const layers = [
  {
    key: 'elettrico', label: 'Elettrici', color: '#e9b44c',
    text: 'Distribuzione, quadri, illuminazione e punti di utilizzo, dalla fornitura all’ultima presa.',
    paths: ['M60 300 H80 V90 H460', 'M80 200 H460', 'M80 300 H460', 'M200 90 V70', 'M340 90 V70', 'M200 200 V180', 'M340 200 V180', 'M200 300 V280', 'M340 300 V280'],
    dots: [[200, 66], [340, 66], [200, 176], [340, 176], [200, 276], [340, 276], [60, 300]],
  },
  {
    key: 'idraulico', label: 'Idraulici', color: '#066664',
    text: 'Adduzione e scarico dell’acqua, sanitari e reti antincendio dove richieste.',
    paths: ['M500 330 H420 V100', 'M420 130 H380', 'M420 240 H380', 'M120 330 V110', 'M120 140 H160', 'M120 250 H160'],
    dots: [[380, 130], [380, 240], [160, 140], [160, 250]],
  },
  {
    key: 'termotecnico', label: 'Termotecnici', color: '#c7922a',
    text: 'Riscaldamento, raffrescamento e produzione di acqua calda, con il generatore giusto per l’edificio.',
    paths: ['M250 320 V120', 'M262 320 V120', 'M250 150 H150', 'M262 150 H360', 'M250 260 H150', 'M262 260 H360'],
    dots: [[150, 150], [360, 150], [150, 260], [360, 260], [256, 320]],
  },
  {
    key: 'industriale', label: 'Industriali', color: '#08415c',
    text: 'Impianti a servizio di processi produttivi, logistica e infrastrutture.',
    paths: ['M30 60 H490', 'M30 60 V330', 'M490 60 V330', 'M100 60 V40', 'M420 60 V40'],
    dots: [[100, 36], [420, 36]],
  },
] as const

export default function ImpiantiLayers() {
  const [on, setOn] = useState<string[]>(['elettrico', 'termotecnico'])
  const toggle = (k: string) => setOn((o) => (o.includes(k) ? o.filter((x) => x !== k) : [...o, k]))
  const last = layers.find((l) => l.key === on.at(-1))

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-lg bg-forest p-4 md:p-8">
        <svg viewBox="0 0 520 360" className="h-auto w-full" role="img" aria-label="Sezione di un edificio con i livelli impiantistici attivi">
          {/* griglia da tavola tecnica */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="#fff" strokeOpacity=".05" />
            </pattern>
          </defs>
          <rect width="520" height="360" fill="url(#grid)" />
          {/* edificio */}
          <g fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2">
            <path d="M40 330 V100 L260 40 L480 100 V330 Z" />
            <path d="M40 220 H480 M40 110 H480" strokeOpacity=".3" />
            <path d="M10 330 H510" strokeOpacity=".8" />
          </g>
          <AnimatePresence>
            {layers.filter((l) => on.includes(l.key)).map((l) => (
              <motion.g key={l.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {l.paths.map((d, i) => (
                  <motion.path key={i} d={d} fill="none" stroke={l.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: i * 0.06, ease: 'easeInOut' }} />
                ))}
                {l.dots.map(([x, y], i) => (
                  <motion.circle key={`d${i}`} cx={x} cy={y} r="6" fill="#1e3231" stroke={l.color} strokeWidth="3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }} />
                ))}
              </motion.g>
            ))}
          </AnimatePresence>
        </svg>
      </div>
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-ink">Attivi i livelli</p>
        <div className="mt-4 grid gap-2">
          {layers.map((l) => {
            const active = on.includes(l.key)
            return (
              <button key={l.key} onClick={() => toggle(l.key)} aria-pressed={active} className={cn('flex items-center justify-between rounded-md border px-5 py-4 text-left transition-all duration-300', active ? 'border-transparent bg-paper shadow-sm' : 'border-ink/10 hover:bg-paper')}>
                <span className="flex items-center gap-4">
                  <span className="h-1.5 w-10 rounded-full transition-opacity" style={{ background: l.color, opacity: active ? 1 : 0.3 }} />
                  <span className="font-serif text-xl text-ink">{l.label}</span>
                </span>
                <span className={cn('relative h-6 w-11 rounded-full transition-colors', active ? 'bg-ink' : 'bg-ink/15')}>
                  <span className={cn('absolute top-1 size-4 rounded-full bg-white transition-all', active ? 'left-6' : 'left-1')} />
                </span>
              </button>
            )
          })}
        </div>
        <AnimatePresence mode="wait">
          {last && (
            <motion.p key={last.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 border-l-2 pl-4" style={{ borderColor: last.color }}>
              {last.text}
            </motion.p>
          )}
        </AnimatePresence>
        <p className="mt-6 text-sm">Sovrapporre i livelli è ciò che fa il modello MEP: gli impianti si coordinano tra loro prima di arrivare in cantiere.</p>
      </div>
    </div>
  )
}

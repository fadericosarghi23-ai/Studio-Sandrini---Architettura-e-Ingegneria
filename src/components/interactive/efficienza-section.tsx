import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Sezione di un edificio: punti cliccabili sui temi citati nel testo originale
 * (isolamento termico, uso delle risorse, rinnovabili, materiali) e confronto
 * qualitativo prima/dopo. Nessun valore numerico: è un'illustrazione.
 */
const spots = [
  { key: 'involucro', x: 92, y: 210, title: 'Isolamento termico', text: 'Pareti, copertura e serramenti sono il confine fra dentro e fuori: è lì che si decide quanta energia resta in casa.' },
  { key: 'risorse', x: 300, y: 300, title: 'Uso delle risorse', text: 'Impianti dimensionati sul fabbisogno reale, regolati per consumare solo quando serve.' },
  { key: 'rinnovabili', x: 250, y: 92, title: 'Energie rinnovabili', text: 'Fotovoltaico in copertura e sistemi integrati per produrre in loco una parte dell’energia usata.' },
  { key: 'materiali', x: 412, y: 236, title: 'Materiali', text: 'Materiali scelti per durata e prestazioni, adatti al clima di montagna e al contesto.' },
] as const

const leaks = [
  { d: 'M70 170 C 40 160, 30 140, 14 130', at: 'involucro' },
  { d: 'M70 250 C 40 250, 30 262, 12 272', at: 'involucro' },
  { d: 'M150 70 C 140 40, 150 24, 140 6', at: 'rinnovabili' },
  { d: 'M330 70 C 340 40, 330 24, 342 6', at: 'rinnovabili' },
  { d: 'M430 200 C 460 190, 470 172, 490 166', at: 'materiali' },
  { d: 'M430 280 C 462 284, 472 300, 492 306', at: 'materiali' },
]

export default function EfficienzaSection() {
  const [active, setActive] = useState<(typeof spots)[number]['key']>('involucro')
  const [after, setAfter] = useState(false)
  const spot = spots.find((s) => s.key === active)!

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
      <div className="relative rounded-lg bg-paper p-4 md:p-8">
        <div className="absolute right-4 top-4 z-10 flex rounded-full bg-white p-1 text-xs font-extrabold ring-1 ring-ink/10">
          {['Prima', 'Dopo'].map((l, i) => (
            <button key={l} onClick={() => setAfter(i === 1)} aria-pressed={after === (i === 1)} className={cn('rounded-full px-4 py-1.5 transition-colors', after === (i === 1) ? 'bg-ink text-white' : 'text-ink')}>
              {l}
            </button>
          ))}
        </div>
        <svg viewBox="0 0 500 360" className="h-auto w-full" role="img" aria-label="Sezione schematica di un edificio con i punti di dispersione">
          {/* terreno */}
          <path d="M0 320 H500" stroke="#162521" strokeOpacity=".25" strokeWidth="2" />
          <path d="M0 320 L500 320 L500 360 L0 360 Z" fill="#eeebe9" />
          {/* involucro */}
          <motion.path
            d="M70 320 V140 L250 50 L430 140 V320 Z"
            fill="#fff"
            stroke={after ? '#e9b44c' : '#162521'}
            animate={{ strokeWidth: after ? 12 : 3 }}
            transition={{ duration: 0.8 }}
            strokeLinejoin="round"
          />
          {/* solaio e stanze */}
          <path d="M70 230 H430 M250 230 V320 M250 140 V230" stroke="#162521" strokeOpacity=".2" strokeWidth="2" />
          {/* finestre */}
          {[[110, 160], [330, 160], [110, 255], [330, 255]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="60" height="40" fill="#f3f7f6" stroke={after ? '#066664' : '#162521'} strokeWidth={after ? 3 : 1.5} />
          ))}
          {/* fotovoltaico */}
          <AnimatePresence>
            {after && (
              <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {[0, 1, 2, 3].map((i) => (
                  <rect key={i} x={262 + i * 36} y={60 + i * 18} width="32" height="14" transform={`rotate(26.6 ${262 + i * 36} ${60 + i * 18})`} fill="#08415c" stroke="#e9b44c" strokeWidth="1" />
                ))}
              </motion.g>
            )}
          </AnimatePresence>
          {/* impianto */}
          <rect x="280" y="270" width="40" height="44" rx="4" fill={after ? '#066664' : '#707070'} />
          <path d="M300 270 V240 H380" stroke={after ? '#066664' : '#707070'} strokeWidth="3" fill="none" />
          {/* dispersioni */}
          {leaks.map((l, i) => (
            <motion.path
              key={i}
              d={l.d}
              fill="none"
              stroke="#c7922a"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="10 12"
              animate={{ opacity: after ? (i % 3 === 0 ? 0.35 : 0) : 0.9, strokeDashoffset: [0, -44] }}
              transition={{ opacity: { duration: 0.6 }, strokeDashoffset: { repeat: Infinity, duration: 1.4, ease: 'linear' } }}
            />
          ))}
          {/* punti */}
          {spots.map((s) => (
            <g key={s.key} role="button" tabIndex={0} aria-label={s.title} onClick={() => setActive(s.key)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActive(s.key)} className="cursor-pointer outline-none">
              <circle cx={s.x} cy={s.y} r="16" fill="#e9b44c" fillOpacity={s.key === active ? 0.35 : 0.15}>
                <animate attributeName="r" values="12;20;12" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx={s.x} cy={s.y} r="8" fill={s.key === active ? '#162521' : '#e9b44c'} stroke="#fff" strokeWidth="2.5" />
            </g>
          ))}
        </svg>
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          {spots.map((s) => (
            <button key={s.key} onClick={() => setActive(s.key)} className={cn('rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] transition-colors', s.key === active ? 'bg-gold text-ink' : 'bg-paper text-ink hover:bg-sand')}>
              {s.title}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="mt-8">
            <h3 className="font-serif text-3xl">{spot.title}</h3>
            <p className="mt-4 text-[1.05rem]">{spot.text}</p>
          </motion.div>
        </AnimatePresence>
        <p className="mt-8 border-l-2 border-gold pl-4 text-sm">
          {after ? 'Dopo: involucro isolato, serramenti migliorati, fotovoltaico e impianto efficiente. Le dispersioni si riducono.' : 'Prima: le frecce mostrano dove il calore esce dall’edificio. Provi a passare su “Dopo”.'}
        </p>
        <Link to="/approfondimenti/conto-termico-3-0-trasforma-la-diagnosi-energetica-in-un-opp" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-ink">
          Conto Termico 3.0 e diagnosi energetica <ArrowRight className="size-4 text-gold" />
        </Link>
      </div>
    </div>
  )
}

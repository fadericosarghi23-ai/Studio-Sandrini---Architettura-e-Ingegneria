import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/** pianta schematica di un edificio, con i tre livelli della progettazione antincendio */
const modes = [
  { key: 'esodo', label: 'Vie di esodo', color: '#066664', text: 'Percorsi chiari e dimensionati che portano tutti verso un luogo sicuro, con uscite di emergenza raggiungibili da ogni punto.' },
  { key: 'compartimenti', label: 'Compartimenti', color: '#c7922a', text: 'L’edificio diviso in zone resistenti al fuoco, perché un incendio resti confinato dove nasce.' },
  { key: 'presidi', label: 'Presidi', color: '#e9b44c', text: 'Estintori, idranti, rilevazione e allarme nei punti giusti, con impianti efficienti e tecnologicamente avanzati.' },
] as const

const routes = [
  'M120 110 H300 V40',
  'M120 250 H300',
  'M480 250 H300',
  'M480 110 H300',
  'M300 250 V330',
]

export default function AntincendioPlan() {
  const [on, setOn] = useState<string[]>(['esodo'])
  const toggle = (k: string) => setOn((o) => (o.includes(k) ? o.filter((x) => x !== k) : [...o, k]))

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.35fr_1fr]">
      <div className="rounded-lg bg-paper p-4 md:p-8">
        <svg viewBox="0 0 600 360" className="h-auto w-full" role="img" aria-label="Pianta schematica con vie di esodo, compartimenti e presidi">
          <defs>
            <pattern id="hatch" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#c7922a" strokeWidth="2.5" strokeOpacity=".35" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="#066664" />
            </marker>
          </defs>
          {/* compartimenti */}
          <AnimatePresence>
            {on.includes('compartimenti') && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <rect x="40" y="40" width="250" height="280" fill="url(#hatch)" />
                <rect x="310" y="40" width="250" height="280" fill="#c7922a" fillOpacity=".08" />
                <path d="M300 40 V320" stroke="#c7922a" strokeWidth="8" />
                <text x="165" y="186" textAnchor="middle" fontFamily="Mulish" fontWeight="800" fontSize="13" fill="#c7922a">Compartimento A</text>
                <text x="435" y="186" textAnchor="middle" fontFamily="Mulish" fontWeight="800" fontSize="13" fill="#c7922a">Compartimento B</text>
              </motion.g>
            )}
          </AnimatePresence>
          {/* muri */}
          <g fill="none" stroke="#162521" strokeWidth="5" strokeLinejoin="round">
            <path d="M40 40 H280 M320 40 H560 V320 H320 M280 320 H40 V40" />
            <path d="M40 180 H120 M160 180 H260 M340 180 H440 M480 180 H560" strokeWidth="3" />
            <path d="M200 40 V140 M200 220 V320 M400 40 V140 M400 220 V320" strokeWidth="3" />
          </g>
          {/* uscite */}
          {[[300, 40], [300, 320]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x - 22} y={y - 6} width="44" height="12" fill="#066664" />
              <text x={x} y={y + (y < 100 ? -12 : 26)} textAnchor="middle" fontSize="11" fontWeight="800" fill="#066664" fontFamily="Mulish">USCITA</text>
            </g>
          ))}
          {/* esodo */}
          <AnimatePresence>
            {on.includes('esodo') &&
              routes.map((d, i) => (
                <motion.path key={d} d={d} fill="none" stroke="#066664" strokeWidth="4" strokeDasharray="10 8" markerEnd="url(#arrow)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1, strokeDashoffset: [36, 0] }} exit={{ opacity: 0 }}
                  transition={{ opacity: { delay: i * 0.08 }, strokeDashoffset: { repeat: Infinity, duration: 0.9, ease: 'linear' } }} />
              ))}
          </AnimatePresence>
          {/* presidi */}
          <AnimatePresence>
            {on.includes('presidi') && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {[[80, 70, 'E'], [520, 70, 'E'], [80, 290, 'E'], [520, 290, 'E'], [250, 200, 'I'], [350, 200, 'I']].map(([x, y, t], i) => (
                  <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.06, type: 'spring' }} style={{ transformOrigin: `${x}px ${y}px` }}>
                    <circle cx={x} cy={y} r="13" fill={t === 'E' ? '#e9b44c' : '#c7922a'} stroke="#fff" strokeWidth="2" />
                    <text x={x} y={(y as number) + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="#162521" fontFamily="Mulish">{t}</text>
                  </motion.g>
                ))}
                {[[140, 110], [460, 110], [140, 250], [460, 250]].map(([x, y], i) => (
                  <circle key={`r${i}`} cx={x} cy={y} r="5" fill="none" stroke="#e9b44c" strokeWidth="2">
                    <animate attributeName="r" values="4;10;4" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                  </circle>
                ))}
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
        <p className="mt-3 text-xs">E: estintore · I: idrante · cerchi: rilevazione. Pianta schematica, a scopo illustrativo.</p>
      </div>
      <div className="space-y-3">
        {modes.map((m) => {
          const active = on.includes(m.key)
          return (
            <button key={m.key} onClick={() => toggle(m.key)} aria-pressed={active} className={cn('block w-full rounded-lg border p-5 text-left transition-all duration-300', active ? 'border-transparent bg-paper shadow-sm' : 'border-ink/10 opacity-70 hover:opacity-100')}>
              <span className="flex items-center gap-3">
                <span className="size-3 rounded-full" style={{ background: m.color }} />
                <span className="font-serif text-xl text-ink">{m.label}</span>
              </span>
              <AnimatePresence initial={false}>
                {active && (
                  <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="block overflow-hidden">
                    <span className="block pt-3">{m.text}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </div>
    </div>
  )
}

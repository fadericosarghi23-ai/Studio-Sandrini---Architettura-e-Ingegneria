import { useRef, useState } from 'react'

/**
 * Trave appoggiata con carico concentrato P a distanza a dall'appoggio A.
 * Formule della scienza delle costruzioni, risultati espressi in funzione di P e L:
 *   RA = P·b/L, RB = P·a/L, Mmax = P·a·b/L (sotto il carico),
 *   deformata: y(x) = P·b·x·(L² − b² − x²)/(6EIL) per x ≤ a (simmetrica per x > a).
 */
const L = 1
const X0 = 60
const X1 = 540
const Y = 140

function deflection(x: number, a: number) {
  const b = L - a
  if (x <= a) return (b * x * (L * L - b * b - x * x)) / (6 * L)
  const xp = L - x
  return (a * xp * (L * L - a * a - xp * xp)) / (6 * L)
}

export default function BeamLab() {
  const [a, setA] = useState(0.35)
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef(false)
  const b = L - a
  const RA = b / L
  const RB = a / L
  const M = (a * b) / L
  const toX = (t: number) => X0 + t * (X1 - X0)
  const maxDef = 1 / 48 // massimo assoluto (carico in mezzeria)
  const scale = 46 / maxDef
  const deformed = Array.from({ length: 61 }, (_, i) => {
    const t = i / 60
    return `${toX(t).toFixed(1)},${(Y + deflection(t, a) * scale).toFixed(1)}`
  }).join(' ')
  const Mscale = 70 / 0.25
  const moment = `${X0},260 ${toX(a)},${260 + M * Mscale} ${X1},260`

  const onMove = (clientX: number) => {
    const r = svg.current!.getBoundingClientRect()
    const vx = ((clientX - r.left) / r.width) * 600
    setA(Math.min(0.95, Math.max(0.05, (vx - X0) / (X1 - X0))))
  }
  const fmt = (n: number) => n.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-lg bg-forest p-4 text-white md:p-8">
        <svg
          ref={svg}
          viewBox="0 0 600 360"
          className="h-auto w-full touch-pan-y select-none"
          onPointerDown={(e) => { drag.current = true; onMove(e.clientX) }}
          onPointerMove={(e) => drag.current && onMove(e.clientX)}
          onPointerUp={() => (drag.current = false)}
          onPointerLeave={() => (drag.current = false)}
          role="img"
          aria-label={`Trave appoggiata con carico a ${Math.round(a * 100)}% della luce`}
        >
          {/* trave indeformata */}
          <line x1={X0} y1={Y} x2={X1} y2={Y} stroke="#fff" strokeOpacity=".25" strokeWidth="2" strokeDasharray="5 5" />
          {/* deformata (amplificata) */}
          <polyline points={deformed} fill="none" stroke="#e9b44c" strokeWidth="6" strokeLinecap="round" />
          {/* appoggi */}
          <path d={`M${X0} ${Y + 4} l-14 24 h28 z`} fill="#fff" />
          <path d={`M${X1} ${Y + 4} l-14 24 h28 z`} fill="#fff" />
          <circle cx={X1 - 8} cy={Y + 34} r="4" fill="#fff" /><circle cx={X1 + 8} cy={Y + 34} r="4" fill="#fff" />
          {/* reazioni */}
          <g stroke="#066664" fill="#066664" strokeWidth="4">
            <line x1={X0} y1={Y + 90 - RA * 50} x2={X0} y2={Y + 34} />
            <line x1={X1} y1={Y + 90 - RB * 50} x2={X1} y2={Y + 44} />
          </g>
          <text x={X0} y={Y + 108} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="Mulish">RA = {fmt(RA)} P</text>
          <text x={X1} y={Y + 108} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="Mulish">RB = {fmt(RB)} P</text>
          {/* carico */}
          <g transform={`translate(${toX(a)}, 0)`} style={{ cursor: 'ew-resize' }}>
            <rect x="-24" y="20" width="48" height="110" fill="transparent" />
            <line x1="0" y1="34" x2="0" y2={Y - 14 + deflection(a, a) * scale} stroke="#e9b44c" strokeWidth="4" />
            <path d={`M-9 ${Y - 18 + deflection(a, a) * scale} L0 ${Y - 2 + deflection(a, a) * scale} L9 ${Y - 18 + deflection(a, a) * scale} Z`} fill="#e9b44c" />
            <circle cy="30" r="14" fill="#e9b44c" />
            <text y="35" textAnchor="middle" fontSize="13" fontWeight="800" fill="#162521" fontFamily="Mulish">P</text>
          </g>
          {/* diagramma del momento */}
          <polygon points={moment} fill="#e9b44c" fillOpacity=".18" stroke="#e9b44c" strokeWidth="2" />
          <line x1={X0} y1="260" x2={X1} y2="260" stroke="#fff" strokeOpacity=".3" />
          <text x={toX(a)} y={260 + M * Mscale + 18} textAnchor="middle" fontSize="12" fontWeight="800" fill="#e9b44c" fontFamily="Mulish">Mmax = {fmt(M)} PL</text>
          <text x={X1} y="350" fontSize="11" fill="#fff" fillOpacity=".6" fontFamily="Mulish" textAnchor="end">diagramma del momento flettente</text>
        </svg>
        <label className="mt-4 block px-2">
          <span className="sr-only">Posizione del carico</span>
          <input type="range" min={0.05} max={0.95} step={0.01} value={a} onChange={(e) => setA(+e.target.value)} className="w-full accent-[#e9b44c]" />
        </label>
      </div>
      <div>
        <p className="text-[1.05rem]">
          Trascini il carico P lungo la trave. Le reazioni degli appoggi, il momento massimo e la deformata (qui amplificata) cambiano in tempo reale.
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-ink/10">
          {[
            ['Posizione a', `${fmt(a)} L`],
            ['Momento max', `${fmt(M)} PL`],
            ['Reazione A', `${fmt(RA)} P`],
            ['Reazione B', `${fmt(RB)} P`],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper p-5">
              <dt className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em]">{k}</dt>
              <dd className="mt-1 font-serif text-2xl text-ink tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm">
          Schema elementare a scopo divulgativo. Un calcolo strutturale reale considera carichi di normativa, azione sismica, materiali e verifiche secondo le NTC vigenti.
        </p>
      </div>
    </div>
  )
}

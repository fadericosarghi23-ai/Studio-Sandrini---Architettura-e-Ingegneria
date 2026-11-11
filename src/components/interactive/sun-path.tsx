import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { dayOfYear, formatHour, italyUtcOffset, MONTHS, sunPosition, sunriseSunset } from '@/lib/solar'

/**
 * Diagramma solare polare per Darfo Boario Terme (45,88° N): tutto calcolato,
 * nessun dato inventato. Utile per capire orientamento e ombre di un impianto.
 */
const R = 150
const C = 170
function polar(az: number, el: number) {
  const r = (R * (90 - Math.max(0, el))) / 90
  const a = (az * Math.PI) / 180
  return [C + r * Math.sin(a), C - r * Math.cos(a)] as const
}

function dayPath(doy: number, offset: number) {
  const { sunrise, sunset } = sunriseSunset(doy, offset)
  const pts: string[] = []
  for (let h = sunrise; h <= sunset; h += 0.1) {
    const p = sunPosition(doy, h, offset)
    const [x, y] = polar(p.azimuth, p.elevation)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return 'M' + pts.join('L')
}

export default function SunPath() {
  const [month, setMonth] = useState(5)
  const [hour, setHour] = useState(13)
  const offset = italyUtcOffset(month)
  const doy = dayOfYear(month, 21)
  const { sunrise, sunset } = useMemo(() => sunriseSunset(doy, offset), [doy, offset])
  const h = Math.min(sunset, Math.max(sunrise, hour))
  const pos = sunPosition(doy, h, offset)
  const [sx, sy] = polar(pos.azimuth, pos.elevation)
  const noonMax = useMemo(() => {
    let m = 0
    for (let t = sunrise; t <= sunset; t += 0.05) m = Math.max(m, sunPosition(doy, t, offset).elevation)
    return m
  }, [doy, offset, sunrise, sunset])
  const refs = useMemo(() => [11, 2, 5].map((m) => ({ m, d: dayPath(dayOfYear(m, 21), italyUtcOffset(m)) })), [])
  const current = useMemo(() => dayPath(doy, offset), [doy, offset])
  const light = sunset - sunrise
  const dir = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(pos.azimuth / 45) % 8]

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
      <div className="mx-auto w-full max-w-[520px]">
        <svg viewBox="0 0 340 340" className="h-auto w-full" role="img" aria-label={`Percorso del sole il 21 ${MONTHS[month]} a Darfo Boario Terme`}>
          {[0, 30, 60].map((el) => (
            <circle key={el} cx={C} cy={C} r={(R * (90 - el)) / 90} fill="none" stroke="#162521" strokeOpacity={el === 0 ? 0.35 : 0.12} strokeDasharray={el ? '3 4' : undefined} />
          ))}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((az) => {
            const [x, y] = polar(az, 0)
            return <line key={az} x1={C} y1={C} x2={x} y2={y} stroke="#162521" strokeOpacity=".08" />
          })}
          {[['N', 0], ['E', 90], ['S', 180], ['O', 270]].map(([l, az]) => {
            const [x, y] = polar(az as number, -8)
            const r = R + 12
            const a = ((az as number) * Math.PI) / 180
            return <text key={l} x={C + r * Math.sin(a)} y={C - r * Math.cos(a) + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#066664" fontFamily="Mulish" data-x={x} data-y={y}>{l}</text>
          })}
          <text x={C + 4} y={C - (R * 60) / 90 - 4} fontSize="8" fill="#707070" fontFamily="Mulish">30°</text>
          <text x={C + 4} y={C - (R * 30) / 90 - 4} fontSize="8" fill="#707070" fontFamily="Mulish">60°</text>
          {refs.map((r) => <path key={r.m} d={r.d} fill="none" stroke="#162521" strokeOpacity=".18" strokeWidth="1.2" />)}
          <motion.path key={month} d={current} fill="none" stroke="#e9b44c" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9 }} />
          <line x1={C} y1={C} x2={sx} y2={sy} stroke="#e9b44c" strokeOpacity=".6" strokeDasharray="2 3" />
          <circle cx={sx} cy={sy} r="14" fill="#e9b44c" fillOpacity=".25" />
          <circle cx={sx} cy={sy} r="7" fill="#e9b44c" stroke="#fff" strokeWidth="2" />
          <circle cx={C} cy={C} r="3" fill="#162521" />
        </svg>
        <p className="mt-2 text-center text-xs">In grigio i percorsi del 21 dicembre, 21 marzo e 21 giugno; in oro il mese scelto.</p>
      </div>

      <div>
        <label className="block">
          <span className="flex justify-between text-xs font-extrabold uppercase tracking-[0.16em] text-ink"><span>Giorno</span><span className="text-petrol">21 {MONTHS[month]}</span></span>
          <input type="range" min={0} max={11} step={1} value={month} onChange={(e) => setMonth(+e.target.value)} className="mt-3 w-full accent-[#e9b44c]" />
        </label>
        <label className="mt-8 block">
          <span className="flex justify-between text-xs font-extrabold uppercase tracking-[0.16em] text-ink"><span>Ora</span><span className="text-petrol">{formatHour(h)}</span></span>
          <input type="range" min={4} max={22} step={0.25} value={hour} onChange={(e) => setHour(+e.target.value)} className="mt-3 w-full accent-[#e9b44c]" />
        </label>
        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-ink/10">
          {[
            ['Alba', formatHour(sunrise)],
            ['Tramonto', formatHour(sunset)],
            ['Ore di luce', `${Math.floor(light)} h ${Math.round((light % 1) * 60)} min`],
            ['Altezza massima', `${Math.round(noonMax)}°`],
            ['Altezza ora', `${Math.max(0, Math.round(pos.elevation))}°`],
            ['Direzione', `${dir}, ${Math.round(pos.azimuth)}°`],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper p-5">
              <dt className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em]">{k}</dt>
              <dd className="mt-1 font-serif text-2xl text-ink tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm">
          Calcolo astronomico per la latitudine di Darfo Boario Terme, senza ostacoli all&apos;orizzonte. In valle montagne ed edifici vicini accorciano le ore di sole: per questo ogni impianto si progetta sul posto.
        </p>
      </div>
    </div>
  )
}

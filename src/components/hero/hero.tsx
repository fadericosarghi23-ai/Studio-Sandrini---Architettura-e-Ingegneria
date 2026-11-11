import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContourField } from '@/components/contour-field'
import { getProject, places, services, terrain } from '@/lib/content'
import { dayOfYear, formatHour, italyUtcOffset, MONTHS, sunPosition, sunriseSunset, sunVector } from '@/lib/solar'
import { hasWebGL, prefersReducedMotion } from '@/lib/webgl'
import type { PinTarget, SceneState } from './terrain-scene'
import { cn } from '@/lib/utils'

const TerrainScene = lazy(() => import('./terrain-scene'))

const architettura = services.find((s) => s.slug === 'architettura')!

export function Hero() {
  const now = useMemo(() => new Date(), [])
  const month = now.getMonth()
  const doy = dayOfYear(month, now.getDate())
  const offset = italyUtcOffset(month)
  const { sunrise, sunset } = useMemo(() => sunriseSunset(doy, offset), [doy, offset])

  const startHour = sunrise + 0.4
  const restHour = Math.min(sunset - 1, Math.max(sunrise + 2.5, 10.5))
  const [hour, setHour] = useState(prefersReducedMotion() ? restHour : startHour)
  const pos = sunPosition(doy, hour, offset)

  const state = useRef<SceneState>({ sun: sunVector(pos), elevation: pos.elevation, pointer: [0, 0], scroll: 0, reveal: prefersReducedMotion() ? 1 : 0 })
  state.current.sun = sunVector(pos)
  state.current.elevation = pos.elevation

  const pins = useRef<PinTarget[]>(places.map((p) => ({ lat: p.lat, lon: p.lon, el: null })))
  const [webgl] = useState(() => hasWebGL())
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const touched = useRef(false)
  const section = useRef<HTMLElement>(null)

  // intro: le curve si rivelano dallo studio e il sole sale dall'alba alla mattina
  useEffect(() => {
    if (!ready || prefersReducedMotion()) return
    const a = animate(0, 1, { duration: 3.2, ease: [0.65, 0, 0.35, 1], onUpdate: (v) => { state.current.reveal = v } })
    const b = animate(startHour, restHour, { duration: 3.6, ease: [0.45, 0, 0.2, 1], onUpdate: (v) => { if (!touched.current) setHour(v) } })
    return () => { a.stop(); b.stop() }
  }, [ready, startHour, restHour])

  useEffect(() => {
    const el = section.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 })
    io.observe(el)
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      state.current.pointer = [(e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1]
    }
    const onScroll = () => { state.current.scroll = Math.min(1, window.scrollY / Math.max(1, el.offsetHeight)) }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { io.disconnect(); window.removeEventListener('pointermove', onMove); window.removeEventListener('scroll', onScroll) }
  }, [])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const onHour = useCallback((h: number) => { touched.current = true; state.current.reveal = Math.max(state.current.reveal, 1); setHour(h) }, [])

  return (
    <section ref={section} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-paper" aria-label="Studio Sandrini, Architettura e Ingegneria">
      {/* livello 3D (o fallback 2.5D) */}
      <div className="absolute inset-0 -z-10">
        <SunGlow azimuth={pos.azimuth} elevation={pos.elevation} />
        <TerrainFallback hidden={webgl && ready} sunAzimuth={pos.azimuth} sunElevation={pos.elevation} />
        {webgl && (
          <Suspense fallback={null}>
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1.2 }}>
              <TerrainScene state={state} pins={pins} active={visible} onReady={() => setReady(true)} />
            </motion.div>
          </Suspense>
        )}
        {/* sfumatura in alto: la navbar resta su fondo chiaro */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,rgba(243,247,246,0.95),rgba(243,247,246,0))]" />
        {/* velo per la leggibilità del testo */}
        <div className="pointer-events-none absolute inset-0 lg:bg-[radial-gradient(ellipse_640px_520px_at_max(380px,calc(50%-330px))_52%,rgba(243,247,246,0.92)_0%,rgba(243,247,246,0.75)_45%,rgba(243,247,246,0)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(243,247,246,0.96)_0%,rgba(243,247,246,0.86)_55%,rgba(243,247,246,0.35)_78%,rgba(243,247,246,0.6)_100%)]" />
      </div>

      <MapFrame />

      {/* segnaposto dei progetti sul rilievo: sopra il blocco del titolo (largo quanto l'hero), sotto la scheda del sole */}
      {webgl && (
        <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden={!ready}>
          {places.map((p, i) => {
            const project = getProject(p.project)
            return (
              <div key={p.name} ref={(el) => { pins.current[i].el = el }} className="invisible absolute left-0 top-0 opacity-0 transition-[opacity,visibility] duration-500" style={{ willChange: 'transform' }}>
                <Link
                  to={'studio' in p && p.studio ? '/studio' : `/progetti/${p.project}`}
                  aria-label={'studio' in p && p.studio ? `${p.name}: la sede dello studio` : `${p.name}: ${project?.title ?? 'progetto'}`}
                  className="group pointer-events-auto absolute -bottom-2 left-0 flex -translate-x-1/2 cursor-pointer flex-col items-center p-2 transition-transform duration-300 hover:-translate-y-1"
                  tabIndex={ready ? 0 : -1}
                >
                  <span className="mb-1.5 whitespace-nowrap rounded-full bg-white/90 px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-ink shadow-sm ring-1 ring-ink/10 backdrop-blur transition-colors group-hover:bg-gold">
                    {p.name}
                    <span className="inline-block max-w-0 overflow-hidden whitespace-nowrap align-bottom font-sans normal-case tracking-normal transition-[max-width] duration-500 group-hover:max-w-[18rem] group-focus-visible:max-w-[18rem]">
                      {'studio' in p && p.studio ? ' · lo studio' : project ? ` · ${project.title}` : ''}
                    </span>
                  </span>
                  <span className={cn('block h-6 w-px bg-ink/40', 'studio' in p && p.studio && 'h-9 bg-gold')} />
                  <span className={cn('block size-2.5 rounded-full border-2 border-white bg-petrol shadow', 'studio' in p && p.studio && 'size-3.5 bg-gold')} />
                </Link>
              </div>
            )
          })}
        </div>
      )}

      <motion.div style={{ y: textY, opacity: textOpacity }} className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col justify-center px-5 pb-8 pt-28 md:px-8 md:pt-32 lg:pb-36">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="eyebrow">
          Darfo Boario Terme · Val Camonica
        </motion.p>
        <h1 className="mt-5 max-w-[11ch] font-serif text-[clamp(3.2rem,9vw,8.4rem)] leading-[0.92] text-ink">
          {['Studio', 'Sandrini'].map((w, i) => (
            <span key={w} className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}>
                {i === 0 ? `${w} ` : w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.9, delay: 0.75, ease: [0.76, 0, 0.24, 1] }}
          className="mt-4 inline-block self-start bg-gold px-3 py-1 font-serif text-[clamp(1.15rem,2.4vw,2rem)] text-white"
        >
          Architettura e Ingegneria
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="mt-7 max-w-md text-[1.05rem] text-[#5f6866]">
          {architettura.paragraphs[0]}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.8 }} className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/contatti">Contattaci <ArrowRight className="transition-transform group-hover/btn:translate-x-1" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/progetti">I nostri lavori</Link>
          </Button>
        </motion.div>
      </motion.div>

      <SunArc
        hour={hour}
        onHour={onHour}
        sunrise={sunrise}
        sunset={sunset}
        doy={doy}
        offset={offset}
        dateLabel={`${now.getDate()} ${MONTHS[month]}`}
        elevation={pos.elevation}
      />

    </section>
  )
}

/** arco del sole di oggi: trascinando si sposta l'ora e la luce sul rilievo */
function SunArc({
  hour, onHour, sunrise, sunset, doy, offset, dateLabel, elevation,
}: { hour: number; onHour: (h: number) => void; sunrise: number; sunset: number; doy: number; offset: number; dateLabel: string; elevation: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  const VW = 600, VH = 120, PAD = 24
  const maxEl = useMemo(() => {
    let m = 0
    for (let h = sunrise; h <= sunset; h += 0.25) m = Math.max(m, sunPosition(doy, h, offset).elevation)
    return m
  }, [doy, offset, sunrise, sunset])
  const toX = (h: number) => PAD + ((h - sunrise) / (sunset - sunrise)) * (VW - PAD * 2)
  const toY = (el: number) => VH - 14 - (Math.max(0, el) / maxEl) * (VH - 40)
  const path = useMemo(() => {
    const pts: string[] = []
    for (let h = sunrise; h <= sunset + 0.001; h += 0.2) pts.push(`${toX(h).toFixed(1)},${toY(sunPosition(doy, h, offset).elevation).toFixed(1)}`)
    return 'M' + pts.join('L')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doy, offset, sunrise, sunset, maxEl])

  const fromEvent = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect()
    const x = ((clientX - r.left) / r.width) * VW
    const h = sunrise + ((x - PAD) / (VW - PAD * 2)) * (sunset - sunrise)
    onHour(Math.min(sunset, Math.max(sunrise, h)))
  }

  const step = (sunset - sunrise) / 48
  return (
    <div className="pointer-events-none relative z-10 lg:absolute lg:inset-x-0 lg:bottom-0">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-5 pb-6 md:flex-row-reverse md:items-end md:justify-between md:px-8 md:pb-8">
        <div className="pointer-events-auto w-full max-w-[520px] rounded-lg bg-white/80 p-3 pb-2 shadow-[0_20px_60px_-30px_rgba(22,37,33,0.5)] ring-1 ring-ink/5 backdrop-blur-md">
          <div className="flex items-baseline justify-between px-1 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-ink">
            <span>Il sole su Darfo, {dateLabel}</span>
            <span className="tabular-nums text-petrol">
              {formatHour(hour)} · {elevation > 0 ? `${Math.round(elevation)}° sull'orizzonte` : 'sotto l’orizzonte'}
            </span>
          </div>
          <svg
            ref={ref}
            viewBox={`0 0 ${VW} ${VH}`}
            className="mt-1 h-auto w-full touch-none select-none"
            role="slider"
            tabIndex={0}
            aria-label="Ora del giorno: sposta il sole sul rilievo"
            aria-valuemin={Math.round(sunrise * 60)}
            aria-valuemax={Math.round(sunset * 60)}
            aria-valuenow={Math.round(hour * 60)}
            aria-valuetext={formatHour(hour)}
            onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); fromEvent(e.clientX) }}
            onPointerMove={(e) => { if (dragging.current) fromEvent(e.clientX) }}
            onPointerUp={() => { dragging.current = false }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onHour(Math.min(sunset, hour + step)) }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onHour(Math.max(sunrise, hour - step)) }
            }}
            style={{ cursor: 'ew-resize' }}
          >
            <line x1={PAD} x2={VW - PAD} y1={VH - 14} y2={VH - 14} stroke="#162521" strokeOpacity="0.2" />
            <path d={path} fill="none" stroke="#e9b44c" strokeWidth="2" strokeDasharray="4 5" />
            <path d={`${path}L${toX(sunset)},${VH - 14}L${toX(sunrise)},${VH - 14}Z`} fill="#e9b44c" fillOpacity="0.08" />
            <g transform={`translate(${toX(hour)}, ${toY(elevation)})`}>
              <circle r="16" fill="#e9b44c" fillOpacity="0.2" />
              <circle r="9" fill="#e9b44c" stroke="#fff" strokeWidth="2.5" />
            </g>
            <text x={PAD} y={VH - 1} fontSize="11" fill="#707070" fontFamily="Mulish">alba {formatHour(sunrise)}</text>
            <text x={VW - PAD} y={VH - 1} fontSize="11" fill="#707070" fontFamily="Mulish" textAnchor="end">tramonto {formatHour(sunset)}</text>
          </svg>
          <p className="mt-1 border-t border-ink/5 px-1 pt-2 text-[0.68rem] leading-snug text-text">
            Rilievo reale della valle, {Math.round(terrain.kmW)} × {Math.round(terrain.kmH)} km: curve ogni 100 m, in oro ogni 500 m. Trascini il sole per spostare luce e ombre.
          </p>
        </div>
            </div>
    </div>
  )
}

/** fallback 2.5D: le stesse curve reali in SVG, con un sole che si sposta */
function TerrainFallback({ hidden, sunAzimuth, sunElevation }: { hidden: boolean; sunAzimuth: number; sunElevation: number }) {
  const x = 50 + Math.sin((sunAzimuth * Math.PI) / 180) * 40
  const y = 50 + Math.cos((sunAzimuth * Math.PI) / 180) * 40
  return (
    <div className={cn('absolute inset-0 transition-opacity duration-1000', hidden && 'opacity-0')} aria-hidden>
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at ${x}% ${y}%, rgba(233,180,76,${sunElevation > 0 ? 0.28 : 0.05}), transparent 55%)` }}
      />
      <ContourField className="absolute right-[-10%] top-0 h-full w-[85%] text-petrol/40 max-lg:right-[-30%] max-lg:w-[130%]" every={1} />
    </div>
  )
}

/** alone caldo nel cielo, nella direzione del sole (la camera guarda verso nord: est a destra) */
function SunGlow({ azimuth, elevation }: { azimuth: number; elevation: number }) {
  const x = 100 - ((Math.min(270, Math.max(90, azimuth)) - 90) / 180) * 100
  const y = 40 - Math.max(0, elevation) * 1.1
  const a = elevation > 0 ? 0.26 + Math.min(0.14, (1 - elevation / 60) * 0.14) : 0.06
  return (
    <div
      aria-hidden
      className="absolute inset-0 transition-[background] duration-700"
      style={{
        background: `radial-gradient(ellipse 55% 45% at ${x}% ${y}%, rgba(233,180,76,${a}), rgba(233,180,76,0) 70%), radial-gradient(120% 55% at 50% 0%, rgba(6,102,100,0.07), rgba(6,102,100,0) 70%)`,
      }}
    />
  )
}

/** cornice da carta topografica: angoli e nord (la camera guarda verso nord) */
function MapFrame() {
  const corner = 'absolute size-5 border-ink/35'
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-6 bottom-6 top-24 z-0 hidden text-[0.62rem] font-extrabold tracking-[0.14em] text-ink/45 lg:block">
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />
      <span className="absolute bottom-14 left-0 flex flex-col items-center gap-1 pl-1 text-ink/55">
        <svg viewBox="0 0 20 28" className="h-7 w-5"><path d="M10 0 L17 26 L10 20 L3 26 Z" fill="#e9b44c" /><path d="M10 0 L10 20 L3 26 Z" fill="#162521" fillOpacity=".55" /></svg>
        N
      </span>
    </div>
  )
}

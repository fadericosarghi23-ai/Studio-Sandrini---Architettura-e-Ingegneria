import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Level = { v: number; d: string }
let cache: Promise<Level[]> | null = null
export const loadContours = () => (cache ??= fetch('/terrain/contours.json').then((r) => r.json() as Promise<Level[]>))

/**
 * Curve di livello reali della Val Camonica (dal rilievo importato), usate come
 * texture decorativa. Si disegnano quando entrano in pagina.
 */
export function ContourField({ className, animate = true, every = 2 }: { className?: string; animate?: boolean; every?: number }) {
  const [levels, setLevels] = useState<Level[] | null>(null)
  useEffect(() => {
    let alive = true
    loadContours().then((l) => alive && setLevels(l.filter((x, i) => i % every === 0 || x.v % 500 === 0)))
    return () => { alive = false }
  }, [every])
  return (
    <svg viewBox="0 0 255 255" preserveAspectRatio="xMidYMid slice" className={cn(animate && 'contour-draw', className)} fill="none" stroke="currentColor" aria-hidden>
      {levels?.map((l) => (
        <path key={l.v} d={l.d} pathLength={1} vectorEffect="non-scaling-stroke" strokeWidth={l.v % 500 === 0 ? 1.4 : 0.7} />
      ))}
    </svg>
  )
}

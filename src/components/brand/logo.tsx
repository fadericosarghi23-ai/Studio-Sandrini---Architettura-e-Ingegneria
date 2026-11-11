import { logoHorizontal, logoStacked, LOGO_GOLD } from './logo-data'
import { cn } from '@/lib/utils'

/**
 * Marchio tipografico ricostruito dall'header del sito originale:
 * "Studio Sandrini" in Playfair Display 700 + "Architettura e Ingegneria" su blocco oro.
 * Il nome prende il colore corrente (currentColor), il blocco resta oro.
 */
export function Logo({ variant = 'horizontal', className, compact }: { variant?: 'horizontal' | 'stacked'; className?: string; compact?: boolean }) {
  const v = variant === 'stacked' ? logoStacked : logoHorizontal
  if (compact) {
    // su schermi piccoli: solo il nome, con un tratto oro sotto
    const [, , w] = v.viewBox.split(' ').map(Number)
    const nameWidth = v.block.x - 20
    return (
      <svg viewBox={`0 0 ${nameWidth > 0 && variant === 'horizontal' ? nameWidth : w} 84`} className={cn('h-8 w-auto', className)} role="img" aria-label="Studio Sandrini, Architettura e Ingegneria">
        <path d={v.name} fill="currentColor" />
        <rect x="2" y="74" width="120" height="7" fill={LOGO_GOLD} />
      </svg>
    )
  }
  return (
    <svg viewBox={v.viewBox} className={cn('h-8 w-auto', className)} role="img" aria-label="Studio Sandrini, Architettura e Ingegneria">
      <path d={v.name} fill="currentColor" />
      <rect x={v.block.x} y={v.block.y} width={v.block.w} height={v.block.h} fill={LOGO_GOLD} />
      <path d={v.tag} fill="#ffffff" />
    </svg>
  )
}

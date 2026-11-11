import { Building2, Cpu, Flame, HardHat, Leaf, PlugZap, Ruler, ShieldCheck, Sun, type LucideProps } from 'lucide-react'

const map: Record<string, React.ComponentType<LucideProps>> = {
  architettura: Building2,
  'efficientamento-energetico': Leaf,
  'fonti-rinnovabili': Sun,
  'direzione-lavori': HardHat,
  'sicurezza-nei-cantieri': ShieldCheck,
  'progettazione-impiantistica': PlugZap,
  'innovazione-e-tecnologia': Cpu,
  'progettazione-antincendio': Flame,
  'calcoli-strutturali': Ruler,
}

export function ServiceIcon({ slug, ...props }: { slug: string } & LucideProps) {
  const I = map[slug] ?? Building2
  return <I strokeWidth={1.7} {...props} />
}

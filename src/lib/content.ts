/**
 * Contenuti: i testi arrivano tutti dall'import (src/content/*.json, generati da
 * scripts/import-content.mjs). Qui c'è solo la parte editoriale aggiunta per il
 * nuovo sito: ambiti dei progetti, luoghi, collegamenti fra servizi e progetti.
 */
import siteJson from '@/content/site.json'
import servicesJson from '@/content/services.json'
import technologiesJson from '@/content/technologies.json'
import projectsJson from '@/content/projects.json'
import articlesJson from '@/content/articles.json'
import terrainJson from '@/content/terrain.json'

export type Media = { src: string; sm: string; w: number; h: number; alt: string; original: string; hasAlpha: boolean }
export type ServiceRaw = { slug: string; name: string; tagline: string; paragraphs: string[]; icon: string }
export type Technology = { slug: string; title: string; paragraphs: string[]; image: Media | null }
export type ProjectRaw = { slug: string; title: string; description: string; image: Media | null; isLogo: boolean }
export type Article = {
  slug: string; oldSlug: string; oldUrl: string; title: string; date: string; author: string
  excerpt: string; categories: string[]; tags: string[]; cover: Media | null; html: string
}

export const site = {
  ...siteJson,
  socials: siteJson.socials.map((s) => ({ ...s, href: s.href.replace(/^http:/, 'https:') })),
  name: 'Studio Sandrini',
  descriptor: 'Architettura e Ingegneria',
  city: 'Darfo Boario Terme',
  area: 'Val Camonica',
  /** Da completare: la P.IVA non è pubblicata sul sito attuale. Se resta vuota non viene mostrata. */
  vat: '',
  mapsQuery: 'Via Quarteroni 71, 25047 Darfo Boario Terme BS',
}

export const terrain = terrainJson
export const technologies = technologiesJson as Technology[]
export const articles = (articlesJson as Article[]).slice().sort((a, b) => b.date.localeCompare(a.date))

/* ------------------------------------------------------------------ progetti */
export type ProjectArea =
  | 'Architettura' | 'Efficientamento energetico' | 'Impianti' | 'Antincendio'
  | 'Fotovoltaico' | 'Analisi energetiche' | 'Interior design'

type ProjectExtra = { area: ProjectArea; place?: string; client?: string; services: string[]; spaces?: string[] }

const projectExtra: Record<string, ProjectExtra> = {
  'illuminazione-e-impianto-elettrico': { area: 'Impianti', place: 'Ronchi dei Legionari (GO)', client: 'Ansaldo STS', services: ['progettazione-impiantistica'] },
  'digital-signage-impianti-elettrici': { area: 'Impianti', place: 'Milano e Parma', services: ['progettazione-impiantistica'] },
  'prevenzione-incendi-melzo': { area: 'Antincendio', place: 'Melzo (MI)', services: ['progettazione-antincendio'] },
  'prevenzione-incendi-saronno': { area: 'Antincendio', place: 'Saronno (VA)', client: 'Ferrovie Nord', services: ['progettazione-antincendio'] },
  'linea-d-alpe': { area: 'Architettura', services: ['architettura', 'innovazione-e-tecnologia'], spaces: ['commerciali'] },
  pnrr: { area: 'Architettura', services: ['architettura'], spaces: ['pubblici'] },
  'scuola-elementare': { area: 'Efficientamento energetico', place: 'Vissone (BS)', services: ['efficientamento-energetico', 'direzione-lavori'], spaces: ['pubblici', 'riqualificazione'] },
  'pro-loco-ski-area-centro-congressi': { area: 'Efficientamento energetico', place: 'Borno (BS)', services: ['efficientamento-energetico', 'architettura'], spaces: ['pubblici', 'commerciali', 'riqualificazione'] },
  condominio: { area: 'Efficientamento energetico', place: 'Bossico (BG)', services: ['efficientamento-energetico', 'calcoli-strutturali', 'architettura'], spaces: ['residenze', 'riqualificazione'] },
  'palazzo-comunale': { area: 'Efficientamento energetico', place: 'Paspardo (BS)', services: ['efficientamento-energetico', 'architettura'], spaces: ['pubblici', 'riqualificazione'] },
  'centro-storico': { area: 'Architettura', place: 'Darfo Boario Terme (BS)', services: ['architettura', 'efficientamento-energetico', 'calcoli-strutturali'], spaces: ['residenze', 'riqualificazione'] },
  'progetto-vincitore-di-bando-regionale': { area: 'Efficientamento energetico', services: ['efficientamento-energetico', 'progettazione-impiantistica'], spaces: ['pubblici', 'riqualificazione'] },
  'progettazione-impiantistica': { area: 'Impianti', place: 'Cividate Camuno (BS)', services: ['progettazione-impiantistica', 'innovazione-e-tecnologia'], spaces: ['commerciali'] },
  fotovoltaico: { area: 'Fotovoltaico', place: 'Varese', services: ['fonti-rinnovabili', 'direzione-lavori'] },
  'analisi-energetiche': { area: 'Analisi energetiche', client: 'DHL', services: ['efficientamento-energetico'] },
  'interior-design': { area: 'Interior design', services: ['architettura', 'innovazione-e-tecnologia'], spaces: ['residenze'] },
}

export type Project = ProjectRaw & ProjectExtra
export const projects: Project[] = (projectsJson as ProjectRaw[]).map((p) => ({
  ...p,
  ...(projectExtra[p.slug] ?? { area: 'Architettura', services: [] }),
}))
export const projectAreas = [...new Set(projects.map((p) => p.area))]
export const getProject = (slug: string) => projects.find((p) => p.slug === slug)

/* ------------------------------------------------------------------ servizi */
export type ServiceKey =
  | 'architettura' | 'efficientamento-energetico' | 'fonti-rinnovabili' | 'direzione-lavori'
  | 'sicurezza-nei-cantieri' | 'progettazione-impiantistica' | 'innovazione-e-tecnologia'
  | 'progettazione-antincendio' | 'calcoli-strutturali'

/** etichetta breve per il menu (il nome completo resta quello importato) */
const shortName: Record<ServiceKey, string> = {
  architettura: 'Architettura',
  'efficientamento-energetico': 'Efficientamento energetico',
  'fonti-rinnovabili': 'Fonti rinnovabili',
  'direzione-lavori': 'Direzione lavori',
  'sicurezza-nei-cantieri': 'Sicurezza nei cantieri',
  'progettazione-impiantistica': 'Progettazione impiantistica',
  'innovazione-e-tecnologia': 'Innovazione e tecnologia',
  'progettazione-antincendio': 'Progettazione antincendio',
  'calcoli-strutturali': 'Calcoli strutturali',
}

const articleLinks: Partial<Record<ServiceKey, (a: Article) => boolean>> = {
  'fonti-rinnovabili': (a) => a.categories.includes('Fotovoltaico'),
  'efficientamento-energetico': (a) => /conto termico/i.test(a.title + a.tags.join(' ')),
}

export type Service = ServiceRaw & { key: ServiceKey; short: string; index: number }
export const services: Service[] = (servicesJson as ServiceRaw[]).map((s, index) => ({
  ...s,
  key: s.slug as ServiceKey,
  short: shortName[s.slug as ServiceKey] ?? s.name,
  index,
}))
export const getService = (slug: string) => services.find((s) => s.slug === slug)
export const projectsForService = (key: string) => projects.filter((p) => p.services.includes(key))
export const articlesForService = (key: ServiceKey) => {
  const f = articleLinks[key]
  return f ? articles.filter(f) : []
}

/* ------------------------------------------------------------------ luoghi (hero) */
/** paesi della Val Camonica e dintorni dove si trovano progetti del portfolio */
export const places = [
  { name: 'Darfo Boario Terme', lat: 45.8817, lon: 10.1826, project: 'centro-storico', studio: true },
  { name: 'Borno', lat: 45.9473, lon: 10.2036, project: 'pro-loco-ski-area-centro-congressi' },
  { name: 'Cividate Camuno', lat: 45.9428, lon: 10.2768, project: 'progettazione-impiantistica' },
  { name: 'Paspardo', lat: 46.0322, lon: 10.3683, project: 'palazzo-comunale' },
  { name: 'Bossico', lat: 45.8284, lon: 10.0456, project: 'condominio' },
  { name: 'Vissone', lat: 45.7985, lon: 10.1228, project: 'scuola-elementare' },
] as const

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug)

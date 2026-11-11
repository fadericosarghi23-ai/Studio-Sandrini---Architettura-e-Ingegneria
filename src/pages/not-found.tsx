import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ContourField } from '@/components/contour-field'
import { Button } from '@/components/ui/button'
import { useSeo } from '@/hooks/use-seo'

export default function NotFoundPage() {
  useSeo('Pagina non trovata')
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-forest px-5 pt-32 text-center text-white">
      <ContourField className="pointer-events-none absolute inset-0 h-full w-full text-gold/20" />
      <div className="relative">
        <p className="font-serif text-[clamp(6rem,20vw,14rem)] leading-none text-gold">404</p>
        <h1 className="mt-2 text-[clamp(1.8rem,4vw,3rem)] text-white">Fuori dalle curve di livello</h1>
        <p className="mx-auto mt-4 max-w-md text-white/75">La pagina che cerca non esiste o è stata spostata con il nuovo sito.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild><Link to="/">Torna alla home <ArrowRight /></Link></Button>
          <Button asChild variant="outline-light"><Link to="/servizi">Vedi i servizi</Link></Button>
        </div>
      </div>
    </section>
  )
}

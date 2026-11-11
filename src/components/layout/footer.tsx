import { Link } from 'react-router-dom'
import { ArrowUp, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { ContourField } from '@/components/contour-field'
import { services, site } from '@/lib/content'
import { telHref } from '@/lib/utils'
import { useLenis } from '@/components/motion/smooth-scroll'

export function Footer() {
  const lenis = useLenis()
  const toTop = () => (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }))
  return (
    <footer className="relative overflow-hidden border-t border-gold/30 bg-ink text-[#dbdbdb]">
      <ContourField className="pointer-events-none absolute -right-40 -top-20 h-[140%] w-[90%] text-white/[0.06]" />
      <div className="relative mx-auto max-w-[1320px] px-5 pb-8 pt-14 md:px-8 md:pb-10 md:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <Logo variant="stacked" className="h-16 text-white md:h-20" />
            <address className="mt-6 space-y-2.5 not-italic text-[0.92rem] md:mt-8 md:space-y-3 md:text-[0.95rem]">
              <p className="flex gap-3"><MapPin className="mt-1 size-4 shrink-0 text-gold" />{site.contact.address}</p>
              {site.contact.phones.map((p) => (
                <p key={p} className="flex gap-3"><Phone className="mt-1 size-4 shrink-0 text-gold" /><a className="hover:text-gold" href={telHref(p)}>{p}</a></p>
              ))}
              <p className="flex gap-3"><Mail className="mt-1 size-4 shrink-0 text-gold" /><a className="hover:text-gold" href={`mailto:${site.contact.email}`}>{site.contact.email}</a></p>
              <p className="flex gap-3"><Clock className="mt-1 size-4 shrink-0 text-gold" />Dalle {site.contact.hours}</p>
            </address>
          </div>

          <FooterCol title="Servizi" className="col-span-2 lg:col-span-1" listClassName="grid grid-cols-2 gap-x-6 lg:block">
            {services.map((s) => (
              <li key={s.slug}><Link className="hover:text-gold" to={`/servizi/${s.slug}`}>{s.short}</Link></li>
            ))}
          </FooterCol>

          <FooterCol title="Studio">
            <li><Link className="hover:text-gold" to="/studio">Lo studio</Link></li>
            <li><Link className="hover:text-gold" to="/progetti">Progetti</Link></li>
            <li><Link className="hover:text-gold" to="/approfondimenti">Approfondimenti</Link></li>
            <li><Link className="hover:text-gold" to="/contatti">Contatti</Link></li>
          </FooterCol>

          <FooterCol title="Seguici">
            {site.socials.map((s) => (
              <li key={s.href}><a className="hover:text-gold" href={s.href} target="_blank" rel="noopener noreferrer">{s.network}</a></li>
            ))}
          </FooterCol>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t md:mt-16 border-white/10 pt-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.siteTitle}
            {site.vat && <> · P.IVA {site.vat}</>}
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link className="hover:text-gold" to="/privacy">Privacy</Link>
            <Link className="hover:text-gold" to="/cookie">Cookie</Link>
            <span>Rilievo: AWS Terrain Tiles, open data</span>
            <button type="button" onClick={toTop} className="grid size-9 place-items-center rounded-md bg-gold text-ink transition-transform hover:-translate-y-1" aria-label="Torna su">
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children, className, listClassName }: { title: string; children: React.ReactNode; className?: string; listClassName?: string }) {
  return (
    <div className={className}>
      <h2 className="font-serif text-lg text-white">{title}</h2>
      <span className="mt-3 block h-[2px] w-10 bg-gold" />
      <ul className={`mt-4 space-y-2 text-[0.92rem] md:mt-5 md:space-y-2.5 md:text-[0.95rem] ${listClassName ?? ''}`}>{children}</ul>
    </div>
  )
}

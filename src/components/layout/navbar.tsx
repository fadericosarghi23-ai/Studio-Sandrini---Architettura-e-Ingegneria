import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, Menu, Phone, X } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { ServiceIcon } from '@/components/service-icon'
import { services, site } from '@/lib/content'
import { cn, telHref } from '@/lib/utils'
import { useLenis } from '@/components/motion/smooth-scroll'

const links = [
  { to: '/studio', label: 'Studio' },
  { to: '/servizi', label: 'Servizi', dropdown: true },
  { to: '/progetti', label: 'Progetti' },
  { to: '/approfondimenti', label: 'Approfondimenti' },
]

export function Navbar() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [mega, setMega] = useState(false)
  const closeTimer = useRef<number | undefined>(undefined)
  const lenis = useLenis()
  const overHero = pathname === '/' && !scrolled
  // pagine interne: in cima c'è l'intestazione verde bosco, la barra diventa trasparente e chiara
  const onDark = (pathname !== '/' && !scrolled) || open

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setMega(false)
  }, [pathname])

  useEffect(() => {
    if (open) lenis?.stop()
    else lenis?.start()
    document.documentElement.style.overflow = open ? 'hidden' : ''
  }, [open, lenis])

  const openMega = () => { window.clearTimeout(closeTimer.current); setMega(true) }
  const closeMega = () => { closeTimer.current = window.setTimeout(() => setMega(false), 140) }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding] duration-500',
          overHero || onDark ? 'bg-transparent py-5' : open ? 'bg-transparent py-3' : 'bg-paper/85 py-3 shadow-[0_1px_0_rgba(22,37,33,0.08)] backdrop-blur-xl',
        )}
      >
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-5 md:px-8">
          <Link to="/" className={cn('relative z-10 transition-colors duration-500', onDark ? 'text-white' : 'text-ink')} aria-label="Studio Sandrini, home">
            <Logo className="hidden h-[26px] sm:block lg:h-[30px]" />
            <Logo compact className="h-7 sm:hidden" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigazione principale">
            {links.map((l) =>
              l.dropdown ? (
                <div key={l.to} className="relative" onMouseEnter={openMega} onMouseLeave={closeMega}>
                  <NavLink
                    to={l.to}
                    className={({ isActive }) => cn(navItem, onDark && 'text-white hover:text-gold', isActive && 'after:scale-x-100')}
                    aria-haspopup="true"
                    aria-expanded={mega}
                    onFocus={openMega}
                    onKeyDown={(e) => { if (e.key === 'Escape') setMega(false) }}
                  >
                    {l.label}
                    <ChevronDown className={cn('size-3.5 transition-transform duration-300', mega && 'rotate-180')} />
                  </NavLink>
                  <AnimatePresence>
                    {mega && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-1/2 top-full w-[720px] -translate-x-1/2 pt-4"
                        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setMega(false) }}
                      >
                        <div className="grid grid-cols-[1fr_1fr_220px] overflow-hidden rounded-lg bg-white shadow-[0_30px_80px_-30px_rgba(22,37,33,0.45)] ring-1 ring-ink/5">
                          <ul className="col-span-2 grid grid-cols-2 gap-1 p-3">
                            {services.map((s) => (
                              <li key={s.slug}>
                                <Link to={`/servizi/${s.slug}`} className="group flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-paper">
                                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-sand text-petrol transition-colors group-hover:bg-gold group-hover:text-ink">
                                    <ServiceIcon slug={s.slug} className="size-4" />
                                  </span>
                                  <span>
                                    <span className="block font-serif text-[0.98rem] leading-tight text-ink">{s.short}</span>
                                    <span className="mt-1 line-clamp-2 block text-xs text-text first-letter:uppercase">{s.tagline}</span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <div className="flex flex-col justify-between bg-forest p-5 text-white/80">
                            <p className="font-serif text-xl leading-snug text-white">Nove discipline, un solo studio.</p>
                            <Link to="/servizi" className="group inline-flex items-center gap-2 text-sm font-extrabold text-gold">
                              Tutti i servizi <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => cn(navItem, onDark && 'text-white hover:text-gold', isActive && 'after:scale-x-100')}>
                  {l.label}
                </NavLink>
              ),
            )}
            <Button asChild size="sm" className="ml-3">
              <Link to="/contatti">Contattaci</Link>
            </Button>
          </nav>

          <button
            type="button"
            className={cn('relative z-10 grid size-11 place-items-center rounded-md lg:hidden', onDark ? 'text-white' : 'text-ink')}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </header>

      {/* menu mobile: pannello petrolio #066664 e voci in Playfair, come il menu mobile del sito originale */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-forest px-6 pb-8 pt-24 text-white lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 40px)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
          >
            <nav aria-label="Navigazione mobile" className="flex flex-col">
              {[{ to: '/', label: 'Home' }, ...links].map((l, i) => (
                <motion.div key={l.to} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  {l.dropdown ? (
                    <MobileServices />
                  ) : (
                    <Link to={l.to} className="block border-b border-white/15 py-3 font-serif text-[clamp(1.6rem,7vw,2.3rem)] leading-tight">
                      {l.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto space-y-4 pt-10">
              <Button asChild size="lg" className="w-full">
                <Link to="/contatti">Contattaci</Link>
              </Button>
              <a href={telHref(site.contact.phones[0])} className="flex items-center justify-center gap-2 text-sm font-bold text-white/85">
                <Phone className="size-4 text-gold" /> {site.contact.phones[0]}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function MobileServices() {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/15">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between py-3 text-left font-serif text-[clamp(1.6rem,7vw,2.3rem)] leading-tight">
        Servizi <ChevronDown className={cn('size-6 text-gold transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <li><Link to="/servizi" className="block py-2 text-sm font-extrabold uppercase tracking-[0.2em] text-gold">Tutti i servizi</Link></li>
            {services.map((s) => (
              <li key={s.slug}>
                <Link to={`/servizi/${s.slug}`} className="flex items-center gap-3 py-2 text-[1.05rem] text-white/90">
                  <ServiceIcon slug={s.slug} className="size-4 text-gold" /> {s.short}
                </Link>
              </li>
            ))}
            <li className="h-3" />
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

const navItem =
  "relative inline-flex items-center gap-1 rounded-md px-3.5 py-2 text-[0.82rem] font-extrabold uppercase tracking-[0.14em] text-ink transition-colors hover:text-petrol after:absolute after:inset-x-3.5 after:bottom-1 after:h-[2px] after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100 after:content-['']"

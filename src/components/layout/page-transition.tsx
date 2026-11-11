import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getArticle, getProject, getService } from '@/lib/content'

const ease = [0.76, 0, 0.24, 1] as const

/** nome della pagina di destinazione, scritto in oro sulla tenda */
function labelFor(pathname: string) {
  const [, a, b] = pathname.split('/')
  if (!a) return { eyebrow: 'Studio Sandrini', title: 'Home' }
  if (a === 'studio') return { eyebrow: 'Studio Sandrini', title: 'Studio' }
  if (a === 'servizi') return b ? { eyebrow: 'Servizi', title: getService(b)?.short ?? 'Servizi' } : { eyebrow: 'Le nostre attività', title: 'Servizi' }
  if (a === 'progetti') return b ? { eyebrow: 'Progetti', title: getProject(b)?.title ?? 'Progetti' } : { eyebrow: 'Alcuni nostri lavori', title: 'Progetti' }
  if (a === 'approfondimenti') return b && getArticle(b) ? { eyebrow: 'Approfondimenti', title: 'Articolo' } : { eyebrow: 'Studio Sandrini', title: 'Approfondimenti' }
  if (a === 'contatti') return { eyebrow: 'Studio Sandrini', title: 'Contatti' }
  if (a === 'privacy') return { eyebrow: 'Note legali', title: 'Privacy' }
  if (a === 'cookie') return { eyebrow: 'Note legali', title: 'Cookie' }
  return { eyebrow: 'Studio Sandrini', title: 'Pagina non trovata' }
}

function CurtainLabel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center px-6 text-center">
      <div>
        <span className="block font-sans text-[0.72rem] font-extrabold uppercase tracking-[0.3em] text-white/60">{eyebrow}</span>
        <span className="mt-3 block font-serif text-[clamp(2.6rem,8vw,7rem)] leading-none text-gold">{title}</span>
        <span className="mx-auto mt-6 block h-[3px] w-16 bg-gold" />
      </div>
    </div>
  )
}

/**
 * Transizione tra pagine: una tenda verde bosco (#1e3231, il colore del footer)
 * sale, mostra in oro il nome della pagina di destinazione e si ritira verso l'alto.
 * useLocation() restituisce sempre la rotta nuova, anche nella pagina in uscita.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const label = labelFor(useLocation().pathname)
  return (
    <motion.div initial="initial" animate="enter" exit="exit">
      <motion.div
        variants={{ initial: { opacity: 0, y: 24 }, enter: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] } }, exit: { opacity: 0, transition: { duration: 0.3 } } }}
      >
        {children}
      </motion.div>

      {/* tenda in uscita: sale dal basso e scrive la destinazione */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] bg-forest"
        variants={{
          initial: { clipPath: 'inset(100% 0% 0% 0%)' },
          enter: { clipPath: 'inset(100% 0% 0% 0%)' },
          exit: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.55, ease } },
        }}
      >
        <motion.div
          variants={{ initial: { opacity: 0, y: 40 }, enter: { opacity: 0, y: 40 }, exit: { opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] } } }}
          className="absolute inset-0"
        >
          <CurtainLabel {...label} />
        </motion.div>
      </motion.div>

      {/* tenda in entrata: parte piena con la scritta, poi si ritira verso l'alto */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] bg-forest"
        variants={{
          initial: { clipPath: 'inset(0% 0% 0% 0%)' },
          enter: { clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 0.7, delay: 0.35, ease } },
          exit: { clipPath: 'inset(0% 0% 100% 0%)' },
        }}
      >
        <motion.div
          variants={{ initial: { opacity: 1, y: 0 }, enter: { opacity: 0, y: -50, transition: { duration: 0.45, delay: 0.25, ease } }, exit: { opacity: 0 } }}
          className="absolute inset-0"
        >
          <CurtainLabel {...label} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

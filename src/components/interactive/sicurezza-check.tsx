import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, RotateCcw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Verifica orientativa basata sul D.Lgs. 81/2008 (Titolo IV):
 * art. 90 c.3 e c.4 (coordinatori), art. 99 (notifica preliminare), art. 96 e 89 (POS).
 * Non sostituisce la valutazione del professionista.
 */
type Answer = { multi: boolean | null; big: boolean | null }

export default function SicurezzaCheck() {
  const [a, setA] = useState<Answer>({ multi: null, big: null })
  const step = a.multi === null ? 0 : a.multi === false && a.big === null ? 1 : 2
  const reset = () => setA({ multi: null, big: null })

  const result: { title: string; items: string[] } | null =
    step < 2
      ? null
      : a.multi
        ? {
            title: 'Servono i coordinatori per la sicurezza',
            items: [
              'Coordinatore per la progettazione (CSP), che redige il Piano di Sicurezza e Coordinamento (PSC) e il fascicolo dell’opera.',
              'Coordinatore per l’esecuzione (CSE), che verifica in cantiere l’applicazione del PSC.',
              'Notifica preliminare agli enti prima dell’inizio dei lavori.',
              'Ogni impresa esecutrice redige il proprio Piano Operativo di Sicurezza (POS).',
            ],
          }
        : a.big
          ? {
              title: 'Non servono coordinatori, ma serve la notifica preliminare',
              items: [
                'Con un’unica impresa i coordinatori non sono obbligatori, salvo varianti che portino in cantiere altre imprese.',
                'Sopra i 200 uomini-giorno serve la notifica preliminare agli enti.',
                'L’impresa redige il proprio Piano Operativo di Sicurezza (POS).',
              ],
            }
          : {
              title: 'Adempimenti ridotti, ma la sicurezza resta',
              items: [
                'Con un’unica impresa e sotto i 200 uomini-giorno non servono coordinatori né notifica preliminare.',
                'L’impresa redige comunque il proprio Piano Operativo di Sicurezza (POS).',
                'Se in corso d’opera entra una seconda impresa, gli obblighi cambiano.',
              ],
            }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative min-h-[340px] overflow-hidden rounded-lg bg-forest p-8 text-white md:p-12">
        <div className="mb-8 flex gap-2" aria-hidden>
          {[0, 1, 2].map((i) => <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-gold' : 'bg-white/15'}`} />)}
        </div>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <Question key="q1" n={1} q="Nel cantiere lavorerà più di un'impresa, anche in tempi diversi?" onYes={() => setA({ multi: true, big: null })} onNo={() => setA({ multi: false, big: null })} />
          )}
          {step === 1 && (
            <Question key="q2" n={2} q="L'entità dei lavori supera i 200 uomini-giorno?" hint="Somma delle giornate lavorative di tutti gli addetti previste per l'opera." onYes={() => setA({ ...a, big: true })} onNo={() => setA({ ...a, big: false })} />
          )}
          {step === 2 && result && (
            <motion.div key="r" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ShieldCheck className="size-9 text-gold" />
              <h3 className="mt-4 font-serif text-3xl text-white">{result.title}</h3>
              <ul className="mt-6 space-y-3">
                {result.items.map((it, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className="flex gap-3 text-white/85">
                    <Check className="mt-1 size-4 shrink-0 text-gold" /> {it}
                  </motion.li>
                ))}
              </ul>
              <button onClick={reset} className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-gold">
                <RotateCcw className="size-4" /> Ricomincia
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-[1.05rem]">
          Una verifica orientativa sugli obblighi del committente previsti dal D.Lgs. 81/2008 (artt. 89, 90, 96 e 99). Ogni cantiere ha però le sue condizioni: per una valutazione completa ci contatti.
        </p>
        <ul className="mt-8 space-y-3">
          {['Piani di sicurezza dettagliati', 'Controlli costanti in cantiere', 'Conformità alle normative vigenti'].map((t) => (
            <li key={t} className="flex items-center gap-3 font-serif text-xl text-ink">
              <span className="grid size-7 place-items-center rounded-full bg-gold text-ink"><Check className="size-4" /></span>{t}
            </li>
          ))}
        </ul>
        <Button asChild className="mt-10 self-start"><Link to="/contatti">Parliamo del suo cantiere <ArrowRight /></Link></Button>
      </div>
    </div>
  )
}

function Question({ n, q, hint, onYes, onNo }: { n: number; q: string; hint?: string; onYes: () => void; onNo: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
      <p className="eyebrow text-gold">Domanda {n}</p>
      <h3 className="mt-3 font-serif text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-white">{q}</h3>
      {hint && <p className="mt-3 text-sm text-white/60">{hint}</p>}
      <div className="mt-8 flex gap-3">
        <Button onClick={onYes}>Sì</Button>
        <Button onClick={onNo} variant="outline-light">No</Button>
      </div>
    </motion.div>
  )
}

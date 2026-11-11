import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Container, PageHeader } from '@/components/blocks'
import { ContourField } from '@/components/contour-field'
import { Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'
import { Input, Label, Select, Textarea } from '@/components/ui/form-fields'
import { services, site } from '@/lib/content'
import { useSeo } from '@/hooks/use-seo'
import { telHref } from '@/lib/utils'

const encode = (data: Record<string, string>) => new URLSearchParams(data).toString()

export default function ContactPage() {
  useSeo('Contatti', `${site.contact.address}. Telefono ${site.contact.phones.join(', ')}. Email ${site.contact.email}.`)
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
    setState('sending')
    try {
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: encode(data) })
      if (!r.ok) throw new Error(String(r.status))
      setState('ok')
      form.reset()
    } catch {
      setState('error')
    }
  }

  return (
    <>
      <PageHeader eyebrow="Contatti" title="Parliamo del suo progetto" highlight={['progetto']} intro="Ci scriva o ci chiami: le rispondiamo per fissare un primo incontro in studio o sul posto." />

      <section className="py-16 md:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr] [&>*]:min-w-0">
          <div className="space-y-4">
            {[
              { icon: MapPin, k: 'Indirizzo', v: site.contact.address },
              ...site.contact.phones.map((p, i) => ({ icon: Phone, k: i === 0 ? 'Telefono' : 'Cellulare', v: p, href: telHref(p) })),
              { icon: Mail, k: 'Email', v: site.contact.email, href: `mailto:${site.contact.email}` },
              { icon: Clock, k: 'Orari', v: `Dalle ${site.contact.hours}` },
            ].map((c, i) => (
              <Reveal key={c.k + i} delay={i * 0.05}>
                {'href' in c && c.href ? (
                  <a href={c.href} className="group flex items-center gap-5 rounded-lg bg-white p-5 ring-1 ring-ink/5 transition-colors hover:bg-ink">
                    <span className="grid size-12 shrink-0 place-items-center rounded-md bg-sand text-petrol transition-colors group-hover:bg-gold group-hover:text-ink"><c.icon className="size-5" /></span>
                    <span className="min-w-0"><span className="eyebrow block group-hover:text-gold">{c.k}</span><span className="mt-0.5 block font-serif text-xl text-ink [overflow-wrap:anywhere] group-hover:text-white">{c.v}</span></span>
                  </a>
                ) : (
                  <div className="flex items-center gap-5 rounded-lg bg-white p-5 ring-1 ring-ink/5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-md bg-sand text-petrol"><c.icon className="size-5" /></span>
                    <span className="min-w-0"><span className="eyebrow block">{c.k}</span><span className="mt-0.5 block font-serif text-xl text-ink [overflow-wrap:anywhere]">{c.v}</span></span>
                  </div>
                )}
              </Reveal>
            ))}
            <Reveal delay={0.3}><MapOnClick /></Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-lg bg-white p-6 ring-1 ring-ink/5 md:p-10">
              <AnimatePresence mode="wait">
                {state === 'ok' ? (
                  <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="grid min-h-[480px] place-items-center text-center">
                    <div>
                      <CheckCircle2 className="mx-auto size-14 text-gold" />
                      <h2 className="mt-6 text-4xl">Messaggio inviato</h2>
                      <p className="mx-auto mt-3 max-w-sm">Grazie, la ricontatteremo al più presto.</p>
                      <Button className="mt-8" variant="outline" onClick={() => setState('idle')}>Scrivi un altro messaggio</Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form key="form" name="contatti" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                    <input type="hidden" name="form-name" value="contatti" />
                    <p className="hidden"><label>Non compilare: <input name="bot-field" /></label></p>
                    <h2 className="text-3xl sm:col-span-2">Scrivici</h2>
                    <div><Label htmlFor="nome">Nome e cognome</Label><Input id="nome" name="nome" required autoComplete="name" /></div>
                    <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>
                    <div><Label htmlFor="telefono">Telefono</Label><Input id="telefono" name="telefono" type="tel" autoComplete="tel" /></div>
                    <div>
                      <Label htmlFor="servizio">Servizio</Label>
                      <Select id="servizio" name="servizio" defaultValue="">
                        <option value="">Scelga un servizio</option>
                        {services.map((s) => <option key={s.slug} value={s.short}>{s.short}</option>)}
                        <option value="Altro">Altro</option>
                      </Select>
                    </div>
                    <div className="sm:col-span-2"><Label htmlFor="messaggio">Messaggio</Label><Textarea id="messaggio" name="messaggio" required placeholder="Ci racconti il suo progetto" /></div>
                    <label className="flex items-start gap-3 text-sm sm:col-span-2">
                      <input type="checkbox" name="privacy" value="accettata" required className="mt-1 size-4 accent-[#e9b44c]" />
                      <span>Ho letto l&apos;<Link to="/privacy" className="font-bold text-petrol underline underline-offset-2">informativa privacy</Link> e acconsento al trattamento dei dati per ricevere una risposta.</span>
                    </label>
                    {state === 'error' && <p className="text-sm text-destructive sm:col-span-2">Invio non riuscito. Riprovi o ci scriva a {site.contact.email}.</p>}
                    <div className="sm:col-span-2">
                      <Button type="submit" size="lg" disabled={state === 'sending'}>{state === 'sending' ? 'Invio in corso…' : 'Invia messaggio'} <ArrowRight /></Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}

/** la mappa Google si carica solo dopo il clic: prima nessuna richiesta esterna */
function MapOnClick() {
  const [on, setOn] = useState(false)
  const q = encodeURIComponent(site.mapsQuery)
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-forest">
      {on ? (
        <iframe title="Mappa: sede dello Studio Sandrini" src={`https://www.google.com/maps?q=${q}&output=embed`} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
          <ContourField className="absolute inset-0 h-full w-full text-gold/25" />
          <div className="relative">
            <MapPin className="mx-auto size-8 text-gold" />
            <p className="mt-3 max-w-xs text-sm text-white/75">La mappa è fornita da Google. Caricandola, Google riceve il suo indirizzo IP e può impostare cookie.</p>
            <Button className="mt-5" onClick={() => setOn(true)}>Mostra la mappa</Button>
            <a className="mt-3 block text-xs font-bold text-gold underline underline-offset-2" href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">Oppure apri in Google Maps</a>
          </div>
        </div>
      )}
    </div>
  )
}

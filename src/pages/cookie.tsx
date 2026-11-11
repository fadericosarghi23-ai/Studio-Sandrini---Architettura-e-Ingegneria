import { Link } from 'react-router-dom'
import { Container, PageHeader } from '@/components/blocks'
import { site } from '@/lib/content'
import { useSeo } from '@/hooks/use-seo'

/* Testo redatto da Altalogik sulla base delle tecnologie effettivamente usate dal sito. */
export default function CookiePage() {
  useSeo('Cookie policy', 'Cookie e tecnologie simili usate dal sito di Studio Sandrini, Architettura e Ingegneria.')
  return (
    <>
      <PageHeader eyebrow="Note legali" title="Cookie policy" intro="Questo sito non usa cookie di profilazione né di statistica. Per questo non le chiediamo il consenso all'apertura." />
      <Container className="max-w-3xl py-16 md:py-24">
        <div className="prose-sandrini">
          <h2>Cosa usa il sito</h2>
          <ul>
            <li><strong>Nessun cookie proprio</strong>: il sito non imposta cookie durante la navigazione.</li>
            <li><strong>Font e immagini ospitati sul nostro server</strong>: caratteri tipografici e foto sono serviti direttamente dal sito, senza richieste a servizi esterni come Google Fonts.</li>
            <li><strong>Modulo contatti</strong>: l&apos;invio passa da Netlify Forms, senza cookie di profilazione.</li>
          </ul>

          <h2>Contenuti di terze parti, solo su richiesta</h2>
          <p>
            Nella pagina <Link to="/contatti">Contatti</Link> la mappa di Google Maps non viene caricata automaticamente. Se sceglie &ldquo;Mostra la mappa&rdquo;, il suo browser si collega ai server di Google, che riceve il suo indirizzo IP e può impostare cookie propri secondo la sua informativa (policies.google.com/privacy).
            Se non fa clic, nessun dato viene inviato a Google.
          </p>
          <p>
            I collegamenti ai profili social dello studio (Facebook, Pinterest, X) sono semplici link: i rispettivi servizi entrano in gioco solo se li apre.
          </p>

          <h2>Come gestire i cookie</h2>
          <p>Può cancellare o bloccare i cookie dalle impostazioni del suo browser. Il sito continuerà a funzionare normalmente.</p>

          <h2>Contatti</h2>
          <p>Per domande: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>. Per il trattamento dei dati personali veda l&apos;<Link to="/privacy">informativa privacy</Link>.</p>
          <p className="text-sm">Ultimo aggiornamento: novembre 2026.</p>
        </div>
      </Container>
    </>
  )
}

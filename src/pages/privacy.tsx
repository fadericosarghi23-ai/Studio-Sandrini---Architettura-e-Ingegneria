import { Link } from 'react-router-dom'
import { Container, PageHeader } from '@/components/blocks'
import { site } from '@/lib/content'
import { useSeo } from '@/hooks/use-seo'

/*
 * Testo redatto da Altalogik in base a ciò che il sito usa davvero
 * (modulo Netlify Forms, hosting Netlify, mappa Google su clic, nessuna analitica).
 * Da far verificare al cliente o al suo consulente prima della pubblicazione.
 */
export default function PrivacyPage() {
  useSeo('Informativa privacy', 'Informativa sul trattamento dei dati personali del sito di Studio Sandrini, Architettura e Ingegneria.')
  return (
    <>
      <PageHeader eyebrow="Note legali" title="Informativa privacy" intro="Ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679 (GDPR)." />
      <Container className="max-w-3xl py-16 md:py-24">
        <div className="prose-sandrini">
          <h2>Titolare del trattamento</h2>
          <p>
            {site.siteTitle}, {site.contact.address}
            {site.vat && <>, P.IVA {site.vat}</>}. Email: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>, telefono {site.contact.phones[0]}.
          </p>

          <h2>Quali dati trattiamo</h2>
          <ul>
            <li><strong>Dati inviati con il modulo contatti</strong>: nome e cognome, email, telefono (facoltativo), servizio di interesse e testo del messaggio.</li>
            <li><strong>Dati di navigazione</strong>: i server che ospitano il sito registrano in modo automatico dati tecnici come indirizzo IP, data e ora della richiesta e pagina visitata, necessari al funzionamento e alla sicurezza del servizio.</li>
            <li><strong>Email e telefonate</strong>: i dati che ci comunica scrivendo o chiamando direttamente lo studio.</li>
          </ul>

          <h2>Perché li trattiamo e su quale base</h2>
          <ul>
            <li>Rispondere alle sue richieste e fornire informazioni o preventivi: misure precontrattuali richieste dall&apos;interessato (art. 6.1.b GDPR).</li>
            <li>Garantire il funzionamento e la sicurezza del sito: legittimo interesse del titolare (art. 6.1.f GDPR).</li>
          </ul>
          <p>Il sito non usa strumenti di statistica, profilazione o pubblicità.</p>

          <h2>A chi li comunichiamo</h2>
          <p>
            I dati sono trattati dal titolare e da fornitori che agiscono come responsabili del trattamento: Netlify, Inc. per l&apos;hosting del sito e la ricezione dei messaggi del modulo, e il fornitore del servizio di posta elettronica dello studio.
            Netlify può trattare dati negli Stati Uniti sulla base delle garanzie previste dal GDPR (EU-US Data Privacy Framework e clausole contrattuali standard). I dati non vengono diffusi.
          </p>
          <p>
            La mappa nella pagina Contatti è fornita da Google e si carica solo se lo chiede lei con un clic: da quel momento si applica l&apos;informativa di Google. Dettagli nella <Link to="/cookie">cookie policy</Link>.
          </p>

          <h2>Per quanto tempo</h2>
          <p>I messaggi ricevuti tramite il modulo sono conservati per il tempo necessario a gestire la richiesta e, se ne nasce un incarico, per la durata del rapporto e degli obblighi di legge collegati.</p>

          <h2>I suoi diritti</h2>
          <p>
            Può chiedere in ogni momento l&apos;accesso ai suoi dati, la rettifica, la cancellazione, la limitazione del trattamento, la portabilità e opporsi al trattamento, scrivendo a <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
            Ha inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).
          </p>
          <p className="text-sm">Ultimo aggiornamento: novembre 2026.</p>
        </div>
      </Container>
    </>
  )
}

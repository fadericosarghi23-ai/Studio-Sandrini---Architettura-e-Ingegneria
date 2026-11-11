# Studio Sandrini, Architettura e Ingegneria

Nuovo sito di studioingsandrini.com, realizzato da Altalogik.

Stack: Vite, React, TypeScript, Tailwind v4, struttura shadcn (`components.json`, `src/components/ui`, alias `@/`), framer-motion, GSAP + Lenis, three / react-three-fiber (solo hero, caricato a parte).

## Comandi

```bash
npm ci            # installazione pulita
npm run dev       # sviluppo
npm run build     # tsc + build in dist/
npm run import    # reimporta i contenuti dal sito attuale (vedi sotto)
```

## Contenuti

Tutti i testi e le foto arrivano dal sito attuale tramite `scripts/import-content.mjs`:

- servizi, tecnologie (BIM, MEP, Real-Time Rendering), progetti e contatti dalla home;
- articoli reali dal REST API di WordPress (esclusi i post demo del tema del 2016);
- foto originali convertite in WebP sotto i 300 KB (`public/media`, report in `scripts/media-report.json`);
- rilievo altimetrico della Val Camonica da AWS Terrain Tiles (open data) per l'hero.

Altri script: `make-brand.mjs` (marchio SVG da Playfair Display), `make-derived.mjs` (render a linee), `make-seo.mjs` (`netlify.toml` con redirect 301, `sitemap.xml`, `robots.txt`).

La parte editoriale aggiunta (ambiti dei progetti, luoghi, collegamenti tra servizi e progetti) è in `src/lib/content.ts`.

## Testi scritti da Altalogik, da far confermare al cliente

- Pagina Studio (il sito attuale non ha una pagina chi siamo).
- Titoli di sezione, microtesti delle sezioni interattive dei servizi, testi di Privacy e Cookie.
- La P.IVA è vuota in `src/lib/content.ts` (`site.vat`): va inserita.

## Hero

Rilievo reale (34 × 34 km) disegnato a curve di livello in uno shader; la luce e le ombre seguono la posizione del sole calcolata per Darfo Boario Terme nel giorno corrente. Fallback 2.5D in SVG se WebGL non è disponibile o il rendering è software.

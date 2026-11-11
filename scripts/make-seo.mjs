/**
 * Genera netlify.toml (build, redirect 301 dai vecchi URL WordPress, fallback SPA),
 * public/sitemap.xml e public/robots.txt a partire dai contenuti importati.
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const read = async (f) => JSON.parse(await fs.readFile(path.join(ROOT, 'src/content', f), 'utf8'))
const articles = await read('articles.json')
const services = await read('services.json')
const projects = await read('projects.json')
const DOMAIN = 'https://www.studioingsandrini.com'

/** [vecchio percorso, nuovo percorso] */
const redirects = [
  // pagine
  ['/about-us', '/studio'],
  ['/contact', '/contatti'],
  ['/blog', '/approfondimenti'],
  ['/blog-with-intro', '/approfondimenti'],
  ['/jetpack-portfolio', '/progetti'],
  // articoli: stesso contenuto, nuovo indirizzo
  ...articles.map((a) => [`/${a.oldSlug}`, `/approfondimenti/${a.slug}`]),
  // categorie e tag
  ['/category/progettazione-architettonica', '/servizi/architettura'],
  ['/category/fotovoltaico', '/approfondimenti'],
  ['/category/conto-termico-3-0', '/approfondimenti'],
  ['/category/*', '/approfondimenti'],
  ['/tag/*', '/approfondimenti'],
  ['/author/*', '/approfondimenti'],
  // riquadri progetto del tema (oggi 404)
  ['/cryout-featured-blob-category/antincendio', '/servizi/progettazione-antincendio'],
  ['/cryout-featured-blob-category/impianti', '/servizi/progettazione-impiantistica'],
  ['/cryout-featured-blob-category/*', '/progetti'],
  ['/featured/pnrr', '/progetti/pnrr'],
  ['/featured/fotovoltaico', '/progetti/fotovoltaico'],
  ['/featured/galbani-prevenzione-incendi', '/progetti/prevenzione-incendi-melzo'],
  ['/featured/prevenzione-incendi', '/progetti/prevenzione-incendi-saronno'],
  ['/featured/innovazione-e-tecnologia-il-futuro-della-progettazione-con-strumenti-allavanguardia', '/servizi/innovazione-e-tecnologia'],
  ['/featured/*', '/progetti'],
  // contenuti demo del tema Bravada
  ...['link-format', 'aside-post', 'latest-screenshots', 'quote-format'].map((s) => [`/${s}`, '/approfondimenti']),
  ...['my-account', 'checkout', 'basket', 'gutenberg-blocks', 'sample-page/*', 'sample-page', 'blank', 'jetpack-portfolio-shortcode', 'shortcodes', 'two-sidebars-right', 'two-sidebars-left', 'typography', 'page/*', 'feed', 'comments/feed', 'wp-login.php', 'wp-admin/*']
    .map((s) => [`/${s}`, '/']),
]

const toml = `# Generato da scripts/make-seo.mjs
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/media/*"
  [headers.values]
    Cache-Control = "public, max-age=2592000"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# dominio senza www verso www
[[redirects]]
  from = "https://studioingsandrini.com/*"
  to = "${DOMAIN}/:splat"
  status = 301
  force = true

# vecchi indirizzi WordPress (301)
${redirects.map(([from, to]) => `[[redirects]]
  from = "${from}"
  to = "${to}"
  status = 301
  force = true
`).join('\n')}
# applicazione a pagina singola: tutte le rotte servono index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`
await fs.writeFile(path.join(ROOT, 'netlify.toml'), toml)

const today = new Date().toISOString().slice(0, 10)
const urls = [
  '/', '/studio', '/servizi', '/progetti', '/approfondimenti', '/contatti', '/privacy', '/cookie',
  ...services.map((s) => `/servizi/${s.slug}`),
  ...projects.map((p) => `/progetti/${p.slug}`),
  ...articles.map((a) => `/approfondimenti/${a.slug}`),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${DOMAIN}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`
await fs.writeFile(path.join(ROOT, 'public/sitemap.xml'), sitemap)
await fs.writeFile(path.join(ROOT, 'public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`)
console.log(`netlify.toml: ${redirects.length} redirect · sitemap: ${urls.length} URL`)

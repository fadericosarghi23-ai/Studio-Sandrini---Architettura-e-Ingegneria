/**
 * Import completo dei contenuti da https://www.studioingsandrini.com
 * - testi della home (servizi, tecnologie, progetti, contatti, social)
 * - articoli reali dal REST API di WordPress (esclusi i post demo del tema)
 * - foto scaricate in originale e convertite in WebP (< 300 KB)
 * - modello altimetrico della Val Camonica (AWS Terrain Tiles, open data) per l'hero
 *
 * Uso: npm run import
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import * as cheerio from 'cheerio'
import sharp from 'sharp'
import { contours } from 'd3-contour'

const BASE = 'https://www.studioingsandrini.com'
const ROOT = path.resolve(import.meta.dirname, '..')
const MEDIA = path.join(ROOT, 'public/media')
const CONTENT = path.join(ROOT, 'src/content')
const CACHE = path.join(ROOT, '.cache')
const UA = { 'User-Agent': 'Mozilla/5.0 (site-migration import script)' }

await fs.mkdir(MEDIA, { recursive: true })
await fs.mkdir(CONTENT, { recursive: true })
await fs.mkdir(CACHE, { recursive: true })

/* ---------------------------------------------------------------- utils */
async function fetchBuf(url, tries = 3) {
  const key = path.join(CACHE, url.replace(/[^a-z0-9.]+/gi, '_').slice(-180))
  try { return await fs.readFile(key) } catch {}
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA })
      if (!r.ok) throw new Error(`${r.status} ${url}`)
      const b = Buffer.from(await r.arrayBuffer())
      await fs.writeFile(key, b)
      return b
    } catch (e) {
      if (i === tries - 1) throw e
      await new Promise((r) => setTimeout(r, 800 * (i + 1)))
    }
  }
}
const fetchText = async (u) => (await fetchBuf(u)).toString('utf8')

const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, ' e ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70)

const fullSize = (u) => u.replace(/-\d+x\d+(\.\w+)$/, '$1')
const clean = (s) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
/** regola dell'agenzia: niente trattini lunghi o medi nei testi */
const noDash = (s) => s.replace(/\s*[–—]\s*/g, ', ').replace(/,\s*,/g, ',')
const txt = (s) => noDash(clean(s))

const mediaLog = []
/** scarica un'immagine e la salva in WebP grande + piccola, sempre sotto i limiti di peso */
async function toWebp(url, name, { max = 1800, alt = '' } = {}) {
  const src = await fetchBuf(url)
  const meta = await sharp(src).metadata()
  const out = {}
  for (const [suffix, width, limit] of [['', max, 300_000], ['-sm', 760, 110_000]]) {
    let q = 82
    let buf
    do {
      buf = await sharp(src).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: q, effort: 5 }).toBuffer()
      q -= 6
    } while (buf.length > limit && q > 30)
    const file = `${name}${suffix}.webp`
    await fs.writeFile(path.join(MEDIA, file), buf)
    out[suffix === '' ? 'src' : 'sm'] = `/media/${file}`
    mediaLog.push({ file, kb: Math.round(buf.length / 1024), from: url })
  }
  const final = await sharp(path.join(MEDIA, `${name}.webp`)).metadata()
  return { ...out, w: final.width, h: final.height, alt, original: url, hasAlpha: !!meta.hasAlpha }
}

/* ---------------------------------------------------------------- home */
console.log('> home')
const homeHtml = await fetchText(`${BASE}/`)
const $ = cheerio.load(homeHtml)

// Servizi: blocchi "Le nostre attività"
const services = []
$('#lp-blocks1 .lp-block').each((_, el) => {
  const h = $(el).find('.lp-block-title').html() || ''
  const [nameRaw, ...rest] = h.split(/<br\s*\/?>/i)
  const name = txt(cheerio.load(nameRaw).text()).replace(/:$/, '')
  const tagline = txt(cheerio.load(rest.join(' ')).text())
  const paragraphs = $(el).find('.lp-block-text p').map((_, p) => txt($(p).text())).get().filter(Boolean)
  const icon = ($(el).find('.lp-block-icon i').attr('class') || '').replace('blicon-', '')
  services.push({ slug: slugify(name), name, tagline, paragraphs, icon })
})
console.log(`  servizi: ${services.length}`)

// Tecnologie: sezioni testo con immagine (Real-Time Rendering, BIM, MEP)
const technologies = []
for (const el of $('section.lp-text').toArray()) {
  const title = txt($(el).find('.lp-text-title').text())
  const paragraphs = $(el).find('.lp-text-content p').map((_, p) => txt($(p).text())).get().filter(Boolean)
  const img = $(el).find('.lp-text-image img').attr('src')
  const slug = slugify(title.includes('BIM') ? 'bim' : title.includes('MEP') ? 'mep' : title)
  technologies.push({ slug, title, paragraphs, image: img ? await toWebp(fullSize(img), `tech-${slug}`, { alt: title }) : null })
}
console.log(`  tecnologie: ${technologies.length}`)

// Progetti: riquadri "Alcuni nostri lavori"
const projects = []
const seen = new Set()
for (const el of $('.lp-box').toArray()) {
  const title = txt($(el).find('.lp-box-title').text())
  const description = txt($(el).find('.lp-box-text-inside').text())
  const img = $(el).find('img').attr('src')
  if (!title) continue
  let slug = slugify(title)
  if (seen.has(slug) || projects.some((p) => p.title === title)) {
    const words = description.replace(/[^\p{L}\s]/gu, ' ').trim().split(/\s+/)
    slug = slugify(`${title} ${words.at(-1)}`)
    const twin = projects.find((p) => p.slug === slugify(title))
    if (twin) {
      const tw = twin.description.replace(/[^\p{L}\s]/gu, ' ').trim().split(/\s+/)
      seen.delete(twin.slug)
      twin.slug = slugify(`${title} ${tw.at(-1)}`)
      seen.add(twin.slug)
    }
  }
  seen.add(slug)
  const image = img ? await toWebp(fullSize(img), `progetto-${slug}`, { alt: `${title}. ${description}` }) : null
  projects.push({ slug, title, description, image, isLogo: /logo|ANSALDO|FIDA/i.test(img || '') })
}
// riallinea i nomi dei file immagine con gli slug finali
for (const p of projects) {
  if (!p.image) continue
  const want = `progetto-${p.slug}`
  if (!p.image.src.includes(want)) {
    for (const k of ['src', 'sm']) {
      const from = path.join(ROOT, 'public', p.image[k])
      const to = p.image[k].replace(/progetto-[^/]+?(-sm)?\.webp$/, `${want}$1.webp`)
      await fs.rename(from, path.join(ROOT, 'public', to)).catch(() => {})
      p.image[k] = to
    }
  }
}
console.log(`  progetti: ${projects.length}`)

// Contatti (widget "Contact Info") e social
const contactWidget = $('.widget_cryout_contact').first()
const contact = {
  address: txt(contactWidget.find('.contact-address, address').first().text() || ''),
  phones: [],
  email: '',
  hours: '',
}
const widgetText = contactWidget.text()
contact.phones = [...new Set((widgetText.match(/\+39[\s\d]{8,}/g) || []).map(clean))]
contact.email = (widgetText.match(/[\w.+-]+@[\w-]+\.[\w.]+/) || [''])[0]
contact.hours = (widgetText.match(/\d{2}[:.]\d{2}\s*-\s*\d{2}[:.]\d{2}/) || [''])[0].replace(/\s*-\s*/, ' alle ')
contact.address = clean((widgetText.match(/Via[^+]+?\(BS\)/) || [contact.address])[0])
const socials = $('nav#sfooter a').map((_, a) => ({ href: $(a).attr('href') })).get()
  .map((s) => ({ ...s, network: /facebook/.test(s.href) ? 'Facebook' : /pinterest/.test(s.href) ? 'Pinterest' : /x\.com|twitter/.test(s.href) ? 'X' : 'Social' }))
const siteTitle = txt($('#site-title').text())

/* ---------------------------------------------------------------- articoli */
console.log('> articoli')
const posts = JSON.parse(await fetchText(`${BASE}/wp-json/wp/v2/posts?per_page=100&_embed`))
  .filter((p) => p.date >= '2020-01-01') // i post del 2016 sono la demo del tema Bravada
const postSlugs = new Set(posts.map((p) => p.slug))
const articles = []
for (const p of posts) {
  const title = txt(cheerio.load(p.title.rendered).text())
  const c = cheerio.load(p.content.rendered, null, false)
  c('script, style, noscript, iframe, form').remove()
  // immagini nel testo: localizzate
  let n = 0
  for (const img of c('img').toArray()) {
    const s = c(img).attr('src')
    if (!s) { c(img).remove(); continue }
    const m = await toWebp(fullSize(s), `articolo-${p.slug.slice(0, 40)}-${++n}`, { max: 1400, alt: c(img).attr('alt') || title })
    c(img).replaceWith(`<img src="${m.src}" width="${m.w}" height="${m.h}" alt="${(m.alt || '').replace(/"/g, '&quot;')}" loading="lazy" />`)
  }
  // link: articoli interni verso le nuove rotte, esterni in nuova scheda
  c('a').each((_, a) => {
    const href = c(a).attr('href') || ''
    const m = href.match(/studioingsandrini\.com\/([^/?#]+)\/?/)
    if (m && postSlugs.has(m[1])) c(a).attr('href', `/approfondimenti/${m[1]}`)
    else if (/^https?:/.test(href) && !/studioingsandrini\.com/.test(href)) c(a).attr({ target: '_blank', rel: 'noopener noreferrer' })
    else if (/studioingsandrini\.com\/?$/.test(href)) c(a).attr('href', '/')
  })
  // pulizia attributi
  c('*').each((_, el) => {
    const keep = { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'loading'] }[el.tagName] || []
    for (const attr of Object.keys(el.attribs || {})) if (!keep.includes(attr)) c(el).removeAttr(attr)
  })
  c('span, div, section').each((_, el) => { c(el).replaceWith(c(el).html() || '') })
  c('p').each((_, el) => { if (!clean(c(el).text()) && !c(el).find('img').length) c(el).remove() })
  let html = c.html().replace(/ /g, ' ')
  html = html.replace(/(>[^<]*)/g, (m) => noDash(m))
  const terms = (p._embedded?.['wp:term'] || []).flat()
  const fm = p._embedded?.['wp:featuredmedia']?.[0]?.source_url
  articles.push({
    // slug numerici (es. "3366-2") diventano leggibili; il vecchio resta per il redirect 301
    slug: /^\d+-\d+$/.test(p.slug) ? slugify(title).slice(0, 60).replace(/-+$/, '') : p.slug.replace(/_/g, '-'),
    oldSlug: p.slug,
    oldUrl: p.link,
    title,
    date: p.date.slice(0, 10),
    author: p._embedded?.author?.[0]?.name || '',
    excerpt: txt(cheerio.load(p.excerpt.rendered).text()).replace(/\s*\[&hellip;\]|\s*\[…\]/, '…'),
    categories: terms.filter((t) => t.taxonomy === 'category').map((t) => txt(t.name)),
    tags: terms.filter((t) => t.taxonomy === 'post_tag').map((t) => txt(t.name)),
    cover: fm ? await toWebp(fullSize(fm), `articolo-${p.slug.slice(0, 40)}-cover`, { max: 1400, alt: title }) : null,
    html,
  })
}
console.log(`  articoli: ${articles.length}`)

/* ---------------------------------------------------------------- terreno */
console.log('> terreno Val Camonica (AWS Terrain Tiles, z11)')
const Z = 11
const lon2x = (lon) => ((lon + 180) / 360) * 2 ** Z * 256
const lat2y = (lat) => {
  const r = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** Z * 256
}
const bbox = { west: 9.98, east: 10.42, south: 45.76, north: 46.07 }
const tx0 = Math.floor(lon2x(bbox.west) / 256), tx1 = Math.floor(lon2x(bbox.east) / 256)
const ty0 = Math.floor(lat2y(bbox.north) / 256), ty1 = Math.floor(lat2y(bbox.south) / 256)
const MW = (tx1 - tx0 + 1) * 256, MH = (ty1 - ty0 + 1) * 256
const mosaic = new Float32Array(MW * MH)
for (let tx = tx0; tx <= tx1; tx++) for (let ty = ty0; ty <= ty1; ty++) {
  const png = await fetchBuf(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${tx}/${ty}.png`)
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const i = (y * 256 + x) * info.channels
    const h = data[i] * 256 + data[i + 1] + data[i + 2] / 256 - 32768
    mosaic[((ty - ty0) * 256 + y) * MW + (tx - tx0) * 256 + x] = h
  }
}
const GRID = 256
const heights = new Uint16Array(GRID * GRID)
const px0 = lon2x(bbox.west) - tx0 * 256, px1 = lon2x(bbox.east) - tx0 * 256
const py0 = lat2y(bbox.north) - ty0 * 256, py1 = lat2y(bbox.south) - ty0 * 256
const sample = (fx, fy) => {
  const x0 = Math.floor(fx), y0 = Math.floor(fy), dx = fx - x0, dy = fy - y0
  const g = (x, y) => mosaic[Math.min(MH - 1, y) * MW + Math.min(MW - 1, x)]
  return g(x0, y0) * (1 - dx) * (1 - dy) + g(x0 + 1, y0) * dx * (1 - dy) + g(x0, y0 + 1) * (1 - dx) * dy + g(x0 + 1, y0 + 1) * dx * dy
}
let hmin = Infinity, hmax = -Infinity
for (let j = 0; j < GRID; j++) for (let i = 0; i < GRID; i++) {
  const h = Math.max(0, sample(px0 + ((px1 - px0) * i) / (GRID - 1), py0 + ((py1 - py0) * j) / (GRID - 1)))
  heights[j * GRID + i] = Math.round(h)
  hmin = Math.min(hmin, h); hmax = Math.max(hmax, h)
}
await fs.mkdir(path.join(ROOT, 'public/terrain'), { recursive: true })
await fs.writeFile(path.join(ROOT, 'public/terrain/valcamonica.bin'), Buffer.from(heights.buffer))
const kmW = (bbox.east - bbox.west) * 111.32 * Math.cos((((bbox.north + bbox.south) / 2) * Math.PI) / 180)
const kmH = (bbox.north - bbox.south) * 110.57
const terrainMeta = { grid: GRID, bbox, min: Math.round(hmin), max: Math.round(hmax), kmW: +kmW.toFixed(2), kmH: +kmH.toFixed(2), source: 'AWS Terrain Tiles (Mapzen/Tilezen), open data' }

// curve di livello in SVG: fallback 2.5D dell'hero e texture decorativa
const values = Array.from(heights)
const thresholds = []
for (let t = 200; t < hmax; t += 100) thresholds.push(t)
const cs = contours().size([GRID, GRID]).thresholds(thresholds)(values)
const r1 = (v) => Math.round(v * 2) / 2
const toPath = (multi) => multi.coordinates.map((poly) => poly.filter((ring) => ring.length > 6).map((ring) => 'M' + ring.filter((_, i) => i % 2 === 0).map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L') + 'Z').join('')).join('')
const svgPaths = cs.map((c) => ({ v: c.value, d: toPath(c) }))
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID - 1} ${GRID - 1}" fill="none" stroke="currentColor" stroke-linejoin="round">` +
  svgPaths.map((p) => `<path data-v="${p.v}" stroke-width="${p.v % 500 === 0 ? 0.55 : 0.25}" d="${p.d}"/>`).join('') + '</svg>'
await fs.writeFile(path.join(ROOT, 'public/terrain/contours.svg'), svg)
await fs.writeFile(path.join(ROOT, 'public/terrain/contours.json'), JSON.stringify(svgPaths))

/* ---------------------------------------------------------------- scrittura */
const site = { siteTitle, contact, socials, sourceUrl: BASE, importedAt: new Date().toISOString().slice(0, 10) }
const w = (f, d) => fs.writeFile(path.join(CONTENT, f), JSON.stringify(d, null, 2))
await w('site.json', site)
await w('services.json', services)
await w('technologies.json', technologies)
await w('projects.json', projects)
await w('articles.json', articles)
await w('terrain.json', terrainMeta)
await fs.writeFile(path.join(ROOT, 'scripts/media-report.json'), JSON.stringify(mediaLog, null, 2))
const heavy = mediaLog.filter((m) => m.kb > 300)
console.log(`> fatto. immagini: ${mediaLog.length}, oltre 300 KB: ${heavy.length}`, heavy)
console.log('  terreno:', terrainMeta)

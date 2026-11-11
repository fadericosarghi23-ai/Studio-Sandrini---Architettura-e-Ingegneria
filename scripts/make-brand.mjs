/**
 * Ricostruisce in SVG (tracciati, indipendenti dal font) il marchio tipografico
 * del sito attuale: "Studio Sandrini" in Playfair Display 700 e
 * "Architettura e Ingegneria" su blocco oro #e9b44c, come nell'header originale.
 * Il cliente non ha fornito un logo vettoriale: questo va confermato.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import opentype from 'opentype.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const fontFile = path.join(ROOT, 'node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff')
const buf = await fs.readFile(fontFile)
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))

const GOLD = '#e9b44c'
const r = (n) => Math.round(n * 100) / 100

function text(str, x, y, size) {
  const p = font.getPath(str, x, y, size)
  const bb = p.getBoundingBox()
  // toPathData() di opentype.js produce a volte "NaN": serializziamo noi i comandi
  const f = (n) => (Math.round(n * 100) / 100).toString()
  const d = p.commands.map((c) =>
    c.type === 'Z' ? 'Z'
      : c.type === 'Q' ? `Q${f(c.x1)} ${f(c.y1)} ${f(c.x)} ${f(c.y)}`
        : c.type === 'C' ? `C${f(c.x1)} ${f(c.y1)} ${f(c.x2)} ${f(c.y2)} ${f(c.x)} ${f(c.y)}`
          : `${c.type}${f(c.x)} ${f(c.y)}`).join('')
  return { d, w: font.getAdvanceWidth(str, size), bb }
}

// orizzontale: [Studio Sandrini] [blocco oro: Architettura e Ingegneria]
const S1 = 64
const name = text('Studio Sandrini', 0, 60, S1)
const S2 = 34
const padX = 14
const tagX = name.w + 26
const tag = text('Architettura e Ingegneria', tagX + padX, 58, S2)
const blockY = 58 - S2 * 0.86
const blockH = S2 * 1.18
const blockW = tag.w + padX * 2
const W = r(tagX + blockW + 2)
const H = 78

const horizontal = { viewBox: `0 0 ${W} ${H}`, name: name.d, tag: tag.d, block: { x: r(tagX), y: r(blockY), w: r(blockW), h: r(blockH) } }

// impilato: nome sopra, blocco sotto
const nameS = text('Studio Sandrini', 0, 62, 72)
const tagS = text('Architettura e Ingegneria', padX, 62 + 54, 30)
const stacked = {
  viewBox: `0 0 ${r(Math.max(nameS.w, tagS.w + padX * 2) + 2)} 132`,
  name: nameS.d,
  tag: tagS.d,
  block: { x: 0, y: r(62 + 54 - 30 * 0.86), w: r(tagS.w + padX * 2), h: r(30 * 1.18) },
}

// monogramma per favicon
const mono = text('S', 0, 0, 100)
const mx = 50 - (mono.bb.x1 + mono.bb.x2) / 2
const my = 50 - (mono.bb.y1 + mono.bb.y2) / 2
const monoPath = text('S', mx, my, 100).d

const ts = `// Generato da scripts/make-brand.mjs: non modificare a mano.
export const LOGO_GOLD = '${GOLD}'
export const logoHorizontal = ${JSON.stringify(horizontal)} as const
export const logoStacked = ${JSON.stringify(stacked)} as const
export const monogram = ${JSON.stringify(monoPath)}
`
await fs.writeFile(path.join(ROOT, 'src/components/brand/logo-data.ts'), ts)

const svg = (v, color) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.viewBox}"><path fill="${color}" d="${v.name}"/><rect x="${v.block.x}" y="${v.block.y}" width="${v.block.w}" height="${v.block.h}" fill="${GOLD}"/><path fill="#ffffff" d="${v.tag}"/></svg>`
await fs.mkdir(path.join(ROOT, 'public/brand'), { recursive: true })
await fs.writeFile(path.join(ROOT, 'public/brand/studio-sandrini-logo.svg'), svg(horizontal, '#162521'))
await fs.writeFile(path.join(ROOT, 'public/brand/studio-sandrini-logo-negativo.svg'), svg(horizontal, '#ffffff'))
await fs.writeFile(path.join(ROOT, 'public/brand/studio-sandrini-logo-verticale.svg'), svg(stacked, '#162521'))
await fs.writeFile(path.join(ROOT, 'public/favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="#1e3231"/><path fill="#ffffff" d="${monoPath}"/><rect x="62" y="74" width="16" height="6" fill="${GOLD}"/></svg>`)
console.log('marchio generato', horizontal.viewBox)

/**
 * Immagini derivate dalle foto importate:
 * - versione "a linee" del Real-Time Rendering (rilevamento dei bordi), per il
 *   confronto modello/render nella pagina Innovazione e tecnologia.
 */
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const src = path.join(ROOT, 'public/media/tech-real-time-rendering.webp')
const out = path.join(ROOT, 'public/media/tech-real-time-rendering-linee.webp')

const { width, height } = await sharp(src).metadata()

// bordi (bianco su nero) con due kernel di Sobel sommati
const sobel = async (kernel) =>
  sharp(src).greyscale().blur(0.6).convolve({ width: 3, height: 3, kernel, scale: 1, offset: 128 }).raw().toBuffer()
const gx = await sobel([-1, 0, 1, -2, 0, 2, -1, 0, 1])
const gy = await sobel([-1, -2, -1, 0, 0, 0, 1, 2, 1])
const mag = Buffer.alloc(width * height)
for (let i = 0; i < mag.length; i++) {
  const v = Math.hypot(gx[i] - 128, gy[i] - 128) * 2.6
  mag[i] = v < 34 ? 0 : Math.min(255, v)
}

const mask = await sharp(mag, { raw: { width, height, channels: 1 } }).png().toBuffer()
const petrol = await sharp({ create: { width, height, channels: 3, background: '#066664' } })
  .joinChannel(mask)
  .png()
  .toBuffer()

const info = await sharp({ create: { width, height, channels: 3, background: '#f3f7f6' } })
  .composite([{ input: petrol }])
  .webp({ quality: 82 })
  .toFile(out)
console.log('linee:', path.basename(out), Math.round(info.size / 1024), 'KB')

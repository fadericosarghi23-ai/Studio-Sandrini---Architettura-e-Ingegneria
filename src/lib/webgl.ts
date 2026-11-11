/**
 * Il rilievo 3D parte solo con WebGL su GPU reale. Con renderer software
 * (SwiftShader, llvmpipe), risparmio dati attivo o WebGL assente si usa il
 * fallback 2.5D in SVG con le stesse curve di livello.
 */
export function hasWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
    if (nav.connection?.saveData) return false
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return false
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return !/swiftshader|llvmpipe|software|microsoft basic render/i.test(renderer)
  } catch {
    return false
  }
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** schermi piccoli o dispositivi touch: meno passi per le ombre e risoluzione più bassa */
export const isLowPower = () =>
  typeof window !== 'undefined' && (window.matchMedia('(max-width: 767px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4)

/**
 * Rilievo 3D della Val Camonica (dati altimetrici reali) disegnato a curve di livello.
 * La luce e le ombre portate seguono la posizione reale del sole su Darfo Boario Terme.
 * Caricato a parte (lazy) solo se il browser supporta WebGL.
 */
import { useEffect, useMemo, useReducer, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { terrain } from '@/lib/content'
import { isLowPower } from '@/lib/webgl'

export type SceneState = {
  sun: [number, number, number]
  elevation: number
  pointer: [number, number]
  scroll: number
  reveal: number
}

export type PinTarget = { lat: number; lon: number; el: HTMLElement | null }

const EXAG = 1.55
const W = terrain.kmW
const H = terrain.kmH
const RANGE = ((terrain.max - terrain.min) / 1000) * EXAG

export const lonLatToWorld = (lon: number, lat: number): [number, number] => [
  ((lon - terrain.bbox.west) / (terrain.bbox.east - terrain.bbox.west)) * W - W / 2,
  ((terrain.bbox.north - lat) / (terrain.bbox.north - terrain.bbox.south)) * H - H / 2,
]

const vertex = /* glsl */ `
  attribute float aElev;
  varying float vElev;
  varying vec3 vPos;
  varying vec3 vNormal;
  void main() {
    vElev = aElev;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPos = position;
    vNormal = normalize(normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uHeight;
  uniform vec3 uSun;
  uniform float uSunElev;
  uniform vec2 uSize;
  uniform float uRange;
  uniform float uReveal;
  uniform vec2 uOrigin;
  uniform vec3 uPaper;
  uniform vec3 uSand;
  uniform vec3 uInk;
  uniform vec3 uGold;
  uniform vec3 uPetrol;
  varying float vElev;
  varying vec3 vPos;
  varying vec3 vNormal;

  vec2 toTc(vec3 p) { return vec2((p.x + uSize.x * 0.5) / uSize.x, (p.z + uSize.y * 0.5) / uSize.y); }

  float softShadow(vec3 p, vec3 dir) {
    if (dir.y <= 0.0) return 0.0;
    float t = 0.06;
    float res = 1.0;
    for (int i = 0; i < SHADOW_STEPS; i++) {
      vec3 q = p + dir * t;
      vec2 tc = toTc(q);
      if (tc.x < 0.0 || tc.x > 1.0 || tc.y < 0.0 || tc.y > 1.0 || q.y > uRange) break;
      float h = texture2D(uHeight, tc).r * uRange;
      float d = q.y - h;
      if (d < 0.0) return 0.0;
      res = min(res, 10.0 * d / t);
      t += max(0.09, d * 0.6);
    }
    return clamp(res, 0.0, 1.0);
  }

  float contour(float v, float step, float width) {
    float f = v / step;
    float w = fwidth(f);
    return 1.0 - smoothstep(0.0, w * width, abs(fract(f - 0.5) - 0.5));
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 sun = normalize(uSun);
    float day = smoothstep(-4.0, 6.0, uSunElev);
    float lambert = max(dot(n, sun), 0.0);
    float sh = softShadow(vPos + n * 0.02, sun);
    float light = lambert * mix(0.25, 1.0, sh) * day;

    // fondo carta: sabbia calda in fondovalle, carta a metà, appena più fredda in quota
    float hn = clamp(vElev / 2900.0, 0.0, 1.0);
    vec3 high = mix(uPaper, uPetrol, 0.07);
    vec3 base = mix(uSand * 0.985, uPaper, smoothstep(0.08, 0.42, hn));
    base = mix(base, high, smoothstep(0.55, 0.95, hn));
    // tono del sole: oro quando è basso, neutro a mezzogiorno
    float lowSun = 1.0 - smoothstep(8.0, 45.0, uSunElev);
    vec3 sunTint = mix(vec3(1.0), vec3(1.0, 0.95, 0.86), lowSun);
    // versanti al sole caldi, versanti in ombra più scuri e verso il petrolio
    vec3 litCol = base * sunTint * 1.04 + uGold * 0.025 * lowSun;
    vec3 shadeCol = mix(base, uPetrol, 0.12) * 0.84;
    float lit = smoothstep(0.0, 0.85, light);
    vec3 col = mix(shadeCol, litCol, mix(lit, 1.0, 1.0 - day * 0.85));
    // pendenze ripide leggermente più scure: dà rilievo anche senza sole diretto
    col *= 1.0 - (1.0 - n.y) * 0.12;

    // lago d'Iseo e fondovalle più basso
    float water = 1.0 - smoothstep(186.0, 192.0, vElev);
    col = mix(col, mix(uPaper, uPetrol, 0.16), water);

    // curve di livello: ogni 100 m sottili, ogni 500 m oro
    float minor = contour(vElev, 100.0, 1.1) * (1.0 - water);
    float major = contour(vElev, 500.0, 1.8) * (1.0 - water);
    vec3 lineCol = mix(uPetrol, uInk, 0.35);
    vec3 goldLit = mix(uGold * 0.8, uGold, light);

    // rivelazione radiale dal punto dello studio
    float dist = length(vPos.xz - uOrigin);
    float reveal = smoothstep(uReveal * 34.0, uReveal * 34.0 - 3.0, dist);
    float front = smoothstep(2.2, 0.0, abs(dist - uReveal * 34.0)) * (1.0 - step(0.999, uReveal));

    col = mix(col, lineCol, minor * mix(0.5, 0.36, lit) * reveal);
    col = mix(col, goldLit, major * 0.95 * reveal);
    col = mix(col, uGold, front * 0.5 * (minor + major));

    // bordo sfumato nella carta della pagina
    vec2 tc = toTc(vPos);
    float edge = smoothstep(0.5, 0.475, max(abs(tc.x - 0.5), abs(tc.y - 0.5)));
    col = mix(uPaper, col, edge);
    gl_FragColor = vec4(col, 1.0);
  }
`

function Terrain({ heights, state, pins }: { heights: Uint16Array; state: MutableRefObject<SceneState>; pins: MutableRefObject<PinTarget[]> }) {
  const group = useRef<THREE.Group>(null)
  const { camera, size, setDpr } = useThree()
  const perf = useRef({ n: 0, t: 0, lowered: false })
  const g = terrain.grid

  const { geometry, material, sampleHeight } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(W, H, g - 1, g - 1)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position as THREE.BufferAttribute
    const elev = new Float32Array(g * g)
    const tex = new Uint8Array(g * g)
    for (let k = 0; k < g * g; k++) {
      const h = heights[k]
      elev[k] = h
      const y = ((h - terrain.min) / 1000) * EXAG
      pos.setY(k, y)
      tex[k] = Math.round(((h - terrain.min) / (terrain.max - terrain.min)) * 255)
    }
    geo.setAttribute('aElev', new THREE.BufferAttribute(elev, 1))
    geo.computeVertexNormals()
    const heightTex = new THREE.DataTexture(tex, g, g, THREE.RedFormat, THREE.UnsignedByteType)
    heightTex.magFilter = THREE.LinearFilter
    heightTex.minFilter = THREE.LinearFilter
    heightTex.needsUpdate = true
    const [ox, oz] = lonLatToWorld(10.1826, 45.8817)
    const mat = new THREE.ShaderMaterial({
      defines: { SHADOW_STEPS: isLowPower() ? 28 : 48 },
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uHeight: { value: heightTex },
        uSun: { value: new THREE.Vector3(0, 1, 0) },
        uSunElev: { value: 30 },
        uSize: { value: new THREE.Vector2(W, H) },
        uRange: { value: RANGE },
        uReveal: { value: 0 },
        uOrigin: { value: new THREE.Vector2(ox, oz) },
        uPaper: { value: new THREE.Color('#f3f7f6') },
        uSand: { value: new THREE.Color('#eeebe9') },
        uInk: { value: new THREE.Color('#162521') },
        uGold: { value: new THREE.Color('#e9b44c') },
        uPetrol: { value: new THREE.Color('#066664') },
      },
    })
    const sample = (lon: number, lat: number) => {
      const i = Math.round(((lon - terrain.bbox.west) / (terrain.bbox.east - terrain.bbox.west)) * (g - 1))
      const j = Math.round(((terrain.bbox.north - lat) / (terrain.bbox.north - terrain.bbox.south)) * (g - 1))
      return ((heights[j * g + i] - terrain.min) / 1000) * EXAG
    }
    return { geometry: geo, material: mat, sampleHeight: sample }
  }, [heights, g])

  useEffect(() => () => { geometry.dispose(); material.dispose(); (material.uniforms.uHeight.value as THREE.Texture).dispose() }, [geometry, material])

  const v = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const portrait = size.width < size.height

  useFrame((_, dt) => {
    const pf = perf.current
    if (!pf.lowered && pf.n < 90) {
      pf.n++
      if (pf.n > 10) pf.t += dt
      if (pf.n === 90 && pf.t / 80 > 1 / 40) { pf.lowered = true; setDpr(0.85) }
    }
    const s = state.current
    const u = material.uniforms
    ;(u.uSun.value as THREE.Vector3).set(...s.sun)
    u.uSunElev.value = s.elevation
    u.uReveal.value = s.reveal

    // camera: da sud verso nord lungo la valle, si avvicina con lo scroll
    const k = 1 - Math.pow(0.001, dt)
    const sc = s.scroll
    // camera vicina e inclinata: il rilievo riempie tutto lo schermo
    const dist = portrait ? 28 - sc * 6 : 17 - sc * 4
    const camX = (portrait ? -1.5 : 0.5) + s.pointer[0] * 1.6
    const camY = (portrait ? 30 : 20) - sc * 3 + s.pointer[1] * 1
    camera.position.lerp(v.set(camX, camY, dist), k)
    // desktop: la valle al centro, il rilievo copre tutta la larghezza
    target.set(portrait ? -1.5 : 0.5, 0, (portrait ? -1 : -3) - sc * 5)
    camera.lookAt(target)
    if (group.current) group.current.rotation.y += (s.pointer[0] * 0.05 - group.current.rotation.y) * k

    // segnaposto HTML proiettati sullo schermo
    for (const p of pins.current) {
      if (!p.el) continue
      const [x, z] = lonLatToWorld(p.lon, p.lat)
      v.set(x, sampleHeight(p.lon, p.lat) + 0.25, z)
      if (group.current) v.applyMatrix4(group.current.matrixWorld)
      v.project(camera)
      const sx = ((v.x + 1) / 2) * size.width
      const sy = ((1 - v.y) / 2) * size.height
      // sotto i 1024 px i segnaposto coprirebbero il testo; su desktop si nascondono quelli nella colonna del titolo
      const visible = size.width >= 1024 && sx > size.width * 0.4 && sx < size.width - 16 && sy > 150 && v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05
      p.el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`
      p.el.style.visibility = visible ? 'visible' : 'hidden'
      // vicino al bordo destro l'etichetta si apre verso sinistra
      p.el.dataset.edge = sx > size.width - 160 ? 'right' : ''
      p.el.style.opacity = visible ? String(Math.min(1, Math.max(0, (s.reveal - 0.35) * 3))) : '0'
    }
  })

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={material} />
    </group>
  )
}

export default function TerrainScene({
  state, pins, active, onReady,
}: { state: MutableRefObject<SceneState>; pins: MutableRefObject<PinTarget[]>; active: boolean; onReady: () => void }) {
  const heightsRef = useRef<Uint16Array | null>(null)
  const ready = useRef(false)
  const [, force] = useReducerTick()

  useEffect(() => {
    let alive = true
    fetch('/terrain/valcamonica.bin')
      .then((r) => r.arrayBuffer())
      .then((b) => { if (alive) { heightsRef.current = new Uint16Array(b); force() } })
      .catch(() => {})
    return () => { alive = false }
  }, [force])

  if (!heightsRef.current) return null
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={isLowPower() ? [1, 1.25] : [1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 34, near: 0.5, far: 200, position: [-3, 21, 19] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        requestAnimationFrame(() => { if (!ready.current) { ready.current = true; onReady() } })
      }}
    >
      <Terrain heights={heightsRef.current} state={state} pins={pins} />
    </Canvas>
  )
}

function useReducerTick() {
  return useReducer((x: number) => x + 1, 0)
}

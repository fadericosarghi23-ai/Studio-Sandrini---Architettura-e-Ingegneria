/**
 * Posizione del sole (algoritmo NOAA semplificato, precisione di circa mezzo grado).
 * Usata dall'hero (luce e ombre sul rilievo) e dal diagramma solare di "Fonti rinnovabili".
 */
export const DARFO = { lat: 45.8817, lon: 10.1826 }

const rad = Math.PI / 180

export function dayOfYear(month: number, day: number) {
  const d = new Date(Date.UTC(2026, month, day))
  return Math.round((d.getTime() - Date.UTC(2026, 0, 0)) / 86400000)
}

/** ora legale italiana: dall'ultima domenica di marzo all'ultima di ottobre (approssimata per mese) */
export const italyUtcOffset = (month: number) => (month >= 3 && month <= 9 ? 2 : 1)

export type SunPos = { elevation: number; azimuth: number }

/**
 * @param doy giorno dell'anno
 * @param localHour ora civile italiana (es. 14.5 = 14:30)
 * @returns elevazione e azimut in gradi (azimut da nord, in senso orario)
 */
export function sunPosition(doy: number, localHour: number, utcOffset: number, lat = DARFO.lat, lon = DARFO.lon): SunPos {
  const g = ((2 * Math.PI) / 365) * (doy - 1 + (localHour - utcOffset - 12) / 24)
  const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g))
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g)
  const timeOffset = eqTime + 4 * lon - 60 * utcOffset
  const tst = localHour * 60 + timeOffset
  const ha = (tst / 4 - 180) * rad
  const phi = lat * rad
  const cosZen = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(ha)
  const zen = Math.acos(Math.max(-1, Math.min(1, cosZen)))
  const elevation = 90 - zen / rad
  let az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(phi) - Math.tan(decl) * Math.cos(phi)) / rad + 180
  az = (az + 360) % 360
  return { elevation, azimuth: az }
}

/** alba e tramonto (ora civile) cercando lo zero dell'elevazione */
export function sunriseSunset(doy: number, utcOffset: number) {
  const find = (from: number, to: number) => {
    let a = from, b = to
    for (let i = 0; i < 40; i++) {
      const m = (a + b) / 2
      const ea = sunPosition(doy, a, utcOffset).elevation
      const em = sunPosition(doy, m, utcOffset).elevation
      if (Math.sign(ea) === Math.sign(em)) a = m
      else b = m
    }
    return (a + b) / 2
  }
  return { sunrise: find(2, 12.5), sunset: find(12.5, 23) }
}

export const formatHour = (h: number) => {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(mm === 60 ? hh + 1 : hh).padStart(2, '0')}:${String(mm === 60 ? 0 : mm).padStart(2, '0')}`
}

/** direzione verso il sole in coordinate scena (x = est, y = alto, z = sud) */
export function sunVector(p: SunPos): [number, number, number] {
  const el = p.elevation * rad
  const az = p.azimuth * rad
  return [Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)]
}

export const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']

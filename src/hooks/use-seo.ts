import { useEffect } from 'react'

const SUFFIX = 'Studio Sandrini, Architettura e Ingegneria'

export function useSeo(title: string | null, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SUFFIX}` : `${SUFFIX} | Darfo Boario Terme`
    if (description) {
      let m = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (!m) {
        m = document.createElement('meta')
        m.name = 'description'
        document.head.appendChild(m)
      }
      m.content = description.length > 158 ? `${description.slice(0, 155).replace(/\s+\S*$/, '')}…` : description
    }
    let c = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!c) {
      c = document.createElement('link')
      c.rel = 'canonical'
      document.head.appendChild(c)
    }
    c.href = `https://www.studioingsandrini.com${window.location.pathname}`
  }, [title, description])
}

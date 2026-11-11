import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PageTransition } from '@/components/layout/page-transition'
import { SmoothScroll, useLenis, ScrollTrigger } from '@/components/motion/smooth-scroll'
import HomePage from '@/pages/home'

const StudioPage = lazy(() => import('@/pages/studio'))
const ServicesPage = lazy(() => import('@/pages/services'))
const ServicePage = lazy(() => import('@/pages/service'))
const ProjectsPage = lazy(() => import('@/pages/projects'))
const ProjectPage = lazy(() => import('@/pages/project'))
const ArticlesPage = lazy(() => import('@/pages/articles'))
const ArticlePage = lazy(() => import('@/pages/article'))
const ContactPage = lazy(() => import('@/pages/contact'))
const PrivacyPage = lazy(() => import('@/pages/privacy'))
const CookiePage = lazy(() => import('@/pages/cookie'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

function AnimatedRoutes() {
  const location = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        lenis?.scrollTo(0, { immediate: true, force: true })
        window.scrollTo(0, 0)
        requestAnimationFrame(() => ScrollTrigger.refresh())
      }}
    >
      <PageTransition key={location.pathname}>
        <Suspense fallback={<div className="min-h-screen" />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/servizi" element={<ServicesPage />} />
            <Route path="/servizi/:slug" element={<ServicePage />} />
            <Route path="/progetti" element={<ProjectsPage />} />
            <Route path="/progetti/:slug" element={<ProjectPage />} />
            <Route path="/approfondimenti" element={<ArticlesPage />} />
            <Route path="/approfondimenti/:slug" element={<ArticlePage />} />
            <Route path="/contatti" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookie" element={<CookiePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <SmoothScroll>
      <a href="#contenuto" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Vai al contenuto
      </a>
      <Navbar />
      <main id="contenuto">
        <AnimatedRoutes />
      </main>
      <Footer />
    </SmoothScroll>
  )
}

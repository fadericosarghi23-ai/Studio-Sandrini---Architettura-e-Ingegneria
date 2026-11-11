import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// font originali del sito, ospitati localmente (nessuna richiesta a Google)
import '@fontsource/playfair-display/latin-700.css'
import '@fontsource/playfair-display/latin-400-italic.css'
import '@fontsource/mulish/latin-300.css'
import '@fontsource/mulish/latin-400.css'
import '@fontsource/mulish/latin-600.css'
import '@fontsource/mulish/latin-800.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

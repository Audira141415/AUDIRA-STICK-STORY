import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/jetbrains-mono'
import './styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initWebApi } from './lib/webApi'

// Jika berjalan di browser (bukan di dalam Electron), gunakan Web API Adapter
if (typeof window.api === 'undefined') {
  window.api = initWebApi()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)


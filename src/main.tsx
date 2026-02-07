import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/i18n'
import { registerEffects } from '@/effects/activityEffectHandlers'
import './index.css'
import App from './App.tsx'

registerEffects()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

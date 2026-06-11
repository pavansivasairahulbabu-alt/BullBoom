import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{ style: { background: '#0B1220', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
  </StrictMode>,
)

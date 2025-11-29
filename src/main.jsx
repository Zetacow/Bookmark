import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const AppTree = clientId ? (
  <GoogleOAuthProvider clientId={clientId}>
    <App googleAuthEnabled />
  </GoogleOAuthProvider>
) : (
  <App googleAuthEnabled={false} />
)

createRoot(document.getElementById('root')).render(<StrictMode>{AppTree}</StrictMode>)

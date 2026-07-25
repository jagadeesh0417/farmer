import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import ErrorBoundary from './components/ErrorBoundary'
import { checkBackend } from './lib/withDemoFallback'
import './index.css'
import App from './App'

checkBackend()

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  </ErrorBoundary>
)

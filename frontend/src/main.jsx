import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ProductProvider } from './contexts/ProductContext'
import ErrorBoundary from './components/ErrorBoundary'
import { checkBackend } from './lib/withDemoFallback'
import './index.css'
import App from './App'

function Root() {
  const [ready, setReady] = useState(false)
  useEffect(() => { checkBackend().then(() => setReady(true)) }, [])
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Connecting...</p>
        </div>
      </div>
    )
  }
  return (
    <ErrorBoundary>
      <StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <ProductProvider>
                <App />
              </ProductProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </StrictMode>
    </ErrorBoundary>
  )
}

createRoot(document.getElementById('root')).render(<Root />)

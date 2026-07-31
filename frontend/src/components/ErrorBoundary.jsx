import { Component } from 'react'
import Logo from './Logo'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'ui-sans-serif, system-ui, sans-serif', background: '#FAFAFA' }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><Logo size="medium" /></div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Something went wrong</h1>
            <p style={{ color: '#666', fontSize: 14, margin: '0 0 16px' }}>An unexpected error occurred. Please refresh the page to continue.</p>
            <pre style={{ color: '#B91C1C', whiteSpace: 'pre-wrap', fontSize: 12, textAlign: 'left', background: '#FFF', border: '1px solid #E5E5E5', borderRadius: 12, padding: 12, maxHeight: 160, overflow: 'auto', margin: '0 0 20px' }}>{this.state.error?.message}</pre>
            <button onClick={() => window.location.reload()}
              style={{ background: '#005B57', color: '#FFF', border: 'none', borderRadius: 999, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Refresh Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <Logo size="medium" className="mb-6" />
      <p className="font-heading text-[96px] sm:text-[120px] font-bold leading-none text-green-600/20 select-none" aria-hidden="true">404</p>
      <h1 className="text-h3 font-bold text-ink mt-2">Page not found</h1>
      <p className="text-body-sm text-muted mt-2 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-body-sm font-semibold text-white transition hover:bg-green-700 hover:-translate-y-0.5">
          Back to Home
        </Link>
        <Link to="/products" className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-2.5 text-body-sm font-semibold text-ink transition hover:border-green-600 hover:text-green-600">
          Browse Products
        </Link>
      </div>
    </div>
  )
}

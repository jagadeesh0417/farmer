import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import SeoHead from '../components/SeoHead'

export default function QRRedirect() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      try {
        const data = await api.lookupQRCode(code)
        if (cancelled) return
        // Fire-and-forget scan count increment
        api.scanQRCode(code).catch(() => {})
        // Redirect to farmer page
        navigate(`/farmer/${data.slug}`, { replace: true })
      } catch (err) {
        if (!cancelled) setStatus('invalid')
      }
    }

    resolve()
    return () => { cancelled = true }
  }, [code, navigate])

  if (status === 'invalid') {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 py-12 text-center bg-white">
        <SeoHead title="Invalid QR Code" noindex />
        <div className="max-w-sm">
          <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-amber-50 flex items-center justify-center">
            <svg className="h-10 w-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="font-heading text-h2 font-bold text-ink">Invalid or Expired Code</h1>
          <p className="mt-2 text-body-sm text-muted leading-relaxed">
            This QR code could not be verified. It may have expired or been deactivated.
          </p>
          <p className="mt-1 text-body-sm text-muted">
            Please contact the seller or try scanning the code again.
          </p>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-green-600 px-6 py-3 text-body-sm font-semibold text-white hover:bg-green-700 transition">
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-white">
      <SeoHead title="Redirecting..." noindex />
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-green-600" />
        <p className="text-body-sm text-muted">Verifying code & redirecting...</p>
      </div>
    </div>
  )
}

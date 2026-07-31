export default function CheckoutButton({ onClick, loading = false, disabled = false, children, className = '', type = 'button' }) {
  const loadingLabel = typeof loading === 'string' ? loading : 'Processing...'
  return (
    <button type={type} onClick={onClick} disabled={disabled || !!loading}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#2E7D32] text-body-sm font-semibold text-white shadow-lg shadow-[#2E7D32]/25 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#2E7D32]/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100 ${className}`}>
      {loading ? (
        <>
          <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <span>{loadingLabel}</span>
        </>
      ) : children}
    </button>
  )
}

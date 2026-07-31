export default function MobileCheckoutBar({ showTotal, totalLabel, total, children }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5EDD8] bg-white/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        {showTotal !== false && (
          <div className="shrink-0">
            <p className="text-micro font-semibold uppercase tracking-wide text-[#8B9E7A]">{totalLabel || 'Total'}</p>
            <p className="font-heading text-h4 font-bold text-[#2E7D32] leading-tight">{total}</p>
          </div>
        )}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}

export const CHECKOUT_STEPS = [
  { num: 1, label: 'Cart' },
  { num: 2, label: 'Address' },
  { num: 3, label: 'Payment' },
  { num: 4, label: 'Review' },
  { num: 5, label: 'Success' },
]

export default function CheckoutProgress({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {CHECKOUT_STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
              current > s.num
                ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/20'
                : current === s.num
                  ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/20 ring-4 ring-[#2E7D32]/10'
                  : 'bg-[#E5EDD8] text-[#8B9E7A]'
            }`}>
              {current > s.num ? (
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : s.num}
            </div>
            <span className={`mt-1.5 text-micro sm:text-caption font-semibold hidden sm:block ${
              current >= s.num ? 'text-[#1a1a1a]' : 'text-[#B0B0B0]'
            }`}>{s.label}</span>
          </div>
          {i < CHECKOUT_STEPS.length - 1 && (
            <div className={`h-[2px] w-10 sm:w-16 lg:w-24 mx-1 sm:mx-2 transition-colors duration-300 ${
              current > s.num ? 'bg-[#2E7D32]' : 'bg-[#E5EDD8]'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'

export default function HorizontalScroll({ children, className = '' }) {
  const scrollRef = useRef(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 4)
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(() => checkScroll())
    ro.observe(el.parentElement)
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect() }
  }, [checkScroll])

  const scrollBy = (dir) => {
    const el = scrollRef.current
    if (!el || !el.children[0]) return
    const card = el.children[0]
    const gap = parseInt(getComputedStyle(el).columnGap) || 16
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: 'smooth' })
  }

  return (
    <div className="relative group/scroll">
      {showLeft && (
        <button type="button" onClick={() => scrollBy(-1)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md text-ink hover:text-green-600 transition border border-border opacity-0 group-hover/scroll:opacity-100"
          aria-label="Scroll left">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {showRight && (
        <button type="button" onClick={() => scrollBy(1)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md text-ink hover:text-green-600 transition border border-border opacity-0 group-hover/scroll:opacity-100"
          aria-label="Scroll right">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      )}
      <div ref={scrollRef}
        className={`flex gap-4 overflow-x-auto hide-scrollbar carousel-snap pb-2 ${className}`}
        style={{ WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
    </div>
  )
}

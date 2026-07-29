import { useRef, useState, useEffect, useCallback } from 'react'

export default function HorizontalScroll({ children, className = '' }) {
  const scrollRef = useRef(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const autoScrollTimer = useRef(null)
  const rafRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)
  const velocityRef = useRef(0)

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
    ro.observe(el)
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect() }
  }, [checkScroll])

  const scrollBy = useCallback((dir) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.children[0]
    const cardWidth = card ? card.offsetWidth + 16 : 300
    el.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' })
  }, [])

  const handleMouseDown = useCallback((e) => {
    isDragging.current = true
    startX.current = e.pageX
    scrollLeftStart.current = scrollRef.current.scrollLeft
    velocityRef.current = 0
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    const el = scrollRef.current
    if (el && Math.abs(velocityRef.current) > 2) {
      const v = velocityRef.current * 8
      const animate = () => {
        el.scrollLeft += v * 0.016
        velocityRef.current *= 0.95
        if (Math.abs(velocityRef.current) > 0.5) rafRef.current = requestAnimationFrame(animate)
      }
      animate()
    }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return
    e.preventDefault()
    const x = e.pageX - startX.current
    velocityRef.current = x
    scrollRef.current.scrollLeft = scrollLeftStart.current - x
  }, [])

  const handleWheel = useCallback((e) => {
    const el = scrollRef.current
    if (!el) return
    const delta = e.deltaY || e.deltaX
    el.scrollLeft += delta
    e.preventDefault()
  }, [])

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el || isHovered) return
    const card = el.children[0]
    if (!card) return
    const cardWidth = card.offsetWidth + 16
    const timer = setInterval(() => {
      if (isHovered) return
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' })
      }
    }, 4000)
    return () => clearInterval(timer)
  }, [isHovered])

  return (
    <div className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); handleMouseUp() }}>
      {showLeft && (
        <button type="button" onClick={() => scrollBy(-1)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md text-ink hover:text-green-600 hover:bg-white transition border border-border"
          aria-label="Scroll left">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {showRight && (
        <button type="button" onClick={() => scrollBy(1)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md text-ink hover:text-green-600 hover:bg-white transition border border-border"
          aria-label="Scroll right">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      )}
      <div ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        className={`flex overflow-x-auto hide-scrollbar scroll-smooth pb-2 pt-0.5 cursor-grab active:cursor-grabbing snap-x snap-mandatory px-2 sm:px-0 -mx-5 sm:mx-0 [&>*]:snap-start [&>*]:flex-shrink-0 max-sm:gap-3 sm:gap-4 ${className}`}
        style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}>
        {children}
      </div>
    </div>
  )
}

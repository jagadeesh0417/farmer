import { useRef, useState, useEffect, useCallback } from 'react'

export default function HorizontalScroll({ children, className = '' }) {
  const scrollRef = useRef(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const rafRef = useRef(null)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)
  const lastMoveX = useRef(0)
  const lastMoveTime = useRef(0)
  const velocityRef = useRef(0)
  const hoverRef = useRef(false)

  const getCardWidth = useCallback(() => {
    const el = scrollRef.current
    if (!el || !el.children[0]) return 300
    const child = el.children[0]
    const style = getComputedStyle(child)
    const gap = parseInt(getComputedStyle(el).columnGap) || 12
    return child.offsetWidth + gap
  }, [])

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const atStart = el.scrollLeft <= 2
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2
    setShowLeft(!atStart)
    setShowRight(!atEnd)
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

  // Also check on children change
  useEffect(() => { checkScroll() }, [children, checkScroll])

  const scrollBy = useCallback((dir) => {
    const el = scrollRef.current
    if (!el) return
    const step = getCardWidth()
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [getCardWidth])

  const handleMouseDown = useCallback((e) => {
    isDragging.current = true
    dragStartX.current = e.pageX
    dragStartScroll.current = scrollRef.current.scrollLeft
    lastMoveX.current = e.pageX
    lastMoveTime.current = performance.now()
    velocityRef.current = 0
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    const el = scrollRef.current
    if (el && Math.abs(velocityRef.current) > 0.3) {
      const animate = () => {
        el.scrollLeft += velocityRef.current
        velocityRef.current *= 0.92
        if (Math.abs(velocityRef.current) > 0.1) rafRef.current = requestAnimationFrame(animate)
      }
      rafRef.current = requestAnimationFrame(animate)
    }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return
    e.preventDefault()
    const now = performance.now()
    const dt = now - lastMoveTime.current
    if (dt > 0) {
      velocityRef.current = (e.pageX - lastMoveX.current) / dt * 16
    }
    lastMoveX.current = e.pageX
    lastMoveTime.current = now
    scrollRef.current.scrollLeft = dragStartScroll.current - (e.pageX - dragStartX.current)
  }, [])

  const handleWheel = useCallback((e) => {
    const el = scrollRef.current
    if (!el) return
    const delta = e.deltaX || e.deltaY
    if (Math.abs(delta) < 5) return
    const atStart = el.scrollLeft <= 0
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1
    const scrollingUp = delta < 0
    const scrollingDown = delta > 0
    if ((scrollingUp && atStart) || (scrollingDown && atEnd)) return
    el.scrollLeft += delta * 0.8
    e.preventDefault()
  }, [])

  // Auto-scroll — using ref for isHovered to avoid stale closures
  useEffect(() => { hoverRef.current = isHovered }, [isHovered])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const timer = setInterval(() => {
      if (hoverRef.current) return
      const step = getCardWidth()
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - step) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' })
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [getCardWidth])

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
        style={{ WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
    </div>
  )
}

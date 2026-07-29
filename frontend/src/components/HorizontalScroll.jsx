import { useRef, useCallback } from 'react'

export default function HorizontalScroll({ children, className = '' }) {
  const scrollRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const scroll = useCallback((dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }, [])

  const handleMouseDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
    scrollRef.current.style.cursor = 'grabbing'
  }

  const handleMouseUp = () => {
    isDragging.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = ''
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  const handleWheel = (e) => {
    if (!scrollRef.current) return
    const delta = e.deltaY || e.deltaX
    scrollRef.current.scrollLeft += delta
    if (Math.abs(delta) > 5) e.preventDefault()
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => scroll(-1)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 shadow-md text-ink hover:text-green-600 hover:bg-white transition border border-border opacity-70 hover:opacity-100"
        aria-label="Scroll left">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button type="button" onClick={() => scroll(1)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 shadow-md text-ink hover:text-green-600 hover:bg-white transition border border-border opacity-70 hover:opacity-100"
        aria-label="Scroll right">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
      <div ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        className={`flex gap-4 overflow-x-auto hide-scrollbar carousel-snap pb-2 cursor-grab active:cursor-grabbing scroll-smooth px-1 sm:px-2 ${className}`}
        style={{ WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
    </div>
  )
}

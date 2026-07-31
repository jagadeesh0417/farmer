import { useState, useEffect, useCallback, useRef } from 'react'
import { cld } from '../lib/cloudinary'

function getSlidesPerView() {
  if (typeof window === 'undefined') return 3
  const w = window.innerWidth
  if (w >= 1536) return 4
  if (w >= 1024) return 3
  if (w >= 768) return 2
  return 1
}

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-1 mb-3">
      {Array.from({ length: 5 }, (_, j) => (
        <svg key={j} className={`h-3.5 w-3.5 ${j < rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-micro font-bold text-amber-500 ml-1">Verified Purchase</span>
    </div>
  )
}

function ReviewCard({ review }) {
  const initials = (review.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)
  return (
    <div className="relative flex h-full flex-col rounded-xl border border-border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {review.featured && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-600">
          ★ Featured
        </span>
      )}
      <StarRow rating={Number(review.rating) || 5} />
      <p className="text-body-sm text-muted leading-relaxed flex-1">"{review.text}"</p>
      {review.product && (
        <p className="mt-2 text-micro font-semibold text-green-700">✓ Purchased: {review.product}</p>
      )}
      <div className="mt-4 pt-3 border-t border-border flex items-center gap-3">
        {review.image ? (
          <img src={cld(review.image, 'f_auto,q_auto,w_160,h_160,c_fill,g_face')} alt={review.name}
            loading="lazy" decoding="async"
            className="h-9 w-9 rounded-full object-cover shrink-0 border border-border" />
        ) : (
          <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-caption shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-caption font-bold text-ink truncate">{review.name}</p>
          <p className="text-micro text-muted truncate">{review.designation || 'Customer'}</p>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsCarousel({ reviews }) {
  const [perSlide, setPerSlide] = useState(getSlidesPerView)
  const [index, setIndex] = useState(0)
  const [noTransition, setNoTransition] = useState(false)
  const [paused, setPaused] = useState(false)
  const touchX = useRef(null)

  const n = reviews.length
  const canMove = n > perSlide
  const maxIndex = 3 * n - perSlide

  useEffect(() => {
    const onResize = () => {
      setPerSlide(getSlidesPerView())
      setIndex(0)
      setNoTransition(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setNoTransition(false)))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const jump = useCallback((to) => {
    setNoTransition(true)
    setIndex(to)
    requestAnimationFrame(() => requestAnimationFrame(() => setNoTransition(false)))
  }, [])

  const next = useCallback(() => {
    if (!canMove || index >= maxIndex) return
    if (index + 1 > maxIndex) jump(2 * n - perSlide + 1)
    else setIndex(index + 1)
  }, [canMove, index, maxIndex, n, perSlide, jump])

  const prev = useCallback(() => {
    if (!canMove || index <= 0) return
    if (index - 1 < 0) jump(2 * n - 1)
    else setIndex(index - 1)
  }, [canMove, index, n, jump])

  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!canMove || paused || reduceMotion) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [next, canMove, paused, reduceMotion])

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; setPaused(true) }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const delta = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(delta) > 40) { if (delta < 0) next(); else prev() }
    touchX.current = null
    setPaused(false)
  }

  return (
    <div className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}>
      <div className="overflow-hidden px-1 -mx-1">
        <div className="flex items-stretch"
          style={{
            transform: `translateX(-${(index * 100) / perSlide}%)`,
            transition: noTransition ? 'none' : 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}>
          {Array.from({ length: 3 * n }).map((_, i) => {
            const review = reviews[i % n]
            return (
              <div key={i} className="shrink-0 px-2.5 sm:px-3" style={{ width: `${100 / perSlide}%` }}>
                <ReviewCard review={review} />
              </div>
            )
          })}
        </div>
      </div>

      {canMove && (
        <>
          <button type="button" onClick={prev} aria-label="Previous reviews"
            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border border-border text-ink hover:text-green-600 hover:scale-105 transition-all">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button type="button" onClick={next} aria-label="Next reviews"
            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border border-border text-ink hover:text-green-600 hover:scale-105 transition-all">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
    </div>
  )
}

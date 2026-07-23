import { useState, useEffect, useCallback, useRef } from 'react'
import { getImageUrl } from '../lib/utils'
import { cld } from '../lib/cloudinary'

function BannerImage({ banner, priority }) {
  const desktop = banner.desktopImage || banner.image
  const tablet = banner.tabletImage || banner.desktopImage || banner.image
  const mobile = banner.mobileImage || banner.tabletImage || banner.desktopImage || banner.image

  const desktopUrl = desktop ? cld(getImageUrl(desktop), 'f_auto,q_auto,w_1920,h_700,c_fill') : ''
  const tabletUrl = tablet ? cld(getImageUrl(tablet), 'f_auto,q_auto,w_1200,h_600,c_fill') : ''
  const mobileUrl = mobile ? cld(getImageUrl(mobile), 'f_auto,q_auto,w_1080,h_1350,c_fill') : ''

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktopUrl} />
      <source media="(min-width: 640px)" srcSet={tabletUrl} />
      <img
        src={mobileUrl}
        alt={banner.title || 'Banner'}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </picture>
  )
}

export default function HeroSlider({ banners = [], interval = 5000 }) {
  const slides = banners.length > 0 ? banners : []
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const goTo = useCallback((i, dir = 1) => {
    setDirection(dir)
    setIndex((prev) => {
      let next = i
      if (next < 0) next = slides.length - 1
      if (next >= slides.length) next = 0
      return next
    })
  }, [slides.length])

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index])

  useEffect(() => {
    if (slides.length <= 1 || paused) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [slides.length, interval, next, paused])

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX
  }

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) next()
      else prev()
    }
  }

  if (!slides.length) return null

  return (
    <section
      className="relative w-full overflow-hidden bg-off-white aspect-[4/5] sm:aspect-[2/1] lg:aspect-[1920/700]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((banner, i) => {
        const active = i === index
        return (
          <div
            key={banner._id || i}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              active ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 z-0'
            } ${direction > 0 ? 'translate-x-full' : '-translate-x-full'}`}
            style={{ transform: active ? 'translateX(0)' : undefined }}
          >
            <BannerImage banner={banner} priority={i === 0} />
          </div>
        )
      })}

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-ink shadow-md backdrop-blur-sm transition hover:bg-white hover:text-green-600 sm:flex"
            aria-label="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-ink shadow-md backdrop-blur-sm transition hover:bg-white hover:text-green-600 sm:flex"
            aria-label="Next slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

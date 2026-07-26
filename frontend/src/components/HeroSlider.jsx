import { useState, useEffect, useCallback, useRef } from 'react'
import { cld } from '../lib/cloudinary'

function BannerImage({ banner, priority }) {
  const desktop = banner.desktopImage || banner.image
  const tablet = banner.tabletImage || banner.desktopImage || banner.image
  const mobile = banner.mobileImage || banner.tabletImage || banner.desktopImage || banner.image

  const desktopUrl = desktop ? cld(desktop, 'f_auto,q_auto,w_1920,h_700,c_fill') : ''
  const tabletUrl = tablet ? cld(tablet, 'f_auto,q_auto,w_1200,h_600,c_fill') : ''
  const mobileUrl = mobile ? cld(mobile, 'f_auto,q_auto,w_1080,h_1350,c_fill') : ''

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktopUrl} />
      <source media="(min-width: 640px)" srcSet={tabletUrl} />
      <img src={mobileUrl} alt={banner.title || 'Banner'}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        className="absolute inset-0 h-full w-full object-cover object-center" />
    </picture>
  )
}

export default function HeroSlider({ banners = [], interval = 5000 }) {
  const slides = banners.length > 0 ? banners : []
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(0)

  const next = useCallback(() => {
    setIndex(prev => (prev + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    setIndex(prev => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1 || paused) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [slides.length, interval, next, paused])

  const handleTouchStart = (e) => { touchStartX.current = e.changedTouches[0].screenX }
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].screenX
    if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev() }
  }

  if (!slides.length) return null

  return (
    <section className="relative w-full overflow-hidden bg-off-white aspect-[4/5] sm:aspect-[2/1] lg:aspect-[1920/700]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>
      {slides.map((banner, i) => (
        <div key={banner._id || i}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <BannerImage banner={banner} priority={i === 0} />
        </div>
      ))}
      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-ink shadow-md backdrop-blur-sm transition hover:bg-white hover:text-green-600 sm:flex" aria-label="Previous">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-ink shadow-md backdrop-blur-sm transition hover:bg-white hover:text-green-600 sm:flex" aria-label="Next">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'}`}
                aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
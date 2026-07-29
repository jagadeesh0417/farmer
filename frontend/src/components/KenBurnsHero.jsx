import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { cld } from '../lib/cloudinary'

const AUTOPLAY_DELAY = 6000

const defaultSlides = [
  {
    id: 1,
    image: '',
    heading: 'Nature\'s Finest',
    subtext: 'Wild-harvested, chemical-free goodness from tribal communities',
    ctaLabel: 'Shop Now',
    ctaHref: '/products',
    align: 'left',
  },
]

function getImg(url, transform) {
  if (!url) return ''
  if (url.includes('/upload/')) return cld(url, transform)
  return url
}

function SlideImage({ slide, active, index, priority }) {
  const desktop = slide.desktopImage || slide.image
  const mobile = slide.mobileImage || slide.tabletImage || desktop
  const directionClass = index % 2 === 0 ? 'animate-kenburns-in' : 'animate-kenburns-out'

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={getImg(desktop, 'f_auto,q_80,w_2400,h_900,c_fill,g_auto')} />
      <img src={getImg(mobile, 'f_auto,q_80,w_1080,h_1350,c_fill,g_auto')}
        alt={slide.alt || slide.heading || 'Banner'}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        className={`absolute inset-0 h-full w-full object-cover object-center will-change-transform ${active ? directionClass : ''}`}
      />
    </picture>
  )
}

function GradientOverlay({ align }) {
  if (align === 'center') {
    return <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />
  }
  if (align === 'right') {
    return <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/40 via-black/20 to-transparent" />
  }
  return <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />
}

function OverlayContent({ slide, active }) {
  const { heading, subtext, ctaLabel, ctaHref, align } = slide
  const justify = align === 'center' ? 'justify-center text-center' : align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
  const contentAlign = align === 'right' ? 'items-end' : 'items-center'

  return (
    <div className={`absolute inset-0 z-10 flex ${contentAlign} ${justify} px-[5vw] py-12 sm:py-16 lg:py-20`}>
      <div className={`max-w-xl lg:max-w-2xl ${active ? 'banner-content-active' : ''}`}>
        {heading && (
          <h1 className="font-heading text-h1 font-bold leading-tight text-white drop-shadow-lg">
            {heading}
          </h1>
        )}
        {subtext && (
          <p className="mt-3 max-w-lg text-body-sm text-white/85 sm:text-body md:mt-4">
            {subtext}
          </p>
        )}
        {ctaLabel && ctaHref && (
          <Link to={ctaHref}
            className="btn-font mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-green-600 px-7 py-3 text-btn font-semibold tracking-[0.06em] uppercase text-white shadow-2xl shadow-green-600/30 transition-all hover:bg-green-700 hover:-translate-y-0.5 active:scale-[0.97] md:mt-8 md:px-8 md:py-3.5">
            {ctaLabel}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}

function SingleSlide({ slide }) {
  return (
    <section className="ken-hero relative w-full overflow-hidden bg-green-800 h-[400px] sm:h-[500px] lg:h-[560px]" role="banner" aria-label={slide.heading || 'Banner'}>
      <SlideImage slide={slide} active index={0} priority />
      <GradientOverlay align={slide.align} />
      <OverlayContent slide={slide} active />
    </section>
  )
}

function Carousel({ slides }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [animTick, setAnimTick] = useState(0)
  const touchStartX = useRef(0)

  const goNext = useCallback(() => {
    setActive(prev => (prev + 1) % slides.length)
  }, [slides.length])

  const goPrev = useCallback(() => {
    setActive(prev => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1 || paused) return
    const timer = setInterval(goNext, AUTOPLAY_DELAY)
    return () => clearInterval(timer)
  }, [slides.length, paused, goNext])

  useEffect(() => {
    setAnimTick(t => t + 1)
  }, [active])

  const handleTouchStart = (e) => { touchStartX.current = e.changedTouches[0].screenX }
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].screenX
    if (Math.abs(diff) > 50) { if (diff > 0) goNext(); else goPrev() }
  }

  return (
    <section className="ken-hero relative w-full overflow-hidden bg-green-800 h-[400px] sm:h-[500px] lg:h-[560px] select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region" aria-label="Promotional banner carousel" aria-roledescription="carousel">
      {slides.map((slide, i) => (
        <div key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          role="group" aria-roledescription="slide" aria-label={`Slide ${i + 1} of ${slides.length}`}
          aria-hidden={i !== active}>
          <div key={`img-${slide.id}-${i === active ? animTick : i}`} className="absolute inset-0 overflow-hidden">
            <SlideImage slide={slide} active={i === active} index={i} priority={i === 0} />
          </div>
          <GradientOverlay align={slide.align} />
          <OverlayContent slide={slide} active={i === active} />
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button onClick={goPrev}
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-ink shadow-md backdrop-blur-sm transition hover:bg-white hover:text-green-600 sm:flex"
            aria-label="Previous slide">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={goNext}
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-ink shadow-md backdrop-blur-sm transition hover:bg-white hover:text-green-600 sm:flex"
            aria-label="Next slide">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => { setActive(i); setPaused(true); setTimeout(() => setPaused(false), AUTOPLAY_DELAY) }}
                className={`h-2.5 rounded-full transition-all ${i === active ? 'w-7 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/75'}`}
                aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default function KenBurnsHero({ slides = defaultSlides }) {
  if (!slides || slides.length === 0) return null
  if (slides.length === 1) return <SingleSlide slide={slides[0]} />

  return (
    <>
      <Carousel slides={slides} />
      <style>{`
        @keyframes kenburns-in {
          from { transform: scale(1); }
          to { transform: scale(1.12); }
        }
        @keyframes kenburns-out {
          from { transform: scale(1.12); }
          to { transform: scale(1); }
        }
        .animate-kenburns-in {
          animation: kenburns-in 7s ease-in-out forwards;
        }
        .animate-kenburns-out {
          animation: kenburns-out 7s ease-in-out forwards;
        }
        .banner-content-active {
          animation: bannerContentIn 0.8s ease 0.3s both;
        }
        @keyframes bannerContentIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-kenburns-in,
          .animate-kenburns-out {
            animation: none !important;
            transform: none !important;
          }
          .banner-content-active {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
        @media (max-width: 640px) {
          .animate-kenburns-in {
            animation: kenburns-in-mobile 7s ease-in-out forwards;
          }
          .animate-kenburns-out {
            animation: kenburns-out-mobile 7s ease-in-out forwards;
          }
        }
        @keyframes kenburns-in-mobile {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        @keyframes kenburns-out-mobile {
          from { transform: scale(1.08); }
          to { transform: scale(1); }
        }
        @media (max-width: 767px) {
          section.ken-hero {
            height: auto;
            aspect-ratio: 4 / 5;
          }
        }
      `}</style>
    </>
  )
}

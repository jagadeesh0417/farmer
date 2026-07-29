import { useState, useEffect, useCallback } from 'react'
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

function srcSet(url, sizes, transform) {
  if (!url) return undefined
  return sizes.map(w => `${getImg(url, `f_auto,q_70,w_${w},${transform}`)} ${w}w`).join(', ')
}

function SlideImage({ slide, active, index, priority }) {
  const desktop = slide.desktopImage || slide.image
  const mobile = slide.mobileImage || slide.tabletImage || desktop

  return (
    <picture>
      {desktop && (
        <source media="(min-width: 768px)"
          sizes="100vw"
          srcSet={srcSet(desktop, [640, 1024, 1920, 2200, 2800], 'c_limit')} />
      )}
      {mobile && (
        <source media="(max-width: 767px)"
          sizes="100vw"
          srcSet={srcSet(mobile, [480, 768, 1080], 'c_limit')} />
      )}
      <img src={getImg(desktop || mobile, 'f_auto,q_70,w_800,c_limit')}
        alt={slide.alt || slide.heading || 'Banner'}
        loading={priority ? 'eager' : active ? 'eager' : 'lazy'}
        fetchPriority={priority || active ? 'high' : undefined}
        decoding={active ? 'sync' : 'async'}
        className="absolute inset-0 h-full w-full object-cover object-center"
        key={desktop + mobile} />
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
      </div>
    </div>
  )
}

function SingleSlide({ slide }) {
  const desktop = slide.desktopImage || slide.image
  const mobile = slide.mobileImage || slide.tabletImage || desktop
  return (
    <section className="ken-hero relative w-full overflow-hidden bg-green-800 rounded-2xl" role="banner" aria-label={slide.heading || 'Banner'}>
      {desktop && (
        <img src={getImg(desktop, 'f_auto,q_10,w_50,c_limit')} alt="" aria-hidden="true"
          className="hidden md:block w-full h-auto invisible" loading="eager" />
      )}
      {mobile && (
        <img src={getImg(mobile, 'f_auto,q_10,w_50,c_limit')} alt="" aria-hidden="true"
          className="block md:hidden w-full aspect-[1/1] invisible" loading="eager" />
      )}
      <div className="absolute inset-0">
        <SlideImage slide={slide} active index={0} priority />
      </div>
      <GradientOverlay align={slide.align} />
      <OverlayContent slide={slide} active />
    </section>
  )
}

function Carousel({ slides }) {
  const [active, setActive] = useState(0)
  const [animTick, setAnimTick] = useState(0)

  const goNext = useCallback(() => {
    setActive(prev => (prev + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    const timer = setInterval(goNext, AUTOPLAY_DELAY)
    return () => clearInterval(timer)
  }, [goNext])

  useEffect(() => {
    setAnimTick(t => t + 1)
  }, [active])

  const activeSlide = slides[active]
  const desktop = activeSlide?.desktopImage || activeSlide?.image
  const mobile = activeSlide?.mobileImage || activeSlide?.tabletImage || desktop

  return (
    <section className="ken-hero relative w-full overflow-hidden bg-green-800 rounded-2xl select-none"
      role="region" aria-label="Promotional banner carousel" aria-roledescription="carousel">
      {/* Spacer images — sets container height to match active slide's natural aspect ratio per viewport */}
      {desktop && (
        <img src={getImg(desktop, 'f_auto,q_10,w_50,c_limit')} alt="" aria-hidden="true"
          className="hidden md:block w-full h-auto invisible" loading="eager" />
      )}
      {mobile && (
        <img src={getImg(mobile, 'f_auto,q_10,w_50,c_limit')} alt="" aria-hidden="true"
          className="block md:hidden w-full aspect-[1/1] invisible" loading="eager" />
      )}

      {/* Slide stack for crossfade */}
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
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <span key={i}
              className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
          ))}
        </div>
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
        .banner-content-active {
          animation: bannerContentIn 0.8s ease 0.3s both;
        }
        @keyframes bannerContentIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .banner-content-active {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
        section.ken-hero {
          background: #166534;
        }
      `}</style>
    </>
  )
}

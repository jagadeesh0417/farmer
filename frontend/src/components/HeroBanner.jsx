import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { cld } from '../lib/cloudinary'

const SRCSET_WIDTHS = [640, 750, 828, 1080, 1200, 1500, 1920, 2400, 3200]

const BREAKPOINTS = {
  desktop: { min: 1024, width: 2400, height: 900 },
  tablet: { min: 640, width: 1536, height: 1024 },
  mobile: { width: 1080, height: 1350 },
}

function buildSrcSet(baseUrl, { width, height }) {
  if (!baseUrl) return ''
  return SRCSET_WIDTHS
    .filter(w => w <= 3200)
    .map(w => {
      const h = Math.round((height / width) * w)
      return `${cld(baseUrl, `f_auto,q_80,w_${w},h_${h},c_fill,g_auto`)} ${w}w`
    })
    .join(', ')
}

export default function HeroBanner({ banner = {} }) {
  const {
    desktopImage,
    tabletImage,
    mobileImage,
    image,
    title = "Nature's Finest",
    subtitle = 'Wild-harvested, chemical-free goodness from tribal communities',
    buttonText = 'Shop Now',
    buttonLink = '/products',
  } = banner

  const desktop = desktopImage || image
  const tablet = tabletImage || desktopImage || image
  const mobile = mobileImage || tabletImage || desktopImage || image

  const desktopSrcSet = useMemo(() => buildSrcSet(desktop, BREAKPOINTS.desktop), [desktop])
  const tabletSrcSet = useMemo(() => buildSrcSet(tablet, BREAKPOINTS.tablet), [tablet])
  const mobileSrcSet = useMemo(() => buildSrcSet(mobile, BREAKPOINTS.mobile), [mobile])

  const desktopSrc = desktop ? cld(desktop, 'f_auto,q_80,w_2400,h_900,c_fill,g_auto') : ''
  const tabletSrc = tablet ? cld(tablet, 'f_auto,q_80,w_1536,h_1024,c_fill,g_auto') : ''
  const mobileSrc = mobile ? cld(mobile, 'f_auto,q_80,w_1080,h_1350,c_fill,g_auto') : ''

  return (
    <section className="relative w-full overflow-hidden bg-green-800"
      style={{ height: 'clamp(480px, 80vh, 600px)' }}
      role="banner"
      aria-label={title}>

      {/* Background image — responsive picture with srcset */}
      <picture>
        {/* Desktop (1024px+) */}
        {desktop && (
          <source
            media="(min-width: 1024px)"
            srcSet={desktopSrcSet}
            sizes="100vw"
            type="image/avif"
          />
        )}
        {desktop && (
          <source
            media="(min-width: 1024px)"
            srcSet={desktopSrcSet}
            sizes="100vw"
            type="image/webp"
          />
        )}
        {desktop && (
          <source
            media="(min-width: 1024px)"
            srcSet={desktopSrcSet}
            sizes="100vw"
          />
        )}

        {/* Tablet (640px–1023px) */}
        {tablet && (
          <source
            media="(min-width: 640px)"
            srcSet={tabletSrcSet}
            sizes="100vw"
            type="image/avif"
          />
        )}
        {tablet && (
          <source
            media="(min-width: 640px)"
            srcSet={tabletSrcSet}
            sizes="100vw"
            type="image/webp"
          />
        )}
        {tablet && (
          <source
            media="(min-width: 640px)"
            srcSet={tabletSrcSet}
            sizes="100vw"
          />
        )}

        {/* Mobile (<640px) — AVIF */}
        {mobile && (
          <source
            srcSet={mobileSrcSet}
            sizes="100vw"
            type="image/avif"
          />
        )}
        {/* Mobile — WebP */}
        {mobile && (
          <source
            srcSet={mobileSrcSet}
            sizes="100vw"
            type="image/webp"
          />
        )}

        {/* Fallback img */}
        <img
          src={desktopSrc || tabletSrc || mobileSrc}
          alt={title}
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </picture>

      {/* Gradient overlay — left side darkens for text legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent sm:from-black/40 sm:via-black/15 sm:to-transparent" />

      {/* Bottom fade for mobile safe zone */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent sm:hidden" />

      {/* Content — centered safe zone (inner 60% width, 70% height) */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] items-center px-[5vw]">
        <div className="w-full max-w-xl text-left sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <h1 className="font-heading text-h1 font-bold leading-tight text-white drop-shadow-sm">
            {title}
          </h1>
          <p className="mt-3 max-w-lg text-body-sm text-white/85 sm:text-body md:mt-4">
            {subtitle}
          </p>
          <Link
            to={buttonLink}
            className="btn-font mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-7 py-3 text-btn font-semibold tracking-[0.06em] uppercase text-white shadow-2xl shadow-green-600/30 transition-all hover:bg-green-700 hover:-translate-y-0.5 active:scale-[0.97] md:mt-8 md:px-8 md:py-3.5"
          >
            {buttonText}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

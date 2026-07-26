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

export default function HeroSlider({ banners = [] }) {
  const slide = banners?.[0]
  if (!slide) return null

  return (
    <section className="relative w-full overflow-hidden bg-off-white aspect-[4/5] sm:aspect-[2/1] lg:aspect-[1920/700]">
      <BannerImage banner={slide} priority />
    </section>
  )
}
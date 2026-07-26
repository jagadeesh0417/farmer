const CLOUD_BASE = 'https://res.cloudinary.com/drp7pfa2w/image/upload/f_auto,q_auto/haifarmer/placeholders'

export const HOME_ASSETS = {
  hero: [
    {
      image: `${CLOUD_BASE}/hero-1`,
      desktopImage: `${CLOUD_BASE}/hero-1`,
      tabletImage: `${CLOUD_BASE}/hero-1`,
      mobileImage: `${CLOUD_BASE}/hero-1`,
      title: 'Pure Forest Honey & Natural Produce',
      subtitle: 'Straight from tribal communities to your home',
      buttonText: 'Shop Now',
    },
    {
      image: `${CLOUD_BASE}/hero-2`,
      desktopImage: `${CLOUD_BASE}/hero-2`,
      tabletImage: `${CLOUD_BASE}/hero-2`,
      mobileImage: `${CLOUD_BASE}/hero-2`,
      title: 'Traditional Millets & Grains',
      subtitle: 'Rainwater-fed, chemical-free, full of tradition',
      buttonText: 'Explore',
    },
    {
      image: `${CLOUD_BASE}/hero-3`,
      desktopImage: `${CLOUD_BASE}/hero-3`,
      tabletImage: `${CLOUD_BASE}/hero-3`,
      mobileImage: `${CLOUD_BASE}/hero-3`,
      title: 'Organic Spices & Seasonings',
      subtitle: 'Authentic tribal flavours from forest to table',
      buttonText: 'Discover',
    },
  ],

  adBanner: {
    image: `${CLOUD_BASE}/ad-banner`,
    desktopImage: `${CLOUD_BASE}/ad-banner`,
    tabletImage: `${CLOUD_BASE}/ad-banner`,
    mobileImage: `${CLOUD_BASE}/ad-banner`,
    alt: 'Free delivery on all orders over ₹999 — special offer banner',
  },

  promo: [
    {
      image: `${CLOUD_BASE}/promo-1`,
      desktopImage: `${CLOUD_BASE}/promo-1`,
      tabletImage: `${CLOUD_BASE}/promo-1`,
      mobileImage: `${CLOUD_BASE}/promo-1`,
    },
    {
      image: `${CLOUD_BASE}/promo-2`,
      desktopImage: `${CLOUD_BASE}/promo-2`,
      tabletImage: `${CLOUD_BASE}/promo-2`,
      mobileImage: `${CLOUD_BASE}/promo-2`,
    },
    {
      image: `${CLOUD_BASE}/promo-3`,
      desktopImage: `${CLOUD_BASE}/promo-3`,
      tabletImage: `${CLOUD_BASE}/promo-3`,
      mobileImage: `${CLOUD_BASE}/promo-3`,
    },
  ],

  stories: [
    { poster: `${CLOUD_BASE}/story-1`, src: '', duration: '2:34', alt: 'Tribal farmer sharing wisdom about millet cultivation' },
    { poster: `${CLOUD_BASE}/story-2`, src: '', duration: '3:12', alt: 'Forest honey harvesting process — traditional methods' },
    { poster: `${CLOUD_BASE}/story-3`, src: '', duration: '4:05', alt: 'Natural spices being sun-dried by tribal communities' },
    { poster: `${CLOUD_BASE}/story-4`, src: '', duration: '2:58', alt: 'Traditional millet processing — from farm to table' },
  ],

  youtube: {
    videoId: 'dQw4w9WgXcQ',
    poster: `${CLOUD_BASE}/youtube-poster`,
    bg: `${CLOUD_BASE}/youtube-bg`,
  },
}

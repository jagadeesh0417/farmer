const BASE = '/assets'

const BANNER = {
  desktop: `${BASE}/main-banner.png`,
  mobile: `${BASE}/main-banner.png`,
}

export const HOME_ASSETS = {
  hero: [
    { ...BANNER, alt: 'Pure forest honey and natural produce from tribal communities' },
    { ...BANNER, alt: 'Forest honey being collected from traditional beehives' },
    { ...BANNER, alt: 'Freshly harvested organic spices and grains' },
  ],

  adBanner: {
    ...BANNER,
    alt: 'Free delivery on all orders over ₹999 — special offer banner',
  },

  videoSection: {
    poster: BANNER.desktop,
    alt: 'HaiFarmer brand film — from forest to your home',
    src: '',
    type: 'video/mp4',
  },

  youtube: {
    videoId: 'dQw4w9WgXcQ',
    poster: BANNER.desktop,
    alt: 'HaiFarmer farm to table journey — YouTube video',
  },

  leftBanner: {
    ...BANNER,
    alt: 'Pure Forest Honey collection — raw, unfiltered, straight from tribal beekeepers',
  },

  reels: [
    { ...BANNER, src: '', alt: 'Tribal farmer sharing wisdom about millet cultivation' },
    { ...BANNER, src: '', alt: 'Forest honey harvesting process — traditional methods' },
    { ...BANNER, src: '', alt: 'Natural spices being sun-dried by tribal communities' },
    { ...BANNER, src: '', alt: 'Traditional millet processing — from farm to table' },
  ],

  newsletter: {
    bg: BANNER.desktop,
    alt: '',
  },
}

export function getHeroAsset(index) {
  return HOME_ASSETS.hero[index] || HOME_ASSETS.hero[0]
}

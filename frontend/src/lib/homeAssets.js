const SUPABASE_STORAGE = 'https://kpzhiwyfxnojdzbwerra.supabase.co/storage/v1/object/public'

export const HOME_ASSETS = {
  hero: [
    {
      image: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_millet%20Box.jpeg`,
      desktopImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_millet%20Box.jpeg`,
      tabletImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_millet%20Box.jpeg`,
      mobileImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_millet%20Box.jpeg`,
      alt: 'Pure forest honey and natural produce from tribal communities',
    },
    {
      image: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_Natural%20Protein%20Box.jpeg`,
      desktopImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_Natural%20Protein%20Box.jpeg`,
      tabletImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_Natural%20Protein%20Box.jpeg`,
      mobileImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_Natural%20Protein%20Box.jpeg`,
      alt: 'Forest honey being collected from traditional beehives',
    },
    {
      image: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farme_%20Kitchen%20essential%20pack.jpeg`,
      desktopImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farme_%20Kitchen%20essential%20pack.jpeg`,
      tabletImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farme_%20Kitchen%20essential%20pack.jpeg`,
      mobileImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farme_%20Kitchen%20essential%20pack.jpeg`,
      alt: 'Freshly harvested organic spices and grains',
    },
  ],

  adBanner: {
    image: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai_Farmer-Healthy-Family-box.jpeg`,
    desktopImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai_Farmer-Healthy-Family-box.jpeg`,
    tabletImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai_Farmer-Healthy-Family-box.jpeg`,
    mobileImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai_Farmer-Healthy-Family-box.jpeg`,
    alt: 'Free delivery on all orders over ₹999 — special offer banner',
  },

  videoSection: {
    poster: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_millet%20Box.jpeg`,
    alt: 'HaiFarmer brand film — from forest to your home',
    src: '',
    type: 'video/mp4',
  },

  youtube: {
    videoId: 'dQw4w9WgXcQ',
    poster: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_Natural%20Protein%20Box.jpeg`,
    alt: 'HaiFarmer farm to table journey — YouTube video',
  },

  leftBanner: {
    image: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farme_%20Kitchen%20essential%20pack.jpeg`,
    desktopImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farme_%20Kitchen%20essential%20pack.jpeg`,
    tabletImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farme_%20Kitchen%20essential%20pack.jpeg`,
    mobileImage: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farme_%20Kitchen%20essential%20pack.jpeg`,
    alt: 'Pure Forest Honey collection — raw, unfiltered, straight from tribal beekeepers',
  },

  reels: [
    { poster: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_millet%20Box.jpeg`, src: '', duration: '2:34', alt: 'Tribal farmer sharing wisdom about millet cultivation' },
    { poster: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_Natural%20Protein%20Box.jpeg`, src: '', duration: '3:12', alt: 'Forest honey harvesting process — traditional methods' },
    { poster: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farme_%20Kitchen%20essential%20pack.jpeg`, src: '', duration: '4:05', alt: 'Natural spices being sun-dried by tribal communities' },
    { poster: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai_Farmer-Healthy-Family-box.jpeg`, src: '', duration: '2:58', alt: 'Traditional millet processing — from farm to table' },
  ],

  newsletter: {
    bg: `${SUPABASE_STORAGE}/bundle-images/bundles/Hai%20Farmer_millet%20Box.jpeg`,
    alt: '',
  },
}

export function getHeroAsset(index) {
  return HOME_ASSETS.hero[index] || HOME_ASSETS.hero[0]
}

const EXISTING_IMG = 'https://res.cloudinary.com/drp7pfa2w/image/upload/f_auto,q_auto/v1785043452/haifarmer/banners/h0e2m410jrmwqgljj9qj'

export const HOME_ASSETS = {
  hero: [
    {
      image: EXISTING_IMG, desktopImage: EXISTING_IMG, tabletImage: EXISTING_IMG, mobileImage: EXISTING_IMG,
      title: 'Pure Forest Honey & Natural Produce', subtitle: 'Straight from tribal communities to your home', buttonText: 'Shop Now',
    },
    {
      image: EXISTING_IMG, desktopImage: EXISTING_IMG, tabletImage: EXISTING_IMG, mobileImage: EXISTING_IMG,
      title: 'Traditional Millets & Grains', subtitle: 'Rainwater-fed, chemical-free, full of tradition', buttonText: 'Explore',
    },
    {
      image: EXISTING_IMG, desktopImage: EXISTING_IMG, tabletImage: EXISTING_IMG, mobileImage: EXISTING_IMG,
      title: 'Organic Spices & Seasonings', subtitle: 'Authentic tribal flavours from forest to table', buttonText: 'Discover',
    },
  ],

  adBanner: {
    image: EXISTING_IMG, desktopImage: EXISTING_IMG, tabletImage: EXISTING_IMG, mobileImage: EXISTING_IMG,
    alt: 'Free delivery on all orders over ₹999',
  },

  promo: [
    { image: EXISTING_IMG, desktopImage: EXISTING_IMG, tabletImage: EXISTING_IMG, mobileImage: EXISTING_IMG },
    { image: EXISTING_IMG, desktopImage: EXISTING_IMG, tabletImage: EXISTING_IMG, mobileImage: EXISTING_IMG },
    { image: EXISTING_IMG, desktopImage: EXISTING_IMG, tabletImage: EXISTING_IMG, mobileImage: EXISTING_IMG },
  ],

  stories: [
    { poster: EXISTING_IMG, src: '', duration: '2:34', alt: 'Tribal farmer story' },
    { poster: EXISTING_IMG, src: '', duration: '3:12', alt: 'Honey harvesting process' },
    { poster: EXISTING_IMG, src: '', duration: '4:05', alt: 'Spices sun-drying' },
    { poster: EXISTING_IMG, src: '', duration: '2:58', alt: 'Millet processing' },
  ],

  youtube: {
    videoId: 'dQw4w9WgXcQ',
    poster: EXISTING_IMG,
    bg: EXISTING_IMG,
  },

  reels: [
    { poster: EXISTING_IMG, src: '', duration: '2:34', alt: 'Tribal farmer story' },
    { poster: EXISTING_IMG, src: '', duration: '3:12', alt: 'Honey harvesting' },
    { poster: EXISTING_IMG, src: '', duration: '4:05', alt: 'Spices drying' },
    { poster: EXISTING_IMG, src: '', duration: '2:58', alt: 'Millet processing' },
  ],

  videoSection: {
    src: '',
    poster: EXISTING_IMG,
    type: 'video/mp4',
    alt: 'HaiFarmer video story',
  },
}
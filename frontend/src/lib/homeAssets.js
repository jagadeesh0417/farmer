const B1 = 'https://res.cloudinary.com/drp7pfa2w/image/upload/v1784985321/haifarmer/products/rffbrqi21z3fotbkilbl.jpg'
const B2 = 'https://res.cloudinary.com/drp7pfa2w/image/upload/v1785043452/haifarmer/banners/h0e2m410jrmwqgljj9qj.jpg'
const B3 = 'https://res.cloudinary.com/drp7pfa2w/image/upload/v1785043497/haifarmer/banners/phk6buxks9glrc12zf9e.png'

export const HOME_ASSETS = {
  hero: [
    { image: B1, desktopImage: B1, tabletImage: B1, mobileImage: B1, title: 'HAiFarmer', subtitle: 'Fresh from Forests, Straight to Your Home', buttonText: 'Shop Now' },
    { image: B2, desktopImage: B2, tabletImage: B2, mobileImage: B2, title: 'Natural & Pure', subtitle: 'Direct from tribal communities', buttonText: 'Explore' },
    { image: B3, desktopImage: B3, tabletImage: B3, mobileImage: B3, title: 'Traditional Goodness', subtitle: 'Rainwater-fed, chemical-free', buttonText: 'Discover' },
  ],

  adBanner: {
    image: B1, desktopImage: B1, tabletImage: B1, mobileImage: B1,
    alt: 'Free delivery on all orders over ₹999',
  },

  promo: [
    { image: B1, desktopImage: B1, tabletImage: B1, mobileImage: B1 },
    { image: B1, desktopImage: B1, tabletImage: B1, mobileImage: B1 },
    { image: B1, desktopImage: B1, tabletImage: B1, mobileImage: B1 },
  ],

  stories: [
    { poster: B1, src: '', duration: '2:34', alt: 'Tribal farmer story' },
    { poster: B1, src: '', duration: '3:12', alt: 'Honey harvesting process' },
    { poster: B1, src: '', duration: '4:05', alt: 'Spices sun-drying' },
    { poster: B1, src: '', duration: '2:58', alt: 'Millet processing' },
  ],

  youtube: {
    videoId: 'dQw4w9WgXcQ',
    poster: B1,
    bg: B1,
  },

  reels: [
    { poster: B1, src: '', duration: '2:34', alt: 'Tribal farmer story' },
    { poster: B1, src: '', duration: '3:12', alt: 'Honey harvesting' },
    { poster: B1, src: '', duration: '4:05', alt: 'Spices drying' },
    { poster: B1, src: '', duration: '2:58', alt: 'Millet processing' },
  ],

  videoSection: {
    src: '',
    poster: B1,
    type: 'video/mp4',
    alt: 'HaiFarmer video story',
  },
}
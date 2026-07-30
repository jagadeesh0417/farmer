import { Link } from 'react-router-dom'

export default function PromoBanner({ banner = {} }) {
  const { desktopImage, mobileImage, link = '/products' } = banner

  if (!desktopImage && !mobileImage) return null

  return (
    <Link to={link}
      className="relative block w-full overflow-hidden bg-[#1B4332]"
      style={{ height: 'clamp(200px, 30vw, 360px)' }}>
      <style>{`
        @keyframes slowZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .zoom-anim {
          animation: slowZoom 10s ease-in-out infinite;
        }
      `}</style>
      {/* Desktop image */}
      {desktopImage && (
        <img
          src={desktopImage}
          alt=""
          className="zoom-anim hidden sm:block absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Mobile image */}
      {mobileImage && (
        <img
          src={mobileImage}
          alt=""
          className="zoom-anim sm:hidden absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10" />
    </Link>
  )
}

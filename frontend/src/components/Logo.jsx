import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { cld } from '../lib/cloudinary'

const SIZE_MAP = {
  header: {
    img: 'h-[54px] sm:h-[63px] lg:h-[72px]',
    mark: 'h-12 w-12 lg:h-[60px] lg:w-[60px]',
    icon: 'h-[30px] w-[30px] lg:h-9 lg:w-9',
    name: 'text-[27px] sm:text-[30px] lg:text-4xl',
  },
  footer: {
    img: 'h-14 sm:h-16 lg:h-20',
    mark: 'h-11 w-11 lg:h-12 lg:w-12',
    icon: 'h-6 w-6',
    name: 'text-xl sm:text-2xl',
  },
  medium: {
    img: 'h-10 sm:h-11',
    mark: 'h-9 w-9',
    icon: 'h-5 w-5',
    name: 'text-lg',
  },
  small: {
    img: 'h-7 sm:h-8',
    mark: 'h-7 w-7',
    icon: 'h-4 w-4',
    name: 'text-sm sm:text-base',
  },
}

function LeafMark({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={`${className} text-white`} aria-hidden="true">
      <path d="M16 4C12 4 8 8 8 14c0 8 8 14 8 14s8-6 8-14c0-6-4-10-8-10z" fill="currentColor" opacity="0.9" />
      <path d="M16 8c-2 0-4 3-4 6 0 4 4 8 4 8s4-4 4-8c0-3-2-6-4-6z" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

export default function Logo({
  size = 'header',
  className = '',
  textClass = 'text-green-600',
  showName = true,
  onClick,
  to = '/',
  logoOverride = '',
  nameOverride = '',
  loading = 'eager',
}) {
  const { settings } = useSiteSettings()
  const [broken, setBroken] = useState(false)
  const logo = logoOverride || settings?.logo || settings?.logo_url || ''
  const name = nameOverride || settings?.storeName || settings?.store_name || 'HaiFarmer'
  const s = SIZE_MAP[size] || SIZE_MAP.header

  const content = broken || !logo ? (
    <>
      <span className={`flex items-center justify-center rounded-full bg-green-600 shrink-0 ${s.mark}`}>
        <LeafMark className={s.icon} />
      </span>
      {showName && (
        <span className={`font-heading font-bold tracking-tight leading-tight ${s.name} ${textClass}`}>{name}</span>
      )}
    </>
  ) : (
    <img
      src={cld(logo, 'f_auto,q_auto,w_400,c_limit')}
      srcSet={`${cld(logo, 'f_auto,q_auto,w_300,c_limit')} 1x, ${cld(logo, 'f_auto,q_auto,w_600,c_limit')} 2x`}
      alt={name}
      loading={loading}
      decoding="async"
      draggable={false}
      onError={() => setBroken(true)}
      className={`${s.img} w-auto object-contain ${className}`}
    />
  )

  if (to === null) {
    return <span className={`inline-flex items-center gap-2 shrink-0 ${className}`}>{content}</span>
  }
  return (
    <Link to={to} onClick={onClick} aria-label={`${name} — Home`} className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      {content}
    </Link>
  )
}

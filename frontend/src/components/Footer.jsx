import { Link } from 'react-router-dom'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function Footer() {
  const { settings } = useSiteSettings()
  const year = new Date().getFullYear()
  const storeName = settings?.storeName || settings?.store_name || 'HaiFarmer'
  const logo = settings?.logo || settings?.logo_url || ''
  const phone = '9848579053'
  const email = settings?.email || settings?.contact_email || ''

  return (
    <footer className="bg-[#1a2e1a] text-white/90 font-menu">
      {/* Links */}
      <div className="section-container py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              {logo ? (
                <img src={logo} alt={storeName} className="h-16 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                    <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6 text-white">
                      <path d="M16 4C12 4 8 8 8 14c0 8 8 14 8 14s8-6 8-14c0-6-4-10-8-10z" fill="currentColor" opacity="0.9"/>
                      <path d="M16 8c-2 0-4 3-4 6 0 4 4 8 4 8s4-4 4-8c0-3-2-6-4-6z" fill="currentColor" opacity="0.6"/>
                    </svg>
                  </div>
                  <span className="font-heading text-h4 font-bold text-white">{storeName}</span>
                </div>
              )}
            </Link>
            <p className="text-body-sm text-white/50 leading-relaxed">{settings?.footer?.aboutText || settings?.tagline || 'Pure forest-grown produce, directly from tribal farmers to your home.'}</p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-nav font-semibold tracking-[0.1em] uppercase text-white/80 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'All Products', to: '/products' },
                { label: 'Combos', to: '/combos' },
                { label: 'Honey', to: '/products?category=honey' },
                { label: 'Millets', to: '/products?category=millets' },
                { label: 'Spices', to: '/products?category=spices' },
              ].map(item => (
                <li key={item.label}><Link to={item.to} className="text-body-sm text-white/50 hover:text-green-400 transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-nav font-semibold tracking-[0.1em] uppercase text-white/80 mb-4">Information</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
              ].map(item => (
                <li key={item.label}><Link to={item.to} className="text-body-sm text-white/50 hover:text-green-400 transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-nav font-semibold tracking-[0.1em] uppercase text-white/80 mb-4">Contact</h4>
            <div className="space-y-3 text-body-sm text-white/50">
              {email && (
                <div className="flex items-start gap-2">
                  <svg className="h-4 w-4 mt-0.5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a href={`mailto:${email}`} className="hover:text-green-400 transition-colors break-all">{email}</a>
                </div>
              )}
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <a href={`tel:+91${phone}`} className="hover:text-green-400 transition-colors">+91-{phone}</a>
              </div>
              <a href="https://wa.me/919848579053?text=Hello%20HaiFarmer" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-green-600/20 border border-green-600/30 text-green-400 text-caption font-semibold hover:bg-green-600/30 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="border-t border-white/10">
        <div className="section-container py-6 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: '🌿', label: '100% Organic' },
            { icon: '🤲', label: 'Ethically Sourced' },
            { icon: '🚜', label: 'Farm to Home' },
            { icon: '🔬', label: 'Lab Tested' },
          ].map(badge => (
            <div key={badge.label} className="flex items-center gap-1.5 text-body-sm text-white/50">
              <span>{badge.icon}</span>
              <span className="text-caption font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Social + Copyright */}
      <div className="border-t border-white/10">
        <div className="section-container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-caption text-white/40">© {year} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {((settings?.footer?.socialLinks) ? [
              { key: 'facebook', label: 'Facebook' },
              { key: 'instagram', label: 'Instagram' },
              { key: 'twitter', label: 'X (Twitter)' },
              { key: 'youtube', label: 'YouTube' },
            ].filter(s => settings.footer.socialLinks[s.key]) : []).map(social => {
              const href = settings.footer.socialLinks[social.key]
              return (
              <a key={social.key} href={href} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/40 hover:border-green-400 hover:text-green-400 transition-all">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  {social.key === 'instagram' && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>}
                  {social.key === 'facebook' && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>}
                  {social.key === 'youtube' && <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>}
                  {social.key === 'twitter' && <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>}
                </svg>
              </a>
            )})}
          </div>
          <div className="flex items-center gap-2">
            {['Visa', 'Mastercard', 'UPI', 'COD'].map(method => (
              <span key={method} className="text-micro font-semibold text-white/30 uppercase border border-white/20 px-2 py-0.5">{method}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'
import { demoProducts, demoCombos } from '../../lib/demoData'
import { isDemoMode } from '../../lib/withDemoFallback'

const SECTION_KEYS = [
  { key: 'groceries', label: 'Groceries' },
  { key: 'bestSellers', label: 'Our Best Sellers' },
  { key: 'healthConcern', label: 'Health Concern' },
  { key: 'millets', label: 'Millets' },
  { key: 'lentilsBeans', label: 'Lentils & Beans' },
  { key: 'honey', label: 'Honey' },
  { key: 'spices', label: 'Spices' },
]

const COMBO_SECTION_KEY = { key: 'superSaverCombos', label: 'Super Saver Combos' }

const defaultSectionIds = {
  groceries: ['dm-1', 'dm-2', 'dm-3', 'dm-4', 'dm-5', 'dm-6', 'dm-7', 'dm-8'],
  bestSellers: ['dm-1', 'dm-4', 'dm-7', 'dm-11', 'dm-15'],
  healthConcern: ['dm-1', 'dm-4', 'dm-7', 'dm-11'],
  millets: ['dm-7', 'dm-8', 'dm-9', 'dm-10'],
  lentilsBeans: ['dm-5', 'dm-6'],
  honey: ['dm-1'],
  spices: ['dm-4', 'dm-11', 'dm-12', 'dm-13'],
  superSaverCombos: ['demo-combo-1', 'demo-combo-2', 'demo-combo-3'],
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [products, setProducts] = useState([])
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const logoRef = useRef(null)
  const faviconRef = useRef(null)

  function loadSavedHomeSections() {
    try {
      const raw = localStorage.getItem('haifarmer_demo_homeSections')
      if (raw) return { ...defaultSectionIds, ...JSON.parse(raw) }
    } catch {}
    return { ...defaultSectionIds }
  }

  function saveHomeSections(homeSections) {
    try { localStorage.setItem('haifarmer_demo_homeSections', JSON.stringify(homeSections)) } catch {}
  }

  useEffect(() => {
    const load = async () => {
      if (isDemoMode()) {
        setSettings({
          storeName: 'HaiFarmer',
          tagline: 'Fresh from Forests, Straight to Your Home',
          email: 'support@haifarmer.com',
          phone: '+919848579053',
          whatsapp: '+919848579053',
          address: { street: '', city: '', state: 'India', pincode: '', country: 'India' },
          footer: { socialLinks: {} },
          seo: {},
          sliderSettings: { mode: 'both', autoPlay: true, loop: true, pauseOnHover: true, transitionSpeed: 2100, showArrows: true, showDots: true },
          homeSections: loadSavedHomeSections(),
        })
        setProducts(demoProducts.map(p => ({ id: p.id || p._id, name: p.name })))
        setBundles(demoCombos.map(b => ({ id: b._id || b.id, name: b.name })))
        setLoading(false)
        return
      }
      try {
        const [data, allProducts] = await Promise.all([
          api.getSettings(),
          api.getProducts({ active: 'all', limit: 500 }),
        ])
        setSettings({ ...data, homeSections: { ...defaultSectionIds, ...(data.homeSections || {}) } })
        setProducts((allProducts?.data || []).map(p => ({ id: p._id, name: p.name })))
      } catch (err) { toast.error(err.message) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleChange = (path, value) => {
    setSettings(prev => {
      const keys = path.split('.')
      const newSettings = { ...prev }
      let obj = newSettings
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  const toggleSectionProduct = (sectionKey, productId) => {
    setSettings(prev => {
      const current = prev.homeSections?.[sectionKey] || []
      const updated = current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId]
      const homeSections = { ...defaultSectionIds, ...prev.homeSections, [sectionKey]: updated }
      if (isDemoMode()) saveHomeSections(homeSections)
      return { ...prev, homeSections }
    })
  }

  const toggleSectionBundle = (bundleId) => {
    setSettings(prev => {
      const current = prev.homeSections?.superSaverCombos || []
      const updated = current.includes(bundleId)
        ? current.filter(id => id !== bundleId)
        : [...current, bundleId]
      const homeSections = { ...defaultSectionIds, ...prev.homeSections, superSaverCombos: updated }
      if (isDemoMode()) saveHomeSections(homeSections)
      return { ...prev, homeSections }
    })
  }

  const handleSave = async () => {
    if (isDemoMode()) { toast.success('Settings saved'); return }
    setSaving(true)
    try {
      await api.updateSettings(settings)
      toast.success('Settings saved')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleLogoUpload = async (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    if (isDemoMode()) { toast.success('Image upload not available in demo mode'); return }
    try {
      const result = await api.uploadImage(file, 'haifarmer/settings')
      handleChange(field, result.url)
      toast.success('Image uploaded')
    } catch (err) { toast.error(err.message) }
  }

  const Input = ({ label, path, type = 'text', placeholder = '' }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea value={getNestedValue(settings, path) ?? ''} onChange={e => handleChange(path, e.target.value)} rows={3} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
      ) : type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={getNestedValue(settings, path) || false} onChange={e => handleChange(path, e.target.checked)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          <span className="text-sm text-slate-600">{placeholder}</span>
        </label>
      ) : (
        <input type={type} value={getNestedValue(settings, path) ?? ''} onChange={e => handleChange(path, e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
      )}
    </div>
  )

  const tabs = ['general', 'delivery', 'payment', 'seo', 'footer', 'slider', 'sections']

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <button onClick={handleSave} disabled={saving} className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${activeTab === tab ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{tab}</button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">General Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Store Name" path="storeName" />
              <Input label="Tagline" path="tagline" />
              <Input label="Phone" path="phone" />
              <Input label="Email" path="email" type="email" />
              <Input label="WhatsApp Number" path="whatsapp" />
              <Input label="Address" path="address" />
              <Input label="Google Maps URL" path="googleMapsUrl" />
              <Input label="Business Hours" path="businessHours" />
              <Input label="Header Text 1" path="headerText1" />
              <Input label="Header Text 2" path="headerText2" />
              <Input label="GST" path="gst" />
              <Input label="Tax (%)" path="tax" type="number" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo</label>
                {settings?.logo && <img src={settings.logo} alt="" className="h-16 mb-2 rounded-lg" />}
                <button type="button" onClick={() => logoRef.current?.click()} className="rounded-xl border-2 border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:border-brand-400">Upload Logo</button>
                <input ref={logoRef} type="file" accept="image/*" onChange={e => handleLogoUpload(e, 'logo')} hidden />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Favicon</label>
                {settings?.favicon && <img src={settings.favicon} alt="" className="h-10 mb-2" />}
                <button type="button" onClick={() => faviconRef.current?.click()} className="rounded-xl border-2 border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:border-brand-400">Upload Favicon</button>
                <input ref={faviconRef} type="file" accept="image/*" onChange={e => handleLogoUpload(e, 'favicon')} hidden />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Delivery Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Free Delivery Min Amount (₹)" path="freeDeliveryMin" type="number" />
              <Input label="Delivery Charge (₹)" path="deliveryCharge" type="number" />
              <div className="sm:col-span-2"><Input label="Delivery Message" path="deliveryMessage" /></div>
              <Input label="Express Delivery" path="expressDelivery" type="checkbox" placeholder="Enable Express Delivery" />
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Razorpay ON/OFF" path="razorpayEnabled" type="checkbox" placeholder="Enable Razorpay online payments" />
              <Input label="Razorpay Key ID" path="razorpayKeyId" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select value={settings?.paymentMethod || 'both'} onChange={e => handleChange('paymentMethod', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
                  <option value="both">Razorpay + WhatsApp</option>
                  <option value="razorpay">Razorpay Only</option>
                  <option value="whatsapp">WhatsApp Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">SEO Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Meta Title" path="seo.metaTitle" />
              <Input label="Meta Description" path="seo.metaDescription" type="textarea" />
              <Input label="Canonical URL" path="seo.canonicalUrl" />
              <Input label="Google Analytics ID" path="seo.googleAnalyticsId" />
              <Input label="Google Tag Manager ID" path="seo.googleTagManagerId" />
              <Input label="Google Search Console Verification" path="seo.googleSearchConsoleVerification" />
              <Input label="Bing Webmaster Verification" path="seo.bingWebmasterVerification" />
              <Input label="Facebook Pixel ID" path="seo.facebookPixelId" />
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Footer Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Company Name" path="footer.companyName" />
              <Input label="About Text" path="footer.aboutText" type="textarea" />
              <Input label="FAQ URL" path="footer.faqUrl" />
              <Input label="Contact URL" path="footer.contactUrl" />
              <Input label="Facebook URL" path="footer.socialLinks.facebook" />
              <Input label="Instagram URL" path="footer.socialLinks.instagram" />
              <Input label="Twitter URL" path="footer.socialLinks.twitter" />
              <Input label="YouTube URL" path="footer.socialLinks.youtube" />
            </div>
          </div>
        )}

        {activeTab === 'slider' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Slider Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slider Mode</label>
                <select value={settings?.sliderSettings?.mode || 'both'} onChange={e => handleChange('sliderSettings.mode', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="both">Manual + Automatic</option>
                </select>
              </div>
              <Input label="Transition Speed (ms)" path="sliderSettings.transitionSpeed" type="number" />
              <Input label="Auto Play" path="sliderSettings.autoPlay" type="checkbox" placeholder="Enable auto play" />
              <Input label="Loop" path="sliderSettings.loop" type="checkbox" placeholder="Enable loop" />
              <Input label="Pause on Hover" path="sliderSettings.pauseOnHover" type="checkbox" placeholder="Pause on hover" />
              <Input label="Show Navigation Arrows" path="sliderSettings.showArrows" type="checkbox" placeholder="Show arrows" />
              <Input label="Show Pagination Dots" path="sliderSettings.showDots" type="checkbox" placeholder="Show dots" />
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900">Home Page Sections</h2>
              <p className="text-xs text-slate-400">Select which products appear in each home page section</p>
            </div>
            <div className="space-y-6">
              {SECTION_KEYS.map(section => {
                const selectedIds = settings?.homeSections?.[section.key] || []
                return (
                  <div key={section.key} className="border border-slate-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">{section.label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {products.map(p => {
                        const isSelected = selectedIds.includes(p.id)
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleSectionProduct(section.key, p.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-brand-600 text-white ring-2 ring-brand-300 ring-offset-1'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected && (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {p.name}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">{selectedIds.length} product(s) selected</p>
                  </div>
                )
              })}

              {/* Super Saver Combos */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">{COMBO_SECTION_KEY.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {bundles.map(b => {
                    const isSelected = (settings?.homeSections?.superSaverCombos || []).includes(b.id)
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleSectionBundle(b.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white ring-2 ring-brand-300 ring-offset-1'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {b.name}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">{(settings?.homeSections?.superSaverCombos || []).length} combo(s) selected</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getNestedValue(obj, path) {
  if (!obj) return ''
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? ''
}

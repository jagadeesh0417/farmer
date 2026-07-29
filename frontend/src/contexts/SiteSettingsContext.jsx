import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { isDemoMode } from '../lib/withDemoFallback'

const defaultSettings = {
  storeName: 'HAiFarmer',
  tagline: 'Fresh & Natural Products',
  phone: '9709704563',
  whatsapp: '9709704563',
  email: '',
  address: '',
  headerText1: 'Free delivery over ₹1499',
  announcementEnabled: true,
  logo: '',
  favicon: '',
  deliveryCharge: 0,
  freeDeliveryMin: 1499,
  razorpayEnabled: true,
  razorpayKeyId: 'rzp_live_SeagFUXcQMCgdT',
  paymentMethod: 'both',
  placeholder_image: '',
  footer: {
    aboutText: 'Pure forest-grown produce, directly from tribal farmers to your home.',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
    },
  },
}

function getSavedHomeSections() {
  try {
    const raw = localStorage.getItem('haifarmer_demo_homeSections')
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

const defaultHomeSections = {
  groceries: [],
  bestSellers: [],
  healthConcern: [],
  millets: [],
  lentilsBeans: [],
  honey: [],
  spices: [],
  superSaverCombos: [],
}

function aliasSettings(raw) {
  const saved = getSavedHomeSections()
  const homeSections = saved ? { ...defaultHomeSections, ...saved } : { ...defaultHomeSections }
  if (!raw) return { ...defaultSettings, homeSections }
  return {
    ...defaultSettings,
    ...raw,
    homeSections: { ...homeSections, ...(raw.homeSections || {}) },
    store_name: raw.storeName || raw.store_name || defaultSettings.storeName,
    header_text_1: raw.headerText1 || raw.header_text_1 || defaultSettings.headerText1,
    logo_url: raw.logo || raw.logo_url || '',
    whatsapp_number: raw.whatsapp || raw.whatsapp_number || defaultSettings.whatsapp,
    contact_phone: raw.phone || raw.contact_phone || defaultSettings.phone,
    contact_email: raw.email || raw.contact_email || '',
    shipping_cost: raw.deliveryCharge ?? raw.shipping_cost ?? defaultSettings.deliveryCharge,
    delivery_charge_amount: raw.deliveryCharge ?? raw.delivery_charge_amount ?? defaultSettings.deliveryCharge,
    placeholder_image: raw.placeholder_image || '',
  }
}

let cachedSettings = null
let settingsPromise = null

export async function fetchSiteSettings() {
  if (cachedSettings) return cachedSettings
  if (!settingsPromise) {
    settingsPromise = api.getSettings()
      .then(data => {
        cachedSettings = aliasSettings(data)
        return cachedSettings
      })
      .catch(() => {
        cachedSettings = aliasSettings(null)
        return cachedSettings
      })
      .finally(() => { settingsPromise = null })
  }
  return settingsPromise
}

export function getSiteSettings() {
  return cachedSettings || defaultSettings
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(cachedSettings || defaultSettings)
  const [loading, setLoading] = useState(!cachedSettings)

  useEffect(() => {
    let cancelled = false
    fetchSiteSettings().then(s => {
      if (!cancelled) { setSettings(s); setLoading(false) }
    }).catch(() => {
      if (!cancelled) { setSettings(defaultSettings); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [])

  return { settings, loading }
}
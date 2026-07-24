import { useState } from 'react'
import SeoHead from '../components/SeoHead'

const WHATSAPP_NUMBER = '9848579053'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return
    const text = `Hello HaiFarmer, I have a query.%0A%0A*Name:* ${encodeURIComponent(form.name)}%0A*Email:* ${encodeURIComponent(form.email)}%0A*Phone:* ${encodeURIComponent(form.phone)}%0A*Subject:* ${encodeURIComponent(form.subject)}%0A*Message:* ${encodeURIComponent(form.message)}`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
  }

  const contactInfo = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'WhatsApp',
      value: `+91 ${WHATSAPP_NUMBER}`,
      href: `https://wa.me/${WHATSAPP_NUMBER}`,
      action: 'Chat Now',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email',
      value: 'support@haifarmer.com',
      href: 'mailto:support@haifarmer.com',
      action: 'Send Email',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Location',
      value: 'India',
      href: null,
      action: null,
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Business Hours',
      value: 'Mon – Sat, 10 AM – 7 PM',
      href: null,
      action: null,
    },
  ]

  return (
    <div className="bg-white">
      <SeoHead title="Contact Us - HaiFarmer" description="Get in touch with HaiFarmer. Reach out to us via WhatsApp or email." />

      {/* Hero */}
      <section className="relative bg-green-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="section-container py-16 lg:py-24 text-center relative">
          <span className="text-white/60 text-micro font-semibold tracking-[0.15em] uppercase mb-4 block">Get in Touch</span>
          <h1 className="font-heading text-h1 font-bold text-white">Contact Us</h1>
          <p className="mt-4 text-body text-white/70 max-w-xl mx-auto">Have a question, feedback, or just want to say hello? We would love to hear from you.</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="relative -mt-10 z-10">
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info) => (
              <div key={info.title} className="bg-white rounded-xl shadow-sm border border-border p-6 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 mb-4">
                  {info.icon}
                </div>
                <h3 className="text-body-sm font-bold text-ink mb-1">{info.title}</h3>
                <p className="text-body-sm text-muted mb-3">{info.value}</p>
                {info.href && (
                  <a href={info.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-caption font-semibold text-green-600 hover:text-green-700 transition-colors">
                    {info.action} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-10">
              {/* Form */}
              <div className="lg:col-span-3">
                <h2 className="font-heading text-h2 font-bold text-ink mb-2">Send us a message</h2>
                <p className="text-body-sm text-muted mb-8">Fill out the form and we will respond via WhatsApp within 24 hours.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-caption font-semibold text-ink mb-1.5">Your Name *</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter your name" required
                        className="w-full border border-border px-4 py-3 text-body-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-caption font-semibold text-ink mb-1.5">Email Address</label>
                      <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="Enter your email"
                        className="w-full border border-border px-4 py-3 text-body-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/20 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-caption font-semibold text-ink mb-1.5">Phone Number</label>
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Enter your phone"
                        className="w-full border border-border px-4 py-3 text-body-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-caption font-semibold text-ink mb-1.5">Subject</label>
                      <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Enter subject"
                        className="w-full border border-border px-4 py-3 text-body-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/20 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-ink mb-1.5">Your Message *</label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Write your message here..." required rows={5}
                      className="w-full border border-border px-4 py-3 text-body-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/20 transition-all resize-none" />
                  </div>
                  <button type="submit"
                    className="w-full bg-green-600 text-white px-6 py-3.5 text-body-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Send via WhatsApp
                  </button>
                </form>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-border p-8">
                  <h3 className="font-heading text-h3 font-bold text-ink mb-6">Why choose HaiFarmer?</h3>
                  <div className="space-y-5">
                    {[
                      { icon: '🌿', title: '100% Natural', desc: 'Pure forest-grown produce, chemical-free' },
                      { icon: '🤝', title: 'Direct from Farmers', desc: 'No middlemen, fair prices for tribal communities' },
                      { icon: '🚚', title: 'Farm to Home', desc: 'Freshly harvested and delivered to your doorstep' },
                      { icon: '🔬', title: 'Quality Tested', desc: 'Every product is lab-tested for purity' },
                    ].map(item => (
                      <div key={item.title} className="flex gap-3">
                        <span className="text-h3 shrink-0">{item.icon}</span>
                        <div>
                          <h4 className="text-body-sm font-bold text-ink">{item.title}</h4>
                          <p className="text-caption text-muted mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-caption text-muted">We aim to respond to all inquiries within 24 hours during business days.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

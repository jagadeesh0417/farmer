import { useState } from 'react'
import SeoHead from '../components/SeoHead'

const WHATSAPP_NUMBER = '9709704563'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return
    const text = `Hello HAiFarmer, I have a query.%0A%0A*Name:* ${encodeURIComponent(form.name)}%0A*Email:* ${encodeURIComponent(form.email)}%0A*Phone:* ${encodeURIComponent(form.phone)}%0A*Subject:* ${encodeURIComponent(form.subject)}%0A*Message:* ${encodeURIComponent(form.message)}`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
  }

  return (
    <div className="bg-white">
      <SeoHead title="Contact Us - HaiFarmer" description="Get in touch with HAiFarmer. Reach out to us via WhatsApp or email." />

      <section className="bg-green-800 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <p className="text-green-200 text-[11px] font-semibold tracking-[0.12em] uppercase mb-3">Get in Touch</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white">Contact Us</h1>
          <p className="mt-3 text-sm text-white/70 max-w-lg mx-auto">Have a question, feedback, or just want to say hello? We would love to hear from you.</p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 lg:px-10">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="font-heading text-xl font-bold text-ink mb-4">Send us a message</h2>
              <p className="text-sm text-muted mb-6">Fill out the form and we will respond via WhatsApp.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your Name *" required className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-green-600 transition-colors" />
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="Email Address" className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-green-600 transition-colors" />
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone Number" className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-green-600 transition-colors" />
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject" className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-green-600 transition-colors" />
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Your Message *" required rows={5} className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-green-600 transition-colors resize-none" />
                <button type="submit" className="w-full bg-green-600 text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-green-700 transition-colors">
                  Send via WhatsApp →
                </button>
              </form>
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-ink mb-4">Other ways to reach us</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-green-600 mb-1">WhatsApp</p>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-sm text-ink hover:text-green-600 transition-colors">+91 {WHATSAPP_NUMBER}</a>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-green-600 mb-1">Email</p>
                  <a href="mailto:support@haifarmer.com" className="text-sm text-ink hover:text-green-600 transition-colors">support@haifarmer.com</a>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-green-600 mb-1">Location</p>
                  <p className="text-sm text-muted">India</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted">We aim to respond to all inquiries within 24 hours during business days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

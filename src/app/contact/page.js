"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiMapPin, FiPhone, FiSend, FiInstagram, FiMessageCircle } from "react-icons/fi";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        setForm({ name: "", email: "", message: "" });
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl mb-4">Get in Touch</h1>
      <p className="text-text-muted text-lg mb-10">We'd love to hear from you.</p>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <FiMapPin className="text-primary mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-medium">Visit Us</h3>
              <p className="text-text-muted">Railway Kodur, Andhra Pradesh</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FiSend className="text-primary mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-medium">DM Us</h3>
              <p className="text-text-muted">Instagram: @arhuuoutfits</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FiMessageCircle className="text-primary mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-medium">WhatsApp</h3>
              <p className="text-text-muted">Reach out on WhatsApp for quick responses</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <a href="https://instagram.com/arhuuoutfits" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-surface border border-border rounded-full flex items-center justify-center hover:border-primary transition-colors">
              <FiInstagram size={20} />
            </a>
            <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-surface border border-border rounded-full flex items-center justify-center hover:border-primary transition-colors">
              <FiMessageCircle size={20} />
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-surface border border-border rounded px-4 py-3 text-foreground placeholder-text-dim focus:outline-none focus:border-primary" required />
          <input type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-surface border border-border rounded px-4 py-3 text-foreground placeholder-text-dim focus:outline-none focus:border-primary" required />
          <textarea placeholder="Your Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="w-full bg-surface border border-border rounded px-4 py-3 text-foreground placeholder-text-dim focus:outline-none focus:border-primary resize-none" required />
          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded transition-colors disabled:opacity-50">
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

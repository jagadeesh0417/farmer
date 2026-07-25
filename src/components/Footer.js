import Link from "next/link";
import { FiStar, FiInstagram, FiSmartphone } from "react-icons/fi";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <FiStar className="text-primary text-xl" />
              <span className="text-xl font-bold tracking-wider text-foreground">
                ARHUU
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed">
              Premium Fashion for Every Occasion
            </p>
            <p className="text-text-dim text-xs leading-relaxed">
              Founded by Harshad in Railway Kodur, Andhra Pradesh. Every piece is designed
              for the modern man who values style, comfort, and quality.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>Railway Kodur, Andhra Pradesh</li>
              <li>
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2 hover:text-primary transition-colors duration-200"
                >
                  <FiSmartphone className="text-xs" />
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@arhuu.com"
                  className="hover:text-primary transition-colors duration-200"
                >
                  hello@arhuu.com
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://instagram.com/arhuuoutfits"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-text-muted hover:text-primary transition-colors duration-200 border border-border rounded-full hover:border-primary"
                aria-label="Instagram"
              >
                <FiInstagram className="text-lg" />
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-text-muted hover:text-primary transition-colors duration-200 border border-border rounded-full hover:border-primary"
                aria-label="WhatsApp"
              >
                <FiSmartphone className="text-lg" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-center text-xs text-text-dim">
            &copy; {new Date().getFullYear()} ARHUU Outfits. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

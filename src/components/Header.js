"use client";

import { useState } from "react";
import Link from "next/link";
import { FiStar, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <FiStar className="text-primary text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="text-xl font-bold tracking-wider text-foreground">
              ARHUU
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-muted hover:text-primary transition-colors duration-200 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-text-muted hover:text-primary transition-colors duration-200"
              aria-label="Cart"
            >
              <FiShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 text-text-muted hover:text-primary transition-colors duration-200"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium text-text-muted hover:text-primary transition-colors duration-200 border-b border-border/50 last:border-0"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata = {
  title: "ARHUU Outfits — Premium Fashion for Every Occasion",
  description: "Premium men's clothing brand based in Railway Kodur, Andhra Pradesh. Trendy styles, best quality.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}>
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <Toaster position="top-right" toastOptions={{
            style: { background: "#1f1f1f", color: "#fafafa", border: "1px solid #333" },
          }} />
        </CartProvider>
      </body>
    </html>
  );
}

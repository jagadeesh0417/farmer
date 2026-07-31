import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileBottomNav from './components/MobileBottomNav'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import ScrollToTop from './components/ScrollToTop'
import PageTracker from './components/PageTracker'
import CartToastContainer from './components/CartToast'
import CartDrawer from './components/CartDrawer'
import AdminLayout from './components/admin/AdminLayout'

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Combos = lazy(() => import('./pages/Combos'))
const BundleDetail = lazy(() => import('./pages/BundleDetail'))
const About = lazy(() => import('./pages/About'))
const Farmers = lazy(() => import('./pages/Farmers'))
const FarmerDetail = lazy(() => import('./pages/FarmerDetail'))
const Impact = lazy(() => import('./pages/Impact'))
const Journal = lazy(() => import('./pages/Journal'))
const Contact = lazy(() => import('./pages/Contact'))
const Payment = lazy(() => import('./pages/Payment'))
const Cart = lazy(() => import('./pages/Cart'))
const CheckoutPage = lazy(() => import('./pages/Checkout'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'))
const AdminBundles = lazy(() => import('./pages/admin/AdminBundles'))
const AdminFarmers = lazy(() => import('./pages/admin/AdminFarmers'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminBannerManagement = lazy(() => import('./pages/admin/AdminBannerManagement'))
const QRRedirect = lazy(() => import('./pages/QRRedirect'))
const AdminQRCode = lazy(() => import('./pages/admin/AdminQRCode'))
const AdminStories = lazy(() => import('./pages/admin/AdminStories'))
const NotFound = lazy(() => import('./pages/NotFound'))

function LoadingFallback() {
  return (
    <div className="min-h-[40vh] flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-4xl space-y-6">
        <div className="h-8 w-56 rounded-lg bg-border/60 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-border/50 animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </div>
    </div>
  )
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1 md:pb-0 pb-20">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/farmers/:code" element={<FarmerDetail />} />
            <Route path="/farmer/:slug" element={<FarmerDetail />} />
            <Route path="/qr/:code" element={<QRRedirect />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/combos" element={<Combos />} />
            <Route path="/combos/:slug" element={<BundleDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/orders" element={<Navigate to="/" replace />} />
            <Route path="/account" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
      <FloatingWhatsApp />
      <CartToastContainer />
      <CartDrawer />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="bundles" element={<AdminBundles />} />
          <Route path="farmers" element={<AdminFarmers />} />
          <Route path="qrcodes" element={<AdminQRCode />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="banners" element={<AdminBannerManagement />} />
          <Route path="stories" element={<AdminStories />} />
        </Route>
        <Route path="/*" element={<><ScrollToTop /><PageTracker /><AppLayout /></>} />
      </Routes>
    </Suspense>
  )
}

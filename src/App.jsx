import React, { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import RequireAuth from './components/RequireAuth'
import { Footer } from './components/Sections'
import { useThemeStore } from './store/themeStore'
import Home from './pages/Home'
import CartPage from './pages/Cart'
import CheckoutPage from './pages/Checkout'
import LoginPage from './pages/Login'
import AccountPage from './pages/Account'
import OrdersPage from './pages/Orders'
import SuccessPage from './pages/Success'
import BillPage from './pages/Bill'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const initTheme = useThemeStore((s) => s.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  const goSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-midnight text-ink relative transition-colors duration-300">
      <Navbar
        onSearch={(res) => {
          if (Array.isArray(res) && res.length && location.pathname !== '/') navigate('/')
          setTimeout(() => window.dispatchEvent(new CustomEvent('novus-search', { detail: res })), 100)
        }}
        onSection={goSection}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route path="/success" element={<SuccessPage />} />
        <Route
          path="*"
          element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
              <p className="text-6xl mb-4">🛸</p>
              <h1 className="text-2xl font-black">Page not found</h1>
              <p className="text-mist text-sm mt-2 mb-6">The page you're looking for doesn't exist.</p>
              <Link to="/" className="btn-glow px-6 py-3 text-sm">Back to Home</Link>
            </div>
          }
        />
      </Routes>

      <Footer onNavigate={goSection} onGo={(p) => navigate(p)} />

      {/* Cart drawer — available everywhere */}
      <CartDrawer
        onCheckout={() => navigate('/checkout')}
        onBrowse={() => {
          navigate('/')
          setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 80)
        }}
      />

      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Standalone route so the invoice prints without the site chrome */}
      <Route
        path="/bill"
        element={
          <RequireAuth>
            <BillPage />
          </RequireAuth>
        }
      />
      <Route path="/*" element={<Layout />} />
    </Routes>
  )
}
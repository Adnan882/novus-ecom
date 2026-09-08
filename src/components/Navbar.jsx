import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate, useSpring } from 'framer-motion'
import { Search, ShoppingBag, Menu, X, User, Sun, Moon, Package } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useThemeStore } from '../store/themeStore'
import { useAuth } from '../context/AuthContext'
import { PRODUCTS } from '../data/products'
import { SPRING_SNAPPY, SPRING_SOFT, SPRING_BOUNCY, SPRING_GENTLE } from '../lib/motion'

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'story', label: 'Story' },
  { id: 'categories', label: 'Categories' },
  { id: 'products', label: 'Products' },
  { id: 'deals', label: 'Deals' },
  { id: 'about', label: 'About' },
]

const PAGE_LINKS = [
  { to: '/cart', label: 'My Cart' },
  { to: '/orders', label: 'My Orders' },
  { to: '/account', label: 'My Account' },
]

const menuContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}
const menuItem = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: SPRING_SNAPPY },
}

export default function Navbar({ onSearch, onSection }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartOpen, openCart, count } = useCartStore()
  const { theme, toggleTheme } = useThemeStore()
  const { isSignedIn, profile } = useAuth()

  // Scroll-driven glass: blur + tint ramp in smoothly as content passes under the header
  const { scrollY } = useScroll()
  const rawFactor = useTransform(scrollY, [0, 180], [0, 1], { clamp: true })
  const factor = useSpring(rawFactor, { stiffness: 140, damping: 24 })
  const blurPx = useTransform(factor, (v) => `blur(${Math.round(30 * v)}px) saturate(180%)`)
  const tint = useTransform(factor, (v) => Math.round(v * 0.56 * 100) / 100)
  const glassBg = useMotionTemplate`rgb(var(--tv-midnight) / ${tint})`

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close overlays when route changes
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  const accountName = profile?.name || ''
  const initials = useMemo(
    () => accountName.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
    [accountName]
  )

  const runSearch = (q) => {
    setQuery(q)
    const terms = q.toLowerCase().trim().split(/\s+/)
    if (!q.trim()) {
      setResults([])
      if (onSearch) onSearch(null)
      return
    }
    const res = PRODUCTS.filter((p) =>
      terms.every((t) =>
        `${p.name} ${p.tagline} ${p.category} ${p.features.join(' ')}`.toLowerCase().includes(t)
      )
    ).slice(0, 6)
    setResults(res)
    if (res.length && onSearch) onSearch(res)
  }

  const goTo = (id) => {
    onSection?.(id)
    setMenuOpen(false)
  }

  const goAccount = () => navigate(isSignedIn ? '/account' : '/login')
  const goOrders = () => navigate('/orders')
  const goCart = () => navigate('/cart')

  return (
    <div className="fixed top-0 left-0 right-0 z-50 safe-top">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING_GENTLE, delay: 0.1 }}
        className={`relative transition-all duration-500 ease-out ${scrolled ? 'py-3' : 'bg-transparent py-5'}`}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: glassBg, backdropFilter: blurPx, WebkitBackdropFilter: blurPx, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3">
          {/* Logo */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING_SNAPPY}
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="flex items-center gap-2 shrink-0 group"
          >
            <motion.span
              className="w-11 h-11 rounded-xl overflow-hidden shrink-0"
            >
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Novus" className="w-full h-full object-contain" />
            </motion.span>
            <span className="text-xl font-extrabold tracking-tight">
              No<span className="gradient-text">vus</span>
            </span>
          </motion.button>

          {/* Desktop section links */}
          <nav className="hidden lg:flex items-center gap-1">
            {LINKS.map((l) => (
              <motion.button
                key={l.id}
                whileHover={{ y: -2 }}
                transition={SPRING_SNAPPY}
                onClick={() => goTo(l.id)}
                className="link-underline px-4 py-2 rounded-xl text-sm font-medium text-mist hover:text-ink-2 transition-colors"
              >
                {l.label}
              </motion.button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {[
              { fn: toggleTheme, label: 'Toggle theme', icon: theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" /> },
              { fn: () => setSearchOpen((s) => !s), label: 'Search', icon: <Search className="w-[18px] h-[18px]" /> },
              { fn: goOrders, label: 'My Orders', icon: <Package className="w-[18px] h-[18px]" />, hideTiny: true },
              { fn: goCart, label: 'Cart', icon: <ShoppingBag className="w-[18px] h-[18px]" />, badge: true },
            ].map((a, i) => (
              <motion.button
                key={a.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_SOFT, delay: 0.2 + i * 0.05 }}
                whileHover={{ scale: 1.1, y: -1 }}
                whileTap={{ scale: 0.9 }}
                onClick={a.fn}
                className={`${a.hideTiny ? 'hidden min-[420px]:flex' : 'flex'} relative w-11 h-11 rounded-xl border border-line bg-panel text-ink-2 hover:bg-ink/5 hover:border-ink-2 transition-colors items-center justify-center`}
                aria-label={a.label}
              >
                {a.icon}
                {a.badge && (
                  <AnimatePresence>
                    {count() > 0 && (
                      <motion.span
                        key={count()}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={SPRING_BOUNCY}
                        className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-ember text-white text-[11px] font-bold flex items-center justify-center"
                      >
                        {count()}
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_SOFT, delay: 0.35 }}
              whileHover={{ scale: 1.1, y: -1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goAccount}
              className="hidden sm:flex w-11 h-11 rounded-xl border border-line bg-panel text-ink-2 hover:bg-ink/5 hover:border-ink-2 transition-colors items-center justify-center"
              aria-label="Account"
            >
              {initials ? (
                <span className="w-6 h-6 rounded-lg bg-glow text-glow-ink text-[10px] font-black flex items-center justify-center">
                  {initials}
                </span>
              ) : (
                <User className="w-[18px] h-[18px]" />
              )}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_SOFT, delay: 0.4 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden w-11 h-11 rounded-xl border border-line bg-panel text-ink-2 hover:bg-ink/5 hover:border-ink-2 flex items-center justify-center"
              onClick={() => setMenuOpen((m) => !m)}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Search bar — spring expand */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ ...SPRING_SOFT, opacity: { duration: 0.2 } }}
              className="overflow-hidden bg-midnight/95 border-t border-line"
            >
              <div className="max-w-3xl mx-auto px-4 py-5">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => runSearch(e.target.value)}
                    placeholder="Search AirPods, watches, speakers…"
                    className="w-full rounded-2xl bg-panel border border-line pl-12 pr-4 py-3.5 text-sm text-ink outline-none focus:border-glow focus:ring-2 focus:ring-glow/20 placeholder:text-mist/60 transition-all"
                  />
                </motion.div>
                {query && results.length > 0 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={menuContainer}
                    className="mt-3 space-y-2 max-h-72 overflow-y-auto no-scrollbar"
                  >
                    {results.map((p) => (
                      <motion.button
                        key={p.id}
                        variants={menuItem}
                        whileHover={{ x: 4, backgroundColor: 'rgb(var(--tv-glow) / 0.08)' }}
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('tv-filter', { detail: 'all' }))
                          onSearch?.([p])
                          setSearchOpen(false)
                          setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 250)
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-panel border border-line hover:border-ink-2 transition-colors text-left"
                      >
                        <span className="w-9 h-9 shrink-0 rounded-lg bg-card border border-line flex items-center justify-center text-base">
                          {p.category === 'watches' ? '⌚' : p.model === 'airpods' ? '🎧' : p.model === 'airpodsmax' ? '🎧' : '🔊'}
                        </span>
                        <span className="text-left flex-1">
                          <span className="block text-sm font-semibold text-ink">{p.name}</span>
                          <span className="block text-xs text-mist">{p.tagline}</span>
                        </span>
                        <span className="text-sm font-bold text-glow">₹{p.price.toLocaleString('en-IN')}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu — staggered links */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ ...SPRING_SOFT, opacity: { duration: 0.2 } }}
              className="lg:hidden overflow-hidden bg-midnight/95 border-t border-line"
            >
              <motion.div
                initial="hidden"
                animate="visible"
                variants={menuContainer}
                className="py-1"
              >
                {LINKS.map((l) => (
                  <motion.button
                    key={l.id}
                    variants={menuItem}
                    whileHover={{ x: 8, backgroundColor: 'rgb(var(--tv-glow) / 0.06)' }}
                    transition={SPRING_SNAPPY}
                    onClick={() => goTo(l.id)}
                    className="block w-full text-left px-6 py-4 text-sm font-medium text-mist hover:text-ink-2 border-b border-line/50"
                  >
                    {l.label}
                  </motion.button>
                ))}
                <div className="px-3 py-3 grid grid-cols-1 gap-2">
                  {PAGE_LINKS.map((p) => (
                    <Link
                      key={p.to}
                      to={p.to}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl border border-line bg-panel/60 px-4 py-3.5 text-sm font-bold text-ink-2 hover:border-glow/50 transition-colors"
                    >
                      {p.label}
                      {p.to === '/account' && isSignedIn && <span className="text-xs text-glow font-black uppercase">{initials || accountName}</span>}
                      {p.to === '/account' && !isSignedIn && <span className="text-[11px] text-mist font-medium">Sign in</span>}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  )
}
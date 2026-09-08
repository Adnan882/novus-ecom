import React, { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Headphones, Watch, Volume2, Zap, Gamepad2, ArrowRight, Flame, Truck, ShieldCheck, Undo2, Headset, Star } from 'lucide-react'
import ProductImage from './ProductImage'
import { CATEGORIES, DEALS, PRODUCTS } from '../data/products'
import { SPRING_SNAPPY, SPRING_SOFT, SPRING_BOUNCY, SPRING_GENTLE, STAGGER_CONTAINER, STAGGER_CHILD_UP, STAGGER_CHILD_SCALE, SECTION_ENTER, EASE_OUT_BACK } from '../lib/motion'

const ICONS = { Headphones, Watch, Volume2, Zap, Gamepad2 }

// ---- Categories ----
export function Categories({ onSelect }) {
  return (
    <section id="categories" className="py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={STAGGER_CONTAINER} className="text-center mb-12">
          <motion.h2 variants={TEXT_REVEAL_LINE} className="text-3xl sm:text-4xl font-black tracking-tight">Browse <span className="gradient-text">Categories</span></motion.h2>
          <motion.p variants={STAGGER_CHILD_FADE} className="text-mist mt-3 text-sm">Five shelves of curated clone tech.</motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {CATEGORIES.map((c) => {
            const Icon = ICONS[c.icon] || Zap
            return (
              <motion.button
                key={c.id}
                variants={STAGGER_CHILD_SCALE}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING_SNAPPY}
                onClick={() => onSelect(c.id)}
                className="rounded-3xl border border-line bg-panel/70 p-6 text-center group hover:border-ink-2 transition-colors duration-300"
              >
                <span className="inline-flex mx-auto w-14 h-14 rounded-2xl bg-panel border border-line items-center justify-center text-ink-2 group-hover:text-glow group-hover:border-glow mb-4 transition-colors">
                  <Icon className="w-6 h-6" />
                </span>
                <h3 className="font-bold text-sm">{c.label}</h3>
                <p className="text-mist text-xs mt-1.5">{c.blurb}</p>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ---- Deals ----
function useCountdown() {
  const [time, setTime] = useState({ h: 8, m: 32, s: 0 })
  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        let { h, m, s } = t
        s -= 1
        if (s < 0) { s = 59; m -= 1 }
        if (m < 0) { m = 59; h -= 1 }
        if (h < 0) { h = 23 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export function Deals({ onQuickView }) {
  const { h, m, s } = useCountdown()
  const pad = (n) => String(n).padStart(2, '0')

  return (
    <section id="deals" className="py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Banner */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={SECTION_ENTER}
          className="rounded-[28px] border border-ember/30 bg-panel/60 p-6 sm:p-10 mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={SPRING_SOFT}
                className="flex items-center gap-2 text-ember font-bold text-sm uppercase tracking-widest"
              >
                <Flame className="w-4 h-4" />
                Flash Sale
              </motion.p>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...SPRING_GENTLE, delay: 0.1 }}
                className="text-2xl sm:text-3xl font-black mt-2"
              >
                Save up to 95% — ends soon
              </motion.h3>
            </div>
            <div className="flex gap-3">
              {[[h, 'Hrs'], [m, 'Min'], [s, 'Sec']].map(([v, l], i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...SPRING_BOUNCY, delay: 0.15 + i * 0.08 }}
                  className="rounded-2xl border border-line bg-deep px-4 py-3 text-center min-w-[74px]"
                >
                  <span className="block text-2xl sm:text-3xl font-extrabold">{pad(v)}</span>
                  <span className="text-[11px] text-mist uppercase tracking-widest">{l}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Deal cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {DEALS.map((p) => {
            const off = Math.round(((p.mrp - p.price) / p.mrp) * 100)
            return (
              <motion.button
                key={p.id}
                variants={STAGGER_CHILD_UP}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING_SNAPPY}
                onClick={() => onQuickView(p)}
                className="group relative rounded-3xl border border-line bg-panel/70 p-5 text-left hover:border-ink-2 transition-colors duration-300"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ ...SPRING_BOUNCY, delay: 0.2 }}
                  className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-ember text-white text-[11px] font-bold"
                >
                  {off}% OFF
                </motion.span>
                <div className="relative h-40 mb-4 overflow-hidden rounded-2xl bg-card flex items-center justify-center p-4">
                  <ProductImage product={p} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h4 className="font-bold text-sm truncate">{p.name.replace('Clone ', '')}</h4>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-ember">₹{p.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-mist line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-mist">
                  <span className="flex text-gold">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= Math.round(p.rating) ? 'fill-gold' : 'fill-slate-700'}`} />
                    ))}
                  </span>
                  {p.rating}
                  <span className="ml-auto inline-flex items-center gap-1 text-glow font-semibold group-hover:translate-x-1 transition-transform duration-300">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ---- About ----
const FEATURES = [
  { icon: ShieldCheck, title: 'Premium Quality', desc: '1:1 clone with original-grade feel' },
  { icon: Truck, title: 'Free Shipping', desc: 'Free & fast delivery across India' },
  { icon: Undo2, title: '7-Day Returns', desc: 'No-questions-asked returns' },
  { icon: Headset, title: '24/7 Support', desc: 'Real humans, always awake' },
]

export function About({ onExplore }) {
  return (
    <section id="about" className="py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={STAGGER_CONTAINER}
        >
          <motion.h2 variants={TEXT_REVEAL_LINE} className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Why shoppers choose <span className="gradient-text">Novus</span>
          </motion.h2>
          <motion.p variants={STAGGER_CHILD_FADE} className="text-mist mt-4 leading-relaxed text-sm sm:text-base">
            Every product is inspected, tested and quality-checked before it ships. Our clone tech matches the original in design and feel — at a fraction of the price — backed by India-ready support.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={STAGGER_CHILD_UP}
                whileHover={{ y: -3 }}
                transition={SPRING_SNAPPY}
                className="rounded-2xl border border-line bg-panel/60 p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-panel border border-line flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-glow" />
                </div>
                <h4 className="font-bold text-sm">{f.title}</h4>
                <p className="text-mist text-xs mt-1">{f.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.button
            variants={STAGGER_CHILD_FADE}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={SPRING_SNAPPY}
            onClick={onExplore}
            className="btn-glow mt-8 px-7 py-3 text-sm"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Showcase — float entrance */}
<motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={SPRING_GENTLE}
            className="relative"
          >
            <div className="rounded-3xl border border-line bg-panel/60 p-8">
              <ProductImage product={PRODUCTS.find((p) => p.id === 'ap-pro-max')} className="w-full max-w-md mx-auto object-contain" />
            </div>
          </motion.div>
      </div>
    </section>
  )
}

// ---- Newsletter ----
export function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  return (
    <section className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={SPRING_GENTLE}
        className="max-w-4xl mx-auto rounded-[28px] lens border border-line p-8 sm:p-12 text-center"
      >
        <div className="text-4xl mb-4">📬</div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...SPRING_SOFT, delay: 0.15 }}
          className="text-2xl sm:text-3xl font-black"
        >
          Get <span className="gradient-text">exclusive deals</span>
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...SPRING_SOFT, delay: 0.2 }}
          className="text-mist mt-3 text-sm"
        >
          New drops, coupon codes and giveaways — straight to your inbox.
        </motion.p>
        {done ? (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING_BOUNCY}
            className="mt-7 text-mint font-semibold"
          >
            ✓ Subscribed! Keep an eye on your inbox.
          </motion.p>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...SPRING_SOFT, delay: 0.3 }}
            onSubmit={(e) => { e.preventDefault(); setDone(true) }}
            className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-2xl input-dark"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING_SNAPPY}
              className="btn-glow px-6 py-3 text-sm"
            >
              Subscribe
            </motion.button>
          </motion.form>
        )}
      </motion.div>
    </section>
  )
}

// ---- Footer ----
export function Footer({ onNavigate, onGo }) {
  return (
    <footer className="border-t border-line bg-midnight pt-14 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-extrabold flex items-center gap-2"><img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Novus" className="w-8 h-8 rounded-lg object-contain" />No<span className="gradient-text">vus</span></h3>
            <p className="text-mist text-sm mt-3 leading-relaxed">Premium clone tech — AirPods, watches, speakers & more. Inspected, tested and quality-checked before every dispatch.</p>
            <div className="flex gap-2 mt-4">
              {[
                { s: '𝕏', href: 'https://x.com/novus', label: 'X (Twitter)' },
                { s: 'IG', href: 'https://instagram.com/novus', label: 'Instagram' },
                { s: 'YT', href: 'https://youtube.com/@novus', label: 'YouTube' },
                { s: 'WA', href: 'https://wa.me/919876543210', label: 'WhatsApp' },
              ].map(({ s, href, label }) => (
                <motion.a
                  key={s}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  transition={SPRING_SNAPPY}
                  className="w-9 h-9 rounded-xl border border-line flex items-center justify-center text-xs text-mist hover:text-ink-2 hover:border-glow cursor-pointer transition-colors"
                >
                  {s}
                </motion.a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4">Shop</h4>
            {['categories', 'products', 'deals', 'about'].map((id) => (
              <motion.button
                key={id}
                whileHover={{ x: 4 }}
                transition={SPRING_SNAPPY}
                onClick={() => onNavigate(id)}
                className="link-underline inline-block text-mist text-sm py-1.5 hover:text-ink-2 transition-colors capitalize"
              >
                {id}
              </motion.button>
            ))}
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4">Contact</h4>
            <a href="tel:+919876543210" className="link-underline inline-block text-mist text-sm py-1 hover:text-ink-2 transition-colors">+91 98765 43210</a>
            <a href="mailto:support@novus.in" className="link-underline inline-block text-mist text-sm py-1 hover:text-ink-2 transition-colors">support@novus.in</a>
            <p className="text-mist text-sm py-1">Mumbai, Maharashtra, India</p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4">Account</h4>
            {[
              { to: '/account', label: 'My Account' },
              { to: '/orders', label: 'My Orders' },
              { to: '/cart', label: 'My Cart' },
              { to: '/login', label: 'Sign In' },
            ].map((l) => (
              <motion.button
                key={l.to}
                whileHover={{ x: 4 }}
                transition={SPRING_SNAPPY}
                onClick={() => onGo?.(l.to)}
                className="link-underline inline-block text-mist text-sm py-1.5 hover:text-ink-2 transition-colors capitalize"
              >
                {l.label}
              </motion.button>
            ))}
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4">Payments accepted</h4>
            <div className="flex flex-wrap gap-2">
              {['UPI', 'PhonePe', 'GPay', 'Paytm', 'BHIM', 'Visa', 'Mastercard', 'RuPay', 'NetBank', 'COD'].map((p) => (
                <span key={p} className="chip">{p}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-line pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-mist">
          <p>© 2026 Novus. All rights reserved. Clone-tech store demo.</p>
          <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-mint" /> SSL encrypted · 256-bit</p>
        </div>
      </div>
    </footer>
  )
}

// ---- Trust strip ----
export function TrustStrip() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={STAGGER_CONTAINER}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8"
      >
        {[
          { icon: ShieldCheck, t: 'Secure Checkout', d: 'Razorpay-grade encryption' },
          { icon: Truck, t: 'Free Shipping', d: 'Across India, 3–7 days' },
          { icon: Undo2, t: 'Easy Returns', d: '7-day hassle-free' },
          { icon: Headset, t: 'Support 24/7', d: 'WhatsApp & phone help' },
        ].map((f) => (
          <motion.div
            key={f.t}
            variants={STAGGER_CHILD_UP}
            whileHover={{ y: -3 }}
            transition={SPRING_SNAPPY}
            className="rounded-2xl border border-line bg-panel/70 p-4 flex items-center gap-3"
          >
            <f.icon className="w-5 h-5 text-ink-2 shrink-0" />
            <div>
              <p className="text-sm font-bold">{f.t}</p>
              <p className="text-xs text-mist">{f.d}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// Stagger child variants (re-export for other files)
const STAGGER_CHILD_FADE = STAGGER_CHILD_UP
const TEXT_REVEAL_LINE = {
  hidden: { opacity: 0, y: 60, rotateX: -20 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { ...SPRING_GENTLE, opacity: { duration: 0.5 } },
  },
}
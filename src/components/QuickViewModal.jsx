import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Zap, Star, Minus, Plus, Check } from 'lucide-react'
import ProductImage from './ProductImage'
import { useCartStore } from '../store/cartStore'
import { useUIStore } from '../store/uiStore'

export default function QuickViewModal({ product, onClose, onBuyNow }) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const showToast = useUIStore((s) => s.showToast)
  const color = product?.colors?.[0]?.name || ''
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (product) {
      setQty(1)
    }
  }, [product])

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    document.body.style.overflow = product ? 'hidden' : ''
    return () => {
      window.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [product, onClose])

  if (!product) return null
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100)

  const add = () => {
    addItem(product.id, qty, color)
    showToast(`${qty} × ${product.name.replace('Clone ', '')} added`)
  }
  const buy = () => {
    addItem(product.id, qty, color)
    if (onBuyNow) return onBuyNow()
    onClose()
    openCart()
  }

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl rounded-[28px] border border-line bg-deep overflow-hidden my-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl glass border border-line flex items-center justify-center text-ink-2 hover:bg-ember hover:border-ember transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="relative h-72 md:h-[520px] bg-card flex items-center justify-center p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 160, damping: 20, delay: 0.1 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <ProductImage product={product} className="w-full h-full object-contain" />
                </motion.div>
              </div>

              {/* Info */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-glow/15 text-glow text-[11px] font-bold uppercase tracking-wider">
                    {product.category}
                  </span>
                  {product.badge && (
                    <span className="px-3 py-1 rounded-full bg-ember/15 text-ember text-[11px] font-bold">{product.badge}</span>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold mt-3 leading-tight">{product.name.replace('Clone ', '')}</h2>
                <p className="text-mist text-sm mt-1.5">{product.tagline}</p>

                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="flex text-gold">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-gold' : 'fill-slate-700'}`} />
                    ))}
                  </span>
                  <span className="text-mist">{product.rating} · {product.reviews.toLocaleString('en-IN')} reviews</span>
                  <span className="text-mint font-semibold ml-auto">{product.stock} in stock</span>
                </div>

                <div className="mt-5 flex items-end gap-3">
                  <span className="text-3xl font-black">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-mist line-through text-sm mb-1">₹{product.mrp.toLocaleString('en-IN')}</span>
                  <span className="text-mint text-sm font-bold mb-1">{off}% off</span>
                </div>

                {/* Features */}
                <div className="mt-5">
                  <p className="text-[11px] uppercase tracking-widest text-mist font-bold mb-2">Highlights</p>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((f) => (
                      <span key={f} className="chip flex items-center gap-1">
                        <Check className="w-3 h-3 text-mint" /> {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Qty + actions */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-xl border border-line bg-panel">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-glow hover:text-ink-2 hover:bg-glow/10 transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="w-8 text-center font-bold">{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(5, q + 1))} className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-glow hover:text-ink-2 hover:bg-glow/10 transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={add} className="btn-glow flex-1 px-5 py-3 text-sm">
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={buy} className="btn-ghost px-5 py-3 text-sm border-aqua/40 text-aqua hover:bg-aqua/10">
                    <Zap className="w-4 h-4" /> Buy Now
                  </motion.button>
                </div>

                <p className="text-xs text-mist mt-4">✓ Free shipping across India · 7-day returns · GST invoice included</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
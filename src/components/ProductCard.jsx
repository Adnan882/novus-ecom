import React, { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye, Star, Loader2 } from 'lucide-react'
import ProductImage from './ProductImage'
import { useCartStore } from '../store/cartStore'
import { useUIStore } from '../store/uiStore'
import { SPRING_SNAPPY, STAGGER_CHILD_UP } from '../lib/motion'

const ProductCard = memo(function ProductCard({ product, onQuickView, index = 0 }) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const showToast = useUIStore((s) => s.showToast)
  const color = product.colors[0]?.name || ''
  const [adding, setAdding] = useState(false)

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100)

  const quickAdd = () => {
    setAdding(true)
    addItem(product.id, 1, color)
    setTimeout(() => {
      setAdding(false)
      showToast(`${product.name.replace('Clone ', '')} added to cart`)
      openCart()
    }, 350)
  }

  const buyNow = () => {
    addItem(product.id, 1, color)
    onQuickView(product)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...SPRING_SNAPPY, delay: (index % 3) * 0.06, opacity: { duration: 0.4 } }}
      whileHover={{ y: -4 }}
      className="group relative rounded-3xl border border-line bg-panel/70 overflow-hidden hover:border-ink-2 transition-colors duration-300"
    >
      {/* Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
        {product.badge && (
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${product.hot ? 'bg-ember text-white' : 'bg-glow text-glow-ink'}`}>
            {product.badge}
          </span>
        )}
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-glow/10 text-glow">
          {off}% off
        </span>
      </div>

      {/* Quick view — always visible on touch, hover-reveal on pointer */}
      <div className="absolute top-4 right-4 z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => onQuickView(product)}
          className="w-9 h-9 rounded-xl border border-line bg-deep flex items-center justify-center text-ink-2 hover:border-ink-2 transition-colors"
          title="Quick view"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Preview area */}
      <div
        className="relative h-52 sm:h-56 overflow-hidden bg-card cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4 group-hover:scale-[1.05] transition-transform duration-500">
          <ProductImage product={product} className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="text-[11px] uppercase tracking-[0.15em] text-mist font-bold">
          {product.category}
        </p>
        <h3 className="mt-1 font-bold text-[15px] leading-snug">{product.name.replace('Clone ', '')}</h3>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          <span className="flex text-gold">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.rating) ? 'fill-gold' : 'fill-slate-700'}`} />
            ))}
          </span>
          <span className="text-mist">{product.rating} ({product.reviews.toLocaleString('en-IN')})</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-end gap-2">
          <span className="text-xl font-extrabold">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="text-sm text-mist line-through mb-0.5">₹{product.mrp.toLocaleString('en-IN')}</span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={SPRING_SNAPPY}
            onClick={quickAdd}
            disabled={adding}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-glow py-2.5 text-sm font-semibold text-white hover:bg-glow-hover transition-colors"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            Add to Cart
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={SPRING_SNAPPY}
            onClick={buyNow}
            className="inline-flex items-center justify-center rounded-xl border border-line px-3 py-2.5 text-sm font-bold text-ink-2 hover:border-ink-2 hover:text-ink transition-colors"
          >
            Buy
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
})

export default ProductCard
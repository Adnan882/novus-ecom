import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react'
import { useCartStore, getProduct } from '../store/cartStore'
import ProductImage from './ProductImage'

export default function CartDrawer({ onCheckout, onBrowse }) {
  const { items, cartOpen, closeCart, updateQty, removeItem } = useCartStore()

  const rows = items
    .map((i) => ({ ...i, product: getProduct(i.productId) }))
    .filter((r) => r.product)

  const subtotal = rows.reduce((s, r) => s + r.product.price * r.qty, 0)

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[85] w-full max-w-md bg-deep border-l border-line flex flex-col transition-colors duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-line">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-glow" /> Your Cart
                {rows.length > 0 && <span className="text-sm text-mist font-medium">({items.reduce((s, i) => s + i.qty, 0)} items)</span>}
              </h3>
              <button onClick={closeCart} className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl border border-line flex items-center justify-center text-mist hover:text-ink-2 hover:border-ember transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
              {rows.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-panel border border-line flex items-center justify-center mb-4">
                    <ShoppingBag className="w-9 h-9 text-mist" />
                  </div>
                  <p className="text-mist font-medium">Your cart is empty</p>
                  <p className="text-xs text-mist/70 mt-1">Add some tech from the collection to get started.</p>
                  <button onClick={() => { closeCart(); onBrowse?.() }} className="btn-glow px-6 py-2.5 text-sm mt-6">Start shopping</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {rows.map((row) => (
                      <motion.div
                        key={`${row.productId}-${row.color || 'd'}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        className="flex gap-3 rounded-2xl border border-line bg-panel/70 p-3"
                      >
                        <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-card to-midnight flex items-center justify-center p-1.5">
                          <ProductImage product={row.product} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold truncate">{row.product.name.replace('Clone ', '')}</h4>
                            <button onClick={() => removeItem(`${row.productId}-${row.color || 'd'}`)} className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-mist hover:text-ember transition-colors shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {row.color && <p className="text-[11px] text-mist">{row.color}</p>}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center rounded-lg border border-line bg-deep">
                              <button onClick={() => updateQty(`${row.productId}-${row.color || 'd'}`, -1)} className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-glow hover:text-ink-2 hover:bg-glow/10 transition-colors"><Minus className="w-4 h-4" /></button>
                              <span className="w-8 text-center text-sm font-bold">{row.qty}</span>
                              <button onClick={() => updateQty(`${row.productId}-${row.color || 'd'}`, 1)} className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-glow hover:text-ink-2 hover:bg-glow/10 transition-colors"><Plus className="w-4 h-4" /></button>
                            </div>
                            <span className="font-bold text-sm">₹{(row.product.price * row.qty).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {rows.length > 0 && (
              <div className="px-6 py-5 border-t border-line bg-midnight/60">
                <div className="space-y-1.5 text-sm mb-4">
                  <div className="flex justify-between text-mist"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-mist"><span>Shipping</span><span className="text-mint">FREE</span></div>
                  <div className="flex justify-between font-extrabold text-base pt-2 border-t border-line mt-2"><span>Total</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { closeCart(); onCheckout() }}
                  className="btn-glow w-full py-3.5 text-sm"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </motion.button>
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-mist mt-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-mint" /> UPI · Cards · Net Banking · COD accepted
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
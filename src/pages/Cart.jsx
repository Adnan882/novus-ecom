import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, AlertCircle, Check, Tag } from 'lucide-react'
import { useCartStore, getProduct } from '../store/cartStore'
import { useUIStore } from '../store/uiStore'
import { PROMO_CODES } from '../data/products'
import { calcTotals } from '../lib/totals'
import ProductImage from '../components/ProductImage'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQty, removeItem } = useCartStore()
  const showToast = useUIStore((s) => s.showToast)
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState(null)
  const [promoError, setPromoError] = useState('')

  const rows = items.map((i) => ({ ...i, product: getProduct(i.productId) })).filter((r) => r.product)
  const totals = useMemo(() => calcTotals(rows, promoApplied), [rows, promoApplied])

  if (rows.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-24 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-panel border border-line flex items-center justify-center mb-4">
          <ShoppingBag className="w-9 h-9 text-mist" />
        </div>
        <h2 className="text-2xl font-black">Your cart is empty</h2>
        <p className="text-mist text-sm mt-2 mb-6">Add some tech from the collection to get started.</p>
        <Link to="/" className="btn-glow px-6 py-3 text-sm">Start shopping <ArrowRight className="w-4 h-4" /></Link>
      </div>
    )
  }

  const applyPromo = () => {
    const p = PROMO_CODES[promo.trim().toUpperCase()]
    if (!p) { setPromoError('Invalid promo code'); setPromoApplied(null); return }
    setPromoError('')
    setPromoApplied({ code: promo.trim().toUpperCase(), percent: p })
    showToast(`Promo applied — ${p}% off!`)
  }

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-glow" /> My Cart
        </h1>
        <p className="text-mist text-sm mb-8">{items.reduce((s, i) => s + i.qty, 0)} item{items.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''} in your bag</p>

        {totals.savings > 0 && (
          <div className="mb-6 rounded-2xl border border-mint/30 bg-mint/5 px-4 py-3 text-sm text-mint font-semibold flex items-center gap-2">
            <Tag className="w-4 h-4" /> You're saving ₹{totals.savings.toLocaleString('en-IN')} on today's order
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Items */}
          <div className="space-y-3">
            {rows.map((row) => {
              const key = `${row.productId}-${row.color || 'd'}`
              return (
                <div key={key} className="flex gap-4 rounded-3xl border border-line bg-deep p-4 sm:p-5">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-card to-midnight border border-line flex items-center justify-center p-2">
                    <ProductImage product={row.product} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.15em] text-mist font-bold">{row.product.category}</p>
                        <h3 className="font-bold text-[15px] leading-snug truncate">{row.product.name.replace('Clone ', '')}</h3>
                        {row.color && <p className="text-xs text-mist mt-0.5">{row.color}</p>}
                      </div>
                      <button onClick={() => removeItem(key)} className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl border border-line flex items-center justify-center text-mist hover:text-ember hover:border-ember transition-colors shrink-0" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                      <div className="flex items-center rounded-xl border border-line bg-panel">
                        <button onClick={() => updateQty(key, -1)} className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-glow hover:text-ink-2 hover:bg-glow/10 transition-colors" aria-label="Decrease">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-9 text-center font-bold">{row.qty}</span>
                        <button onClick={() => updateQty(key, 1)} className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-glow hover:text-ink-2 hover:bg-glow/10 transition-colors" aria-label="Increase">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-lg">₹{(row.product.price * row.qty).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-mist line-through">₹{(row.product.mrp * row.qty).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/" className="btn-ghost px-5 py-3 text-sm">← Continue shopping</Link>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 rounded-[28px] border border-line bg-deep p-6">
            <h3 className="font-bold mb-4 flex items-center justify-between">
              Price Details
              <span className="text-xs text-mist font-medium">({rows.length} item{rows.length !== 1 ? 's' : ''})</span>
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-mist"><span>Subtotal</span><span>₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-mist"><span>MRP total</span><span className="line-through">₹{totals.mrp.toLocaleString('en-IN')}</span></div>
              {promoApplied && (
                <div className="flex justify-between text-mint"><span>Promo ({promoApplied.code})</span><span>− ₹{totals.discount.toLocaleString('en-IN')}</span></div>
              )}
              <div className="flex justify-between text-mist"><span>Shipping</span><span className="text-mint font-bold">FREE</span></div>
              <div className="flex justify-between text-mist"><span>GST (18%)</span><span>₹{totals.gst.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between font-extrabold text-base border-t border-line pt-3 mt-3">
                <span>Total</span><span className="gradient-text">₹{totals.grand.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-mint font-semibold"><span>Total savings</span><span>₹{totals.savings.toLocaleString('en-IN')}</span></div>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-mist font-bold mb-2">Promo code</p>
              <div className="flex gap-2">
                <input className="input-dark !min-h-[44px]" placeholder="NOVUS10" value={promo} onChange={(e) => setPromo(e.target.value)} />
                <button onClick={applyPromo} className="rounded-xl bg-glow/15 border border-glow/40 text-glow px-4 min-h-[44px] text-xs font-bold hover:bg-glow/25 transition-colors">Apply</button>
              </div>
              {promoError && <p className="text-xs text-ember mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{promoError}</p>}
              {promoApplied && <p className="text-xs text-mint mt-1.5 flex items-center gap-1"><Check className="w-3 h-3" />{promoApplied.code} applied ({promoApplied.percent}% off)</p>}
              <p className="text-xs text-mist mt-1">Try: WELCOME15 · BIGDEAL25</p>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-glow w-full mt-6 py-3.5 text-sm">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-mist mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-mint" /> UPI · Cards · Net Banking · COD accepted
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ShoppingBag, ChevronDown, Loader2, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listOrders, etaRange } from '../lib/orders'
import { getProduct } from '../store/cartStore'
import { fmt } from '../utils/validation'
import ProductImage from '../components/ProductImage'

function fmtDate(v) {
  if (!v) return ''
  const d = typeof v === 'number' ? new Date(v) : v.toDate ? v.toDate() : new Date(v)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const STATUS_STEPS = [
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'out-for-delivery', label: 'Out for delivery' },
  { id: 'delivered', label: 'Delivered' },
]

export default function OrdersPage() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)

  const uid = profile?.uid || user?.uid || 'demo'

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    listOrders(uid)
      .then((l) => { setOrders(l); setLoading(false) })
      .catch(() => setLoading(false))
  }, [uid])

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-2">
          <Package className="w-7 h-7 text-glow" /> My Orders
        </h1>
        <p className="text-mist text-sm mb-8">{orders.length} order{orders.length !== 1 ? 's' : ''} · {profile?.name || user?.email || ''}</p>

        {loading ? (
          <p className="text-sm text-mist flex items-center gap-2 py-8"><Loader2 className="w-4 h-4 animate-spin" /> Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-line px-6 py-14 text-center">
            <ShoppingBag className="w-10 h-10 text-mist mx-auto mb-3" />
            <p className="text-lg font-bold">No orders yet</p>
            <p className="text-sm text-mist mt-1 mb-6">When you place an order it'll show up here with live tracking.</p>
            <Link to="/" className="btn-glow px-6 py-3 text-sm">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const items = (o.items || []).map((it) => ({ ...it, product: getProduct(it.id) || null }))
              const open = openId === o.id
              const statusIdx = STATUS_STEPS.findIndex((s) => s.id === (o.status || 'confirmed'))
              const itemsTotal = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0)
              return (
                <div key={o.id} className="rounded-[28px] border border-line bg-deep overflow-hidden">
                  {/* Header row */}
                  <button onClick={() => setOpenId(open ? null : o.id)} className="w-full flex flex-wrap items-center gap-3 px-5 py-4 text-left hover:bg-glow/5 transition-colors">
                    <span className="w-11 h-11 rounded-xl bg-panel border border-line flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-glow" />
                    </span>
                    <span className="flex-1 min-w-[140px]">
                      <span className="block text-sm font-extrabold">{o.orderNo || `#${o.id}`}</span>
                      <span className="block text-xs text-mist">Placed {fmtDate(o.createdAt)}</span>
                    </span>
                    <span className={`text-[11px] font-black uppercase tracking-widest rounded-full px-3 py-1 ${(o.status || 'confirmed') === 'confirmed' ? 'bg-glow/10 text-glow border border-glow/30' : 'bg-mint/10 text-mint border border-mint/30'}`}>
                      {o.status || 'Confirmed'}
                    </span>
                    <span className="text-sm font-bold">{fmt(o.totals?.grand || itemsTotal)}</span>
                    <ChevronDown className={`w-4 h-4 text-mist transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {open && (
                    <div className="border-t border-line px-5 py-5 space-y-5">
                      {/* Status timeline */}
                      <div className="flex items-center gap-1">
                        {STATUS_STEPS.map((s, i) => (
                          <React.Fragment key={s.id}>
                            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                              <span className={`w-3 h-3 rounded-full shrink-0 ${i <= statusIdx ? 'bg-glow' : 'bg-line'}`} />
                              <span className={`text-[8.5px] sm:text-[9px] uppercase tracking-wide font-bold leading-tight text-center ${i <= statusIdx ? 'text-glow' : 'text-mist'}`}>{s.label}</span>
                            </div>
                            {i < STATUS_STEPS.length - 1 && <span className={`h-px flex-1 -mt-4 ${i < statusIdx ? 'bg-glow' : 'bg-line'}`} />}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-3 rounded-2xl border border-line bg-panel/50 p-3">
                            <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-card to-midnight border border-line flex items-center justify-center p-1">
                              {it.product ? <ProductImage product={it.product} className="w-full h-full object-contain" /> : <ShoppingBag className="w-5 h-5 text-mist" />}
                            </div>
                            <span className="flex-1 text-sm font-semibold truncate">{it.name}{it.color ? ` · ${it.color}` : ''}</span>
                            <span className="text-xs text-mist">{it.qty} × {fmt(it.price)}</span>
                            <span className="text-sm font-bold">{fmt(it.price * it.qty)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Details */}
                      <div className="grid sm:grid-cols-2 gap-4 text-xs">
                        <div className="rounded-2xl border border-line bg-panel/50 p-4">
                          <p className="text-[11px] uppercase tracking-widest text-mist font-bold mb-2">Deliver to</p>
                          <p className="font-bold text-sm mb-0.5">{o.address?.name}</p>
                          <p className="text-mist leading-relaxed">{o.address?.addr}, {o.address?.locality}, {o.address?.city}, {o.address?.state} — {o.address?.pin}</p>
                          <p className="text-mist mt-1">+91 {o.address?.phone}</p>
                        </div>
                        <div className="rounded-2xl border border-line bg-panel/50 p-4">
                          <p className="text-[11px] uppercase tracking-widest text-mist font-bold mb-2">Payment</p>
                          <p className="font-bold text-sm capitalize">{o.method === 'upi' ? 'UPI' : o.method === 'card' ? 'Card' : o.method === 'netbanking' ? 'Net Banking' : o.method === 'wallet' ? 'E-Wallet' : 'Cash on Delivery'}</p>
                          <p className="text-mist mt-0.5 break-words">{o.paymentDetail}</p>
                          <div className="mt-2 space-y-1 border-t border-line pt-2">
                            {o.totals && (
                              <>
                                <div className="flex justify-between text-mist"><span>Subtotal</span><span>{fmt(o.totals.subtotal)}</span></div>
                                {o.totals.discount > 0 && <div className="flex justify-between text-mint"><span>Discount</span><span>− {fmt(o.totals.discount)}</span></div>}
                                <div className="flex justify-between text-mist"><span>GST (18%)</span><span>{fmt(o.totals.gst)}</span></div>
                                <div className="flex justify-between font-extrabold"><span>Total</span><span>{fmt(o.totals.grand)}</span></div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Link to="/" className="btn-ghost px-4 py-2 text-xs">Buy again</Link>
                        <button onClick={() => navigate(`/bill?no=${encodeURIComponent(o.orderNo || o.id)}`)} className="btn-ghost px-4 py-2 text-xs"><FileText className="w-3.5 h-3.5" /> View bill</button>
                        <span className="text-xs text-mist self-center flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-mint" /> Delivery expected by <b className="text-mint">{etaRange(o.eta, o.createdAt)}</b></span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
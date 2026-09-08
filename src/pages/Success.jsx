import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Package, Home, ShoppingBag, FileText } from 'lucide-react'
import { fmt } from '../utils/validation'
import { etaRange } from '../lib/orders'

export default function SuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state?.order
  const orderNo = state?.orderNo || location.state?.orderNo || `TV${Date.now().toString().slice(-8)}`
  const source = location.state?.source || 'local'

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 flex items-start justify-center">
      <div className="w-full max-w-lg text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-mint/15 border-2 border-mint flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-mint" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Order placed successfully! 🎉</h1>
        <p className="text-mist mt-2 text-sm">Order ID: <span className="font-bold text-ink">{orderNo}</span></p>
        <p className="text-mist text-sm">
          {source === 'firebase'
            ? 'This order is saved to your account — view it in My Orders any time.'
            : 'A receipt has been saved on this device for now.'}
        </p>

        {state && (
          <div className="max-w-sm mx-auto mt-6 rounded-3xl border border-line bg-deep p-5 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-mist">Payment</span><span className="font-semibold capitalize">{state.method === 'upi' ? 'UPI' : state.method === 'card' ? 'Card' : state.method === 'netbanking' ? 'Net Banking' : state.method === 'wallet' ? 'Wallet' : 'COD'}</span></div>
            <div className="flex justify-between"><span className="text-mist">Amount</span><span className="font-semibold">{state.method === 'cod' ? 'Pay on delivery' : `₹${fmt(state.totals?.grand || 0)}`}</span></div>
            <div className="flex justify-between"><span className="text-mist">Deliver to</span><span className="font-semibold text-right max-w-[60%] break-words">{state.address?.name}, {state.address?.city} {state.address?.pin}</span></div>
            <div className="flex justify-between"><span className="text-mist">Items</span><span className="font-semibold">{state.items?.length}</span></div>
            <div className="flex justify-between"><span className="text-mist">ETA</span><span className="font-semibold text-mint">{etaRange(state.order?.eta || state.eta, state.order?.createdAt)}</span></div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link to={`/bill?no=${encodeURIComponent(orderNo)}`} className="btn-ghost px-6 py-3 text-sm"><FileText className="w-4 h-4" /> Download Bill</Link>
          <Link to="/orders" className="btn-glow px-6 py-3 text-sm"><Package className="w-4 h-4" /> Track My Order</Link>
          <button onClick={() => navigate('/')} className="btn-ghost px-6 py-3 text-sm"><ShoppingBag className="w-4 h-4" /> Continue Shopping</button>
        </div>
        <p className="text-xs text-mist mt-6 flex items-center justify-center gap-1.5"><Home className="w-3.5 h-3.5" /> Free delivery · 7-day returns · GST invoice included</p>
      </div>
    </div>
  )
}
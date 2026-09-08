import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Printer, ArrowLeft, Loader2, FileText, PackageSearch } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getOrder, etaRange } from '../lib/orders'
import { fmt } from '../utils/validation'

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function two(n) {
  if (n < 20) return ONES[n]
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
}
function three(n) {
  const h = Math.floor(n / 100)
  const r = n % 100
  return (h ? ONES[h] + ' Hundred ' : '') + (r ? two(r) : '')
}
function amountInWords(num) {
  const n = Math.round(Number(num) || 0)
  if (!n) return 'Zero Rupees Only'
  const crore = Math.floor(n / 1e7)
  const lakh = Math.floor((n % 1e7) / 1e5)
  const thousand = Math.floor((n % 1e5) / 1e3)
  const rest = n % 1e3
  let s = ''
  if (crore) s += three(crore) + ' Crore '
  if (lakh) s += three(lakh) + ' Lakh '
  if (thousand) s += three(thousand) + ' Thousand '
  if (rest) s += three(rest)
  return s.trim() + ' Rupees Only'
}

const HSN = (id = '') =>
  /ultra|series|watch/i.test(id) ? '9102 1200' : /magsafe|charge|power/i.test(id) ? '8504 4020' : '8518 3000'

function fmtDate(v) {
  if (!v) return ''
  const d = typeof v === 'number' || typeof v === 'string' ? new Date(v) : v.toDate ? v.toDate() : new Date(v)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const methodName = (m) =>
  m === 'upi' ? 'UPI' : m === 'card' ? 'Debit / Credit Card' : m === 'netbanking' ? 'Net Banking' : m === 'wallet' ? 'E-Wallet' : 'Cash on Delivery'

export default function BillPage() {
  const { profile, user } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const no = params.get('no') || ''
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const uid = profile?.uid || user?.uid || 'demo'

  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (!no) { setLoading(false); setError(true); return }
    getOrder(uid, no)
      .then((o) => { setOrder(o); setLoading(false); setError(!o) })
      .catch(() => { setLoading(false); setError(true) })
  }, [uid, no])

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <p className="text-mist text-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading bill…</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-midnight flex flex-col items-center justify-center text-center px-6">
        <PackageSearch className="w-10 h-10 text-mist mb-4" />
        <h1 className="text-xl font-black mb-1">Bill not found</h1>
        <p className="text-sm text-mist mb-6">We couldn't find an invoice for this order.</p>
        <Link to="/orders" className="btn-glow px-6 py-3 text-sm">Go to My Orders</Link>
      </div>
    )
  }

  const items = order.items || []
  const totals = order.totals || {}
  const taxable = (totals.subtotal || 0) - (totals.discount || 0)
  const cgst = Math.round((totals.gst || 0) / 2)
  const sgst = (totals.gst || 0) - cgst
  const address = order.address || {}
  const buyer = `${address.name || ''}${address.type ? ` (${address.type})` : ''}`
  const fullAddress = [address.addr, address.locality, address.city, address.state, address.pin].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-midnight py-10 px-4 sm:px-6 print:p-0 print:bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Toolbar — hidden when printing */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button onClick={() => navigate('/orders')} className="btn-ghost px-4 py-2 text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
          <button onClick={() => window.print()} className="btn-glow px-5 py-2 text-sm"><Printer className="w-4 h-4" /> Print / Save PDF</button>
        </div>

        {/* Invoice */}
        <div id="invoice" className="bg-white text-gray-900 rounded-2xl shadow-xl shadow-black/30 overflow-hidden print:rounded-none print:shadow-none">
          <div className="border-b border-gray-200 px-6 sm:px-10 py-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-2xl font-black tracking-tight">NOVUS <span className="text-emerald-600">.</span></p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mt-1">Tax Invoice</p>
              <p className="text-[11px] text-gray-500 mt-3 max-w-[240px] leading-relaxed">
                Novus Electronics Private Limited<br />
                No. 12, MG Road, Bengaluru, Karnataka 560001<br />
                GSTIN: 29ABCDE1234F1Z5
              </p>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-lg">INV-{order.orderNo || order.id}</p>
              <p className="text-[11px] text-gray-500 mt-1">Invoice date: {fmtDate(order.createdAt)}</p>
              <p className="text-[11px] text-gray-500">Order no: {order.orderNo || order.id}</p>
              <p className="text-[11px] text-gray-500">Place of supply: {address.state || 'Karnataka'}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 px-6 sm:px-10 py-5 text-xs">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Billed to</p>
              <p className="font-bold text-gray-900">{buyer || '—'}</p>
              <p className="text-gray-600 mt-0.5">{fullAddress || '—'}</p>
              <p className="text-gray-600 mt-0.5">+91 {address.phone || '—'}</p>
              {order.email && <p className="text-gray-600 mt-0.5">{order.email}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Shipping address</p>
              <p className="text-gray-600">{fullAddress || '—'}</p>
              <p className="text-gray-600 mt-1">+91 {address.phone || '—'}</p>
              <p className="mt-2 font-semibold text-gray-900">Payment: {methodName(order.method)}</p>
              {order.paymentDetail ? <p className="text-gray-600">{order.paymentDetail}</p> : null}
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="text-left py-2 pr-2 w-8">#</th>
                  <th className="text-left py-2 pr-2">Item</th>
                  <th className="text-left py-2 pr-2 w-20">HSN</th>
                  <th className="text-right py-2 pr-2">Qty</th>
                  <th className="text-right py-2 pr-2">Rate</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-2 text-gray-500">{i + 1}</td>
                    <td className="py-2 pr-2 font-medium">{it.name}{it.color ? ` · ${it.color}` : ''}</td>
                    <td className="py-2 pr-2 text-gray-500">{HSN(it.id)}</td>
                    <td className="py-2 pr-2 text-right">{it.qty}</td>
                    <td className="py-2 pr-2 text-right">{fmt(it.price)}</td>
                    <td className="py-2 text-right font-semibold">{fmt((it.price || 0) * (it.qty || 1))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 sm:px-10 py-5 grid sm:grid-cols-2 gap-6">
            <div className="text-[11px] text-gray-500 space-y-1.5 self-end">
              <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Amount in words</p>
              <p className="font-semibold text-gray-800">{amountInWords(totals.grand || 0)}</p>
              <div className="pt-3 mt-2 border-t border-dashed border-gray-200">
                <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1.5">Expected delivery</p>
                <p className="font-semibold text-emerald-700">{etaRange(order.eta, order.createdAt)}</p>
                <p className="text-gray-500">(3–7 business days from order date)</p>
              </div>
            </div>
            <div className="text-right text-xs space-y-1.5">
              <div className="flex justify-between gap-8 text-gray-600"><span>Subtotal</span><span>{fmt(totals.subtotal || 0)}</span></div>
              {totals.discount > 0 && <div className="flex justify-between gap-8 text-gray-600"><span>Discount{order.promo ? ` (${order.promo.code})` : ''}</span><span>− {fmt(totals.discount)}</span></div>}
              <div className="flex justify-between gap-8 text-gray-600"><span>Taxable value</span><span>{fmt(taxable)}</span></div>
              <div className="flex justify-between gap-8 text-gray-600"><span>CGST 9%</span><span>{fmt(cgst)}</span></div>
              <div className="flex justify-between gap-8 text-gray-600"><span>SGST 9%</span><span>{fmt(sgst)}</span></div>
              <div className="flex justify-between gap-8 border-t border-dashed border-gray-300 pt-2 text-base font-black"><span>Grand total</span><span>₹ {fmt(totals.grand || 0)}</span></div>
            </div>
          </div>

          <div className="px-6 sm:px-10 py-5 border-t border-gray-200 text-[10px] text-gray-400 leading-relaxed print:text-[9px]">
            <p>This is a computer-generated invoice and does not require a physical signature. No returns or exchanges after availing free-replacement/warranty claims. Goods once sold at discounted prices (offer/sale) are not returnable unless defective (7-day window). Insurance-free shipments: risk of transit damage borne by seller until delivery.</p>
            <p className="mt-2 font-semibold text-gray-500">Novus Electronics · support@novus.app · +91 98765 43210</p>
          </div>
        </div>
      </div>
    </div>
  )
}
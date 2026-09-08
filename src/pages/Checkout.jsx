import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Lock, CreditCard, Smartphone, Landmark, Wallet, Banknote,
  ChevronLeft, ChevronRight, Check, MapPin, AlertCircle, BadgeCheck, ShieldCheck,
  QrCode, Copy, CheckCircle2, Loader2,
} from 'lucide-react'
import { useCartStore, getProduct } from '../store/cartStore'
import { useUIStore } from '../store/uiStore'
import { INDIAN_BANKS, INDIAN_STATES, PROMO_CODES } from '../data/products'
import {
  validateMobile, validateEmail, validatePin, validateUpi,
  detectCardBrand, validateCardNumber, validateExpiry, validateCvv,
  formatCardNumber, formatExpiry, upiAppFromHandle, fmt,
} from '../utils/validation'
import { calcTotals } from '../lib/totals'
import { listAddresses, addAddress, updateAddress } from '../lib/addresses'
import { saveOrder } from '../lib/orders'
import { useAuth } from '../context/AuthContext'
import ProductImage from '../components/ProductImage'
import QRCode from '../components/QRCode'

const PAY_METHODS = [
  { id: 'upi', label: 'UPI Payment', desc: 'PhonePe · Google Pay · Paytm · BHIM', icon: Smartphone },
  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa · Mastercard · RuPay · Amex', icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', desc: 'All major Indian banks', icon: Landmark },
  { id: 'wallet', label: 'E-Wallets', desc: 'Paytm · Amazon Pay · Mobikwik', icon: Wallet },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when it arrives', icon: Banknote },
]

const UPI_APPS = [
  { name: 'PhonePe', handle: 'ybl', cas: '#5f259f' },
  { name: 'Google Pay', handle: 'okaxis', cas: '#4285f4' },
  { name: 'Paytm', handle: 'paytm', cas: '#002e6e' },
  { name: 'BHIM', handle: 'upi', cas: '#fabc3e' },
]

const UPI_VPA = 'adnanchowdhury882@oksbi'

function upiLink(amount, tr) {
  const p = [
    `pa=${encodeURIComponent(UPI_VPA)}`,
    'pn=Novus',
    `am=${encodeURIComponent(String(amount))}`,
    'cu=INR',
    'tn=Novus%20Order',
  ]
  if (tr) p.push(`tr=${encodeURIComponent(tr)}`)
  return `upi://pay?${p.join('&')}`
}

function ScannableQR({ data, size = 200 }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <QRCode value={data} size={size} />
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}x${size}&margin=8&color=1a1d29&bgcolor=ffffff`}
      width={size}
      height={size}
      alt="UPI QR"
      onError={() => setFailed(true)}
      className="rounded-2xl bg-white"
    />
  )
}

const ACCEPTED_BANKS = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOB', 'Canara', 'IDBI', 'Yes Bank', 'IndusInd', 'Union']
const WALLETS = [
  { name: 'Paytm', cas: '#002e6e' },
  { name: 'Amazon Pay', cas: '#ff9900' },
  { name: 'Mobikwik', cas: '#23b2c9' },
]

function LogoMini({ name }) {
  const palette = { PhonePe: 'bg-[#5f259f]', 'Google Pay': 'bg-[#4285f4]', Paytm: 'bg-[#00baf2]', BHIM: 'bg-[#fabc3e]' }
  return <span className={`w-7 h-7 rounded-lg ${palette[name] || 'bg-glow'} text-white text-[10px] font-extrabold flex items-center justify-center`}>{name.slice(0, 2)}</span>
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-mist font-bold mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-ember mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { profile, isSignedIn } = useAuth()
  const { items, clearCart } = useCartStore()
  const showToast = useUIStore((s) => s.showToast)

  const rows = items.map((i) => ({ ...i, product: getProduct(i.productId) })).filter((r) => r.product)

  const [step, setStep] = useState(1)
  const [method, setMethod] = useState('upi')
  const [upiMode, setUpiMode] = useState('scan')
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [qrApp, setQrApp] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState({})

  const [savedAddrs, setSavedAddrs] = useState([])
  const [addrMode, setAddrMode] = useState('new')
  const [selectedAddrId, setSelectedAddrId] = useState(null)
  const [saveNewAddress, setSaveNewAddress] = useState(true)
  const [loadingAddrs, setLoadingAddrs] = useState(false)

  // shipping — prefilled from the profile
  const [ship, setShip] = useState({ name: '', phone: '', email: '', addr: '', city: '', state: '', pin: '', locality: '', type: 'Home' })
  const [upi, setUpi] = useState('')
  const [card, setCard] = useState({ num: '', name: '', exp: '', cvv: '' })
  const [bank, setBank] = useState('')
  const [wallet, setWallet] = useState('')

  useEffect(() => {
    if (profile) {
      setShip((s) => ({ ...s, name: s.name || profile.name || '', phone: s.phone || profile.phone || '', email: s.email || profile.email || '' }))
    }
  }, [profile])

  useEffect(() => {
    if (!isSignedIn) return
    let alive = true
    setLoadingAddrs(true)
    listAddresses(profile?.uid).then((list) => {
      if (!alive) return
      setSavedAddrs(list)
      const def = list.find((a) => a.isDefault) || list[0]
      if (def) {
        setSelectedAddrId(def.id)
        setAddrMode('saved')
        setShip((s) => ({
          ...s, name: def.name, phone: def.phone, email: s.email || profile?.email || '', addr: def.addr,
          locality: def.locality, city: def.city, state: def.state, pin: def.pin, type: def.label || 'Home',
        }))
      }
      setLoadingAddrs(false)
    }).catch(() => setLoadingAddrs(false))
    return () => { alive = false }
  }, [profile?.uid, isSignedIn])

  const totals = useMemo(() => calcTotals(rows, promoApplied), [rows, promoApplied])

  if (rows.length === 0 && !processing) {
    return (
      <div className="min-h-screen pt-28 pb-24 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-panel border border-line flex items-center justify-center mb-4">
          <Lock className="w-9 h-9 text-mist" />
        </div>
        <h2 className="text-2xl font-black">Your cart is empty</h2>
        <p className="text-mist text-sm mt-2 mb-6">Add some tech from the collection, then come back to pay.</p>
        <Link to="/" className="btn-glow px-6 py-3 text-sm">Browse products</Link>
      </div>
    )
  }

  const showSaved = isSignedIn && savedAddrs.length > 0

  const startNewAddress = () => {
    setAddrMode('new')
    setErrors({})
    setSelectedAddrId(null)
    // Pull contact details from the signed-in account (Google/email/OTP) so a
    // new address starts prefilled, but leave every field editable.
    setShip((s) => ({
      ...s,
      name: profile?.name || s.name,
      phone: profile?.phone || s.phone,
      email: profile?.email || s.email,
      addr: '', locality: '', city: '', state: '', pin: '', type: 'Home',
    }))
  }

  const selectSaved = (a) => {
    setSelectedAddrId(a.id)
    setAddrMode('saved')
    setErrors({})
    setShip((s) => ({
      ...s, name: a.name, phone: a.phone, email: s.email || profile?.email || '', addr: a.addr,
      locality: a.locality, city: a.city, state: a.state, pin: a.pin, type: a.label || 'Home',
    }))
  }

  const onPinChange = (v) => {
    setShip((s) => ({ ...s, pin: v.replace(/\D/g, '').slice(0, 6) }))
  }

  const goStep = async (n) => {
    if (n === 2) {
      const e = {}
      if (!ship.name.trim()) e.name = 'Full name is required'
      if (!validateMobile(ship.phone)) e.phone = 'Enter a valid 10-digit number (with +91 accepted)'
      if (!validateEmail(ship.email)) e.email = 'Enter a valid email'
      if (ship.addr.trim().length < 8) e.addr = 'Address too short'
      if (!ship.city.trim()) e.city = 'City is required'
      if (!ship.state) e.state = 'Select a state'
      if (!ship.locality.trim()) e.locality = 'Locality is required'
      if (!validatePin(ship.pin)) e.pin = '6-digit PIN required'
      setErrors(e)
      if (Object.keys(e).length) return
      // Persist a new address when the user asked to save it
      if (isSignedIn && addrMode === 'new' && saveNewAddress) {
        const id = await addAddress(profile?.uid || 'me', { ...ship, phone: ship.phone.replace(/\D/g, '') })
        const fresh = await listAddresses(profile?.uid)
        setSavedAddrs(fresh)
        setSelectedAddrId(id)
      }
    }
    if (n === 3) {
      const e = {}
      if (method === 'upi') {
        if (upiMode === 'upi' && !validateUpi(upi)) e.upi = 'Enter a valid UPI ID like name@ybl'
        if (upiMode === 'scan' && !qrApp) setQrApp(UPI_APPS[0])
      }
      if (method === 'card') {
        const brand = detectCardBrand(card.num)
        if (!validateCardNumber(card.num)) e.num = 'Invalid card number'
        if (brand === '') e.num = 'Card brand not recognised'
        if (!card.name.trim()) e.name = 'Name on card required'
        if (!validateExpiry(card.exp)) e.exp = 'Invalid or expired (MM/YY)'
        if (!validateCvv(card.cvv, brand)) e.cvv = '3/4 digit CVV required'
      }
      if (method === 'netbanking' && !bank) e.bank = 'Select your bank'
      if (method === 'wallet' && !wallet) e.wallet = 'Select a wallet'
      setErrors(e)
      if (Object.keys(e).length) return
    }
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const applyPromo = () => {
    const p = PROMO_CODES[promo.trim().toUpperCase()]
    if (!p) { setPromoError('Invalid promo code'); setPromoApplied(null); return }
    setPromoError('')
    setPromoApplied({ code: promo.trim().toUpperCase(), percent: p })
    showToast(`Promo applied — ${p}% off!`)
  }

  const placeOrder = async () => {
    if (method === 'upi') {
      if (upiMode === 'upi' && !validateUpi(upi)) { setErrors({ upi: 'Enter a valid UPI ID like name@ybl' }); return }
      if (upiMode === 'scan') { setQrApp(qrApp || UPI_APPS[0]); return }
    }
    if (method === 'card') {
      const brand = detectCardBrand(card.num)
      const e = {}
      if (!validateCardNumber(card.num)) e.num = 'Invalid card number'
      if (brand === '') e.num = 'Card brand not recognised'
      if (!card.name.trim()) e.name = 'Name on card required'
      if (!validateExpiry(card.exp)) e.exp = 'Invalid or expired (MM/YY)'
      if (!validateCvv(card.cvv, brand)) e.cvv = '3/4 digit CVV required'
      setErrors(e)
      if (Object.keys(e).length) return
    }
    if (method === 'netbanking' && !bank) { setErrors({ bank: 'Select your bank' }); return }
    if (method === 'wallet' && !wallet) { setErrors({ wallet: 'Select a wallet' }); return }

    await finalizeOrder()
  }

  const finalizeOrder = async () => {
    setProcessing(true)
    const orderNo = `TV${Date.now().toString().slice(-8)}`
    const order = {
      orderNo,
      items: rows.map((r) => ({
        id: r.product.id, name: r.product.name.replace('Clone ', ''), qty: r.qty, color: r.color || null,
        price: r.product.price, mrp: r.product.mrp,
      })),
      totals,
      promo: promoApplied ? { code: promoApplied.code, percent: promoApplied.percent } : null,
      method,
      paymentDetail: paymentDetail(method),
      address: { name: ship.name, phone: ship.phone, addr: ship.addr, locality: ship.locality, city: ship.city, state: ship.state, pin: ship.pin, type: ship.type },
      email: ship.email,
    }
    const saved = await saveOrder(profile?.uid || 'guest', order)
    clearCart()
    navigate('/success', { state: { ...saved, order: { ...order, id: saved.id } }, replace: true })
  }

  const delivered = `${ship.addr || '—'}, ${ship.locality || ''}${ship.locality ? ', ' : ''}${ship.city || '—'}${ship.state ? ', ' + ship.state : ''} ${ship.pin || ''}`

  const paymentDetail = (m) => {
    if (m === 'upi') return upi || 'name@upi'
    if (m === 'card') return `${detectCardBrand(card.num)} •••• ${card.num.replace(/\D/g, '').slice(-4) || '0000'}`
    if (m === 'netbanking') return bank || 'Select bank'
    if (m === 'wallet') return wallet || 'Select wallet'
    return 'Pay on delivery'
  }

  const upiApp = upiAppFromHandle(upi) || 'UPI'
  const scanApp = UPI_APPS.find((a) => a.name === (qrApp?.name || UPI_APPS[0].name)) || UPI_APPS[0]
  const scanDeep = upiLink(totals.grand)
  const methodMeta = PAY_METHODS.find((p) => p.id === method)
  const MethodIcon = methodMeta?.icon || Wallet

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <p className="text-xs text-mist mb-1"><Link to="/cart" className="hover:text-ink-2 transition-colors">Cart</Link> <span className="mx-1">/</span> <span className="text-ink-2 font-semibold">Secure Checkout</span></p>
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
            <Lock className="w-6 h-6 text-mint" /> Secure Checkout
          </h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <React.Fragment key={n}>
              <div className={`flex items-center gap-2 ${step >= n ? 'text-glow' : 'text-mist'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${step > n ? 'bg-mint border-mint text-white' : step === n ? 'bg-glow border-glow text-white' : 'border-line'}`}>
                  {step > n ? <Check className="w-3.5 h-3.5" /> : n}
                </span>
                <span className="text-xs font-semibold hidden sm:inline">{['Address', 'Payment', 'Review'][n - 1]}</span>
              </div>
              {n < 3 && <div className={`flex-1 h-px ${step > n ? 'bg-glow' : 'bg-line'}`} />}
            </React.Fragment>
          ))}
        </div>

        {processing && (
          <div className="rounded-3xl border border-line bg-panel/60 p-10 text-center">
            <Loader2 className="w-8 h-8 text-glow animate-spin mx-auto mb-4" />
            <p className="font-bold text-sm">{method === 'cod' ? 'Placing your order…' : `Processing ₹${fmt(totals.grand)}…`}</p>
            <p className="text-xs text-mist mt-1">256-bit encrypted · your money is safe</p>
          </div>
        )}

        {!processing && (
          <div className="grid lg:grid-cols-[1fr_340px] gap-6">
            {/* LEFT */}
            <div className="bg-deep border border-line rounded-[28px] p-6 sm:p-8 relative">
              {/* STEP 1 — Address */}
              {step === 1 && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <h2 className="font-extrabold text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-glow" /> Delivery Address</h2>
                    {showSaved && (
                      <div className="flex rounded-xl border border-line overflow-hidden">
                        <button onClick={() => { setAddrMode('saved'); setErrors({}) }} className={`px-4 py-2 min-h-[44px] text-xs font-bold ${addrMode === 'saved' ? 'bg-glow text-glow-ink' : 'bg-panel/60 text-mist'}`}>
                          Saved ({savedAddrs.length})
                        </button>
                        <button onClick={startNewAddress} className={`px-4 py-2 min-h-[44px] text-xs font-bold ${addrMode === 'new' ? 'bg-glow text-glow-ink' : 'bg-panel/60 text-mist'}`}>
                          + New
                        </button>
                      </div>
                    )}
                  </div>

                  {showSaved && addrMode === 'saved' && (
                    <div className="space-y-3 mb-5">
                      {loadingAddrs && <p className="text-xs text-mist">Loading saved addresses…</p>}
                      {savedAddrs.map((a) => (
                        <button key={a.id} onClick={() => selectSaved(a)}
                          className={`w-full flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${selectedAddrId === a.id ? 'border-glow bg-glow/10 shadow-lg shadow-glow/10' : 'border-line bg-panel/60 hover:border-glow/40'}`}>
                          <span className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 ${selectedAddrId === a.id ? 'border-glow' : 'border-line'}`}>
                            {selectedAddrId === a.id && <span className="block w-2 h-2 rounded-full bg-glow m-auto mt-0.5" />}
                          </span>
                          <span className="flex-1">
                            <span className="flex items-center gap-2 text-sm font-bold">
                              {a.label === 'Home' ? '🏠' : a.label === 'Work' ? '💼' : '📍'} {a.name}
                              {a.isDefault && <span className="text-[11px] font-bold text-mint border border-mint/40 rounded-full px-2 py-0.5">DEFAULT</span>}
                              <span className="ml-auto text-xs text-mist font-normal">{a.phone}</span>
                            </span>
                            <span className="block text-xs text-mist mt-1">{a.addr}, {a.locality}, {a.city}, {a.state} — {a.pin}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {addrMode === 'new' && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { k: 'name', label: 'Full Name', ph: 'Adnan Chowdhury', err: errors.name },
                        { k: 'phone', label: 'Mobile (+91)', ph: '98765 43210', numeric: true },
                      ].map((f) => (
                        <Field key={f.k} label={f.label} error={errors[f.k]}>
                          <input className="input-dark" placeholder={f.ph} value={ship[f.k]}
                            onChange={(e) => setShip({ ...ship, [f.k]: f.numeric ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value })} />
                        </Field>
                      ))}
                      <div className="sm:col-span-2">
                        <Field label="Email" error={errors.email}>
                          <input className="input-dark" type="email" placeholder="adnan@example.com" value={ship.email} onChange={(e) => setShip({ ...ship, email: e.target.value })} />
                        </Field>
                      </div>
                      <Field label="Pincode" error={errors.pin}>
                        <input className="input-dark" placeholder="400001" maxLength={6} value={ship.pin} onChange={(e) => onPinChange(e.target.value)} />
                      </Field>
                      <Field label="Locality / Area" error={errors.locality}>
                        <input className="input-dark" placeholder="Andheri East" value={ship.locality} onChange={(e) => setShip({ ...ship, locality: e.target.value })} />
                      </Field>
                      <Field label="City" error={errors.city}>
                        <input className="input-dark" placeholder="Mumbai" value={ship.city} onChange={(e) => setShip({ ...ship, city: e.target.value })} />
                      </Field>
                      <Field label="State" error={errors.state}>
                        <select className="input-dark" value={ship.state} onChange={(e) => setShip({ ...ship, state: e.target.value })}>
                          <option value="">Select state</option>
                          {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Flat, House no., Building, Street" error={errors.addr}>
                          <input className="input-dark" placeholder="Flat 302, Rainbow Residency, Linking Road" value={ship.addr} onChange={(e) => setShip({ ...ship, addr: e.target.value })} />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs uppercase tracking-wider text-mist font-bold mb-2">Save as</p>
                        <div className="flex gap-2">
                          {['Home', 'Work', 'Other'].map((t) => (
                            <button key={t} type="button" onClick={() => setShip({ ...ship, type: t })}
                              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 min-h-[44px] text-sm font-semibold transition-all ${ship.type === t ? 'border-glow bg-glow/10 text-glow' : 'border-line bg-panel/60 text-mist hover:border-glow/40'}`}>
                              <span>{t === 'Home' ? '🏠' : t === 'Work' ? '💼' : '📍'}</span> {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      {isSignedIn && (
                        <label className="sm:col-span-2 flex items-center gap-2 text-xs text-mist cursor-pointer">
                          <input type="checkbox" checked={saveNewAddress} onChange={(e) => setSaveNewAddress(e.target.checked)} className="w-4 h-4 rounded border-line accent-[#263A99]" />
                          Save this address to my account for next time
                        </label>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-mist mt-4 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-mint" /> We'll send an OTP to verify your number before dispatch.</p>
                  <button onClick={() => goStep(2)} className="btn-glow w-full mt-6 py-3 text-sm">
                    Continue to Payment <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <div>
                  <h2 className="font-extrabold text-lg flex items-center gap-2 mb-5"><CreditCard className="w-5 h-5 text-glow" /> Choose Payment</h2>

                  <div className="grid sm:grid-cols-2 gap-2.5 mb-6">
                    {PAY_METHODS.map((m) => (
                      <button key={m.id} onClick={() => { setMethod(m.id); setErrors({}) }}
                        className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${method === m.id ? 'border-glow bg-glow/10 shadow-lg shadow-glow/10' : 'border-line bg-panel/60 hover:border-glow/40'}`}>
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${method === m.id ? 'bg-glow text-glow-ink' : 'bg-card text-glow'}`}>
                          <m.icon className="w-5 h-5" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-bold">{m.label}</span>
                          <span className="block text-xs text-mist">{m.desc}</span>
                        </span>
                        <span className={`w-4 h-4 rounded-full border-2 ${method === m.id ? 'border-glow' : 'border-line'}`}>
                          {method === m.id && <span className="block w-2 h-2 rounded-full bg-glow m-auto mt-0.5" />}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* UPI */}
                  {method === 'upi' && (
                    <div className="space-y-4">
                      <div className="flex rounded-2xl border border-line overflow-hidden">
                        {[{ id: 'scan', label: 'Scan via QR' }, { id: 'upi', label: 'Enter UPI ID' }, { id: 'apps', label: 'UPI Apps' }].map((t) => (
                          <button key={t.id} type="button" onClick={() => { setUpiMode(t.id); setErrors({}) }}
                            className={`flex-1 py-2.5 min-h-[44px] text-xs font-bold transition-all ${upiMode === t.id ? 'bg-glow text-glow-ink' : 'bg-panel/60 text-mist hover:text-ink'}`}>
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {upiMode === 'scan' && (
                        <div className="rounded-2xl border border-line bg-panel/60 p-4 flex flex-col items-center text-center">
                          <div className="w-36 h-36 rounded-2xl border border-line bg-white flex items-center justify-center mb-2 overflow-hidden">
                            <ScannableQR data={scanDeep} size={132} />
                          </div>
                          <p className="text-sm font-bold flex items-center gap-1.5"><QrCode className="w-4 h-4 text-glow" /> Scan with any UPI app</p>
                          <p className="text-xs text-mist mt-1">Pay {fmt(totals.grand)} to <span className="font-semibold text-ink">{UPI_VPA}</span></p>
                          <button type="button" onClick={() => setQrApp(UPI_APPS[0])} className="flex items-center gap-2 mt-3 rounded-xl border border-line bg-deep px-4 py-2 min-h-[44px] text-xs font-bold hover:border-glow/50 transition-all">
                            <Smartphone className="w-4 h-4 text-glow" /> Open in {scanApp.name} <ChevronRight className="w-3.5 h-3.5 text-mist" />
                          </button>
                        </div>
                      )}

                      {upiMode === 'upi' && (
                        <Field label="Your UPI ID" error={errors.upi}>
                          <div className="flex gap-2">
                            <input className="input-dark flex-1" placeholder="yourname@upi" value={upi} onChange={(e) => setUpi(e.target.value)} />
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-mint/10 border border-mint/40 px-3 text-mint text-xs font-bold shrink-0">
                              <Smartphone className="w-3.5 h-3.5" /> {upiApp}
                            </span>
                          </div>
                        </Field>
                      )}

                      {upiMode === 'apps' && (
                        <div className="rounded-2xl border border-line bg-panel/60 divide-y divide-line/60 overflow-hidden">
                          {UPI_APPS.map((a) => (
                            <button key={a.name} type="button" onClick={() => setQrApp(a)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-glow/5 transition-all">
                              <LogoMini name={a.name} />
                              <span className="flex-1 text-sm font-bold">{a.name}</span>
                              <ChevronRight className="w-4 h-4 text-mist" />
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-mist flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-mint" /> Complete payment within 15 minutes. Funds are taken only after you confirm.</p>
                    </div>
                  )}

                  {/* Card */}
                  {method === 'card' && (
                    <div className="space-y-4">
                      <Field label="Card Number" error={errors.num}>
                        <div className="relative">
                          <input className="input-dark pr-24" placeholder="1234 5678 9012 3456" value={card.num} maxLength={19} onChange={(e) => setCard({ ...card, num: formatCardNumber(e.target.value) })} />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1.5 text-[10px] font-black">
                            {['Visa', 'MC', 'RP', 'Amex'].map((b, i) => (
                              <span key={b} className={`flex items-center justify-center h-5 px-1.5 rounded ${detectCardBrand(card.num) === ['Visa', 'Mastercard', 'RuPay', 'Amex'][i] ? 'bg-glow text-glow-ink' : 'bg-line text-mist'}`}>{b}</span>
                            ))}
                          </div>
                        </div>
                      </Field>
                      <Field label="Name on Card" error={errors.name}>
                        <input className="input-dark" placeholder="ADNAN CHOWDHURY" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Expiry (MM/YY)" error={errors.exp}>
                          <input className="input-dark" placeholder="09/28" maxLength={5} value={card.exp} onChange={(e) => setCard({ ...card, exp: formatExpiry(e.target.value) })} />
                        </Field>
                        <Field label="CVV" error={errors.cvv}>
                          <input className="input-dark" type="password" placeholder="•••" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
                        </Field>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-mist font-bold mb-2">Cards from all major Indian banks accepted</p>
                        <div className="flex flex-wrap gap-1.5">{ACCEPTED_BANKS.map((b) => <span key={b} className="chip">{b}</span>)}</div>
                      </div>
                      <p className="text-xs text-mist flex items-center gap-1.5"><Lock className="w-3 h-3 text-mint" /> Tokenised & charged via secure 3D-Secure. We never store card details.</p>
                    </div>
                  )}

                  {/* Net banking */}
                  {method === 'netbanking' && (
                    <div>
                      <Field label="Select your bank" error={errors.bank}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                          {INDIAN_BANKS.map((b) => (
                            <button key={b} onClick={() => setBank(b)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 min-h-[44px] text-left text-xs font-semibold transition-all ${bank === b ? 'border-glow bg-glow/10' : 'border-line bg-panel/60 hover:border-glow/40'}`}>
                              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-glow to-aqua text-white text-[10px] font-black flex items-center justify-center">{b.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
                              {b}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </div>
                  )}

                  {/* Wallet */}
                  {method === 'wallet' && (
                    <div>
                      <Field label="Choose wallet" error={errors.wallet}>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {WALLETS.map((w) => (
                            <button key={w.name} onClick={() => setWallet(w.name)} className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${wallet === w.name ? 'border-glow bg-glow/10' : 'border-line bg-panel/60 hover:border-glow/40'}`}>
                              <LogoMini name={w.name} /> {w.name}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </div>
                  )}

                  {/* COD */}
                  {method === 'cod' && (
                    <div className="rounded-2xl border border-mint/30 bg-mint/5 p-4 flex items-start gap-3">
                      <Banknote className="w-5 h-5 text-mint shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm">Cash on Delivery</p>
                        <p className="text-xs text-mist mt-1">Pay {fmt(totals.grand)} by cash or UPI at your doorstep. Keep the amount handy when the delivery partner arrives.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-between gap-3 mt-6">
                    <button onClick={() => goStep(1)} className="btn-ghost px-5 py-3 text-sm"><ChevronLeft className="w-4 h-4" /> Back</button>
                    <button onClick={() => goStep(3)} className="btn-glow px-6 py-3 text-sm">Review Order <ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}

              {/* STEP 3 — Review */}
              {step === 3 && (
                <div>
                  <h2 className="font-extrabold text-lg flex items-center gap-2 mb-5"><BadgeCheck className="w-5 h-5 text-glow" /> Review & Pay</h2>
                  <div className="rounded-2xl border border-line bg-panel/60 divide-y divide-line/60 text-sm">
                    <div className="p-4 flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-glow shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">{ship.name} · <span className="text-mist font-normal">{ship.phone}</span></p>
                        <p className="text-mist text-xs mt-0.5">{delivered}</p>
                      </div>
                    </div>
                    <div className="p-4 flex items-start gap-3">
                      <MethodIcon className="w-4 h-4 text-glow shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold capitalize">{method === 'upi' ? `UPI (${upiApp})` : method === 'card' ? 'Card' : method === 'netbanking' ? 'Net Banking' : method === 'wallet' ? 'E-Wallet' : 'Cash on Delivery'}</p>
                        <p className="text-mist text-xs mt-0.5">{paymentDetail(method)}</p>
                      </div>
                    </div>
                    <div className="p-4 flex items-start gap-3">
                      <span className="w-4 h-4 rounded bg-glow/15 border border-glow/40 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3 text-glow" /></span>
                      <div className="w-full space-y-1.5 text-xs">
                        {rows.map((r) => (
                          <div key={`${r.productId}-${r.color}`} className="flex justify-between gap-3">
                            <span className="truncate">{r.qty} × {r.product.name.replace('Clone ', '')}{r.color ? ` · ${r.color}` : ''}</span>
                            <span className="font-bold shrink-0">{fmt(r.product.price * r.qty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-between gap-3 mt-6">
                    <button onClick={() => goStep(2)} className="btn-ghost px-5 py-3 text-sm"><ChevronLeft className="w-4 h-4" /> Back</button>
                    <button onClick={placeOrder} className="btn-glow px-6 py-3 text-sm">
                      {method === 'cod' ? <Banknote className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      {method === 'cod' ? 'Place COD Order' : `Pay ${fmt(totals.grand)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Summary */}
            <div className="lg:border border-line rounded-[28px] bg-deep p-6 sm:p-8 h-max lg:sticky lg:top-24">
              <h4 className="font-bold mb-4 flex items-center justify-between">
                Order Summary <span className="text-xs text-mist font-medium">{rows.length} item{rows.length !== 1 ? 's' : ''}</span>
              </h4>
              <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar pr-1">
                {rows.map((r) => (
                  <div key={`${r.productId}-${r.color}`} className="flex gap-3 items-center">
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-card to-midnight border border-line flex items-center justify-center p-1">
                      <ProductImage product={r.product} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{r.product.name.replace('Clone ', '')}</p>
                      <p className="text-xs text-mist">{fmt(r.product.price)} × {r.qty}</p>
                    </div>
                    <span className="text-xs font-bold">{fmt(r.product.price * r.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 text-sm border-t border-line pt-4">
                <div className="flex justify-between text-mist"><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
                {promoApplied && (
                  <div className="flex justify-between text-mint"><span>Promo ({promoApplied.code})</span><span>− {fmt(totals.discount)}</span></div>
                )}
                <div className="flex justify-between text-mist"><span>Shipping</span><span className="text-mint font-bold">FREE</span></div>
                <div className="flex justify-between text-mist"><span>GST (18%)</span><span>{fmt(totals.gst)}</span></div>
                <div className="flex justify-between font-extrabold text-base border-t border-line pt-3 mt-3">
                  <span>Total</span><span className="gradient-text">{fmt(totals.grand)}</span>
                </div>
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

              <div className="mt-5 space-y-2 text-xs text-mist rounded-2xl border border-line bg-panel/40 p-4">
                <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-mint" /> 256-bit SSL secure payment</p>
                <p className="flex items-center gap-2"><Lock className="w-4 h-4 text-mint" /> PCI-DSS compliant flow</p>
                <p className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-mint" /> GST invoice included</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UPI QR modal */}
      {qrApp && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setQrApp(null)}>
          <div className="rounded-3xl border border-line bg-deep p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <QrPayModal app={qrApp} amount={totals.grand} setQrApp={setQrApp} onDone={finalizeOrder} />
          </div>
        </div>
      )}
    </div>
  )
}

function QrPayModal({ app, amount, setQrApp, onDone }) {
  const vpa = UPI_VPA
  const trRef = useRef(`NVS${Date.now().toString().slice(-8)}`)
  const [copied, setCopied] = useState(false)
  const [paid, setPaid] = useState(false)
  const [appOpened, setAppOpened] = useState(false)
  const deep = upiLink(amount, trRef.current)

  useEffect(() => {
    if (!appOpened || paid) return
    const confirm = () => {
      if (document.visibilityState === 'visible') {
        setPaid(true)
        setTimeout(onDone, 450)
      }
    }
    window.addEventListener('focus', confirm)
    document.addEventListener('visibilitychange', confirm)
    return () => {
      window.removeEventListener('focus', confirm)
      document.removeEventListener('visibilitychange', confirm)
    }
  }, [appOpened, paid, onDone])

  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-4">
        <LogoMini name={app.name} />
        <span className="font-extrabold">Pay with {app.name}</span>
        <span className="text-mist text-sm font-normal">({fmt(amount)})</span>
      </div>
      <div className="flex justify-center mb-4">
        <ScannableQR data={deep} size={200} />
      </div>
      <div className="rounded-xl bg-panel border border-line px-3 py-2 flex items-center justify-between text-sm mb-3">
        <span className="text-mist text-xs">Pay {fmt(amount)} to</span>
        <span className="font-bold text-xs flex items-center gap-1.5">{vpa}
          <button onClick={() => { navigator.clipboard?.writeText(vpa); setCopied(true) }} className="text-glow inline-flex items-center justify-center w-9 h-9 -m-2" aria-label="Copy VPA">
            {copied ? <Check className="w-4 h-4 text-mint" /> : <Copy className="w-4 h-4" />}
          </button>
        </span>
      </div>
      <a href={deep} className="btn-glow w-full py-3 text-sm mb-2" onClick={() => { setAppOpened(true); setPaid(true) }}>
        <Smartphone className="w-4 h-4" /> Open in {app.name}
      </a>
      <p className="text-xs text-mist mb-5">Tap above to jump straight into {app.name} — pay, and we'll confirm your order when you return.</p>
      <button onClick={() => { setPaid(true); setTimeout(onDone, 350) }} disabled={paid} className="btn-ghost w-full py-3 text-sm disabled:opacity-60">
        <CheckCircle2 className="w-4 h-4" /> {paid ? 'Completing order…' : 'I already paid'}
      </button>
      <button onClick={() => setQrApp(null)} className="w-full py-2.5 min-h-[44px] text-xs text-mist hover:text-ink-2 mt-2">Cancel</button>
    </>
  )
}
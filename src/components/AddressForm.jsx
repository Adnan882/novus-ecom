import React, { useState } from 'react'
import { AlertCircle, MapPin } from 'lucide-react'
import { INDIAN_STATES } from '../data/products'
import { blankAddress } from '../lib/addresses'
import { validateMobile, validateEmail, validatePin } from '../utils/validation'
import { useAuth } from '../context/AuthContext'

const PIN_MAP = {
  '110001': ['New Delhi', 'Delhi'], '110002': ['New Delhi', 'Delhi'],
  '400001': ['Mumbai', 'Maharashtra'], '400002': ['Mumbai', 'Maharashtra'],
  '560001': ['Bengaluru', 'Karnataka'], '560002': ['Bengaluru', 'Karnataka'],
  '600001': ['Chennai', 'Tamil Nadu'], '700001': ['Kolkata', 'West Bengal'],
  '800001': ['Patna', 'Bihar'], '226001': ['Lucknow', 'Uttar Pradesh'],
  '380001': ['Ahmedabad', 'Gujarat'], '380002': ['Ahmedabad', 'Gujarat'],
  '500001': ['Hyderabad', 'Telangana'], '695001': ['Thiruvananthapuram', 'Kerala'],
  '834001': ['Ranchi', 'Jharkhand'], '302001': ['Jaipur', 'Rajasthan'],
  '411001': ['Pune', 'Maharashtra'], '444001': ['Akola', 'Maharashtra'],
  '641001': ['Coimbatore', 'Tamil Nadu'], '360001': ['Rajkot', 'Gujarat'],
}

const LABELS = [
  { id: 'Home', icon: '🏠' },
  { id: 'Work', icon: '💼' },
  { id: 'Other', icon: '📍' },
]

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-mist font-bold mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-ember mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

export default function AddressForm({ initial, onSubmit, onCancel, submitLabel = 'Save Address', submitBusy }) {
  const { profile } = useAuth()
  // Prefill contact details from the signed-in account (Google/email/OTP) so users
  // don't retype them; everything stays editable before saving.
  const base = initial || {
    ...blankAddress(),
    name: profile?.name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
  }
  const [a, setA] = useState(() => ({ ...blankAddress(), ...base }))
  const [errors, setErrors] = useState({})

  const onPin = (v) => {
    const pin = v.replace(/\D/g, '').slice(0, 6)
    const hit = PIN_MAP[pin]
    setA((s) => ({ ...s, pin, city: hit ? hit[0] : s.city, state: hit ? hit[1] : s.state }))
  }

  const save = () => {
    const e = {}
    if (!a.name.trim()) e.name = 'Full name is required'
    if (!validateMobile(a.phone)) e.phone = 'Enter a valid 10-digit number'
    if (a.email && !validateEmail(a.email)) e.email = 'Enter a valid email'
    if (a.addr.trim().length < 8) e.addr = 'Address too short'
    if (!a.locality.trim()) e.locality = 'Locality is required'
    if (!a.city.trim()) e.city = 'City is required'
    if (!a.state) e.state = 'Select a state'
    if (!validatePin(a.pin)) e.pin = '6-digit PIN required'
    setErrors(e)
    if (Object.keys(e).length) return
    onSubmit({ ...a })
  }

  return (
    <div className="rounded-2xl border border-line bg-panel/60 p-5">
      <p className="flex items-center gap-2 font-bold text-sm mb-4"><MapPin className="w-4 h-4 text-glow" /> Address details</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-mist font-bold mb-2">Save as</p>
          <div className="flex gap-2">
            {LABELS.map((t) => (
              <button key={t.id} type="button" onClick={() => setA({ ...a, label: t.id })}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 min-h-[44px] text-xs font-semibold transition-all ${a.label === t.id ? 'border-glow bg-glow/10 text-glow' : 'border-line bg-panel/60 text-mist hover:border-glow/40'}`}>
                <span>{t.icon}</span> {t.id}
              </button>
            ))}
          </div>
        </div>
        <Field label="Full Name" error={errors.name}>
          <input className="input-dark" placeholder="Adnan Chowdhury" value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} />
        </Field>
        <Field label="Mobile (+91)" error={errors.phone}>
          <input className="input-dark" placeholder="98765 43210" value={a.phone} onChange={(e) => setA({ ...a, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Email" error={errors.email}>
            <input className="input-dark" type="email" placeholder="you@gmail.com" value={a.email} onChange={(e) => setA({ ...a, email: e.target.value })} />
          </Field>
        </div>
        <Field label="Pincode" error={errors.pin}>
          <input className="input-dark" placeholder="400001" maxLength={6} value={a.pin} onChange={(e) => onPin(e.target.value)} />
        </Field>
        <Field label="Locality / Area" error={errors.locality}>
          <input className="input-dark" placeholder="Andheri East" value={a.locality} onChange={(e) => setA({ ...a, locality: e.target.value })} />
        </Field>
        <Field label="City" error={errors.city}>
          <input className="input-dark" placeholder="Mumbai" value={a.city} onChange={(e) => setA({ ...a, city: e.target.value })} />
        </Field>
        <Field label="State" error={errors.state}>
          <select className="input-dark" value={a.state} onChange={(e) => setA({ ...a, state: e.target.value })}>
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Flat, House no., Building, Street" error={errors.addr}>
            <input className="input-dark" placeholder="Flat 302, Rainbow Residency, Linking Road" value={a.addr} onChange={(e) => setA({ ...a, addr: e.target.value })} />
          </Field>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <button onClick={save} disabled={submitBusy} className="btn-glow px-6 py-2.5 min-h-[44px] text-sm">
          {submitLabel}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="btn-ghost px-5 py-2.5 min-h-[44px] text-sm">Cancel</button>
        )}
      </div>
    </div>
  )
}
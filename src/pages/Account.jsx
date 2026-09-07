import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Phone, Mail, MapPin, Package, Pencil, Trash2, Star, Plus, LogOut, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listAddresses, addAddress, updateAddress, deleteAddress, setAddressDefault } from '../lib/addresses'
import AddressForm from '../components/AddressForm'
import { useUIStore } from '../store/uiStore'
import { validateMobile } from '../utils/validation'

const labelIcon = (l) => (l === 'Home' ? '🏠' : l === 'Work' ? '💼' : '📍')

export default function AccountPage() {
  const { profile, user, isSignedIn, updateProfileData, signOutUser, configured } = useAuth()
  const showToast = useUIStore((s) => s.showToast)

  const [editProfile, setEditProfile] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [addrList, setAddrList] = useState([])
  const [loadingAddrs, setLoadingAddrs] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const uid = profile?.uid || user?.uid

  useEffect(() => {
    if (profile) setForm({ name: profile.name || '', phone: profile.phone || '' })
  }, [profile])

  const load = () => {
    setLoadingAddrs(true)
    listAddresses(uid || 'me').then((l) => { setAddrList(l); setLoadingAddrs(false) }).catch(() => setLoadingAddrs(false))
  }

  useEffect(() => { load() }, [uid])

  const saveProfile = async () => {
    if (form.name.trim().length < 2) { showToast('Enter your name'); return }
    if (form.phone && !validateMobile(form.phone)) { showToast('Enter a valid 10-digit number'); return }
    setSaving(true)
    const res = await updateProfileData({ name: form.name.trim(), phone: form.phone.replace(/\D/g, '') })
    setSaving(false)
    if (res.ok) { setEditProfile(false); showToast('Profile updated') }
    else showToast(res.error)
  }

  const onAdd = async (addr) => {
    await addAddress(uid || 'me', { ...addr, phone: String(addr.phone).replace(/\D/g, '') })
    setAdding(false)
    load()
    showToast('Address saved')
  }

  const onEdit = async (addr) => {
    await updateAddress(uid || 'me', editingId, addr)
    setEditingId(null)
    load()
    showToast('Address updated')
  }

  const onDelete = async (id) => {
    await deleteAddress(uid || 'me', id)
    load()
    showToast('Address removed')
  }

  const onDefault = async (id) => {
    await setAddressDefault(uid || 'me', id)
    load()
    showToast('Default address updated')
  }

  const onSignOut = async () => {
    await signOutUser()
    showToast('Signed out')
  }

  const initials = (profile?.name || 'U').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-black mb-2">My Account</h1>
        <p className="text-mist text-sm mb-8">Manage your personal details and saved delivery addresses.</p>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Profile */}
          <div className="space-y-6">
            <div className="rounded-[28px] border border-line bg-deep p-6 text-center">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover" />
              ) : (
                <span className="w-20 h-20 mx-auto rounded-2xl bg-glow text-glow-ink flex items-center justify-center text-2xl font-black mb-4">{initials}</span>
              )}
              <p className="font-extrabold text-lg leading-tight">{profile?.name || 'Guest'}</p>
              <p className="text-xs text-mist mt-1 flex items-center justify-center gap-1.5"><Mail className="w-3 h-3" /> {profile?.email || '—'}</p>
              {configured && <p className="text-[10px] text-mint font-bold mt-2 uppercase tracking-widest">Synced to account</p>}

              <div className="flex flex-col gap-2 mt-6 text-left">
                <Link to="/orders" className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold hover:border-glow/50 transition-all hover:bg-glow/5">
                  <Package className="w-4 h-4 text-glow" /> My Orders
                  <span className="ml-auto text-mist text-xs font-normal">Track, cancel, reorder</span>
                </Link>
                <Link to="/cart" className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold hover:border-glow/50 transition-all hover:bg-glow/5">
                  <User className="w-4 h-4 text-glow" /> My Cart
                  <span className="ml-auto text-mist text-xs font-normal">View bag</span>
                </Link>
                <button onClick={onSignOut} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink-2 hover:border-ember hover:text-ember transition-all hover:bg-ember/5">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
            {!configured && (
              <div className="rounded-2xl border border-ember/40 bg-ember/5 px-5 py-4 text-xs text-ember leading-relaxed">
                Firebase isn't connected yet — your info is saved locally until you add your keys to <code className="font-bold">.env</code>.
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6 min-w-0">
            {/* Profile editor */}
            <div className="rounded-[28px] border border-line bg-deep p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-extrabold text-lg flex items-center gap-2"><User className="w-5 h-5 text-glow" /> Personal Details</h2>
                {!editProfile && (
                  <button onClick={() => setEditProfile(true)} className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-xs font-bold hover:border-glow/50 hover:text-glow transition-all">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              {!editProfile ? (
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel/50 px-4 py-3.5">
                    <User className="w-4 h-4 text-glow shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-mist font-bold">Full name</p>
                      <p className="font-bold truncate">{profile?.name || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel/50 px-4 py-3.5">
                    <Mail className="w-4 h-4 text-glow shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-mist font-bold">Email</p>
                      <p className="font-bold truncate">{profile?.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel/50 px-4 py-3.5 sm:col-span-2">
                    <Phone className="w-4 h-4 text-glow shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-mist font-bold">Mobile (+91)</p>
                      <p className="font-bold">{profile?.phone ? `+91 ${profile.phone}` : 'Add a number for faster checkout'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-mist font-bold mb-1.5">Full name</label>
                    <input className="input-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-mist font-bold mb-1.5">Mobile (+91)</label>
                    <input className="input-dark" placeholder="98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveProfile} disabled={saving} className="btn-glow px-5 py-2.5 text-sm">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Save</>}
                    </button>
                    <button onClick={() => { setEditProfile(false); setForm({ name: profile?.name || '', phone: profile?.phone || '' }) }} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Addresses */}
            <div className="rounded-[28px] border border-line bg-deep p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h2 className="font-extrabold text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-glow" /> Saved Addresses</h2>
                {!adding && editingId === null && (
                  <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 rounded-xl bg-glow text-glow-ink px-4 py-2 text-xs font-bold hover:bg-glow-hover transition-colors">
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                )}
              </div>

              {adding && (
                <div className="mb-5">
                  <AddressForm onSubmit={onAdd} onCancel={() => setAdding(false)} submitLabel="Save Address" />
                </div>
              )}

              {editingId !== null && (
                <div className="mb-5">
                  <AddressForm
                    initial={addrList.find((a) => a.id === editingId)}
                    onSubmit={onEdit}
                    onCancel={() => setEditingId(null)}
                    submitLabel="Update Address"
                  />
                </div>
              )}

              {loadingAddrs ? (
                <p className="text-xs text-mist py-4 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading addresses…</p>
              ) : addrList.length === 0 && !adding ? (
                <div className="rounded-2xl border border-dashed border-line px-5 py-8 text-center">
                  <MapPin className="w-8 h-8 text-mist mx-auto mb-2" />
                  <p className="text-sm font-semibold">No saved addresses yet</p>
                  <p className="text-xs text-mist mt-1 mb-4">Add a home or work address and it'll be auto-filled at checkout.</p>
                  <button onClick={() => setAdding(true)} className="btn-ghost px-4 py-2 text-xs">+ Add your first address</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addrList.map((a) => (
                    <div key={a.id} className="rounded-2xl border border-line bg-panel/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                            <span>{labelIcon(a.label)}</span> {a.name}
                            {a.isDefault && <span className="text-[10px] font-bold text-mint border border-mint/40 rounded-full px-2 py-0.5">DEFAULT</span>}
                          </p>
                          <p className="text-xs text-mist mt-1 break-words">{a.addr}, {a.locality}, {a.city}, {a.state} — {a.pin}</p>
                          <p className="text-xs text-mist mt-0.5">+91 {a.phone} · {a.label === 'Home' ? 'Home' : a.label === 'Work' ? 'Work' : 'Other'}</p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-1.5 shrink-0">
                          {!a.isDefault && (
                            <button onClick={() => onDefault(a.id)} title="Set as default" className="w-10 h-10 rounded-xl border border-line flex items-center justify-center text-mist hover:text-glow hover:border-glow/50 transition-colors">
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => { setEditingId(a.id); setAdding(false) }} title="Edit" className="w-10 h-10 rounded-xl border border-line flex items-center justify-center text-mist hover:text-glow hover:border-glow/50 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDelete(a.id)} title="Delete" className="w-10 h-10 rounded-xl border border-line flex items-center justify-center text-mist hover:text-ember hover:border-ember transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-mist mt-8 text-center flex items-center justify-center gap-1.5">
          <span className="w-3.5 h-3.5 inline-flex items-center justify-center"><Check className="w-3 h-3" /></span>
          {configured ? 'Your data is stored securely with Firebase and synced across all your devices.' : 'Demo mode — connect Firebase to enable cloud sync.'}
        </p>
      </div>
    </div>
  )
}
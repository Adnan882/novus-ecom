import {
  addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

const LS_KEY = 'novus-addresses'

function lsAll() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}
function lsSave(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

export async function listAddresses(uid) {
  if (isFirebaseConfigured) {
    const q = query(collection(db, 'users', uid, 'addresses'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }
  return lsAll()
}

export async function addAddress(uid, addr) {
  const payload = { ...addr, createdAt: serverTimestamp() }
  if (isFirebaseConfigured) {
    const ref = await addDoc(collection(db, 'users', uid, 'addresses'), payload)
    if (addr.isDefault) await setAddressDefault(uid, ref.id)
    return ref.id
  }
  const list = lsAll()
  if (list.length === 0) addr.isDefault = true
  const id = `a${Date.now()}`
  if (addr.isDefault) list.forEach((a) => (a.isDefault = false))
  list.unshift({ id, ...payload, createdAt: Date.now() })
  lsSave(list)
  return id
}

export async function updateAddress(uid, id, patch) {
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, 'users', uid, 'addresses', id), patch)
    if (patch.isDefault) await setAddressDefault(uid, id)
    return
  }
  const list = lsAll()
  const next = list.map((a) => (a.id === id ? { ...a, ...patch } : a))
  if (patch.isDefault) next.forEach((a) => (a.isDefault = a.id === id))
  lsSave(next)
}

export async function deleteAddress(uid, id) {
  if (isFirebaseConfigured) {
    await deleteDoc(doc(db, 'users', uid, 'addresses', id))
    return
  }
  lsSave(lsAll().filter((a) => a.id !== id))
}

export async function setAddressDefault(uid, id) {
  if (isFirebaseConfigured) {
    const q = query(collection(db, 'users', uid, 'addresses'))
    const snap = await getDocs(q)
    const writes = snap.docs.map((d) => updateDoc(doc(db, 'users', uid, 'addresses', d.id), { isDefault: d.id === id }))
    await Promise.all(writes)
    return
  }
  const list = lsAll()
  lsSave(list.map((a) => ({ ...a, isDefault: a.id === id })))
}

export function blankAddress() {
  return { label: 'Home', name: '', phone: '', email: '', addr: '', locality: '', city: '', state: '', pin: '', isDefault: false }
}
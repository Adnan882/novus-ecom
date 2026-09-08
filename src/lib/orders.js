import { addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

const LS_KEY = 'novus-orders'

function addBusinessDays(from, count) {
  const d = new Date(from)
  let added = 0
  while (added < count) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day !== 0 && day !== 6) added += 1
  }
  return d
}

export function etaFor(from = new Date(), min = 3, max = 7) {
  const start = addBusinessDays(from, min)
  const end = addBusinessDays(from, max)
  return { start: start.getTime(), end: end.getTime(), min, max, label: `${min}–${max} business days` }
}

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

export async function saveOrder(uid, order) {
  const eta = order.eta || etaFor()
  if (isFirebaseConfigured) {
    const ref = await addDoc(collection(db, 'users', uid, 'orders'), {
      ...order,
      eta,
      createdAt: serverTimestamp(),
      status: 'confirmed',
    })
    return { id: ref.id, source: 'firebase', eta }
  }
  const created = {
    id: `o${Date.now()}${Math.floor(Math.random() * 90 + 10)}`,
    createdAt: Date.now(),
    status: 'confirmed',
    eta,
    ...order,
  }
  lsSave([created, ...lsAll()])
  return { id: created.id, source: 'local', eta }
}

export async function listOrders(uid) {
  if (isFirebaseConfigured) {
    const q = query(collection(db, 'users', uid, 'orders'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }
  return lsAll()
}

export async function getOrder(uid, key) {
  if (isFirebaseConfigured) {
    const q = query(collection(db, 'users', uid, 'orders'), where('orderNo', '==', key), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const d = snap.docs[0]
      return { id: d.id, ...d.data() }
    }
    return null
  }
  const list = lsAll()
  return list.find((o) => (o.orderNo || o.id) === key) || null
}

export function etaRange(eta, fallback = null) {
  const from = eta || etaFor(fallback ? new Date(fallback) : undefined)
  const start = new Date(from.start)
  const end = new Date(from.end)
  const opts = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString('en-IN', opts)} – ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
}
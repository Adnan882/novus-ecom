import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

const LS_KEY = 'novus-orders'

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
  if (isFirebaseConfigured) {
    const ref = await addDoc(collection(db, 'users', uid, 'orders'), {
      ...order,
      createdAt: serverTimestamp(),
      status: 'confirmed',
    })
    return { id: ref.id, source: 'firebase' }
  }
  const created = {
    id: `o${Date.now()}${Math.floor(Math.random() * 90 + 10)}`,
    createdAt: Date.now(),
    status: 'confirmed',
    ...order,
  }
  lsSave([created, ...lsAll()])
  return { id: created.id, source: 'local' }
}

export async function listOrders(uid) {
  if (isFirebaseConfigured) {
    const q = query(collection(db, 'users', uid, 'orders'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }
  return lsAll()
}
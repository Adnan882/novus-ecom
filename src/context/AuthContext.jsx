import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import {
  createUserWithEmailAndPassword, onAuthStateChanged,
  signInWithEmailAndPassword, signInWithPopup, signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as fbSignOut, updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider, isFirebaseConfigured } from '../lib/firebase'

const DEMO_KEY = 'novus-account'
const AuthContext = createContext(null)

let activeVerifier = null

function readDemo() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) || 'null')
  } catch {
    return null
  }
}
function writeDemo(d) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(d))
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const hydrateProfile = useCallback(async (fbUser) => {
    if (!isFirebaseConfigured) {
      const demo = readDemo()
      setProfile(demo ? {
        ...demo,
        email: demo.email || fbUser?.email || '',
        phone: demo.phone || fbUser?.phoneNumber || '',
        photoURL: fbUser?.photoURL || '',
      } : null)
      setLoading(false)
      return
    }
    const ref = doc(db, 'users', fbUser.uid)
    let snap = await getDoc(ref)
    if (!snap.exists()) {
      const base = {
        name: fbUser.displayName || '',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        photoURL: fbUser.photoURL || '',
        createdAt: serverTimestamp(),
      }
      await setDoc(ref, base)
      snap = await getDoc(ref)
    }
    const data = snap.exists() ? snap.data() : {}
    setProfile({
      name: data.name || fbUser.displayName || '',
      email: data.email || fbUser.email || '',
      phone: data.phone || fbUser.phoneNumber || '',
      photoURL: data.photoURL || fbUser.photoURL || '',
      uid: fbUser.uid,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt || null,
    })
    // If the provider exposed a number the profile doesn't have yet, persist it.
    if (fbUser.phoneNumber && !data.phone) {
      await setDoc(ref, { phone: fbUser.phoneNumber }, { merge: true })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured) {
      hydrateProfile()
      return
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser)
        await hydrateProfile(fbUser)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })
    return unsub
  }, [hydrateProfile])

  // Keep the local cache in lock-step (used by Navbar initials before Firestore resolves).
  useEffect(() => {
    if (!profile) return
    try {
      localStorage.setItem(DEMO_KEY, JSON.stringify({ name: profile.name, email: profile.email, phone: profile.phone }))
    } catch {
      /* ignore */
    }
  }, [profile])

  const signInWithGoogle = useCallback(async () => {
    setError('')
    if (!isFirebaseConfigured) return { ok: false, error: 'Firebase is not configured yet — paste your keys into .env (see setup guide).' }
    try {
      const res = await signInWithPopup(auth, googleProvider)
      await hydrateProfile(res.user)
      return { ok: true }
    } catch (e) {
      const msg = e?.code === 'auth/popup-closed-by-user' ? 'Sign-in popup was closed.' : e?.message || 'Google sign-in failed.'
      setError(msg)
      return { ok: false, error: msg }
    }
  }, [hydrateProfile])

  const signInWithEmail = useCallback(async (email, pw) => {
    setError('')
    if (!isFirebaseConfigured) return { ok: false, error: 'Firebase is not configured yet — paste your keys into .env (see setup guide).' }
    try {
      await signInWithEmailAndPassword(auth, email, pw)
      return { ok: true }
    } catch (e) {
      const msg = e?.code === 'auth/user-not-found' ? 'No account found with this email.' : e?.code === 'auth/wrong-password' ? 'Incorrect password.' : e?.message || 'Sign in failed.'
      setError(msg)
      return { ok: false, error: msg }
    }
  }, [])

  const sendOtp = useCallback(async (phone, recaptchaContainerId) => {
    setError('')
    if (!isFirebaseConfigured) return { ok: false, error: 'Firebase is not configured yet — paste your keys into .env (see setup guide).' }
    try {
      // A reCAPTCHA widget can only be rendered once per element — release the
      // previous one (and wipe the container) before creating a new verifier.
      if (activeVerifier) {
        try { activeVerifier.clear() } catch { /* already gone */ }
        activeVerifier = null
      }
      const container = document.getElementById(recaptchaContainerId)
      if (!container) return { ok: false, error: 'Captcha element not found.' }
      container.innerHTML = ''
      const verifier = new RecaptchaVerifier(auth, container, { size: 'invisible' })
      activeVerifier = verifier
      const session = await signInWithPhoneNumber(auth, phone, verifier)
      return { ok: true, session, verifier }
    } catch (e) {
      const msg = e?.code === 'auth/too-many-requests' ? 'Too many attempts — wait a minute and try again.' : e?.message?.includes('argument') ? 'Phone sign-in is not enabled in this Firebase project.' : e?.message || 'Failed to send OTP.'
      setError(msg)
      return { ok: false, error: msg }
    }
  }, [])

  const verifyOtp = useCallback(async (session, code) => {
    setError('')
    if (!session) return { ok: false, error: 'Session expired — send a new code.' }
    try {
      const result = await session.confirm(code)
      await hydrateProfile(result.user)
      return { ok: true }
    } catch (e) {
      const msg = e?.code === 'auth/invalid-verification-code' ? 'Incorrect OTP — check the code and try again.' : e?.message || 'Verification failed.'
      setError(msg)
      return { ok: false, error: msg }
    }
  }, [hydrateProfile])

  const signUpWithEmail = useCallback(async (name, email, pw) => {
    setError('')
    if (!isFirebaseConfigured) return { ok: false, error: 'Firebase is not configured yet — paste your keys into .env (see setup guide).' }
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pw)
      if (res.user) await updateProfile(res.user, { displayName: name })
      await setDoc(doc(db, 'users', res.user.uid), {
        name, email, phone: '', photoURL: '', createdAt: serverTimestamp(),
      }, { merge: true })
      await hydrateProfile(res.user)
      return { ok: true }
    } catch (e) {
      const msg = e?.code === 'auth/email-already-in-use' ? 'This email is already registered — sign in instead.' : e?.message || 'Sign up failed.'
      setError(msg)
      return { ok: false, error: msg }
    }
  }, [hydrateProfile])

  const signOutUser = useCallback(async () => {
    setError('')
    if (isFirebaseConfigured) await fbSignOut(auth)
    writeDemo(null)
    setUser(null)
    setProfile(null)
  }, [])

  const updateProfileData = useCallback(async (patch) => {
    if (!user) return { ok: false, error: 'Not signed in.' }
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'users', user.uid), patch, { merge: true })
      await hydrateProfile(user)
      return { ok: true }
    }
    const next = { ...(profile || {}), ...patch }
    writeDemo({ name: next.name, email: next.email, phone: next.phone })
    setProfile({ ...profile, ...patch })
    return { ok: true }
  }, [user, profile, hydrateProfile])

  const value = useMemo(
    () => ({
      user, profile, loading, error, setError,
      configured: isFirebaseConfigured,
      isSignedIn: Boolean(user || (profile && !isFirebaseConfigured)),
      signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, updateProfileData, sendOtp, verifyOtp,
    }),
    [user, profile, loading, error, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, updateProfileData, sendOtp, verifyOtp]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, AlertCircle, Loader2, Smartphone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, sendOtp, verifyOtp, configured, error, setError, loading } = useAuth()
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState('')
  const [otpPhone, setOtpPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSession, setOtpSession] = useState(null)
  const [otpSent, setOtpSent] = useState(false)

  const from = location.state?.from || '/'
  const after = () => navigate(from, { replace: true })

  const onGoogle = async () => {
    setBusy('google')
    const res = await signInWithGoogle()
    setBusy('')
    if (res.ok) after()
  }

  const onEmail = async (e) => {
    e.preventDefault()
    if (mode === 'signup') {
      if (name.trim().length < 2) { setError('Enter your full name'); return }
      if (pw.length < 6) { setError('Password must be at least 6 characters'); return }
      if (pw !== pw2) { setError('Passwords do not match'); return }
    }
    setBusy('email')
    const res = mode === 'signin'
      ? await signInWithEmail(email.trim(), pw)
      : await signUpWithEmail(name.trim(), email.trim(), pw)
    setBusy('')
    if (res.ok) after()
  }

  const formatPhone = (v) => {
    let digits = v.replace(/\D/g, '')
    if (!digits.startsWith('91') && digits.length === 10) digits = '91' + digits
    if (!digits.startsWith('91') && digits.length > 10) digits = digits.slice(-10)
    return '+' + digits
  }

  const onSendOtp = async () => {
    const phone = formatPhone(otpPhone)
    if (phone.length < 13) { setError('Enter a valid 10-digit Indian mobile number'); return }
    setError('')
    setBusy('otp')
    const res = await sendOtp(phone, 'phone-recaptcha')
    setBusy('')
    if (res.ok) {
      setOtpSession(res.session)
      setOtpSent(true)
    }
  }

  const onVerifyOtp = async (e) => {
    e.preventDefault()
    if (otpCode.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setBusy('verify')
    const res = await verifyOtp(otpSession, otpCode)
    setBusy('')
    if (res.ok) after()
  }

  const googleBusy = busy === 'google' || loading
  const otpBusy = busy === 'otp' || busy === 'verify'

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 flex items-start justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-[28px] border border-line bg-deep overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-8 pb-6 border-b border-line bg-midnight/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-11 h-11 rounded-xl overflow-hidden border border-line flex items-center justify-center">
                <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Novus" className="w-full h-full object-contain" />
              </span>
              <h1 className="text-xl font-extrabold">Welcome to Novus</h1>
            </div>
            <p className="text-sm text-mist">
              {mode === 'signin' || mode === 'otp'
                ? 'Sign in and your saved address, orders and profile will follow you anywhere.'
                : 'Create an account once — checkout, orders and addresses get saved for next time.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-line">
            {[
              { id: 'signin', label: 'Sign In' },
              { id: 'otp', label: 'Mobile OTP' },
              { id: 'signup', label: 'Create Account' },
            ].map((m) => (
              <button key={m.id} onClick={() => { setMode(m.id); setError(''); setOtpSent(false); setOtpSession(null); setOtpCode('') }}
                className={`flex-1 px-1 py-3.5 text-center text-[13px] sm:text-sm leading-tight font-bold transition-colors ${mode === m.id ? 'text-glow border-b-2 border-glow' : 'text-mist hover:text-ink-2'}`}>
                {m.label}
              </button>
            ))}
          </div>

          <div className="p-7">
            {/* Google — available in all modes */}
            <button
              onClick={onGoogle}
              disabled={googleBusy}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-line bg-panel/60 py-3.5 text-sm font-bold hover:border-glow/50 transition-all disabled:opacity-60"
            >
              {googleBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
                </svg>
              )}
              {busy === 'google' ? 'Connecting to Google…' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-3 my-5">
              <span className="flex-1 h-px bg-line" />
              <span className="text-xs uppercase tracking-widest text-mist">
                {mode === 'otp' ? 'phone verification' : 'or use email'}
              </span>
              <span className="flex-1 h-px bg-line" />
            </div>

            {/* Mobile OTP form */}
            {mode === 'otp' && (
              <form onSubmit={otpSent ? onVerifyOtp : (e) => { e.preventDefault(); onSendOtp() }} className="space-y-3.5">
                {!otpSent && (
                  <>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-mist font-bold mb-1.5">Mobile Number (+91)</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
                        <input className="input-dark !pl-11" placeholder="98765 43210" value={otpPhone}
                          onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 12))} required />
                      </div>
                    </div>
                    <p className="text-xs text-mist">We'll send a one-time code to verify your number. Standard SMS charges apply.</p>
                  </>
                )}
                {otpSent && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-mist font-bold mb-1.5">Enter OTP</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
                      <input className="input-dark !pl-11" placeholder="6-digit code" value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus required />
                    </div>
                    <p className="text-xs text-mist mt-1">Sent to {formatPhone(otpPhone)}. Didn't receive it?
                      <button type="button" onClick={onSendOtp} className="text-glow font-semibold ml-1">Resend</button>
                    </p>
                  </div>
                )}
                {error && (
                  <p className="text-[12px] text-ember flex items-center gap-1.5 font-semibold"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</p>
                )}
                <button type="submit" disabled={otpBusy} className="btn-glow w-full py-3.5 text-sm mt-1">
                  {otpBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : otpSent ? 'Verify & Sign In' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* Email form (Sign In / Create Account) */}
            {mode !== 'otp' && (
              <form onSubmit={onEmail} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-mist font-bold mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
                      <input className="input-dark !pl-11" placeholder="Adnan Chowdhury" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-mist font-bold mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
                    <input className="input-dark !pl-11" type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-mist font-bold mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
                    <input className="input-dark !pl-11" type="password" placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'} value={pw} onChange={(e) => setPw(e.target.value)} required />
                  </div>
                </div>
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-mist font-bold mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
                      <input className="input-dark !pl-11" type="password" placeholder="Repeat password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
                    </div>
                  </div>
                )}
                {error && (
                  <p className="text-[12px] text-ember flex items-center gap-1.5 font-semibold"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</p>
                )}
                <button type="submit" disabled={busy === 'email'} className="btn-glow w-full py-3.5 text-sm mt-1">
                  {busy === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Create My Account'}
                </button>
              </form>
            )}

            {/* reCAPTCHA container (invisible, created on demand) */}
            {mode === 'otp' && <div id="phone-recaptcha" className="invisible" />}

            <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center text-xs text-mist mt-5">
              <Link to="/" className="hover:text-ink-2 transition-colors">Back to store</Link>
              <span>·</span>
              <button onClick={() => navigate('/')} className="hover:text-ink-2 transition-colors">Browse products</button>
            </div>
          </div>
        </div>

        {/* First-time note */}
        <div className="mt-4 rounded-2xl border border-line bg-panel/50 px-5 py-4 text-xs text-mist leading-relaxed">
          {mode === 'signup' ? (
            <>Your profile, saved addresses and order history are stored securely with Firebase and synced to every device. First time? Your Google details are pulled automatically so you don't retype anything.</>
          ) : mode === 'otp' ? (
            <>Enter your Indian mobile number and we'll send a one-time password via SMS. If you already have a Novus account linked to this number, it signs you right in; otherwise a new account is created automatically.</>
          ) : (
            <>Signing in with Google pre-fills your name and email from your Gmail account. New to Novus? <button onClick={() => setMode('signup')} className="text-glow font-semibold">Create an account</button> — you'll only be asked for your details once.</>
          )}
        </div>

        {!configured && (
          <div className="mt-4 rounded-2xl border border-ember/40 bg-ember/5 px-5 py-4 text-xs text-ember leading-relaxed">
            Firebase isn't connected yet — paste your keys from the Firebase console into <code className="font-bold">.env</code> (see the setup guide). The store still works as a demo until then.
          </div>
        )}
      </div>
    </div>
  )
}
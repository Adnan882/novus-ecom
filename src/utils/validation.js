// Indian e-commerce validation utilities

export const VALID_PIN_CODES = [
  '110001', '110002', '400001', '400002', '560001', '600001', '700001', '800001', '226001', '380001',
  '500001', '695001', '834001', '302001', '444001', '560002', '411001', '380002', '641001', '360001',
]

export const validateName = (value, min = 3) =>
  (value || '').trim().length >= min

export const validateMobile = (value) => {
  const digits = (value || '').replace(/\D/g, '')
  // Accepts +91 prefix
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^9[1-9]/.test(digits.slice(0, 3)) || /^[6-9]/.test(digits.slice(2, 3))
  }
  if (digits.length === 11 && digits.startsWith('0')) digits.replace(/^0/, '')
  return digits.length === 10 && /^[6-9]/.test(digits)
}

export const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value || '')

export const validatePin = (value) => /^[1-9][0-9]{5}$/.test(value || '')

export const validateUpi = (value) =>
  /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(value || '')

// Card brand auto-detection (Visa / Mastercard / RuPay / Amex / Discover)
export const detectCardBrand = (number = '') => {
  const n = number.replace(/\s/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^5[1-5]/.test(n) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(n)) return 'Mastercard'
  if (/^(34|37)/.test(n)) return 'Amex'
  if (/^508[5-9]/.test(n) || /^(60|65|81|82|352)/.test(n)) return 'RuPay'
  if (/^6011/.test(n)) return 'Discover'
  return ''
}

export const validateCardNumber = (number = '') => {
  const digits = number.replace(/\s/g, '')
  if (!/^[0-9]{15,16}$/.test(digits)) return false
  // Luhn check
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10)
    if (double) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    double = !double
  }
  return sum % 10 === 0
}

export const validateExpiry = (value) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(value || '')
  if (!m) return false
  const month = parseInt(m[1], 10)
  const year = 2000 + parseInt(m[2], 10)
  if (month < 1 || month > 12) return false
  const now = new Date()
  const exp = new Date(year, month)
  return exp > now
}

export const validateCvv = (value, brand = '') => {
  const v = (value || '').trim()
  if (brand === 'Amex') return /^\d{4}$/.test(v)
  return /^\d{3}$/.test(v)
}

export const formatCardNumber = (value = '') => {
  const v = value.replace(/\D/g, '').slice(0, 16)
  const groups = v.match(/.{1,4}/g)
  return groups ? groups.join(' ') : v
}

export const formatExpiry = (value = '') => {
  const v = value.replace(/\D/g, '').slice(0, 4)
  if (v.length <= 2) return v
  return `${v.slice(0, 2)}/${v.slice(2)}`
}

// UPI app detection from upi id handle
export const upiAppFromHandle = (handle = '') => {
  const h = handle.split('@')[1]?.toLowerCase() || ''
  if (h === 'ybl' || h === 'yapl') return 'PhonePe'
  if (h === 'okaxis' || h.startsWith('ok')) return 'Google Pay'
  if (h === 'paytm') return 'Paytm'
  if (h === 'upi') return 'BHIM'
  if (h === 'ibl') return 'Amazon Pay'
  if (h === 'kmbl') return 'Kotak'
  return ''
}

export const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
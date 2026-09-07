import React, { useMemo } from 'react'

// Deterministic pseudo-QR matrix (looks the part without a QR lib)
function hash(str) {
  let h = 7
  for (let i = 0; i < (str || '').length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function makeMatrix(seed, size = 26) {
  let s = seed || 42
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const m = Array.from({ length: size }, () => Array(size).fill(false))
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (rnd() < 0.48) m[i][j] = true
    }
  }
  // Finder patterns (top-left, top-right, bottom-left)
  const finder = (r, c) => {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const x = r + i
        const y = c + j
        if (x < 0 || y < 0 || x >= size || y >= size) continue
        const ring = Math.max(Math.abs(i), Math.abs(j))
        m[x][y] = ring !== 1 && ring !== 3
        if (ring === 3) m[x][y] = false
      }
    }
  }
  finder(0, 0)
  finder(0, size - 7)
  finder(size - 7, 0)
  return m
}

export default function QRCode({ value = 'novus', size = 210 }) {
  const matrix = useMemo(() => makeMatrix(hash(value), 26), [value])
  const cell = size / 26
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white rounded-xl p-2" role="img" aria-label="UPI QR code">
      {matrix.map((row, i) =>
        row.map((v, j) =>
          v ? <rect key={`${i}-${j}`} x={j * cell} y={i * cell} width={cell} height={cell} fill="#0a0a0a" /> : null
        )
      )}
    </svg>
  )
}
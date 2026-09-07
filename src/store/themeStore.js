import { create } from 'zustand'

function applyTheme(t) {
  const root = document.documentElement
  if (t === 'light') root.classList.remove('dark')
  else root.classList.add('dark')
}

export const useThemeStore = create((set, get) => ({
  theme: 'dark',
  initTheme: () => {
    let stored = null
    try {
      stored = localStorage.getItem('tv-theme')
    } catch {
      /* ignore */
    }
    const prefersLight = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: light)').matches
    const t = stored === 'light' || stored === 'dark' ? stored : prefersLight ? 'light' : 'dark'
    applyTheme(t)
    set({ theme: t })
    return t
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    try {
      localStorage.setItem('tv-theme', next)
    } catch {
      /* ignore */
    }
    set({ theme: next })
  },
}))
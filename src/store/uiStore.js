import { create } from 'zustand'

export const useUIStore = create((set) => ({
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type, id: Date.now() } })
  },
  clearToast: () => set({ toast: null }),
}))
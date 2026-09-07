import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PRODUCTS } from '../data/products'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      cartOpen: false,
      lastAdded: null,

      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),

      addItem: (productId, qty = 1, color = null) => {
        const existing = get().items.find(
          (i) => i.productId === productId && i.color === color
        )
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === productId && i.color === color
                ? { ...i, qty: i.qty + qty }
                : i
            ),
            lastAdded: productId,
          })
        } else {
          set({
            items: [...get().items, { productId, qty, color }],
            lastAdded: productId,
          })
        }
      },

      removeItem: (key) =>
        set({ items: get().items.filter((i) => `${i.productId}-${i.color || 'd'}` !== key) }),

      updateQty: (key, delta) =>
        set({
          items: get()
            .items.map((i) => {
              const k = `${i.productId}-${i.color || 'd'}`
              if (k === key) return { ...i, qty: Math.max(1, i.qty + delta) }
              return i
            })
            .filter((i) => i.qty > 0),
        }),

      clearCart: () => set({ items: [], lastAdded: null }),

      subtotal: () =>
        get().items.reduce((sum, i) => {
          const p = PRODUCTS.find((p) => p.id === i.productId)
          return sum + (p ? p.price * i.qty : 0)
        }, 0),

      count: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: 'novus-cart' }
  )
)

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id)
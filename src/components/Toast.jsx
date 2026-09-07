import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { useUIStore } from '../store/uiStore'

export default function Toast() {
  const toast = useUIStore((s) => s.toast)
  const clearToast = useUIStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(clearToast, 2600)
    return () => clearTimeout(id)
  }, [toast, clearToast])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 60, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 30, x: '-50%' }}
          className="fixed bottom-6 left-1/2 z-[120] flex items-center gap-3 rounded-2xl border border-mint/40 bg-card/95 backdrop-blur-xl px-5 py-3.5 shadow-2xl max-w-[90vw] sm:max-w-md break-words"
        >
          {toast.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 text-mint" />
            : <AlertTriangle className="w-5 h-5 text-gold" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}